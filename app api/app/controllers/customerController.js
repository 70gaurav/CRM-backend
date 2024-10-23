import { config } from "dotenv";
import db from "../models/modelAssociation.js";
import logger from "../lib/logger.js";

const Customer = db.Customer;
const Store = db.Store;
const CustomerEmail = db.CustomerEmail;

config();

export const getCustomers = async (req, res) => {
  const { storeId } = req.params;

  try {
    const isCorrectStoreId = await Store.findOne({
      where: { StoreId: storeId },
    });

    if (!isCorrectStoreId) {
      return res.status(400).send({ message: "Incorrect store id" });
    }

    const data = await Customer.findAll({
      where: { StoreId: storeId },
      attributes: { exclude: ["CreatedAt", "UpdatedAt", "StoreId"] },
    });

    if (data.length < 1) {
      return res.status(200).send({ message: "No customer found" });
    }

    return res.status(200).send({ message: "Request success", data: data });
  } catch (error) {
    logger.error("Error in function getCustomers", error);
    return res.status(500).send({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getCustomerById = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customerData = await Customer.findOne({
      where: { Id: customerId },
      attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
      // include: [{ model: CustomerEmail, exclude: ["CreatedAt", "UpdatedAt"] }],
    });

    if (!customerData) {
      return res.status(200).send({ message: "No customer found" });
    }

    return res
      .status(200)
      .send({ message: "request success", data: customerData });
  } catch (error) {
    logger.error("error in function getCustomerById", error);
    return res.status(500).send({ message: error });
  }
};
