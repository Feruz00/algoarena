"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Groups extends Model {
    static associate(models) {
      Groups.belongsToMany(models.Users, {
        through: models.GroupsToUser,
        foreignKey: "groupId",
        otherKey: "userId",
        as: "users",
      });

      Groups.belongsToMany(models.Contests, {
        through: models.ContestGroups,
        foreignKey: "groupId",
        otherKey: "contestId",
        as: "contests",
      });
    }
  }

  Groups.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title is required",
          },
          len: {
            args: [3, 50],
            msg: "Title must be between 3 and 50 characters",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Description is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Groups",
      tableName: "tbl_groups",
      paranoid: true,

      hooks: {
        async beforeDestroy(group, options) {
          if (options.user) {
            group.deleted_username = options.user.username;
          } else {
            group.deleted_username = "Administratsiya tarapyndan pozulma";
          }
        },
      },
    },
  );

  return Groups;
};
