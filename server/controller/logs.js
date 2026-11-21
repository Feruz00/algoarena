const { catchAsync } = require("../utils/catchAsync");
const { Logs } = require("../models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const XLSX = require("xlsx");

const getLogs = catchAsync(async (req, res) => {
  const {
    page,
    limit,
    sort = "id",
    order = "desc",
    startDate,
    endDate,
    username,
    ip,
    action,
    status,
    export: isExport, // ?export=true
  } = req.query;

  const options = {
    where: {},
    order: [[sort, order]],
  };

  // Date range
  if (startDate && endDate) {
    options.where.createdAt = {
      [Op.and]: [
        { [Op.gte]: dayjs(startDate).startOf("day").toDate() },
        { [Op.lte]: dayjs(endDate).endOf("day").toDate() },
      ],
    };
  } else if (startDate) {
    options.where.createdAt = {
      [Op.gte]: dayjs(startDate).startOf("day").toDate(),
    };
  } else if (endDate) {
    options.where.createdAt = {
      [Op.lte]: dayjs(endDate).endOf("day").toDate(),
    };
  }

  if (username) {
    options.where.username = { [Op.iLike]: `%${username}%` }; // change to Op.like if MySQL
  }

  if (ip) {
    options.where.ip = { [Op.iLike]: `%${ip}%` };
  }

  if (action) {
    options.where.action = action;
  }

  if (status) {
    options.where.status = status;
  }

  // ========== EXCEL EXPORT ==========
  if (isExport === "true") {
    const rows = await Logs.findAll({
      ...options,
      attributes: [
        "id",
        "username",
        "ip",
        "action",
        "status",
        "message",
        "createdAt",
      ],
      raw: true,
    });

    // Format data for Excel
    const excelData = rows.map((row) => ({
      ID: row.id,
      Username: row.username || "-",
      IP: row.ip || "-",
      Action: row.action,
      Status: row.status,
      Message: row.message || "-",
      Date: dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

    // Optional: set column widths
    worksheet["!cols"] = [
      { wch: 8 }, // ID
      { wch: 18 }, // Username
      { wch: 16 }, // IP
      { wch: 16 }, // Action
      { wch: 12 }, // Status
      { wch: 30 }, // Message
      { wch: 20 }, // Date
    ];

    // Generate buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // File name
    const fileName = `logs_${startDate || "all"}_${endDate || "all"}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.send(buffer);
  }

  // ========== NORMAL PAGINATED RESPONSE ==========
  if (page && limit) {
    const pageInt = Number(page) || 1;
    const limitInt = Number(limit) || 20;
    options.offset = (pageInt - 1) * limitInt;
    options.limit = limitInt;
  }

  const { count, rows } = await Logs.findAndCountAll(options);

  return res.json({
    data: rows,
    count,
  });
});

module.exports = getLogs;
