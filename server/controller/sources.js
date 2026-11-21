const { Sources, Problems } = require("../models");
const { catchAsync } = require("../utils/catchAsync");
const { Op } = require("sequelize");

const AppError = require("../utils/appError");

const syncProblems = async (sourceId, problems, transaction) => {
  const currentProblems = await Problems.findAll({
    where: { sourceId },
    transaction,
  });

  const ids = currentProblems.map((row) => row.id);
  const added = [];
  for (const row of problems) {
    const problem = await Problems.findByPk(row.id, { transaction });

    await problem.update(
      { order: Number(row.order), sourceId },
      { transaction },
    );
    added.push(row.id);
  }
  for (const id of ids) {
    if (!added.includes(id)) {
      const problem = await Problems.findByPk(id, { transaction });

      await problem.update(
        { order: 1, sourceId: null, status: "deactive" },
        { transaction },
      );
    }
  }
};
const createSource = catchAsync(async (req, res, next) => {
  const transaction = await Sources.sequelize.transaction();

  try {
    const { problems, ...sourceData } = req.body;

    const data = await Sources.create(sourceData, { transaction });

    await syncProblems(data.id, problems, transaction);

    await transaction.commit();

    return res.status(201).json({});
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(new AppError(error.message, 400));
  }
});

const getSources = catchAsync(async (req, res, next) => {
  const {
    title,
    parentId,
    page = 1,
    limit = 10,
    sort = "id",
    order = "desc",
  } = req.query;

  const options = {
    where: {},
    order: [[sort, order]],
    offset: (page - 1) * limit,
    limit: parseInt(limit, 10),
    distinct: true,
  };

  if (parentId) {
    options.where.parentId = parentId;
  } else {
    options.where.parentId = null;
  }
  if (title) {
    options.where[Op.or] = [
      { titleEn: { [Op.like]: `%${title}%` } },
      { titleTm: { [Op.like]: `%${title}%` } },
      { titleRu: { [Op.like]: `%${title}%` } },
    ];
  }
  const { count, rows } = await Sources.findAndCountAll(options);
  if (!count) return res.status(200).json({ count: 0, data: [] });
  const ids = rows.map((row) => row.id);
  const data = await Sources.findAll({
    where: {
      id: ids,
    },
    order: options.order,
    include: ["childrens"],
  });

  return res.status(200).json({ count, data });
});

const getSource = catchAsync(async (req, res, next) => {
  const options = {
    where: {
      id: req.params.id,
    },

    include: [
      {
        model: Sources,
        as: "parent",
      },
      {
        model: Problems,
        as: "problems",
        attributes: ["id", "titleTm"],
      },
    ],
    order: [[{ model: Problems, as: "problems" }, "order", "ASC"]],
  };

  const data = await Sources.findOne(options);
  if (!data) {
    return next(new AppError("Data not found", 404)); // Fixed error message
  }
  return res.status(200).json({ data });
});

const getSourceParents = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let current = await Sources.findByPk(id, {
    attributes: ["id", "titleEn", "titleTm", "titleRu", "parentId"],
  });

  if (!current) {
    return next(new AppError("Data not found", 404));
  }

  const parents = [];

  // Prevent infinite loop in case bad/cyclic data exists
  const visited = new Set();

  while (current) {
    if (visited.has(current.id)) {
      return next(new AppError("Circular parent relationship detected", 400));
    }

    visited.add(current.id);

    parents.unshift({
      id: current.id,
      titleEn: current.titleEn,
      titleTm: current.titleTm,
      titleRu: current.titleRu,
    });

    if (!current.parentId) {
      break;
    }

    current = await Sources.findByPk(current.parentId, {
      attributes: ["id", "titleEn", "titleTm", "titleRu", "parentId"],
    });
  }

  return res.status(200).json({
    data: parents,
  });
});

const updateSource = catchAsync(async (req, res, next) => {
  const transaction = await Sources.sequelize.transaction();

  try {
    const data = await Sources.findByPk(req.params.id, { transaction });

    if (!data) {
      await transaction.rollback();
      return next(new AppError("Source not found", 404));
    }

    const { problems, ...sourceData } = req.body;

    await data.update(sourceData, { transaction });

    await syncProblems(data.id, problems, transaction);

    await transaction.commit();

    return res.status(200).json({});
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(new AppError(error.message, 400));
  }
});
const getClientSources = catchAsync(async (req, res, next) => {
  const { title, sort = "id", order = "desc" } = req.query;

  const options = {
    where: {
      status: "active",
    },
    order: [[sort, order]],
    distinct: true,
    attributes: [
      "id",
      "titleEn",
      "titleRu",
      "titleTm",

      "subTitleEn",
      "subTitleRu",
      "subTitleTm",
      "parentId",
    ],

    include: [
      "childrens",
      {
        model: Problems,
        as: "problems",
        attributes: ["id", "titleEn", "titleRu", "titleTm", "difficulty"],
      },
    ],
    order: [[{ model: Problems, as: "problems" }, "order", "ASC"]],
  };

  if (title) {
    options.where[Op.or] = [
      { titleEn: { [Op.like]: `%${title}%` } },
      { titleTm: { [Op.like]: `%${title}%` } },
      { titleRu: { [Op.like]: `%${title}%` } },
    ];
  }

  let data = await Sources.findAll(options);

  return res.status(200).json({ data });
});

const getClientSource = catchAsync(async (req, res, next) => {
  const options = {
    where: {
      id: req.params.id,
    },

    include: [
      {
        model: Problems,
        as: "problems",
        attributes: ["id", "titleEn", "titleRu", "titleTm", "difficulty"],
      },
    ],
    order: [[{ model: Problems, as: "problems" }, "order", "ASC"]],
  };

  const data = await Sources.findOne(options);
  if (!data) {
    return next(new AppError("Data not found", 404)); // Fixed error message
  }
  return res.status(200).json({ data });
});

module.exports = {
  getSources,
  getSource,
  getSourceParents,
  createSource,
  updateSource,

  getClientSources,
  getClientSource,
};
