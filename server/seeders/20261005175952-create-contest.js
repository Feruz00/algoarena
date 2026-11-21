"use strict";

const dayjs = require("dayjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const groupContest = [];
    for (let group = 501; group <= 506; group++) {
      let k = group % 500,
        t = 0;

      const today = new Date(`${dayjs().format("YYYY-MM-DD")}T12:00:00`);
      for (let j = 3; j >= 1; j--) {
        ++t;
        const startTime =
          j == 1
            ? dayjs(today)
                .add(j * 14 + k, "day")
                .toDate()
            : dayjs(today)
                .subtract(j * 14 + k, "day")
                .toDate();
        const finished = dayjs(startTime).add(60, "minute").toDate();
        groupContest.push({
          title: `${group} topar üçin ${t} atestatsiýa`,
          duration: 60,
          startTime,
          startedAt: j == 1 ? null : startTime,
          finishedAt: j == 1 ? null : finished,
          status: j == 1 ? "scheduled" : "finished",

          public: false,
          fullTest: true,
          rating: false,
          createdAt: dayjs(startTime).subtract(1, "day").toDate(),
          updatedAt: dayjs(startTime).subtract(1, "day").toDate(),
          deletedAt: null,
        });
      }
    }

    const contests = [];
    let k = 4,
      j = 3,
      h = 0;
    while (k > 0 || j > 0) {
      ++h;
      if (k > 0) {
        const today = new Date(`${dayjs().format("YYYY-MM-DD")}T12:00:00`);
        // console.log(today);
        const startTime = dayjs(today)
          .subtract(j * 7, "day")
          .toDate();
        const finished = dayjs(startTime).add(120, "minute").toDate();
        contests.push({
          title: `2026/2027 okuw ýylynda tapgyrlaýyn bäsleşikler -- ${h}`,
          duration: 120,
          startTime: startTime,
          startedAt: startTime,
          finishedAt: finished,

          status: "finished",

          public: true,
          fullTest: true,
          rating: true,

          createdAt: dayjs(startTime).subtract(1, "day").toDate(),
          updatedAt: dayjs(startTime).subtract(1, "day").toDate(),
          deletedAt: null,
        });
        --k;
      } else {
        const today = new Date(`${dayjs().format("YYYY-MM-DD")}T12:00:00`);

        const startTime = dayjs(today)
          .add(j * 7, "day")
          .toDate();
        contests.push({
          title: `2026/2027 okuw ýylynda tapgyrlaýyn bäsleşikler -- ${h}`,
          duration: 120,
          startTime: startTime,
          startedAt: null,
          finishedAt: null,

          status: "scheduled",

          public: true,
          fullTest: false,
          rating: true,
          createdAt: dayjs(startTime).subtract(1, "day").toDate(),
          updatedAt: dayjs(startTime).subtract(1, "day").toDate(),
          deletedAt: null,
        });
        --j;
      }
    }

    await queryInterface.bulkInsert("tbl_contests", [
      ...groupContest,
      ...contests,
    ]);

    const contestGroups = [];
    let contestId = 1;
    for (let groupId = 5; groupId <= 10; groupId++) {
      for (let p = 1; p <= 3; p++) {
        contestGroups.push({
          groupId: groupId,
          contestId: contestId,
          createdAt: now,
          updatedAt: now,
        });
        contestId++;
      }
    }

    if (contestGroups.length) {
      await queryInterface.bulkInsert("tbl_contest_to_groups", contestGroups);
    }

    const contestUsers = [];

    for (let contestId = 1; contestId <= 25; contestId++) {
      for (let userId = 1; userId <= 2; userId++) {
        contestUsers.push({
          userId: userId,
          contestId: contestId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (contestUsers.length) {
      await queryInterface.bulkInsert("tbl_contest_to_users", contestUsers);
    }

    const registrations = [];
    let userId = 54;
    for (let contestId = 1; contestId <= 18; contestId += 3) {
      let k = 15;
      while (k--) {
        for (let p = contestId; p <= contestId + 2; p++) {
          contestUsers.push({
            contestId: contestId,
            userId: userId,
            registeredBy: Math.floor(Math.random() * 1) + 1,
            registeredAt: now,
            status: "registered",
            createdAt: now,
            updatedAt: now,
          });
        }
        userId++;
      }
    }

    userId = 3;
    for (let contestId = 19; contestId <= 25; contestId++) {
      for (let userId = 3; userId <= 53; userId++) {
        contestUsers.push({
          contestId: contestId,
          userId: userId,
          registeredAt: now,
          status: "registered",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (registrations.length) {
      await queryInterface.bulkInsert(
        "tbl_contest_registrations",
        registrations,
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("tbl_contest_registrations", {});

    await queryInterface.bulkDelete("tbl_contest_to_users", {});

    await queryInterface.bulkDelete("tbl_contest_to_groups", {});

    await queryInterface.bulkDelete("tbl_contests", {});
  },
};
