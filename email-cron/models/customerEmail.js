import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const CustomerEmail = sequelize.define(
  "customerEmails",
  {
    EmailId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    EmailStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "customerEmails",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default CustomerEmail;
