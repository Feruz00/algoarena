const { catchAsync } = require("../utils/catchAsync");
const {
  Users,
  Problems,
  Contests,
  Submissions,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const getDashboardStats = catchAsync(async (req, res) => {
  const todayStart = dayjs().startOf("day").toDate();
  const sevenDaysAgo = dayjs().subtract(6, "day").startOf("day").toDate();

  // Parallel queries for performance
  const [
    totalUsers,
    todayUsers,
    totalProblems,
    activeProblems,
    totalContests,
    contestsByStatus,
    totalSubmissions,
    acceptedSubmissions,
    todaySubmissions,
    submissionsLast7Days,
    verdictStats,
  ] = await Promise.all([
    // Users
    Users.count({ where: { status: "active" } }),
    Users.count({
      where: {
        createdAt: { [Op.gte]: todayStart },
      },
    }),

    // Problems
    Problems.count(),
    Problems.count({ where: { status: "active" } }),

    // Contests
    Contests.count(),
    Contests.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),

    // Submissions
    Submissions.count(),
    Submissions.count({ where: { verdict: "AC" } }),
    Submissions.count({
      where: { createdAt: { [Op.gte]: todayStart } },
    }),

    // Last 7 days submissions (for chart)
    Submissions.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(`CASE WHEN verdict = 'AC' THEN 1 ELSE 0 END`),
          ),
          "accepted",
        ],
      ],
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
      },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    }),

    // Verdict distribution
    Submissions.findAll({
      attributes: [
        "verdict",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        verdict: { [Op.ne]: null },
      },
      group: ["verdict"],
      raw: true,
    }),
  ]);

  // Format contests by status
  const statusMap = {
    scheduled: 0,
    running: 0,
    finished: 0,
    deactive: 0,
  };
  contestsByStatus.forEach((row) => {
    statusMap[row.status] = Number(row.count);
  });

  // Fill missing days for the last 7 days chart
  const daysMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    daysMap[d] = { date: d, count: 0, accepted: 0 };
  }
  submissionsLast7Days.forEach((row) => {
    const d = dayjs(row.date).format("YYYY-MM-DD");
    if (daysMap[d]) {
      daysMap[d].count = Number(row.count);
      daysMap[d].accepted = Number(row.accepted);
    }
  });

  const submissionsChart = Object.values(daysMap);

  // Verdict chart data
  const verdictChart = verdictStats.map((row) => ({
    type: row.verdict || "Unknown",
    value: Number(row.count),
  }));

  return res.status(200).json({
    users: {
      total: totalUsers,
      today: todayUsers,
    },
    problems: {
      total: totalProblems,
      active: activeProblems,
    },
    contests: {
      total: totalContests,
    },
    contestsByStatus: statusMap,
    submissions: {
      total: totalSubmissions,
      accepted: acceptedSubmissions,
      today: todaySubmissions,
      acceptanceRate:
        totalSubmissions > 0
          ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
          : 0,
    },
    charts: {
      submissionsLast7Days: submissionsChart,
      verdictDistribution: verdictChart,
    },
  });
});

const getRecentContests = catchAsync(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);

  const contests = await Contests.findAll({
    attributes: ["id", "title", "status", "startTime", "duration", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit,
  });

  // Optional: add participant count
  const data = await Promise.all(
    contests.map(async (c) => {
      const json = c.toJSON();
      // If you have ContestRegistrations model:
      // json.participants = await ContestRegistrations.count({ where: { contestId: c.id } });
      json.participants = 0; // replace later if needed
      return json;
    }),
  );

  return res.status(200).json({ data });
});

const getRecentSubmissions = catchAsync(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 30);

  const submissions = await Submissions.findAll({
    attributes: ["id", "verdict", "score", "lang", "createdAt", "status"],
    include: [
      {
        model: Users,
        as: "user",
        attributes: ["id", "username"],
      },
      {
        model: Problems,
        as: "problem",
        attributes: ["id", "titleTm", "titleEn"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
  });

  return res.status(200).json({
    data: submissions.map((s) => s.toJSON()),
  });
});

module.exports = {
  getDashboardStats,
  getRecentContests,
  getRecentSubmissions,
};
