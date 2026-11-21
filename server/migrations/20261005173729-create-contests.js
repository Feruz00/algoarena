"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_contests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      penaltyMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      startTime: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      status: {
        type: Sequelize.ENUM("scheduled", "running", "finished", "deactive"),
        allowNull: false,
        defaultValue: "scheduled",
      },

      startedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      finishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      fullTest: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      rating: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_username: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tbl_contests");
  },
};
