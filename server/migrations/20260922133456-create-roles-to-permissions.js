"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_roles_to_permissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: "tbl_roles",
        //   key: "id",
        // },
        // onUpdate: "CASCADE",
        // onDelete: "CASCADE",
      },

      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: "tbl_permissions",
        //   key: "id",
        // },
        // onUpdate: "CASCADE",
        // onDelete: "CASCADE",
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

    await queryInterface.addIndex(
      "tbl_roles_to_permissions",
      ["roleId", "permissionId"],
      {
        unique: true,
        name: "unique_role_permission",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "tbl_roles_to_permissions",
      "unique_role_permission",
    );

    await queryInterface.dropTable("tbl_roles_to_permissions");
  },
};
