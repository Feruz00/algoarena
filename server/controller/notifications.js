const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const { Notifications, sequelize } = require("../models");
const { getRedis } = require("../config/redis");

const getAll = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    where: {
      userId: req.user.id,
    },
    order: [["id", "desc"]],
  };

  if (page && limit) {
    const pageInt = Number(page) || 1;
    const limitInt = Number(limit) || 10;

    options.offset = (pageInt - 1) * limitInt;
    options.limit = limitInt;
  }

  const { count, rows } = await Notifications.findAndCountAll(options);

  return res.json({ data: rows, count });
});

const update = catchAsync(async (req, res) => {
  const cacheKey = `user-${req.user.id}`;
  const redis = getRedis();

  const [updatedCount] = await Notifications.update(
    { read: true },
    {
      where: {
        userId: req.user.id,
        read: false,
      },
    },
  );
  const deletedCount = await redis.del(cacheKey);

  return res.json({
    status: "success",
    updatedCount,
    deletedCount,
  });
});

module.exports = { getAll, update };
