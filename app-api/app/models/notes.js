import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const Notes = sequelize.define(
  "notes",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    CustomerEmailId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Note: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "notes",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default Notes;
