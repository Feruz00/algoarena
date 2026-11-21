"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Submissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Submissions.belongsTo(models.Problems, {
        foreignKey: "problemId",
        as: "problem",
      });

      Submissions.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });

      Submissions.belongsTo(models.Contests, {
        foreignKey: "contestId",
        as: "contest",
      });
      Submissions.belongsTo(models.Sources, {
        foreignKey: "sourceId",
        as: "source",
      });
    }
  }
  Submissions.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      problemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contestId: {
        type: DataTypes.INTEGER,
      },
      sourceId: {
        type: DataTypes.INTEGER,
      },

      verdict: {
        type: DataTypes.ENUM("AC", "WA", "PE", "CE", "RE", "TLE", "MLE"),
      },
      status: {
        type: DataTypes.ENUM("queue", "compiling", "running", "finished"),
        defaultValue: "queue",
      },
      lang: {
        type: DataTypes.STRING,
        defaultValue: "cpp",
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      code: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      timeMs: DataTypes.INTEGER,
      memoryKb: DataTypes.INTEGER,
      log: DataTypes.TEXT("long"),
      duringContest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Submissions",
      tableName: "tbl_submissions",

      paranoid: true,
    },
  );
  return Submissions;
};
