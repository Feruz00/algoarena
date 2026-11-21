const {
  Problems,
  Tags,
  ProblemTags,
  Contests,
  Submissions,
  ContestRegistrations,
  ContestGroups,
  GroupsToUser,
  TestGroups,
  Sources,
  TestCases,
  sequelize,
} = require("../models");
const { v4: uuid } = require("uuid");
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

const getProblems = catchAsync(async (req, res) => {
  const {
    title,
    page = 1,
    limit = 10,
    tagIds,
    sort = "id",
    order = "desc",
    difficulty,
    status,
    notUsed,
    type,
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

  if (difficulty?.trim()) {
    where.difficulty = difficulty;
  }
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  if (notUsed) {
    where[Op.and] = {
      sourceId: {
        [Op.eq]: null,
      },
      contestId: {
        [Op.eq]: null,
      },
    };
  }

  if (tagIds?.length) {
    // console.log(tagIds);
    let ids = await ProblemTags.findAll({
      where: {
        tagId: {
          [Op.in]: tagIds.split(",").map((row) => Number(row)),
        },
      },
    });
    ids = ids.map((row) => row.problemId);
    // console.log(ids);
    where.id = { [Op.in]: ids };
  }

  const { count, rows } = await Problems.findAndCountAll({
    where,
    order: [[sortField, sortOrder]],
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  const ids = rows.map((row) => row.id);
  const data = await Problems.findAll({
    where: {
      id: ids,
    },
    order: [[sortField, sortOrder]],
    include: [
      {
        model: Tags,
        as: "tags",
        through: {
          attributes: {},
        },
      },
    ],
  });
  return res.status(200).json({
    count,
    data,
  });
});

const getProblem = catchAsync(async (req, res, next) => {
  const data = await Problems.findByPk(req.params.id, {
    include: [
      {
        model: Tags,
        as: "tags",
        through: {
          attributes: {},
        },
      },
    ],
  });

  if (!data) {
    return next(new AppError("Problem not found", 404));
  }

  return res.status(200).json({ data });
});

const createProblem = catchAsync(async (req, res, next) => {
  const { tags: tagsIds } = req.body;

  const transaction = await sequelize.transaction();
  const slug = uuid();
  try {
    const maxPriority = await Problems.max("priority", {
      transaction: transaction,
    });

    const priority = (maxPriority ?? 0) + 1;
    const data = await Problems.create(
      { ...req.body, priority, slug },
      { transaction },
    );
    if (tagsIds?.length) {
      const tags = await Tags.findAll({ where: { id: tagsIds }, transaction });
      if (tags.length !== tagsIds.length) {
        await transaction.rollback();
        return next(new AppError("Tags not valid", 400));
      }

      await data.setTags(tags, { transaction });
    }
    await transaction.commit();
    return res.status(201).json({ data });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

const updateProblem = catchAsync(async (req, res, next) => {
  const { tags: tagsIds, ...problemData } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const problem = await Problems.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!problem) {
      await transaction.rollback();
      return next(new AppError("Problem not found", 404));
    }

    // Validate problem type
    const allowedTypes = ["contest", "source", "hidden"];

    if (
      problemData.type !== undefined &&
      !allowedTypes.includes(problemData.type)
    ) {
      await transaction.rollback();
      return next(new AppError("Invalid problem type", 400));
    }

    // Clear relationships when changing type
    if (problemData.type !== undefined && problemData.type !== problem.type) {
      switch (problemData.type) {
        case "contest":
          problemData.sourceId = null;
          break;

        case "source":
          problemData.contestId = null;
          break;

        case "hidden":
          problemData.contestId = null;
          problemData.sourceId = null;
          break;
      }
    }

    // Tags validation and synchronization
    if (tagsIds !== undefined) {
      if (!Array.isArray(tagsIds)) {
        await transaction.rollback();
        return next(new AppError("Tags must be an array", 400));
      }

      if (tagsIds.length > 0) {
        const uniqueTagIds = [...new Set(tagsIds.map(String))];

        const tags = await Tags.findAll({
          where: { id: uniqueTagIds },
          transaction,
        });

        if (tags.length !== uniqueTagIds.length) {
          await transaction.rollback();
          return next(new AppError("Tags not valid", 400));
        }

        await problem.setTags(tags, { transaction });
      } else {
        await problem.setTags([], { transaction });
      }
    }

    await problem.update(problemData, { transaction });

    await transaction.commit();

    return res.status(200).json({
      status: "success",
      data: problem,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
});

const getClientProblems = catchAsync(async (req, res, next) => {
  // return next(new AppError("Here i get error", 404));
  const {
    title,
    page = 1,
    limit = 10,
    tagIds,
    sort = "id",
    order = "desc",
    difficulty,
  } = req.query;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const sortField = SORT_FIELDS.includes(sort) ? sort : "priority";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  let submissions = await Submissions.findAll({
    where: {
      verdict: "AC",
      status: "finished",
    },
  });
  const problems = {};
  submissions.forEach((el) => {
    if (!problems[el.problemId]) problems[el.problemId] = [];
    if (!problems[el.problemId].includes(el.userId))
      problems[el.problemId].push(el.userId);
  });

  // console.log(Object.values(problems));

  const options = {
    where: {
      status: "active",
    },
    order: [[sortField, sortOrder]],
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  };

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  let types = [];
  if (userPermissions.includes("use:sources")) {
    types.push("source");
  }

  let contests = [];
  let checkedContests = false;
  if (userPermissions.includes("use:contests")) {
    types.push("contest");
  }
  if (userPermissions.includes("use:onlyGroup")) {
    types.push("hidden");
    const myGroup = await GroupsToUser.findAll({
      where: {
        userId: req.user.id,
      },
    });
    const groups = [...new Set(myGroup.map((row) => row.groupId))];

    const contestIds = await ContestGroups.findAll({
      where: {
        groupId: groups,
      },
    });

    contests = [...new Set(contestIds.map((row) => row.contestId))];
    checkedContests = true;
  }

  if (checkedContests) {
    const availableContests = await Contests.findAll({
      where: {
        id: { [Op.in]: contests },
        status: { [Op.in]: ["running", "finished"] },
      },
      attributes: ["id"],
    });

    const availableContestIds = availableContests.map((row) => row.id);
    // console.log(availableContestIds);
    if (!availableContestIds.length) {
      return res.json({ count: 0, data: [] });
    }

    options.where.contestId = {
      [Op.in]: availableContestIds,
    };
  }
  if (types.length) {
    options.where.type = {
      [Op.in]: types,
    };
  }

  // console.log(options.where);
  if (title?.trim()) {
    const search = title
      .trim()
      .split(" ")
      .map((r) => r.toLowerCase());
    const query = { [Op.or]: search.map((r) => ({ [Op.like]: `%${r}%` })) };
    options.where[Op.or] = [
      { titleEn: query },
      { titleTm: query },
      { titleRu: query },
    ];
  }

  if (difficulty?.trim()) {
    options.where.difficulty = difficulty;
  }

  if (userPermissions.includes("use:tags") && tagIds?.length) {
    let ids = await ProblemTags.findAll({
      where: {
        tagId: {
          [Op.in]: tagIds.split(",").map((row) => Number(row)),
        },
      },
    });
    ids = ids.map((row) => row.problemId);
    let lastIds = options.where.id[Op.in];
    if (lastIds?.length) {
      ids = ids.filter((row) => lastIds.includes(row));
      if (!ids.length) {
        return res.json({ data: 0, data: [] });
      }
    }
    options.where.id = { [Op.in]: ids };
  }

  const { count, rows } = await Problems.findAndCountAll(options);

  const dataIds = rows.map((row) => row.id);
  const include = [];
  if (userPermissions.includes("use:tags")) {
    include.push({
      model: Tags,
      as: "tags",
      through: {
        attributes: {},
      },
      attributes: ["id", "titleEn", "titleTm", "titleRu"],
    });
  }
  const data = await Problems.findAll({
    where: {
      id: dataIds,
    },
    order: options.order,
    include: include,

    attributes: [
      "id",
      "titleEn",
      "titleTm",
      "titleRu",
      "difficulty",
      "priority",
    ],
  });
  const result = data
    .map((row) => row.toJSON())
    .map((row) => ({
      ...row,
      accepted: problems[row.id]?.length ?? 0,
    }));
  return res.status(200).json({
    count,
    data: result,
  });
});

const getClientProblem = catchAsync(async (req, res, next) => {
  const { contestId, sourceId } = req.query;

  const id = Number(req.params.id);
  if (!id) return next(new AppError("Data not found", 404));
  const options = {
    where: {
      id,
      status: "active",
    },
  };
  let noTag = false;
  if (contestId) {
    const contest = await Contests.findByPk(contestId);
    if (!contest) return next(new AppError("Problem not found", 400));
    // console.log(contest.status);
    if (contest.status === "scheduled" || contest.status === "deactive")
      return next(new AppError("Problem not found", 400));
    if (contest.status === "running") noTag = true;
    options.where.contestId = contestId;
  }

  if (sourceId) {
    const source = await Sources.findByPk(sourceId);
    // console.log(sourceId, source);
    if (!source) return next(new AppError("Problem not found", 400));
    if (source.status === "deactive")
      return next(new AppError("Problem not found", 400));
    options.where.sourceId = sourceId;
  }

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  let types = [];
  if (userPermissions.includes("use:sources")) {
    types.push("source");
  }

  let contests = [];
  if (userPermissions.includes("use:contests")) {
    types.push("contest");
  }
  if (userPermissions.includes("use:onlyGroup")) {
    types.push("hidden");
    const myGroup = await GroupsToUser.findAll({
      where: {
        userId: req.user.id,
      },
    });
    const groups = [...new Set(myGroup.map((row) => row.groupId))];

    const contestIds = await ContestGroups.findAll({
      where: {
        groupId: groups,
      },
    });

    contests = [...new Set(contestIds.map((row) => row.contestId))];

    const query = {
      status: {
        [Op.in]: ["running", "finished"],
      },
    };

    query.id = contests;

    contests = await Contests.findAll({
      where: query,
    });
    contests = contests.map((row) => row.id);
    // console.log(contests);
    options.where.contestId = contests;
  }
  // console.log(types);
  if (types.length) {
    options.where.type = {
      [Op.in]: types,
    };
  }
  // console.log(noTag);
  if (userPermissions.includes("use:tags")) {
    options.include = [
      {
        model: Tags,
        as: "tags",
        through: {
          attributes: {},
        },
        attributes: ["id", "titleEn", "titleTm", "titleRu"],
      },
    ];
  }
  // console.log(options.where);
  const data = await Problems.findOne(options);

  if (!data) {
    return next(new AppError("Problem not found", 404));
  }
  const groups = await TestGroups.findAll({
    where: {
      problemId: data.id,
    },
    order: [["order", "asc"]],
  });
  const groupIds = groups.map((row) => row.id);
  const testcases = await TestCases.findAll({
    where: {
      groupId: groupIds,
      isSample: true,
    },
    order: [["order", "asc"]],
  });

  let newData = data.toJSON();
  let canSubmission = true;
  // console.log(data.type);
  if (data.type === "contest" || data.type === "hidden") {
    const problemContest = await Contests.findByPk(newData.contestId);

    if (["scheduled", "deactive"].includes(problemContest.status)) {
      canSubmission = false;
    } else if (problemContest.status === "running") {
      delete newData.tags;
      const c = await ContestRegistrations.count({
        where: {
          userId: req.user.id,
          contestId: problemContest.id,
        },
      });
      if (!c) canSubmission = false;
    }
  }
  return res.status(200).json({
    data: {
      ...newData,
      tests: testcases,
      canSubmission,
    },
  });
});

const getClientContestProblems = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id);

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const attributes = ["id", "titleEn", "titleTm", "titleRu"];
  if (contest.status == "scheduled") return res.json({ count: 0, data: [] });
  if (contest.status === "running") {
    const users = await ContestRegistrations.findAll({
      where: { contestId: contest.id },
    });
    const ids = users.map((row) => row.userId);
    if (!ids.includes(req.user.id)) return res.json({ count: 0, data: [] });
  }
  if (contest.status === "finished") attributes.push("difficulty");
  let data = await Problems.findAll({
    where: {
      contestId: req.params.id,
    },
    order: [["order", "asc"]],
    attributes: attributes,
  });
  data = data.map((row) => row.toJSON());
  if (contest.status === "finished") {
    const problems = {};

    let submissions = await Submissions.findAll({
      where: {
        verdict: "AC",
        status: "finished",
      },
    });
    submissions.forEach((el) => {
      if (!problems[el.problemId]) problems[el.problemId] = [];
      if (!problems[el.problemId].includes(el.userId))
        problems[el.problemId].push(el.userId);
    });
    data = data.map((row) => ({
      ...row,
      accepted: problems[row.id]?.length ?? 0,
    }));
  }
  // console.log(data.problems);
  return res.json({ count: data.length, data: data });
});

module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  getClientProblems,
  getClientProblem,
  getClientContestProblems,
};
