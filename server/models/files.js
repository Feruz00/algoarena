"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Files extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Files.init(
    {
      path: DataTypes.STRING,
      small_path: DataTypes.STRING,
      originalName: DataTypes.STRING,
      mimetype: DataTypes.STRING,
      size: DataTypes.INTEGER,
      cover: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Files",
      tableName: "tbl_files",
      paranoid: true,
    },
  );
  return Files;
};
