"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING, // keep for failed attempts (you may want to hash/mask later)
        allowNull: true,
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // NEW columns
      action: {
        type: Sequelize.ENUM("login_success", "login_failed", "logout"),
        allowNull: false,
        defaultValue: "login_failed",
      },
      status: {
        type: Sequelize.ENUM("success", "failed"),
        allowNull: false,
        defaultValue: "failed",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tbl_users", // change if your users table name is different
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      message: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // useful indexes
    await queryInterface.addIndex("tbl_logs", ["username"]);
    await queryInterface.addIndex("tbl_logs", ["ip"]);
    await queryInterface.addIndex("tbl_logs", ["action"]);
    await queryInterface.addIndex("tbl_logs", ["status"]);
    await queryInterface.addIndex("tbl_logs", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_logs");
  },
};
