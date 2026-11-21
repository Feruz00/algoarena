"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notifications extends Model {
    static associate(models) {
      Notifications.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Notifications.init(
    {
      titleEn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      titleRu: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      titleTm: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      messageEn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messageRu: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messageTm: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      type: {
        type: DataTypes.ENUM("success", "error", "warning", "info"),
        allowNull: false,
        defaultValue: "info",
      },
    },
    {
      sequelize,
      modelName: "Notifications",
      tableName: "tbl_notifications",
    },
  );

  return Notifications;
};
