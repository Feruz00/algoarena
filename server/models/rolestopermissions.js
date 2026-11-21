"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RolesToPermissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RolesToPermissions.belongsTo(models.Roles, {
        foreignKey: "roleId",
        as: "role",
      });

      RolesToPermissions.belongsTo(models.Permissions, {
        foreignKey: "permissionId",
        as: "permission",
      });
    }
  }
  RolesToPermissions.init(
    {
      roleId: DataTypes.INTEGER,
      permissionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "RolesToPermissions",
      tableName: "tbl_roles_to_permissions",
    },
  );
  return RolesToPermissions;
};
