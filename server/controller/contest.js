const { catchAsync } = require("../utils/catchAsync");

const {
  Contests,
  ContestUsers,
  Submissions,
  ContestRegistrations,

  Users,
  GroupsToUser,
  Tags,
  ContestGroups,
  Groups,
  Roles,
  Problems,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

const AppError = require("../utils/appError");
const {
  removeContestStartJob,
  scheduleContestFinish,
  removeContestFinishJob,
  scheduleContestStart,
} = require("../queue/contestQueue");
const {
  emitContestStarted,
  emitContestFinished,
  emitContestBlocked,
} = require("../socket/contest");
const dayjs = require("dayjs");
const { invalidateContestCache } = require("../utils/contestCache");
// const { invalidateContestCache } = require("../utils/contestCache");

// const syncContestProblems = async (contestId, problems, transaction) => {
//   const currentProblems = await Problems.findAll({
//     where: { contestId },
//     transaction,
//   });

//   const ids = currentProblems.map((row) => row.id);
//   const added = [];
//   for (const row of problems) {
//     const problem = await Problems.findByPk(row.id, { transaction });

//     await problem.update(
//       { order: Number(row.order), contestId },
//       { transaction },
//     );
//     added.push(row.id);
//   }
//   for (const id of ids) {
//     if (!added.includes(id)) {
//       const problem = await Problems.findByPk(id, { transaction });

//       await problem.update(
//         { order: 1, contestId: null, status: "deactive" },
//         { transaction },
//       );
//     }
//   }
// };

const syncContestProblems = async (contestId, problems, transaction) => {
  if (!Array.isArray(problems)) {
    throw new AppError("Problems must be an array", 400);
  }

  const currentProblems = await Problems.findAll({
    where: { contestId },
    transaction,
  });

  const currentIds = currentProblems.map((row) => Number(row.id));
  const added = [];

  for (const row of problems) {
    const id = Number(row.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Invalid problem ID", 400);
    }

    const problem = await Problems.findByPk(id, { transaction });

    if (!problem) {
      throw new AppError(`Problem ${id} not found`, 404);
    }

    const order = Number(row.order);
    const penaltyMinutes = Number(row.penaltyMinutes ?? 0);
    const penaltyScore = Number(row.penaltyScore ?? 0);

    if (
      !Number.isInteger(order) ||
      order < 1 ||
      !Number.isInteger(penaltyMinutes) ||
      penaltyMinutes < 0 ||
      !Number.isInteger(penaltyScore) ||
      penaltyScore < 0
    ) {
      throw new AppError("Invalid problem penalty settings", 400);
    }

    await problem.update(
      {
        order,
        contestId,
        penaltyMinutes,
        penaltyScore,
      },
      { transaction },
    );

    added.push(id);
  }

  for (const id of currentIds) {
    if (!added.includes(id)) {
      const problem = await Problems.findByPk(id, { transaction });

      await problem.update(
        {
          order: 1,
          contestId: null,
          status: "deactive",
          penaltyMinutes: 0,
          penaltyScore: 0,
        },
        { transaction },
      );
    }
  }
};

const syncContestGroups = async (contest, groupIds, transaction) => {
  if (!Array.isArray(groupIds)) {
    throw new AppError("Groups must be an array", 400);
  }

  const normalizedIds = [
    ...new Set(
      groupIds.map((id) => {
        const parsedId = Number(id);

        if (!Number.isInteger(parsedId) || parsedId <= 0) {
          throw new AppError("Invalid group ID", 400);
        }

        return parsedId;
      }),
    ),
  ];

  const groups = await Groups.findAll({
    where: {
      id: {
        [Op.in]: normalizedIds,
      },
    },
    transaction,
  });

  if (groups.length !== normalizedIds.length) {
    throw new AppError("One or more groups were not found", 400);
  }

  await contest.setGroups(groups, { transaction });
};
const createContest = catchAsync(async (req, res, next) => {
  const {
    title,
    duration,
    startTime,
    public: isPublic,
    fullTest,
    rating,
    penaltyMinutes,
    problems,
    groups,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const contest = await Contests.create(
      {
        title,
        duration,
        startTime: startTime || null,
        public: isPublic ?? false,
        fullTest: fullTest ?? false,
        rating: rating ?? false,
        status: "scheduled",
        penaltyMinutes,
      },
      { transaction },
    );

    await ContestUsers.create(
      {
        contestId: contest.id,
        userId: req.user.id,
      },
      { transaction },
    );

    if (problems !== undefined) {
      await syncContestProblems(contest.id, problems, transaction);
    }

    // Assign selected groups.
    if (groups !== undefined) {
      await syncContestGroups(contest, groups, transaction);
    }

    await transaction.commit();

    if (contest.startTime) {
      await scheduleContestStart(contest);
    }

    await contest.reload({
      include: [
        {
          model: Groups,
          as: "groups",
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
      ],
    });

    return res.status(201).json({
      data: contest,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(
      error instanceof AppError ? error : new AppError(error.message, 400),
    );
  }
});

const getContest = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
      {
        model: Problems,
        as: "problems",
        attributes: ["id", "titleTm", "penaltyMinutes", "penaltyScore"],
      },
      {
        model: Groups,
        as: "groups",
        attributes: ["id", "title"],
      },
    ],
    order: [[{ model: Problems, as: "problems" }, "order", "ASC"]],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const isHaveAccess = req.user.role.permissions.find(
    (permission) => permission.name === "contest:access",
  )
    ? true
    : false;

  const author =
    contest.users?.some((user) => user.id === req.user.id) || isHaveAccess;

  if (author) {
    const data = contest.toJSON();
    return res.status(200).json({
      data: data,
      author: true,
    });
  }

  return res.status(200).json({
    data: {
      id: contest.id,
      title: contest.title,
    },
    author: false,
  });
});

const getContests = catchAsync(async (req, res, next) => {
  const { page, limit, sort = "id", order = "desc", title, status } = req.query;

  const options = {
    where: {},
    order: [[sort, order]],
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
    ],
  };

  if (page && limit) {
    const pageInt = Number(page) || 1;
    const limitInt = Number(limit) || 10;

    options.offset = (pageInt - 1) * limitInt;
    options.limit = limitInt;
  }

  if (title) {
    options.where.title = {
      [Op.like]: `%${title}%`,
    };
  }

  if (status) {
    options.where.status = status;
  }

  const { count, rows } = await Contests.findAndCountAll(options);

  const data = rows.map((contest) => {
    const json = contest.toJSON();

    const author = json.users?.some((user) => user.id === req.user.id);

    if (author || isHaveAccess) {
      json.author = true;
    } else {
      json.author = false;
    }
    return json;
  });

  return res.status(200).json({
    count,
    data,
  });
});
const updateContest = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
      {
        model: Groups,
        as: "groups",
        attributes: ["id", "title"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const hasAccess = req.user.role.permissions.some(
    (permission) => permission.name === "contest:access",
  );

  const isAuthor =
    contest.users?.some((user) => user.id === req.user.id) || hasAccess;

  if (!isAuthor) {
    return next(new AppError("You are not an author of this contest", 403));
  }

  const {
    title,
    duration,
    startTime,
    public: isPublic,
    fullTest,
    rating,
    problems,
    groups,
    penaltyMinutes,
  } = req.body;

  const newData = {};

  if (contest.status === "scheduled") {
    const nextStartTime = startTime ?? contest.startTime;
    const nextDuration = Number(duration ?? contest.duration);

    if (!dayjs(nextStartTime).add(nextDuration, "minute").isAfter(dayjs())) {
      return next(new AppError("Contest end time must be in the future", 400));
    }

    if (title !== undefined) newData.title = title;
    if (duration !== undefined) newData.duration = duration;
    if (startTime !== undefined) newData.startTime = startTime;
    if (isPublic !== undefined) newData.public = isPublic;
    if (fullTest !== undefined) newData.fullTest = fullTest;
    if (rating !== undefined) newData.rating = rating;

    if (penaltyMinutes !== undefined) {
      newData.penaltyMinutes = penaltyMinutes;
    }
  } else if (contest.status === "running") {
    if (groups !== undefined) {
      return next(
        new AppError("Groups cannot be changed after the contest starts", 400),
      );
    }

    if (duration !== undefined) {
      const finishAt = dayjs(contest.startedAt).add(Number(duration), "minute");

      if (!finishAt.isAfter(dayjs())) {
        return next(
          new AppError("Duration must be higher than elapsed time", 400),
        );
      }

      newData.duration = duration;
    }
  } else {
    return next(new AppError("Finished contests cannot be updated", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    await contest.update(newData, { transaction });

    if (problems !== undefined) {
      await syncContestProblems(contest.id, problems, transaction);
    }

    // Only update groups when the request includes the groups property.
    // [] means remove all assigned groups.
    if (groups !== undefined) {
      await syncContestGroups(contest, groups, transaction);
    }

    await transaction.commit();
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    await invalidateContestCache(contest.id);

    return next(
      error instanceof AppError ? error : new AppError(error.message, 400),
    );
  }

  await contest.reload({
    include: [
      {
        model: Groups,
        as: "groups",
        attributes: ["id", "title"],
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (contest.status === "scheduled") {
    await scheduleContestStart(contest);
  }

  if (contest.status === "running" && duration !== undefined) {
    await scheduleContestFinish(contest);
  }

  await invalidateContestCache(contest.id);

  return res.status(200).json({
    data: contest,
  });
});
const startContest = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
    ],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const isHaveAccess = req.user.role.permissions.find(
    (permission) => permission.name === "contest:access",
  )
    ? true
    : false;

  const author =
    contest.users?.some((user) => user.id === req.user.id) || isHaveAccess;

  if (!author) {
    return next(new AppError("You are not an author of this contest", 403));
  }

  // console.log(contest.status);

  if (contest.status === "running") {
    return next(new AppError("Contest is already running", 400));
  }

  // if (contest.status === "finished") {
  //   return next(new AppError("Contest is already finished", 400));
  // }

  await removeContestStartJob(contest.id);

  const now = new Date();

  await contest.update({
    status: "running",
    startedAt: now,
    startTime: now,
    finishedAt: null,
  });

  // await contest.update({
  //   status: "running",
  //   startedAt: now,
  //   startTime: now,
  //   finishedAt: null,
  // });
  await Problems.update(
    { status: "active" },
    {
      where: {
        contestId: contest.id,
      },
    },
  );

  const registrations = await ContestRegistrations.findAll({
    where: {
      contestId: contest.id,
      status: "registered",
    },
    attributes: ["userId"],
  });

  const userIds = registrations.map((item) => item.userId);

  await emitContestStarted(contest, userIds);

  await scheduleContestFinish(contest);

  return res.status(200).json({
    data: contest,
  });
});

const stopContest = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
    ],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const isHaveAccess = req.user.role.permissions.find(
    (permission) => permission.name === "contest:access",
  )
    ? true
    : false;

  const author =
    contest.users?.some((user) => user.id === req.user.id) || isHaveAccess;

  if (!author) {
    return next(new AppError("You are not an author of this contest", 403));
  }

  if (contest.status !== "running") {
    return next(new AppError("Contest is not running", 400));
  }

  await removeContestFinishJob(contest.id);

  await contest.update({
    status: "finished",
    finishedAt: new Date(),
  });

  const registrations = await ContestRegistrations.findAll({
    where: {
      contestId: contest.id,
      status: "registered",
    },
    attributes: ["userId"],
  });

  const userIds = registrations.map((item) => item.userId);

  await emitContestFinished(contest, userIds);

  return res.status(200).json({
    data: contest,
  });
});

const registerContest = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id);

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  if (contest.status !== "scheduled") {
    return next(new AppError("Registration is closed", 400));
  }

  if (contest.startTime && new Date(contest.startTime) <= new Date()) {
    return next(
      new AppError(
        "Registration is closed because the contest has started",
        400,
      ),
    );
  }

  const userId = req.user.id;

  const existing = await ContestRegistrations.findOne({
    where: {
      contestId: contest.id,
      userId,
    },
  });

  if (existing) {
    if (existing.status === "blocked") {
      return next(new AppError("This user is blocked from the contest", 403));
    }

    if (existing.status === "registered") {
      return next(new AppError("User is already registered", 400));
    }

    await existing.update({
      status: "registered",
      registeredBy: req.user.id,
      registeredAt: new Date(),
    });

    return res.status(200).json({
      data: existing,
    });
  }

  const registration = await ContestRegistrations.create({
    contestId: contest.id,
    userId,
    registeredBy: req.user.id,
    registeredAt: new Date(),
    status: "registered",
  });

  return res.status(201).json({
    data: registration,
  });
});

const blockContestUser = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
    ],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const isHaveAccess = req.user.role.permissions.find(
    (permission) => permission.name === "contest:access",
  )
    ? true
    : false;

  const author =
    contest.users?.some((user) => user.id === req.user.id) || isHaveAccess;

  if (!author) {
    return next(new AppError("Only contest authors can block users", 403));
  }

  const registration = await ContestRegistrations.findOne({
    where: {
      contestId: contest.id,
      userId: req.params.userId,
      status: "registered",
    },
  });

  if (!registration) {
    return next(new AppError("Registered user not found", 404));
  }

  await registration.update({
    status: "blocked",
  });

  await emitContestBlocked(contest.id, registration.userId);

  return res.status(200).json({
    data: registration,
  });
});

const registerManualUsersToContest = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id", "username", "status"],
      },
    ],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  if (contest.status !== "scheduled") {
    return next(new AppError("Registration is closed", 400));
  }

  if (contest.startTime && new Date(contest.startTime) <= new Date()) {
    return next(
      new AppError(
        "Registration is closed because the contest has started",
        400,
      ),
    );
  }

  const isHaveAccess = req.user.role.permissions.find(
    (permission) => permission.name === "contest:access",
  )
    ? true
    : false;

  const author =
    contest.users?.some((user) => user.id === req.user.id) || isHaveAccess;

  if (!author) {
    return next(new AppError("You are not an author of this contest", 403));
  }

  const userId = req.body.userId;

  const existing = await ContestRegistrations.findAll({
    where: {
      contestId: contest.id,
      userId,
    },
  });

  if (existing?.length) {
    if (existing.status === "blocked") {
      return next(new AppError("This user is blocked from the contest", 403));
    }

    if (existing.status === "registered") {
      return next(new AppError("User is already registered", 400));
    }

    await existing.update({
      status: "registered",
      registeredBy: req.user.id,
      registeredAt: new Date(),
    });

    return res.status(200).json({
      data: existing,
    });
  }

  const registration = await ContestRegistrations.create({
    contestId: contest.id,
    userId,
    registeredBy: req.user.id,
    registeredAt: new Date(),
    status: "registered",
  });

  return res.status(201).json({
    data: registration,
  });
});

const usersByContest = catchAsync(async (req, res, next) => {
  const {
    page = "1",
    limit = "10",
    sort = "id",
    order = "desc",
    username,
    fullName,
    groupId,
    status,
  } = req.query;

  const contestId = Number(req.params.id);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const allowedSortFields = [
    "id",
    "username",
    "fullName",
    "createdAt",
    "lastLogin",
  ];

  const sortField = allowedSortFields.includes(sort) ? sort : "id";
  const sortOrder = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

  const allowedStatuses = [
    "registered",
    "cancelled",
    "blocked",
    "not-registered",
  ];

  if (status && !allowedStatuses.includes(status)) {
    return next(new AppError("Invalid registration status", 400));
  }

  const contest = await Contests.findByPk(contestId);

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  // Statuses available for the current contest.
  const allowedRegistrationStatuses = ["running", "finished"].includes(
    contest.status,
  )
    ? ["registered", "cancelled", "blocked"]
    : ["registered", "cancelled"];

  const registrationWhere = {
    contestId,
    status: {
      [Op.in]: allowedRegistrationStatuses,
    },
  };

  const effectiveStatus =
    status === "blocked" && !allowedRegistrationStatuses.includes("blocked")
      ? null
      : status;

  if (effectiveStatus && effectiveStatus !== "not-registered") {
    registrationWhere.status = effectiveStatus;
  }

  const registrations = await ContestRegistrations.findAll({
    where: registrationWhere,
    attributes: ["userId", "status", "registeredAt", "registeredBy"],
  });

  // Build a lookup for each user's registration.
  const registrationMap = new Map(
    registrations.map((registration) => [registration.userId, registration]),
  );

  const registeredUserIds = [...registrationMap.keys()];

  const where = {
    status: "active",
  };

  if (username?.trim()) {
    where.username = {
      [Op.like]: `%${username.trim()}%`,
    };
  }

  if (fullName?.trim()) {
    where.fullName = {
      [Op.like]: `%${fullName.trim()}%`,
    };
  }

  // Optional group filter.
  if (groupId) {
    const parsedGroupId = Number(groupId);

    if (!Number.isInteger(parsedGroupId) || parsedGroupId < 1) {
      return next(new AppError("Invalid group ID", 400));
    }

    where.id = {
      [Op.in]: sequelize.literal(
        `(SELECT userId FROM tbl_groups_to_users WHERE groupId = ${parsedGroupId})`,
      ),
    };
  }

  // Filter users according to their registration status.
  if (effectiveStatus === "not-registered") {
    where.id = {
      ...(where.id || {}),
      [Op.notIn]: registeredUserIds.length ? registeredUserIds : [0],
    };
  } else if (effectiveStatus) {
    where.id = {
      ...(where.id || {}),
      [Op.in]: registeredUserIds.length ? registeredUserIds : [0],
    };
  }

  const { count, rows } = await Users.findAndCountAll({
    where,
    attributes: {
      exclude: ["password"],
    },
    include: [
      {
        model: Roles,
        as: "role",
        attributes: ["id", "label"],
      },
      {
        model: Groups,
        as: "groups",
        attributes: ["id", "title"],
        through: {
          attributes: [],
        },
        required: Boolean(groupId),
        ...(groupId
          ? {
              where: {
                id: Number(groupId),
              },
            }
          : {}),
      },
    ],
    order: [[sortField, sortOrder]],
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
    distinct: true,
  });

  const data = rows.map((user) => {
    const registration = registrationMap.get(user.id);
    const plainUser = user.toJSON();

    return {
      ...plainUser,
      registrationStatus: registration?.status || "not-registered",
      registeredAt: registration?.registeredAt || null,
      registeredBy: registration?.registeredBy || null,
    };
  });

  return res.status(200).json({
    count,
    data,
  });
});

const cancelContestRegistration = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id);
  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }
  if (contest.status !== "scheduled") {
    return next(new AppError("Registration cannot be cancelled", 400));
  }

  if (contest.startTime && new Date(contest.startTime) <= new Date()) {
    return next(
      new AppError(
        "Registration cannot be cancelled because the contest has started",
        400,
      ),
    );
  }

  const registration = await ContestRegistrations.findOne({
    where: {
      contestId: contest.id,
      userId: req.user.id,
    },
  });

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  if (registration.status === "blocked") {
    return next(new AppError("This registration is blocked", 403));
  }

  await registration.destroy({});

  return res.status(200).json({
    message: "Registration cancelled successfully",
    data: registration,
  });
});
const cancelManualContestRegistration = catchAsync(async (req, res, next) => {
  const contest = await Contests.findByPk(req.params.id, {
    include: [
      {
        model: Users,
        as: "users",
        through: {
          attributes: [],
        },
        attributes: ["id"],
      },
    ],
  });

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  if (contest.status !== "scheduled") {
    return next(new AppError("Registration cannot be cancelled", 400));
  }

  if (contest.startTime && new Date(contest.startTime) <= new Date()) {
    return next(
      new AppError(
        "Registration cannot be cancelled because the contest has started",
        400,
      ),
    );
  }

  const hasAccess = req.user.role?.permissions?.some(
    (permission) => permission.name === "contest:access",
  );

  const isAuthor = contest.users?.some((user) => user.id === req.user.id);

  if (!hasAccess && !isAuthor) {
    return next(new AppError("You are not an author of this contest", 403));
  }

  const userId = Number(req.body.userId);

  if (!Number.isInteger(userId) || userId < 1) {
    return next(new AppError("A valid userId is required", 400));
  }

  const registration = await ContestRegistrations.findOne({
    where: {
      contestId: contest.id,
      userId,
    },
  });

  if (!registration) {
    return next(new AppError("Registration not found", 404));
  }

  if (registration.status === "blocked") {
    return next(new AppError("This registration is blocked", 403));
  }

  await registration.destroy({});

  return res.status(200).json({
    message: "User registration cancelled successfully",
    data: registration,
  });
});

const getClientContests = catchAsync(async (req, res, next) => {
  const { page, limit, sort = "id", order = "desc", title, status } = req.query;

  const options = {
    where: {},
    order: [[sort, order]],
    attributes: ["id", "title", "startTime", "duration", "status"],
  };

  if (page && limit) {
    const pageInt = Number(page) || 1;
    const limitInt = Number(limit) || 10;

    options.offset = (pageInt - 1) * limitInt;
    options.limit = limitInt;
  }

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  if (userPermissions.includes("use:onlyGroup")) {
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

    const contests = [...new Set(contestIds.map((row) => row.contestId))];
    if (!contests.length)
      return res.json({
        count: 0,
        data: [],
      });
    options.where.id = {
      [Op.in]: contests,
    };
    options.where.public = false;
  } else {
    options.where.public = true;
  }

  if (title?.trim()) {
    const search = title
      .trim()
      .split(" ")
      .map((r) => r.toLowerCase());
    const query = { [Op.or]: search.map((r) => ({ [Op.like]: `%${r}%` })) };
    options.where.title = query;
  }

  if (status) {
    options.where.status = status;
  }

  const { count, rows } = await Contests.findAndCountAll(options);

  const data = rows.map((row) => row.toJSON());

  const newData = [];
  for (const row of data) {
    const registrations = await ContestRegistrations.findAll({
      where: {
        contestId: row.id,
      },
    });
    const problems = await Problems.findAll({
      where: {
        contestId: row.id,
      },
    });

    row.participants = registrations.length;
    row.problems = problems.length;
    newData.push(row);
  }

  return res.status(200).json({
    count,
    data: newData,
  });
});

const getClientContest = catchAsync(async (req, res, next) => {
  // console.log("geldim");
  const options = {
    where: {
      id: req.params.id,
    },
    attributes: [
      "id",
      "title",
      "duration",
      "startTime",
      "startedAt",
      "finishedAt",
      "status",
    ],
  };
  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  if (userPermissions.includes("use:onlyGroup")) {
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

    const contests = [...new Set(contestIds.map((row) => row.contestId))];
    if (!contests.length) return next(new AppError("Data not found", 404));
    if (!contests.includes(Number(req.params.id)))
      return next(new AppError("Data not found", 404));
    options.where.public = false;
  } else {
    options.where.public = true;
  }
  let contest = await Contests.findOne(options);
  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }
  contest = contest.toJSON();

  const participateCount = await ContestRegistrations.count({
    where: { contestId: contest.id },
  });
  contest.participants = participateCount;
  let problems = [];
  let include = [];
  const attributes = ["id", "titleEn", "titleTm", "titleRu"];

  if (contest.status === "finished") attributes.push("difficulty");

  if (userPermissions.includes("use:tags")) {
    include.push({
      model: Tags,
      as: "tags",
      attributes: ["id", "titleEn", "titleTm", "titleRu"],
    });
  }
  if (contest.status === "scheduled") problems = [];
  else {
    problems = await Problems.findAll({
      where: {
        contestId: contest.id,
      },
      include,
      order: [["order", "asc"]],
      // order: [["order", "asc"]],
      attributes: attributes,
    });

    const used = {};

    let submissions = await Submissions.findAll({
      where: {
        verdict: "AC",
        status: "finished",
      },
    });
    submissions.forEach((el) => {
      if (!used[el.problemId]) used[el.problemId] = [];
      if (!used[el.problemId].includes(el.userId))
        used[el.problemId].push(el.userId);
    });
    problems = problems
      .map((row) => row.toJSON())
      .map((row) => ({
        ...row,
        accepted: used[row.id]?.length ?? 0,
      }));
  }
  contest.problems = problems;

  return res.json({ data: contest });
});

module.exports = {
  getClientContests,
  getClientContest,
  getContests,
  startContest,
  stopContest,

  registerContest,
  blockContestUser,
  registerManualUsersToContest,
  getContest,
  updateContest,
  createContest,
  usersByContest,
  cancelContestRegistration,
  cancelManualContestRegistration,
};
