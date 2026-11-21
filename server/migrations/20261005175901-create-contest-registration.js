"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_contest_registrations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      contestId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_contests",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

      registeredBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tbl_users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      registeredAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      status: {
        type: Sequelize.ENUM("registered", "blocked"),
        allowNull: false,
        defaultValue: "registered",
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

    await queryInterface.addIndex(
      "tbl_contest_registrations",
      ["contestId", "userId"],
      {
        unique: true,
        name: "unique_contest_registration",
      },
    );

    await queryInterface.addIndex("tbl_contest_registrations", ["contestId"], {
      name: "idx_contest_registrations_contest",
    });

    await queryInterface.addIndex("tbl_contest_registrations", ["userId"], {
      name: "idx_contest_registrations_user",
    });

    await queryInterface.addIndex(
      "tbl_contest_registrations",
      ["registeredBy"],
      {
        name: "idx_contest_registrations_registered_by",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "tbl_contest_registrations",
      "unique_contest_registration",
    );

    await queryInterface.removeIndex(
      "tbl_contest_registrations",
      "idx_contest_registrations_contest",
    );

    await queryInterface.removeIndex(
      "tbl_contest_registrations",
      "idx_contest_registrations_user",
    );

    await queryInterface.removeIndex(
      "tbl_contest_registrations",
      "idx_contest_registrations_registered_by",
    );

    await queryInterface.dropTable("tbl_contest_registrations");
  },
};
