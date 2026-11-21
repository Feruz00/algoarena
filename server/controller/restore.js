const {
  Contests,
  Users,
  Groups,
  Problems,
  Roles,
  Sources,
} = require("../models");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError"); // make sure this path is correct
const { Op } = require("sequelize");

const items = [
  {
    model: Contests,
    permission: "get:contest",
    deletePermission: "delete:contest",
    attributes: ["id", "title"],
    as: "contests",
  },
  {
    model: Users,
    permission: "get:user",
    deletePermission: "delete:user",
    attributes: ["id", "username"],
    as: "users",
  },
  {
    model: Groups,
    permission: "get:group",
    deletePermission: "delete:group",
    attributes: ["id", "title"],
    as: "groups",
  },
  {
    model: Problems,
    permission: "get:problem",
    deletePermission: "delete:problem",
    attributes: ["id", "titleTm"],
    as: "problems",
  },
  {
    model: Roles,
    permission: "get:role",
    deletePermission: "delete:role",
    attributes: ["id", "label"],
    as: "roles", // fixed (was "problems")
  },
  {
    model: Sources,
    permission: "get:source",
    deletePermission: "delete:source",
    attributes: ["id", "titleTm"],
    as: "sources",
  },
];

// Helper to find the correct model + check permission
const getModelByKey = (key, userPermissions) => {
  const item = items
    .filter((row) => userPermissions.includes(row.permission))
    .find((item) => key === item.as);
  // console.log(key);
  if (!item) {
    throw new AppError("You don't have permission for this resource", 403);
  }

  return item;
};

//////////////////////
// GET deleted items
//////////////////////
const getDeletedItems = catchAsync(async (req, res, next) => {
  const { key = "contests", page = 1, limit = 20 } = req.query;

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  const item = getModelByKey(key, userPermissions);
  if (!item) {
    return next(new AppError(`Model "${key}" not found`, 400));
  }

  const { model: Model, attributes } = item;

  const pageInt = Math.max(1, Number(page) || 1);
  const limitInt = Math.min(200, Math.max(1, Number(limit) || 20));
  const offset = (pageInt - 1) * limitInt;

  const options = {
    where: {
      deletedAt: {
        [Op.not]: null,
      },
    },
    order: [["deletedAt", "DESC"]],
    attributes: [...new Set([...attributes, "deletedAt", "deleted_username"])], // avoid duplicates
    paranoid: false,
    offset,
    limit: limitInt,
  };

  const { count, rows } = await Model.findAndCountAll(options);

  const data = rows.map((row) => {
    const json = row.toJSON();
    return {
      ...json,
      // fallback title for different models
      title:
        json.title ||
        json.titleTm ||
        json.username ||
        json.label ||
        json.fullName ||
        json.name ||
        json.id,
    };
  });

  res.status(200).json({
    status: "success",
    count,
    data,
  });
});
//////////////////////
// RESTORE one item
//////////////////////
const restoreItem = catchAsync(async (req, res, next) => {
  const { id, key } = req.params;

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  const item = getModelByKey(key, userPermissions);
  const { model: Model } = item;

  const record = await Model.findOne({ where: { id }, paranoid: false });

  if (!record) {
    return next(new AppError("Record not found", 404));
  }
  console.log(record);
  if (!record.deletedAt) {
    return next(new AppError("Record is not deleted", 400));
  }

  // This will trigger afterRestore hooks (e.g. on Users → restores submissions)
  await record.restore({ user: req.user });

  res.status(200).json({
    status: "success",
    message: "Record restored successfully",
  });
});

//////////////////////
// PERMANENT DELETE one
//////////////////////
const forceDeleteItem = catchAsync(async (req, res, next) => {
  const { key = "contests" } = req.query;
  const { id } = req.params;

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  const item = getModelByKey(key, userPermissions);
  const { model: Model } = item;

  const record = await Model.findOne({ where: { id }, paranoid: false });

  if (!record) {
    return next(new AppError("Record not found", 404));
  }

  // Permanent delete
  await record.destroy({ force: true, user: req.user });

  res.status(200).json({
    status: "success",
    message: "Record permanently deleted",
  });
});

//////////////////////
// PERMANENT DELETE many
//////////////////////
const forceDeleteMany = catchAsync(async (req, res, next) => {
  const { ids, key } = req.body; // array of ids

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new AppError("Please provide an array of ids", 400));
  }

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  const item = getModelByKey(key, userPermissions);
  const { model: Model } = item;

  // Permanent delete multiple
  const deletedCount = await Model.destroy({
    where: { id: ids },
    force: true,
    // Note: individual hooks (beforeDestroy etc.) still run per record
  });

  res.status(200).json({
    status: "success",
    message: `${deletedCount} record(s) permanently deleted`,
    deletedCount,
  });
});

module.exports = {
  getDeletedItems,
  restoreItem,
  forceDeleteItem,
  forceDeleteMany,
};
