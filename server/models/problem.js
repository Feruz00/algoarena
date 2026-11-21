"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Problems extends Model {
    static associate(models) {
      Problems.hasMany(models.TestGroups, {
        foreignKey: "problemId",
        as: "testGroups",
      });

      Problems.hasMany(models.Submissions, {
        foreignKey: "problemId",
        as: "submissions",
      });

      Problems.belongsTo(models.Contests, {
        foreignKey: "contestId",
        as: "contest",
      });
      Problems.belongsTo(models.Sources, {
        foreignKey: "sourceId",
        as: "source",
      });

      Problems.belongsToMany(models.Tags, {
        through: models.ProblemTags,
        foreignKey: "problemId",
        otherKey: "tagId",
        as: "tags",
      });
    }
  }

  Problems.init(
    {
      slug: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Slug is required",
          },
          len: {
            args: [1, 160],
            msg: "Slug must be between 1 and 160 characters",
          },
        },
      },

      priority: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },

      titleTm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Turkmen title is required" },
          len: {
            args: [1, 255],
            msg: "Turkmen title must be between 1 and 255 characters",
          },
        },
      },

      titleEn: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "English title is required" },
          len: {
            args: [1, 255],
            msg: "English title must be between 1 and 255 characters",
          },
        },
      },

      titleRu: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Russian title is required" },
          len: {
            args: [1, 255],
            msg: "Russian title must be between 1 and 255 characters",
          },
        },
      },

      descriptionTm: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Turkmen description is required" },
        },
      },

      descriptionEn: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        validate: {
          notEmpty: { msg: "English description is required" },
        },
      },

      descriptionRu: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Russian description is required" },
        },
      },

      inputDescriptionTm: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      inputDescriptionEn: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      inputDescriptionRu: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      outputDescriptionTm: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      outputDescriptionEn: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      outputDescriptionRu: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      timeLimitMs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
        validate: {
          isInt: {
            msg: "Time limit must be an integer",
          },
          min: {
            args: [1],
            msg: "Time limit must be greater than 0",
          },
        },
      },

      memoryLimitMb: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 256,
        validate: {
          isInt: {
            msg: "Memory limit must be an integer",
          },
          min: {
            args: [1],
            msg: "Memory limit must be greater than 0",
          },
        },
      },

      penaltyMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Penalty minutes must be an integer",
          },
          min: {
            args: [0],
            msg: "Penalty minutes cannot be negative",
          },
        },
      },

      penaltyScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Penalty score must be an integer",
          },
          min: {
            args: [0],
            msg: "Penalty score cannot be negative",
          },
        },
      },
      difficulty: {
        type: DataTypes.ENUM("beginner", "easy", "medium", "hard", "expert"),
        allowNull: false,
        defaultValue: "easy",
        validate: {
          isIn: {
            args: [["beginner", "easy", "medium", "hard", "expert"]],
            msg: "Difficulty must be beginner, easy, medium, hard, or expert",
          },
        },
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: "Creator ID must be an integer",
          },
          min: {
            args: [1],
            msg: "Creator ID must be greater than 0",
          },
        },
      },
      checkerType: {
        type: DataTypes.ENUM("exact", "tokens", "custom"),
        allowNull: false,
        defaultValue: "tokens",
        validate: {
          isIn: {
            args: [["exact", "tokens"]],
            msg: "Invalid checker type",
          },
        },
      },

      noteTm: { type: DataTypes.TEXT, allowNull: true },
      noteEn: { type: DataTypes.TEXT, allowNull: true },
      noteRu: { type: DataTypes.TEXT, allowNull: true },

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

      type: {
        type: DataTypes.ENUM("contest", "source", "hidden"),
        allowNull: false,
        defaultValue: "source",
      },
      status: {
        type: DataTypes.ENUM("active", "deactive"),
        allowNull: false,
        defaultValue: "deactive",
      },
    },
    {
      sequelize,
      modelName: "Problems",
      tableName: "tbl_problems",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: async (problem) => {
          if (problem.priority == null) {
            const maxPriority = await Problems.max("priority", {
              transaction: options.transaction,
            });
            problem.priority = (maxPriority ?? 0) + 1;
          }
        },
        async beforeDestroy(problem, options) {
          const submissions = await problem.getSubmissions();
          for (const submission of submissions) {
            await submission.destroy({
              transaction: options.transaction,
              // If this is a force delete, also force delete children
              force: options.force === true,
            });
          }
          if (options.user) {
            problem.deleted_username = options.user.username;
          } else {
            problem.deleted_username = "Administratsiya tarapyndan pozulma";
          }
        },

        async afterRestore(problem, options) {
          const submissions = await problem.getSubmissions({
            paranoid: false,
            transaction: options.transaction, // if a transaction is passed
          });
          for (const submission of submissions) {
            await submission.restore({});
          }
        },
      },
    },
  );

  return Problems;
};
