"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_sources", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      titleEn: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      titleTm: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      titleRu: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      subTitleEn: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      subTitleTm: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      subTitleRu: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      theoryEn: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },

      theoryTm: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },

      theoryRu: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },

      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tbl_sources",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      status: {
        type: Sequelize.ENUM("active", "deactive"),
        allowNull: false,
        defaultValue: "deactive",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
      deleted_username: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("tbl_sources", ["parentId"], {
      name: "idx_tbl_sources_parent_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tbl_sources");
  },
};
