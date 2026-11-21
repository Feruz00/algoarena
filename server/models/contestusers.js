"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContestUsers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  ContestUsers.init(
    {
      userId: DataTypes.INTEGER,
      contestId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ContestUsers",
      tableName: "tbl_contest_to_users",
    },
  );
  return ContestUsers;
};
