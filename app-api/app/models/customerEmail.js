import sequelize from "./index.js";
import { DataTypes } from "sequelize";
import Customer from "./customer.js";
import TopicMaster from "./topicMaster.js";

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
      references: {
        model: Customer,
        key: "Id",
      },
    },
    TopicId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TopicMaster,
        key: "TopicId",
      },
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
