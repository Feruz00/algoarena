const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { Users, Logs, Roles, Permissions, Notifications } = require("../models");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const { getRedis } = require("../config/redis");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.user) {
    token = req.cookies.user;
  }

  if (!token) {
    res.clearCookie("user", cookieOptions);

    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    res.clearCookie("user", cookieOptions);

    return next(
      new AppError("Token is invalid or expired. Please login again.", 401),
    );
  }

  const cacheKey = `user-${decoded.id}`;
  // console.log(cacheKey);
  const redis = getRedis();
  const cachedUser = await redis.get(cacheKey);
  let currentUser;
  if (cachedUser) {
    currentUser = JSON.parse(cachedUser);
    // console.log("redisde bar", currentUser);
  } else {
    currentUser = await Users.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["label", "maxCount", "time"],
          include: [
            {
              model: Permissions,
              as: "permissions",
              attributes: ["name"],

              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    });
    currentUser = await currentUser.toJSON();
    // console.log(currentUser);
    const notification = await Notifications.count({
      where: {
        userId: currentUser.id,
        read: false,
      },
    });
    // console.log("barde", notification);
    currentUser = {
      ...currentUser,
      notification: notification ? true : false,
    };
    // console.log(currentUser);
    await redis.set(cacheKey, JSON.stringify(currentUser), "Ex", 3600);
  }

  if (!currentUser) {
    res.clearCookie("user", cookieOptions);

    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  req.user = currentUser;
  await Users.update(
    { lastLogin: new Date() },
    {
      where: {
        id: decoded.id,
      },
    },
  );
  next();
});

const restrictTo = (...permissions) => {
  return (req, res, next) => {
    const userPermissions =
      req.user?.role?.permissions?.map((row) => row.name) || [];

    if (!permissions.every((row) => userPermissions.includes(row))) {
      return next(new AppError("You dont have permission this page", 403));
    }

    return next();
  };
};

module.exports = { protect, restrictTo };
