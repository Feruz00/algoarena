"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const titles = ["Saýlama tapgyr", "Esasy bäsleşik"];
    const items = [];
    for (let i = 1; i <= 2; i++) {
      items.push({
        title: `${titles[0]} ${i}`,
        description: "Saýlama tapgyr bäsleşigi",
      });
      items.push({
        title: `${titles[1]} ${i}`,
        description: "Esasy bäsleşik tapgyrlary",
      });
    }

    let toparlar = [501, 502, 503, 504, 505, 506];
    for (let i = 0; i < toparlar.length; i++) {
      items.push({
        title: `${toparlar[i]}`,
        description: "Toparlara degişli bäsleşik",
      });
    }

    await queryInterface.bulkInsert(
      "tbl_groups",
      items.map((row) => ({
        ...row,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tbl_groups", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("tbl_groups", null, {});
  },
};
