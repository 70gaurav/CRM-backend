import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Customer = sequelize.define(
  "customers",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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
    EmailId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    EmailStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TotalOrderPlaced: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TotalOrderValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TotalOrderQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    FirstOrderPlaced: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    LastOrderPlaced: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    FirstContacted: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    FirstSeenDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    SignedUp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "customers",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default Customer;
