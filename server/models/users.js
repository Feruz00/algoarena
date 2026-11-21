"use strict";

const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const { toHash, compare } = require("../utils/password");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.belongsTo(models.Roles, {
        foreignKey: "roleId",
        as: "role",
      });
      Users.hasMany(models.Notifications, {
        foreignKey: "userId",
        as: "notifications",
      });
      Users.belongsToMany(models.Groups, {
        through: models.GroupsToUser,
        foreignKey: "userId",
        otherKey: "groupId",
        as: "groups",
      });

      Users.belongsToMany(models.Contests, {
        through: models.ContestUsers,
        foreignKey: "userId",
        otherKey: "contestId",
        as: "contests",
      });

      Users.belongsToMany(models.Contests, {
        through: models.ContestRegistrations,
        foreignKey: "userId",
        otherKey: "contestId",
        as: "registrations",
      });

      Users.hasMany(models.Submissions, {
        foreignKey: "userId",
        as: "submissions",
      });
    }

    async comparePassword(password) {
      const value = await compare(this.password, password);
      return value;
    }
  }

  Users.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Username is required",
          },
          len: {
            args: [3, 50],
            msg: "Username must be between 3 and 50 characters",
          },
          isValidUsername(value) {
            if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
              throw new Error(
                "Username can only contain letters, numbers, _, - and .",
              );
            }
          },
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      github: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
        },
      },

      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Full name is required",
          },
          len: {
            args: [2, 100],
            msg: "Full name must be between 2 and 100 characters",
          },
        },
      },

      status: {
        type: DataTypes.ENUM("active", "deactive", "blocked"),
        defaultValue: "active",
        validate: {
          isIn: {
            args: [["active", "deactive", "blocked"]],
            msg: "Invalid user status",
          },
        },
      },

      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Role ID must be an integer",
          },
          min: {
            args: [1],
            msg: "Role ID must be greater than 0",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "tbl_users",
      paranoid: true,

      hooks: {
        async beforeDestroy(user, options) {
          const submissions = await user.getSubmissions();
          for (const submission of submissions) {
            await submission.destroy({ user: options.user });
          }
          if (options.user) {
            user.deleted_username = options.user.username;
          } else {
            user.deleted_username = "Administratsiya tarapyndan pozulma";
          }
        },
        async afterRestore(user, options) {
          const submissions = await user.getSubmissions({
            paranoid: false,
            transaction: options.transaction, // if a transaction is passed
          });

          for (const submission of submissions) {
            await submission.restore({
              user: options.user,
              transaction: options.transaction,
            });
          }
        },
      },
    },
  );

  return Users;
};
