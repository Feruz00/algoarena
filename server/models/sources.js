"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sources extends Model {
    static associate(models) {
      // Parent
      Sources.belongsTo(models.Sources, {
        foreignKey: "parentId",
        as: "parent",
      });

      Sources.hasMany(models.Sources, {
        foreignKey: "parentId",
        as: "childrens",
      });

      Sources.hasMany(models.Problems, {
        foreignKey: "sourceId",
        as: "problems",
      });
    }
  }

  Sources.init(
    {
      titleEn: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "English title is required",
          },
          len: {
            args: [1, 255],
            msg: "English title must be between 1 and 255 characters",
          },
        },
      },

      titleTm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Turkmen title is required",
          },
          len: {
            args: [1, 255],
            msg: "Turkmen title must be between 1 and 255 characters",
          },
        },
      },

      titleRu: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Russian title is required",
          },
          len: {
            args: [1, 255],
            msg: "Russian title must be between 1 and 255 characters",
          },
        },
      },

      subTitleEn: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "English subTitle is required",
          },
          len: {
            args: [1, 255],
            msg: "English subTitle must be between 1 and 255 characters",
          },
        },
      },

      subTitleTm: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Turkmen subTitle is required",
          },
          len: {
            args: [1, 255],
            msg: "Turkmen subTitle must be between 1 and 255 characters",
          },
        },
      },

      subTitleRu: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Russian subTitle is required",
          },
          len: {
            args: [1, 255],
            msg: "Russian subTitle must be between 1 and 255 characters",
          },
        },
      },

      theoryEn: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        validate: {
          isString(value) {
            if (
              value !== null &&
              value !== undefined &&
              typeof value !== "string"
            ) {
              throw new Error("English theory must be a string");
            }
          },
        },
      },

      theoryTm: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        validate: {
          isString(value) {
            if (
              value !== null &&
              value !== undefined &&
              typeof value !== "string"
            ) {
              throw new Error("Turkmen theory must be a string");
            }
          },
        },
      },

      theoryRu: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        validate: {
          isString(value) {
            if (
              value !== null &&
              value !== undefined &&
              typeof value !== "string"
            ) {
              throw new Error("Russian theory must be a string");
            }
          },
        },
      },

      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: "Parent ID must be an integer",
          },

          isPositive(value) {
            if (value !== null && value !== undefined && value <= 0) {
              throw new Error("Parent ID must be greater than 0");
            }
          },
        },
      },
      status: {
        type: DataTypes.ENUM("active", "deactive"),
        allowNull: false,
        defaultValue: "deactive",
      },
    },
    {
      sequelize,
      modelName: "Sources",
      tableName: "tbl_sources",
      timestamps: true,
      paranoid: true,
      hooks: {
        async beforeDestroy(source, options) {
          const problems = await source.getProblems();
          for (const problem of problems) {
            await problem.destroy({
              transaction: options.transaction,
              // If this is a force delete, also force delete children
              force: options.force === true,
            });
          }
          if (options.user) {
            source.deleted_username = options.user.username;
          } else {
            source.deleted_username = "Administratsiya tarapyndan pozulma";
          }
        },
        async afterRestore(source, options) {
          const problems = await source.getProblems({
            paranoid: false,
            transaction: options.transaction, // if a transaction is passed
          });
          for (const problem of problems) {
            await problem.restore({});
          }
        },
      },
    },
  );

  return Sources;
};
