import sequelize from "./index.js";
import { DataTypes } from "sequelize";

const StoreSettings = sequelize.define(
  "storeSettings",
  {
    SettingsId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    StoreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SMTP: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IMAP: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UserEmailId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "storeSettings",
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

export default StoreSettings;
