"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Tags extends Model {
    static associate(models) {
      Tags.belongsToMany(models.Problems, {
        through: models.ProblemTags,
        foreignKey: "tagId",
        otherKey: "problemId",
        as: "problems",
      });

      // Add associations here if needed later.
    }
  }

  Tags.init(
    {
      titleTm: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Türkmençe tag adyny giriziň",
          },
          len: {
            args: [1, 120],
            msg: "Tag ady 1-120 nyşan aralygynda bolmaly",
          },
        },
      },

      titleEn: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Enter the English tag title",
          },
          len: {
            args: [1, 120],
            msg: "Tag title must be between 1 and 120 characters",
          },
        },
      },

      titleRu: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Введите русское название тега",
          },
          len: {
            args: [1, 120],
            msg: "Название тега должно содержать от 1 до 120 символов",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Tags",
      tableName: "tbl_tags",
      timestamps: true,
      paranoid: true,
      hooks: {
        async beforeDestroy(tag, options) {
          if (options.user) {
            tag.deleted_username = options.user.username;
          } else {
            tag.deleted_username = "Administratsiya tarapyndan pozulma";
          }
        },
      },
    },
  );

  return Tags;
};
