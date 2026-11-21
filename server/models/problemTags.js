"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProblemTags extends Model {
    static associate(models) {
      //   Problems.hasMany(models.TestGroups, {
      //     foreignKey: "problemId",
      //     as: "testGroups",
      //   });
    }
  }

  ProblemTags.init(
    {
      problemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "tbl_problems",
          key: "id",
        },
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "tbl_tags",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "ProblemTags",
      tableName: "tbl_problem_tags",
      timestamps: true,
      paranoid: false,
    },
  );

  return ProblemTags;
};
