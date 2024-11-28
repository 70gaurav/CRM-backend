import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const TopicMaster = sequelize.define(
  "topicMaster",
  {
    TopicId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EmailSubject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateOfFirstEmail: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DateOfLastCommunication: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "topicMaster",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default TopicMaster;
