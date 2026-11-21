"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_submissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      problemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_problems",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      contestId: {
        type: Sequelize.INTEGER,
      },
      sourceId: {
        type: Sequelize.INTEGER,
      },
      verdict: {
        type: Sequelize.ENUM("AC", "WA", "PE", "CE", "RE", "TLE", "MLE"),
      },
      status: {
        type: Sequelize.ENUM("queue", "compiling", "running", "finished"),
        defaultValue: "queue",
      },
      lang: {
        type: Sequelize.STRING,
        defaultValue: "cpp",
      },
      code: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      timeMs: {
        type: Sequelize.INTEGER,
      },
      memoryKb: {
        type: Sequelize.INTEGER,
      },
      log: {
        type: Sequelize.TEXT("long"),
      },
      duringContest: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deleted_username: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("tbl_submissions", ["userId"]);
    await queryInterface.addIndex("tbl_submissions", ["problemId"]);
    await queryInterface.addIndex("tbl_submissions", ["contestId"]);
    await queryInterface.addIndex("tbl_submissions", ["sourceId"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_submissions");
  },
};
