"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TestCases extends Model {
    static associate(models) {
      TestCases.belongsTo(models.TestGroups, {
        foreignKey: "groupId",
        as: "group",
      });
    }
  }

  TestCases.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Group ID must be an integer",
          },
          min: {
            args: [1],
            msg: "Group ID must be greater than 0",
          },
        },
      },

      input: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Test input is required",
          },
          isString(value) {
            if (typeof value !== "string") {
              throw new Error("Test input must be a string");
            }
          },
        },
      },

      expectedOutput: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        validate: {
          notNull: {
            msg: "Expected output is required",
          },
          isString(value) {
            if (typeof value !== "string") {
              throw new Error("Expected output must be a string");
            }
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

      preTest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      isSample: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "TestCases",
      tableName: "tbl_test_cases",
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          fields: ["groupId", "order"],
        },
      ],
    },
  );

  return TestCases;
};
