"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_test_groups", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      problemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tbl_problems", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(120), allowNull: false },
      order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      dependsOn: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
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
    await queryInterface.addIndex("tbl_test_groups", ["problemId", "order"]);
    await queryInterface.addIndex("tbl_test_groups", ["problemId", "name"], {
      unique: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("tbl_test_groups");
  },
};
