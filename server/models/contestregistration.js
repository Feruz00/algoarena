"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ContestRegistrations extends Model {
    static associate(models) {
      ContestRegistrations.belongsTo(models.Contests, {
        foreignKey: "contestId",
        as: "contest",
      });

      ContestRegistrations.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      ContestRegistrations.belongsTo(models.Users, {
        foreignKey: "registeredBy",
        as: "registeredByUser",
      });
    }
  }

  ContestRegistrations.init(
    {
      contestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      registeredBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      registeredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      status: {
        type: DataTypes.ENUM("registered", "blocked"),
        allowNull: false,
        defaultValue: "registered",
      },
    },
    {
      sequelize,
      modelName: "ContestRegistrations",
      tableName: "tbl_contest_registrations",
      timestamps: true,
    },
  );

  return ContestRegistrations;
};
