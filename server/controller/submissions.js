const { catchAsync } = require("../utils/catchAsync");

const {
  Submissions,
  Problems,
  Tags,
  ProblemTags,
  Contests,
  Groups,
  ContestGroups,
  ContestToProblem,
  GroupsToUser,
  TestGroups,
  TestCases,
  Sources,
  SourceToProblem,
  Users,
  sequelize,
  ContestRegistrations,
} = require("../models");
const { getContestPenalty } = require("../utils/contestPenalty");
const AppError = require("../utils/appError");
const dayjs = require("dayjs");
const { sendSubmission } = require("../messaging/rabbitmq");
const { getRedis } = require("../config/redis");
const createSubmission = catchAsync(async (req, res, next) => {
  // redisde 3minutda ugradar yaly etmeli

  const code = req.file.buffer.toString();
  let duringContest = false;
  const { problemId, contestId, sourceId } = req.body;

  const problem = await Problems.findByPk(problemId, {
    include: [
      {
        model: TestGroups,
        as: "testGroups",
        include: [
          {
            model: TestCases,
            as: "testCases",
          },
        ],
      },
    ],
    sort: [["testGroups.order", "asc"]],
    sort: [["testGroups.testCases.order", "asc"]],
  });

  if (!problem) return next(new AppError("Problem not found!", 404));
  const contest = await Contests.findByPk(contestId);

  if (contest) {
    // console.log("contest bar eken");
    if (contest.status === "scheduled")
      return next(new AppError("Contest dont started yet", 400));
    if (contest.status === "running") {
      const remainingSeconds = await getContestPenalty(contestId, req.user.id);

      if (remainingSeconds > 0) {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        return next(
          new AppError(
            `You cannot submit yet. Please wait ${minutes}m ${seconds}s.`,
            429,
          ),
        );
      }

      const conusers = await ContestRegistrations.findAll({
        where: {
          contestId: Number(contestId),
        },
        attributes: ["userId"],
      });

      const ids = conusers.map((row) => Number(row.userId));

      if (!ids.includes(Number(req.user.id))) {
        return next(
          new AppError("Only registration users can submit problem", 400),
        );
      }

      // Important!
      duringContest = true;
    }
  }
  let data = problem.toJSON();

  // barlamaly
  const submission = await Submissions.create({
    userId: req.user.id,
    contestId: req.body.contestId ?? undefined,
    problemId: problem.id,
    sourceId: req.body.sourceId ?? undefined,
    code,
    status: "queue",
    lang: req.body.language,
    duringContest,
  });

  const job = {};

  const groups = data.testGroups.map((row) => {
    const testCases = row.testCases;
    let newData = {};
    newData.id = row.id;
    newData.order = row.order;
    newData.score = row.score;
    const testcases = testCases.map((row) => ({
      input: row.input,
      order: row.order,
      expectedOutput: row.expectedOutput,
    }));
    newData.testcases = testcases;
    return newData;
  });
  job.type = data.checkerType;
  job.time = data.timeLimitMs;
  job.memory = data.memoryLimitMb;
  job.code = code;
  job.lang = req.body.language;
  job.testgroups = groups;
  job.id = submission.id;
  job.userId = req.user.id;
  job.problemId = problem.id;
  job.username = req.user.username;
  // job.contestId = req.body?.contestId;
  console.log(job);
  await sendSubmission(job);

  return res.json({});
});

const getSubmissions = catchAsync(async (req, res, next) => {
  const {
    page,
    limit,
    contestId,
    problemId,
    sourceId,
    verdict,
    sort = "id",
    order = "desc",
  } = req.query;
  const include = [];
  const exclude = [];

  // console.log(req.query);

  const options = {
    where: {},
    order: [[sort, order]],
  };
  if (page && limit) {
    const pageInt = Number(page) || 1;
    const limitInt = Number(limit) || 10;

    options.offset = (pageInt - 1) * limitInt;
    options.limit = limitInt;
  }
  if (problemId) {
    options.where.problemId = problemId;
  }
  let currentContest;
  if (contestId) {
    const contest = await Contests.findByPk(contestId);
    if (!contest) return next(new AppError("Contest not found", 400));
    if (contest.status === "running") {
      options.where.userId = req.user.id;
      exclude.push("code");
    }

    options.where.contestId = contestId;
  }
  if (sourceId) {
    options.where.sourceId = sourceId;
  }
  if (verdict) {
    options.where.verdict = verdict;
  }

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  if (!userPermissions.includes("use:showSubmission")) {
    options.where.userId = req.user.id;
  }

  const { count, rows } = await Submissions.findAndCountAll(options);
  const ids = rows.map((row) => row.id);

  // if (userPermissions.includes("use:showSubmission")) {
  include.push({
    model: Users,
    as: "user",
    attributes: ["id", "username", "fullName"],
  });
  // }
  if (!userPermissions.includes("use:showSolution")) exclude.push("code");
  if (problemId) {
    include.push({
      model: Problems,
      as: "problem",
      attributes: ["id", "titleEn", "titleRu", "titleTm"],
    });
  }
  if (sourceId) {
    include.push({
      model: Sources,
      as: "source",
      attributes: ["id", "titleEn", "titleTm", "titleRu"],
    });
  }

  if (contestId) {
    include.push({
      model: Contests,
      as: "contest",
      attributes: ["id", "title"],
    });
  }
  const data = await Submissions.findAll({
    where: {
      id: ids,
    },
    attributes: {
      exclude,
    },
    order: options.order,
    include: include,
  });
  return res.json({ count, data });
});

module.exports = { createSubmission, getSubmissions };
