const { TestGroups, Problems, sequelize } = require("../models");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const normalizeDependsOn = (value) => {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error("dependsOn must be an array");
      }

      return JSON.stringify(parsed);
    } catch (error) {
      throw new AppError("dependsOn must be a valid JSON array", 400);
    }
  }

  throw new AppError("dependsOn must be an array", 400);
};

const getTestGroups = catchAsync(async (req, res) => {
  const {
    problemId,
    page = 1,
    limit = 10,
    sort = "id",
    order = "asc",
  } = req.query;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const allowedSort = ["id", "problemId", "order", "createdAt", "updatedAt"];
  const sortField = allowedSort.includes(sort) ? sort : "id";
  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  const where = {};

  if (problemId !== undefined) {
    if (!Number.isInteger(Number(problemId)) || Number(problemId) < 1) {
      return next(new AppError("Invalid problemId", 400));
    }

    where.problemId = Number(problemId);
  }

  const { count, rows } = await TestGroups.findAndCountAll({
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

const getTestGroup = catchAsync(async (req, res, next) => {
  const data = await TestGroups.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Test group not found", 404));
  }

  return res.status(200).json({ data });
});

const createTestGroup = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { problemId, dependsOn, ...body } = req.body;

  if (!problemId) {
    return next(new AppError("problemId is required", 400));
  }

  const problem = await Problems.findByPk(problemId);

  if (!problem) {
    return next(new AppError("Problem not found", 404));
  }

  const groups = await TestGroups.findAll({ where: { problemId: problem.id } });

  const data = await TestGroups.create({
    ...body,
    problemId,
    order: groups?.length ? groups?.length + 1 : 1,
    ...(dependsOn !== undefined && {
      dependsOn: normalizeDependsOn(dependsOn),
    }),
  });

  return res.status(201).json({ data });
});

const updateTestGroup = catchAsync(async (req, res, next) => {
  const data = await TestGroups.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Test group not found", 404));
  }

  const body = { ...req.body };

  // Keep a group attached to its original problem.
  delete body.problemId;

  if (body.dependsOn !== undefined) {
    body.dependsOn = normalizeDependsOn(body.dependsOn);
  }

  await data.update(body);

  return res.status(200).json({ data });
});

const changeTestGroupOrder = catchAsync(async (req, res, next) => {
  const { problemId } = req.params;
  const { activeId, overId } = req.body;

  if (!activeId || !overId) {
    return next(new AppError("activeId and overId are required", 400));
  }

  if (String(activeId) === String(overId)) {
    return res.status(200).json({ message: "Order unchanged" });
  }

  const transaction = await sequelize.transaction();

  try {
    // Get groups belonging to this problem in their current order.
    const groups = await TestGroups.findAll({
      where: { problemId },
      order: [
        ["order", "ASC"],
        ["id", "ASC"],
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const activeIndex = groups.findIndex(
      (group) => String(group.id) === String(activeId),
    );

    const overIndex = groups.findIndex(
      (group) => String(group.id) === String(overId),
    );

    if (activeIndex === -1 || overIndex === -1) {
      await transaction.rollback();
      return next(new AppError("Test group not found", 404));
    }

    // Move the dragged group to the target position.
    const [activeGroup] = groups.splice(activeIndex, 1);
    groups.splice(overIndex, 0, activeGroup);
    // Find the current maximum order.

    const maxOrder = Math.max(
      0,
      ...groups.map((group) => Number(group.order) || 0),
    );

    // Step 1: Assign temporary positive orders.
    for (let i = 0; i < groups.length; i++) {
      await groups[i].update(
        { order: maxOrder + i + 1 },
        {
          transaction,
          hooks: false,
          validate: true,
        },
      );
    }

    // Step 2: Assign final sequential orders.
    for (let i = 0; i < groups.length; i++) {
      await groups[i].update(
        { order: i + 1 },
        {
          transaction,
          hooks: false,
          validate: true,
        },
      );
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Test group order updated successfully",
      data: groups.map((group, index) => ({
        id: group.id,
        order: index + 1,
      })),
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

module.exports = {
  getTestGroups,
  getTestGroup,
  createTestGroup,
  updateTestGroup,
  changeTestGroupOrder,
};
