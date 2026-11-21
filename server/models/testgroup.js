"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TestGroups extends Model {
    static associate(models) {
      TestGroups.belongsTo(models.Problems, {
        foreignKey: "problemId",
        as: "problem",
      });

      TestGroups.hasMany(models.TestCases, {
        foreignKey: "groupId",
        as: "testCases",
      });
    }
  }

  TestGroups.init(
    {
      problemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Problem ID must be an integer",
          },
          min: {
            args: [1],
            msg: "Problem ID must be greater than 0",
          },
        },
      },

      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Test group name is required",
          },
          len: {
            args: [1, 120],
            msg: "Test group name must be between 1 and 120 characters",
          },
        },
      },

      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: {
            msg: "Order must be an integer",
          },
          min: {
            args: [1],
            msg: "Order must be greater than 0",
          },
        },
      },

      dependsOn: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      sequelize,
      modelName: "TestGroups",
      tableName: "tbl_test_groups",
      timestamps: true,
      paranoid: false,
    },
  );

  return TestGroups;
};
