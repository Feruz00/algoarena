"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Permissions extends Model {
    static associate(models) {
      Permissions.belongsToMany(models.Roles, {
        through: models.RolesToPermissions,
        foreignKey: "permissionId",
        otherKey: "roleId",
        as: "roles",
      });
    }
  }

  Permissions.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Permission name is required",
          },
          len: {
            args: [2, 100],
            msg: "Permission name must be between 2 and 100 characters",
          },
        },
      },

      sub: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Sub must be an integer",
          },
          min: {
            args: [0],
            msg: "Sub cannot be negative",
          },
        },
      },

      main: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Main must be an integer",
          },
          min: {
            args: [0],
            msg: "Main cannot be negative",
          },
        },
      },

      label: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Label is required",
          },
          len: {
            args: [2, 100],
            msg: "Label must be between 2 and 100 characters",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Permissions",
      tableName: "tbl_permissions",
    },
  );

  return Permissions;
};
