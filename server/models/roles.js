"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Roles.belongsToMany(models.Permissions, {
        through: models.RolesToPermissions,
        foreignKey: "roleId",
        otherKey: "permissionId",
        as: "permissions",
      });
    }
  }
  // define association here

  Roles.init(
    {
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Label name is required",
          },
          len: {
            args: [2, 100],
            msg: "Label name must be between 2 and 100 characters",
          },
        },
      },
      maxCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7,
      },
    },
    {
      sequelize,
      modelName: "Roles",
      tableName: "tbl_roles",
      paranoid: true,
      async beforeDestroy(role, options) {
        // Soft / force delete related users
        const users = await role.getUsers({
          transaction: options.transaction,
        });

        for (const user of users) {
          await user.destroy({
            transaction: options.transaction,
            force: options.force === true, // cascade force delete
          });
        }

        // Set who deleted it (only on soft delete)
        if (!options.force) {
          if (options.user) {
            role.deleted_username = options.user.username;
          } else {
            role.deleted_username = "Administratsiya tarapyndan pozulma";
          }

          await role.save({
            hooks: false,
            transaction: options.transaction,
          });
        }
      },

      async afterRestore(role, options) {
        // Find soft-deleted users and restore them
        const users = await role.getUsers({
          paranoid: false,
          transaction: options.transaction,
        });

        for (const user of users) {
          await user.restore({
            transaction: options.transaction,
          });
        }
      },
    },
  );
  return Roles;
};
