import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Store = sequelize.define(
  "store",
  {
    StoreId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    StoreName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ClientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    StoreHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    AccessToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CustomerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LastJobRunDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "store",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default Store;
