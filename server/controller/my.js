const { catchAsync } = require("../utils/catchAsync");

const {
  Contests,
  Problems,
  ContestRegistrations,

  Submissions,

  sequelize,
} = require("../models");
const getRegistrationsCount = catchAsync(async (req, res, next) => {
  const registrations = await ContestRegistrations.findAll({
    where: {
      userId: req.user.id,
    },
  });
  const contest = registrations.map((row) => row.contestId);
  return res.json({ count: registrations.length, data: contest });
});

const getProfilePage = catchAsync(async (req, res, next) => {
  let submissions = await Submissions.findAll({
    where: {
      id: req.user.id,
    },
    order: [["id", "desc"]],
  });
  submissions = submissions.map((row) => row.toJSON());

  let problems = new Set(
    submissions
      .filter((row) => row.verdict === "AC")
      .map((row) => row.problemId),
  ).size;

  const contests = await ContestRegistrations.count({
    where: { userId: req.user.id },
  });
  const upcoming = await Contests.findAll({
    where: {
      status: ["scheduled", "running"],
    },
    order: [["id", "desc"]],
  });
  const len = submissions.length;
  submissions = submissions?.slice(0, 5);
  const sub = await Submissions.findAll({
    where: {
      id: req.user.id,
    },
    offset: 0,
    limit: 5,
    order: [["id", "desc"]],
    include: [
      {
        model: Problems,
        as: "problem",
        attributes: ["id", "titleEn", "titleRu", "titleTm"],
      },
    ],
  });
  const data = {
    solved: problems,
    submissions: len,
    contests,
    data: sub,
    upcoming,
  };
  return res.json({ data });
});

module.exports = { getRegistrationsCount, getProfilePage };
