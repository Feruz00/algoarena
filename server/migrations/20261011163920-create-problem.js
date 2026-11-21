"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_problems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      priority: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },

      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      titleTm: { type: Sequelize.STRING(255), allowNull: false },
      titleEn: { type: Sequelize.STRING(255), allowNull: false },
      titleRu: { type: Sequelize.STRING(255), allowNull: false },
      descriptionTm: { type: Sequelize.TEXT("long"), allowNull: false },
      descriptionEn: { type: Sequelize.TEXT("long"), allowNull: false },
      descriptionRu: { type: Sequelize.TEXT("long"), allowNull: false },
      inputDescriptionTm: { type: Sequelize.TEXT, allowNull: true },
      inputDescriptionEn: { type: Sequelize.TEXT, allowNull: true },
      inputDescriptionRu: { type: Sequelize.TEXT, allowNull: true },
      outputDescriptionTm: { type: Sequelize.TEXT, allowNull: true },
      outputDescriptionEn: { type: Sequelize.TEXT, allowNull: true },
      outputDescriptionRu: { type: Sequelize.TEXT, allowNull: true },

      noteTm: { type: Sequelize.TEXT, allowNull: true },
      noteEn: { type: Sequelize.TEXT, allowNull: true },
      noteRu: { type: Sequelize.TEXT, allowNull: true },

      penaltyMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      penaltyScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      timeLimitMs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000,
      },

      memoryLimitMb: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 256,
      },

      difficulty: {
        type: Sequelize.ENUM("beginner", "easy", "medium", "hard", "expert"),
        allowNull: false,
        defaultValue: "easy",
      },

      type: {
        type: Sequelize.ENUM("contest", "source", "hidden"),
        allowNull: false,
        defaultValue: "source",
      },

      status: {
        type: Sequelize.ENUM("active", "deactive"),
        allowNull: false,
        defaultValue: "deactive",
      },

      createdBy: { type: Sequelize.INTEGER, allowNull: true },
      checkerType: {
        type: Sequelize.ENUM("exact", "tokens"),
        allowNull: false,
        defaultValue: "tokens",
      },

      contestId: {
        type: Sequelize.INTEGER,
        references: {
          model: "tbl_contests",
          key: "id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
      },
      sourceId: {
        type: Sequelize.INTEGER,
        references: {
          model: "tbl_sources",
          key: "id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
      deletedAt: { allowNull: true, type: Sequelize.DATE },
    });
    await queryInterface.addIndex("tbl_problems", ["priority"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("tbl_problems");
    // If your Sequelize/MySQL version leaves the ENUM type behind, remove it using your normal migration cleanup.
  },
};
