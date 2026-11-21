const { compare } = require("../utils/password");
const jwt = require("jsonwebtoken");
const { Permissions, Users, Logs, Roles, Notifications } = require("../models");

const { catchAsync } = require("../utils/catchAsync");
const { generateToken, cookieOptions } = require("../middleware/jwt");
const dayjs = require("dayjs");
const { Op } = require("sequelize");
const { getIO } = require("../socket");

exports.currentUser = catchAsync(async (req, res) => {
  res.status(200).json({
    data: req.user,
  });
});

exports.loginUser = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  // console.log(req.body);
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const user = await Users.findOne({
    where: { username },
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

  const createLog = async (data) => {
    await Logs.create({
      username,
      password: data.status === "failed" ? password : null,
      ip,
      action: data.action,
      status: data.status,
      userId: data.userId || null,
      message: data.message,
    });
  };

  if (!user) {
    await createLog({
      action: "login_failed",
      status: "failed",
      message: "User not found",
    });
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (user.status === "inactive") {
    await createLog({
      action: "login_failed",
      status: "failed",
      userId: user.id,
      message: "Account inactive",
    });
    return res.status(400).json({ message: "Your account stopped" });
  }
  if (user.status === "blocked") {
    await createLog({
      action: "login_failed",
      status: "failed",
      userId: user.id,
      message: "Account blocked",
    });
    return res.status(400).json({ message: "Your account blocked" });
  }
  const logs = await Logs.findAll({
    where: {
      username,
      action: "login_failed",
      createdAt: {
        [Op.gte]: dayjs()
          .subtract(user.role?.time || 7, "minute")
          .toDate(),
      },
    },
  });

  if (!(await compare(user.password, password))) {
    await createLog({
      action: "login_failed",
      status: "failed",
      userId: user.id,
      message: "Invalid password",
    });

    if (logs.length + 1 >= (user.role?.maxCount || 5)) {
      await user.update({ status: "blocked" });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (logs.length >= (user.role?.maxCount || 5)) {
    return res.status(401).json({ message: "You cannot logged in now" });
  }

  await createLog({
    action: "login_success",
    status: "success",
    userId: user.id,
    message: "Login successful",
  });

  const token = generateToken(user);

  res.cookie("user", token, cookieOptions);
  let userData = await user.toJSON();
  delete userData.password;

  const notification = await Notifications.count({
    where: {
      userId: userData.id,
      read: false,
    },
  });
  // console.log(notification);
  userData = { ...userData, notification: notification ? true : false };
  res.status(200).json({
    status: "success",
    token,
    data: userData,
  });
});

exports.logoutUser = catchAsync(async (req, res) => {
  // console.log(req.user);
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  await Logs.create({
    username: req.user.username,
    password: null,
    ip,
    action: "logout",
    status: "success",
    userId: req.user.id,
    message: "User logged out",
  });
  const io = getIO();
  io.to(String(req.user.id)).emit("logout", {
    message: "You have been logged out",
  });

  res.cookie("user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
