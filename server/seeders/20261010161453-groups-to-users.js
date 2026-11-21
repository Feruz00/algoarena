"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    let userId = 54;
    const data = [];
    for (let groupId = 5; groupId <= 10; groupId++) {
      let k = 15;
      while (k--) {
        data.push({
          groupId,
          userId,
          createdAt: now,
          updatedAt: now,
        });
        userId++;
      }
    }

    await queryInterface.bulkInsert("tbl_groups_to_users", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tbl_groups_to_users", null, {});
  },
};
