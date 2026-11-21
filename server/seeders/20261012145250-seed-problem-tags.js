"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rows = [];
    const tagCount = 75,
      problemCount = 185;
    const now = new Date();
    for (let problemId = 1; problemId <= problemCount; problemId++) {
      let usedIds = [];
      let k = 5;
      while (k) {
        const tagId = Math.floor(Math.random() * tagCount) + 1;
        if (!usedIds.includes(tagId)) {
          usedIds.push(tagId);
          k--;
          rows.push({
            problemId,
            tagId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
    if (rows.length) {
      await queryInterface.bulkInsert("tbl_problem_tags", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("tbl_problem_tags", null, {});
  },
};
