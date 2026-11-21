const { Op } = require("sequelize");
const { Permissions } = require("../models");

const { catchAsync } = require("../utils/catchAsync");

exports.getPermissions = catchAsync(async (req, res, next) => {
  // return res.status(404).json({ message: "Not found" });
  const data = await Permissions.findAll({});
  return res.json({ data });
});
