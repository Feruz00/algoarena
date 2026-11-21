"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_tags", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      titleTm: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      titleEn: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      titleRu: {
        type: Sequelize.STRING(120),
        allowNull: false,
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
      },
    });

    await queryInterface.addIndex("tbl_tags", ["titleTm"]);
    await queryInterface.addIndex("tbl_tags", ["titleEn"]);
    await queryInterface.addIndex("tbl_tags", ["titleRu"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tbl_tags");
  },
};
