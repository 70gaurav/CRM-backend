import { Sequelize } from "sequelize";
import { config } from "dotenv";
import logger from "../lib/logger.js"
config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection to PostgreSQL has been established successfully.")
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
};

testConnection();

export default sequelize;