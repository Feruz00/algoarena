"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_test_cases", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tbl_test_groups", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      preTest: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      input: { type: Sequelize.TEXT("long"), allowNull: false },
      expectedOutput: { type: Sequelize.TEXT("long"), allowNull: false },
      order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      isSample: {
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
    });
    await queryInterface.addIndex("tbl_test_cases", ["groupId", "order"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("tbl_test_cases");
  },
};
