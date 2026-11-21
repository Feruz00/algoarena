const { TestCases, TestGroups, sequelize } = require("../models");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getTestCases = catchAsync(async (req, res) => {
  const {
    groupId,
    // page = 1,
    // limit = 10,
    sort = "order",
    order = "asc",
  } = req.query;

  // const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  // const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const allowedSort = ["id", "groupId", "createdAt", "updatedAt"];
  const sortField = allowedSort.includes(sort) ? sort : "id";
  const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  const options = {
    where: {},
    order: [[sortField, sortOrder]],
    // offset: (currentPage - 1) * pageSize,
    // limit: pageSize,
  };

  if (groupId !== undefined) {
    if (!Number.isInteger(Number(groupId)) || Number(groupId) < 1) {
      throw new AppError("Invalid groupId", 400);
    }

    options.where.groupId = Number(groupId);
  }

  const { count, rows } = await TestCases.findAndCountAll(options);

  return res.status(200).json({
    count,
    data: rows,
  });
});

const getTestCase = catchAsync(async (req, res, next) => {
  const data = await TestCases.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Test case not found", 404));
  }

  return res.status(200).json({ data });
});

const createTestCase = catchAsync(async (req, res, next) => {
  const { groupId, ...body } = req.body;

  if (!groupId) {
    return next(new AppError("groupId is required", 400));
  }

  const group = await TestGroups.findByPk(groupId);

  if (!group) {
    return next(new AppError("Test group not found", 404));
  }

  const tests = await TestCases.findAll({ where: { groupId: group.id } });

  const data = await TestCases.create({
    ...body,
    groupId,
    order: tests?.length ? tests?.length + 1 : 1,
  });

  console.log(data);

  return res.status(201).json({ data });
});

const updateTestCase = catchAsync(async (req, res, next) => {
  const data = await TestCases.findByPk(req.params.id);

  if (!data) {
    return next(new AppError("Test case not found", 404));
  }

  const body = { ...req.body };

  // Keep a test case attached to its original group.
  delete body.groupId;

  await data.update(body);

  return res.status(200).json({ data });
});

const changeTestCaseOrder = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
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
    const groups = await TestCases.findAll({
      where: { groupId },
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
      message: "Test cases order updated successfully",
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
  getTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  changeTestCaseOrder,
};
