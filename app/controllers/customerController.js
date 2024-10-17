import { config } from "dotenv";
import Customer from "../models/customer.js";
import Store from "../models/store.js";

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
      res.status(200).send({ message: "No customer found" });
    }

    return res.status(200).send({ message: "request success", data: data });
  } catch (error) {
    return res.status(500).send({
      message: error,
    });
  }
};

export const getCustomerById = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customerData = await Customer.findOne({
      where: { CustomerId: customerId },
      attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
    });

    if (!customerData) {
      return res.status(200).send({ message: "No customer found" });
    }

    return res
      .status(200)
      .send({ message: "request success", data: customerData });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
