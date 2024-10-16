import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Customer = sequelize.define(
  "customers",
  {
    CustomerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    StoreId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    OrderValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    DateCreated: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DateModified: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "customers",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default Customer;
