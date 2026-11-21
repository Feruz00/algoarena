"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContestGroups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ContestGroups.init(
    {
      groupId: DataTypes.INTEGER,
      contestId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ContestGroups",
      tableName: "tbl_contest_to_groups",
    },
  );
  return ContestGroups;
};
