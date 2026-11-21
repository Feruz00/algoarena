const { Op } = require("sequelize");

const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sequelize } = require("../models");

const deleteDataPermanently = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const data = await Model.findByPk(id, {
      paranoid: false,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    await data.destroy({
      force: true,
    });

    res.status(200).json({
      success: true,
      message: "Data permanently deleted",
    });
  });

const deleteManyDataPermanently = (Model) =>
  catchAsync(async (req, res, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ids must be a non-empty array",
      });
    }

    const dataIds = [
      ...new Set(
        ids.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
      ),
    ];

    if (dataIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid data IDs provided",
      });
    }

    const deletedCount = await Model.destroy({
      where: {
        id: {
          [Op.in]: dataIds,
        },
      },
      force: true,
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} data(s) permanently deleted`,
      deletedCount,
    });
  });

const restoreData = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await Model.findByPk(id, {
      paranoid: false,
    });
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
    await data.restore();
    res.status(200).json({
      success: true,
      message: "Data restored successfully",
    });
  });

const deleteData = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByPk(req.params.id);
    if (!data) {
      return next(new AppError("Data not found", 404)); // Fixed error message
    }
    await data.destroy({ user: req.user });
    return res.status(204).json({});
  });

const deleteManyData = (Model) =>
  catchAsync(async (req, res, next) => {
    const ids = req.body.ids?.filter((id) => id !== req.user.id);

    const results = await Model.findAll({
      where: { id: { [Op.in]: ids } },
    });
    for (const data of results) {
      await data.destroy({ user: req.user });
    }
    return res.status(204).json({});
  });

const changeOrder = (Model) =>
  catchAsync(async (req, res, next) => {
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
      const groups = await Model.findAll({
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
        message: "Orders updated successfully",
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
  deleteDataPermanently,
  deleteManyDataPermanently,
  restoreData,
  deleteData,
  deleteManyData,
  changeOrder,
};
