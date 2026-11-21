"use strict";

const { Model } = require("sequelize");
const { removeContestJobs } = require("../queue/contestQueue");

module.exports = (sequelize, DataTypes) => {
  class Contests extends Model {
    static associate(models) {
      Contests.belongsToMany(models.Groups, {
        through: models.ContestGroups,
        foreignKey: "contestId",
        otherKey: "groupId",
        as: "groups",
      });

      Contests.belongsToMany(models.Users, {
        through: models.ContestUsers,
        foreignKey: "contestId",
        otherKey: "userId",
        as: "users",
      });

      Contests.hasMany(models.Problems, {
        foreignKey: "contestId",
        as: "problems",
      });

      Contests.hasMany(models.Submissions, {
        foreignKey: "contestId",
        as: "submissions",
      });
    }
  }

  Contests.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title is required",
          },
          notEmpty: {
            msg: "Title is required",
          },
          len: {
            args: [2, 255],
            msg: "Title must be between 2 and 255 characters",
          },
          isValidTitle(value) {
            if (typeof value !== "string") {
              throw new Error("Title must be a string");
            }

            if (value.trim().length < 2) {
              throw new Error("Title must contain at least 2 characters");
            }
          },
        },
        set(value) {
          this.setDataValue(
            "title",
            typeof value === "string" ? value.trim() : value,
          );
        },
      },

      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Duration is required",
          },
          isInt: {
            msg: "Duration must be an integer",
          },
          min: {
            args: [1],
            msg: "Duration must be greater than 0",
          },
        },
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        validate: {
          isDate: {
            msg: "Start time must be a valid date",
          },
        },
      },

      public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isBoolean(value) {
            if (typeof value !== "boolean") {
              throw new Error("Public must be true or false");
            }
          },
        },
      },

      fullTest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isBoolean(value) {
            if (typeof value !== "boolean") {
              throw new Error("Full test must be true or false");
            }
          },
        },
      },

      rating: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isBoolean(value) {
            if (typeof value !== "boolean") {
              throw new Error("Rating must be true or false");
            }
          },
        },
      },

      status: {
        type: DataTypes.ENUM("scheduled", "running", "finished", "deactive"),
        allowNull: false,
        defaultValue: "deactive",
      },

      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      deleted_username: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      finishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      penaltyMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Penalty must be an integer",
          },
          min: {
            args: [0],
            msg: "Penalty cannot be negative",
          },
          max: {
            args: [1440],
            msg: "Penalty cannot exceed 1440 minutes",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Contests",
      tableName: "tbl_contests",
      paranoid: true,
      hooks: {
        async beforeDestroy(contest, options) {
          if (contest.status === "running") {
            throw new Error("Running contest cannot be deleted");
          }

          await removeContestJobs(contest.id);

          if (options.user) {
            contest.deleted_username = options.user.username;
          } else {
            contest.deleted_username = "Administratsiya tarapyndan pozulma";
          }
        },
        async afterDestroy(contest, options) {
          if (options.force) {
            const problems = await contest.getProblems();
            for (const problem of problems) {
              await problem.update(
                { contestId: null, sourceId: null },
                { hooks: false },
              );
            }
          }
        },
      },
    },
  );

  return Contests;
};
