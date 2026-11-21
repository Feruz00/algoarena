const { Op } = require("sequelize");
const {
  Contests,
  Problems,
  Submissions,
  Users,
  ContestRegistrations,
} = require("../models");
const XLSX = require("xlsx");

const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const dayjs = require("dayjs");

const getContestResults = catchAsync(async (req, res, next) => {
  const contestId = Number(req.params.id);

  if (!Number.isInteger(contestId) || contestId < 1) {
    return next(new AppError("Invalid contest ID", 400));
  }

  const contest = await Contests.findByPk(contestId);

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }
  const startTime = dayjs(contest.startTime);

  const contestProblems = await Problems.findAll({
    where: { contestId },
    order: [["order", "ASC"]],
  });

  const problems = contestProblems.map((item, index) => ({
    id: item.id,
    order: item.order ?? index + 1,
    title: item?.titleTm ?? `Problem ${index + 1}`,
  }));
  //   console.log(problems);
  const problemIds = problems.map((problem) => problem.id);

  let submissions = await Submissions.findAll({
    where: {
      contestId,
      problemId: { [Op.in]: problemIds },
      status: "finished",
    },
    order: [["createdAt", "ASC"]],
  });
  submissions = submissions.map((row) => row.toJSON());

  let users = await ContestRegistrations.findAll({
    where: {
      contestId,
    },
  });
  users = users.map((row) => row.userId);
  users = users.map((row) => ({ id: row, problems }));
  const userIds = users.map((user) => user.id);

  const userRecords = await Users.findAll({
    where: {
      id: { [Op.in]: userIds },
    },
    attributes: ["id", "username"],
  });

  const usernameById = new Map(
    userRecords.map((user) => [user.id, user.username]),
  );

  users = users.map((row) => {
    const { problems } = row;

    const mySubmissions = submissions.filter((tr) => tr.userId === row.id);

    let totalScore = 0,
      totalTime = 0;

    const results = problems.map((problem) => {
      const byProblem = mySubmissions
        .filter((dt) => dt.problemId === problem.id)
        .map((dt) => ({
          time: Math.abs(dayjs(startTime).diff(dayjs(dt.createdAt))),
          score: dt.score,
        }))
        .sort((a, b) => b.score - a.score || a.time - b.time);

      const best = byProblem[0] ?? {
        time: null,
        score: 0,
      };

      totalScore += best.score ?? 0;
      totalTime += best.time ?? 0;

      return {
        problemId: problem.id,
        title: problem.title,
        score: best.score,
        time: best.time,
        total: byProblem.length,
      };
    });

    return {
      id: row.id,

      username: usernameById.get(row.id) ?? `Ulanyjy ${row.id}`,

      problems: results,
      score: totalScore,
      time: totalTime,
    };
  });

  users.sort((a, b) => b.score - a.score || a.time - b.time);

  res.json({
    data: {
      contest,
      problems,
      users,
    },
  });
});

const getClientContestStaticts = catchAsync(async (req, res, next) => {
  const { page, limit = 10 } = req.query;

  const limitInt = Number(limit) || 10;

  const contestId = Number(req.params.id);

  if (!Number.isInteger(contestId) || contestId < 1) {
    return next(new AppError("Invalid contest ID", 400));
  }

  const contest = await Contests.findByPk(contestId);

  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  if (["scheduled", "deactive"].includes(contest.status))
    return next(new AppError("Contest must be running or finished", 400));

  const submissionQuery = {
    contestId,
    status: "finished",
  };

  const registrationQuery = {
    contestId,
  };

  const userPermissions =
    req.user?.role?.permissions?.map((row) => row.name) || [];

  if (userPermissions.includes("use:onlyGroup")) {
    submissionQuery.userId = req.user.id;
    registrationQuery.userId = req.user.id;
  }

  let submissions = await Submissions.findAll({
    where: submissionQuery,
    order: [["createdAt", "ASC"]],
    // attributes:[['userId',"id","score","problemId"]]
  });
  const userScore = {};
  const startTime = dayjs(contest.startTime);

  submissions
    .map((row) => row.toJSON())
    .forEach((el) => {
      const key = `${el.userId}-${el.problemId}`;
      const time = Math.abs(dayjs(el.createdAt).diff(startTime));

      if (!userScore[key]) {
        userScore[key] = {
          time,
          count: 1,
          score: el.score,
        };
      } else {
        userScore[key].count++;

        if (
          el.score > userScore[key].score ||
          (el.score === userScore[key].score && time < userScore[key].time)
        ) {
          userScore[key].score = el.score;
          userScore[key].time = time;
        }
      }
    });

  const userFullScore = {};

  Object.entries(userScore).forEach(([key, val]) => {
    const [userId] = key.split("-").map(Number);

    if (!userFullScore[userId]) {
      userFullScore[userId] = {
        score: val.score,
        time: val.time,
      };
    } else {
      userFullScore[userId].score += val.score;
      userFullScore[userId].time += val.time;
    }
  });

  // console.log("ikinji:", values);
  let result = [];
  Object.keys(userFullScore).forEach((row) => {
    const userId = Number(row);
    result.push({
      id: userId,
      ...userFullScore[row],
    });
  });

  result.sort((a, b) => b.score - a.score || a.time - b.time);

  let currentPage = result.findIndex((row) => row.id === req.user.id);
  if (currentPage === -1) currentPage = 1;
  else currentPage = Math.floor(currentPage / limitInt) + 1;

  if (page) {
    currentPage = Number(page) || 1;
  }
  const count = result.length;
  result = result.slice((currentPage - 1) * limitInt, currentPage * limitInt);
  const userIds = result.map((data) => data.id);

  const userRecords = await Users.findAll({
    where: {
      id: { [Op.in]: userIds },
    },
    attributes: ["id", "username"],
  });
  const usernameById = new Map(
    userRecords.map((user) => [user.id, user.username]),
  );

  let problems = await Problems.findAll({
    where: { contestId },
    order: [["order", "ASC"]],
    attributes: ["id", "titleEn", "titleRu", "titleTm"],
  });
  problems = problems.map((row) => row.toJSON());
  // console.log(userScore);

  result = result.map((row) => {
    const ans = problems.map((problem) => {
      const key = `${row.id}-${problem.id}`;
      let val;
      if (!userScore[key]) val = { count: 0, score: 0, time: 0 };
      else val = userScore[key];
      // console.log(key, val);
      return { ...val, problemId: problem.id };
    });
    return {
      ...row,
      username: usernameById.get(row.id) ?? `Ulanyjy ${row.id}`,
      problems: ans,
    };
  });

  return res.json({
    data: result,
    problems,
    count,

    page: currentPage,
  });

  // users = users.map((row) => {

  //   let totalScore = 0,
  //     totalTime = 0;

  //   const results = problems.map((problem) => {
  //     const byProblem = mySubmissions
  //       .filter((dt) => dt.problemId === problem.id)
  //       .map((dt) => ({
  //         time: dayjs(dt.createdAt).diff(startTime),
  //         score: dt.score,
  //       }))
  //       .sort((a, b) => b.score - a.score || a.time - b.time);

  //     const best = byProblem[0] ?? {
  //       time: null,
  //       score: 0,
  //     };

  //     totalScore += best.score;
  //     totalTime += best.time ?? 0;

  //     return {
  //       problemId: problem.id,
  //       titleEn: problem.titleEn,
  //       titleRu: problem.titleRu,
  //       titleTm: problem.titleTm,
  //       order: problem.order,
  //       score: best.score,
  //       time: best.time,
  //       total: byProblem.length,
  //     };
  //   });

  //   return {
  //     id: row.id,
  //     username: usernameById.get(row.id) ?? `Ulanyjy ${row.id}`,
  //     problems: results,
  //     score: totalScore,
  //     time: totalTime,
  //   };
  // });

  // users.sort((a, b) => b.score - a.score || a.time - b.time);

  // res.json({
  //   data: {
  //     contest,
  //     problems,
  //     users,
  //   },
  // });
});

const exportContestResults = catchAsync(async (req, res, next) => {
  const contestId = Number(req.params.id);

  if (!Number.isInteger(contestId) || contestId < 1) {
    return next(new AppError("Invalid contest ID", 400));
  }

  const contest = await Contests.findByPk(contestId);
  if (!contest) {
    return next(new AppError("Contest not found", 404));
  }

  const startTime = dayjs(contest.startTime);

  const contestProblems = await Problems.findAll({
    where: { contestId },
    order: [["order", "ASC"]],
  });

  const problems = contestProblems.map((item, index) => ({
    id: item.id,
    order: item.order ?? index + 1,
    title: item?.titleTm ?? `Problem ${index + 1}`,
  }));

  const problemIds = problems.map((p) => p.id);

  let submissions = await Submissions.findAll({
    where: {
      contestId,
      problemId: { [Op.in]: problemIds },
      status: "finished",
    },
    order: [["createdAt", "ASC"]],
  });
  submissions = submissions.map((row) => row.toJSON());

  let registrations = await ContestRegistrations.findAll({
    where: { contestId },
  });
  const userIds = registrations.map((r) => r.userId);

  const userRecords = await Users.findAll({
    where: { id: { [Op.in]: userIds } },
    attributes: ["id", "username"],
  });

  const usernameById = new Map(userRecords.map((u) => [u.id, u.username]));

  let users = userIds.map((id) => {
    const mySubmissions = submissions.filter((s) => s.userId === id);

    let totalScore = 0;
    let totalTime = 0;

    const results = problems.map((problem) => {
      const byProblem = mySubmissions
        .filter((s) => s.problemId === problem.id)
        .map((s) => ({
          time: Math.abs(dayjs(startTime).diff(dayjs(s.createdAt))),
          score: s.score,
        }))
        .sort((a, b) => b.score - a.score || a.time - b.time);

      const best = byProblem[0] ?? { time: null, score: 0 };

      totalScore += best.score ?? 0;
      totalTime += best.time ?? 0;

      return {
        problemId: problem.id,
        title: problem.title,
        score: best.score,
        time: best.time,
        total: byProblem.length,
      };
    });

    return {
      id,
      username: usernameById.get(id) ?? `Ulanyjy ${id}`,
      problems: results,
      score: totalScore,
      time: totalTime,
    };
  });

  users.sort((a, b) => b.score - a.score || a.time - b.time);

  // ========== Build rows for xlsx ==========
  const header = [
    "Rank",
    "Username",
    ...problems.map((p) => p.title),
    "Total Score",
    "Total Time (ms)",
  ];

  const rows = users.map((user, index) => [
    index + 1,
    user.username,
    ...user.problems.map((p) => p.score ?? 0),
    user.score,
    user.time ?? 0,
  ]);

  const worksheetData = [header, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  // Generate buffer
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=contest-${contestId}-results.xlsx`,
  );

  res.send(buffer);
});

module.exports = {
  getContestResults,
  getClientContestStaticts,
  exportContestResults,
};
