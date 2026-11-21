"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Logs extends Model {
    static associate(models) {
      Logs.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Logs.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      ip: DataTypes.STRING,
      action: {
        type: DataTypes.ENUM("login_success", "login_failed", "logout"),
        allowNull: false,
        defaultValue: "login_failed",
      },
      status: {
        type: DataTypes.ENUM("success", "failed"),
        allowNull: false,
        defaultValue: "failed",
      },
      userId: DataTypes.INTEGER,
      message: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Logs",
      tableName: "tbl_logs",
    },
  );

  return Logs;
};
