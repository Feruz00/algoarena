const { Tags } = require("../models");
const { Op } = require("sequelize");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const SORT_FIELDS = [
  "id",
  "titleEn",
  "titleTm",
  "titleRu",
  "createdAt",
  "updatedAt",
];

const getTags = catchAsync(async (req, res) => {
  const {
    title,
    page = 1,
    limit = 10,
    sort = "id",
    order = "desc",
  } = req.query;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const sortField = SORT_FIELDS.includes(sort) ? sort : "id";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  const where = {};

  if (title?.trim()) {
    const search = title.trim();

    where[Op.or] = [
      { titleEn: { [Op.like]: `%${search}%` } },
      { titleTm: { [Op.like]: `%${search}%` } },
      { titleRu: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Tags.findAndCountAll({
    where,
    order: [[sortField, sortOrder]],
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  return res.status(200).json({
    count,
    data: rows,
  });
});

const getTag = catchAsync(async (req, res, next) => {
  const data = await Tags.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Tag not found", 404));
  }

  return res.status(200).json({ data });
});

const createTag = catchAsync(async (req, res) => {
  const data = await Tags.create({
    titleTm: req.body.titleTm,
    titleEn: req.body.titleEn,
    titleRu: req.body.titleRu,
  });

  return res.status(201).json({ data });
});

const updateTag = catchAsync(async (req, res, next) => {
  const data = await Tags.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Tag not found", 404));
  }

  await data.update({
    titleTm: req.body.titleTm,
    titleEn: req.body.titleEn,
    titleRu: req.body.titleRu,
  });

  return res.status(200).json({ data });
});

const deleteTag = catchAsync(async (req, res, next) => {
  const data = await Tags.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Tag not found", 404));
  }

  await data.destroy();

  return res.status(204).send();
});

module.exports = {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
};
