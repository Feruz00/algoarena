"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_notifications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      messageEn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      messageRu: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      messageTm: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      titleEn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      titleRu: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      titleTm: {
        type: Sequelize.STRING,
        allowNull: false,
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
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      type: {
        type: Sequelize.ENUM(
          "note",
          "issue",
          "success",
          "error",
          "warning",
          "info",
        ),
        allowNull: false,
        defaultValue: "info",
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_notifications");
  },
};
