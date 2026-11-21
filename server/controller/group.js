const { catchAsync } = require("../utils/catchAsync");
const { Groups, sequelize } = require("../models");

const { Op } = require("sequelize");
const AppError = require("../utils/appError");
const XLSX = require("xlsx");
const createGroup = catchAsync(async (req, res, next) => {
  const data = await Groups.create(req.body);
  return res.status(201).json({ data: data });
});

const updateGroup = catchAsync(async (req, res, next) => {
  const data = await Groups.findByPk(req.params.id);
  if (!data) {
    return next(new AppError("Group not found", 404));
  }
  await data.update(req.body);
  return res.status(200).json({ data });
});

const getGroup = catchAsync(async (req, res, next) => {
  const options = {
    where: {
      id: req.params.id,
    },
  };

  const data = await Groups.findOne(options);
  if (!data) {
    return next(new AppError("Data not found", 404)); // Fixed error message
  }
  return res.status(200).json({ data });
});

const getGroups = catchAsync(async (req, res, next) => {
  const { page, limit, sort = "id", order = "desc", title } = req.query;

  const options = {
    where: {},
    order: [[sort, order]],
  };

  if (page && limit) {
    let pageInt = Number(page) || 1;
    let limitInt = Number(limit) || 10;
    options.offset = (pageInt - 1) * limitInt;
    options.limit = limitInt;
  }

  if (title) {
    options.where.title = {
      [Op.like]: `%${title}%`,
    };
  }

  const { count, rows } = await Groups.findAndCountAll(options);
  return res.status(200).json({ count, data: rows });
});

const exportGroups = catchAsync(async (req, res, next) => {
  const groups = await Groups.findAll({
    attributes: ["title", "description"],
    order: [["id", "DESC"]],
    raw: true,
  });

  const worksheet = XLSX.utils.json_to_sheet(groups);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Groups");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 30 }, // title
    { wch: 50 }, // description
  ];

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", "attachment; filename=groups.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  return res.send(buffer);
});

const importGroups = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Excel file is required", 400));
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (!rows.length) {
    return next(new AppError("Excel file is empty", 400));
  }

  const groupsToCreate = [];
  const errors = [];

  rows.forEach((row, index) => {
    const title = row.title || row.Title || row.TITLE;
    const description = row.description || row.Description || row.DESCRIPTION;

    if (!title || !String(title).trim()) {
      errors.push(`Row ${index + 2}: Title is required`);
      return;
    }
    if (!description || !String(description).trim()) {
      errors.push(`Row ${index + 2}: Description is required`);
      return;
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length < 3 || cleanTitle.length > 50) {
      errors.push(
        `Row ${index + 2}: Title must be between 3 and 50 characters`,
      );
      return;
    }

    groupsToCreate.push({
      title: cleanTitle,
      description: String(description).trim(),
    });
  });

  if (errors.length) {
    return next(new AppError(errors.join("; "), 400));
  }

  const created = await Groups.bulkCreate(groupsToCreate, {
    validate: true,
  });

  return res.status(201).json({
    message: `${created.length} groups imported successfully`,
    count: created.length,
    data: created,
  });
});
module.exports = {
  createGroup,
  updateGroup,
  getGroup,
  getGroups,
  exportGroups,
  importGroups,
};
