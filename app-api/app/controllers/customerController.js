import { config } from "dotenv";
import db from "../models/modelAssociation.js";
import logger from "../lib/logger.js";

const Customer = db.Customer;
const Store = db.Store;
const CustomerEmail = db.CustomerEmail;
const Notes = db.Notes;
const StoreSettings = db.StoreSettings;

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
    const emails = await CustomerEmail.findAll({
      where: { CustomerId: customerId },
      order: [["DateTime", "DESC"]],
    });

    if (emails.length > 0) {
      const FirstContacted = emails[emails.length - 1].DateTime;
      const LastContacted = emails[0].DateTime;

      await Customer.update(
        {
          FirstContacted,
          LastContacted,
        },
        {
          where: { Id: customerId },
        }
      );
    }

    
    const customerData = await Customer.findOne({
      where: { Id: customerId },
      attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
      include: [
        {
          model: CustomerEmail,
          foreignKey: "CustomerId",
          required: false,
          attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
          include: [
            {
              model: Notes,
              foreignKey: "CustomerEmailId",
              required: false,
              attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
            },
          ],
        },
      ],
      order: [[CustomerEmail, "DateTime", "DESC"]],
    });

    if (!customerData) {
      return res.status(200).send({ message: "No customer found" });
    }

    const userData = await StoreSettings.findOne({
      where: { StoreId: customerData.StoreId },
      attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
    });

    return res.status(200).send({
      message: "request success",
      data: customerData,
      userEmail: userData.UserEmailId,
    });
  } catch (error) {
    logger.error("error in function getCustomerById", error);
    console.log(error);
    return res.status(500).send({ message: "internal server error" });
  }
};
