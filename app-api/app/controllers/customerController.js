import { config } from "dotenv";
import db from "../models/modelAssociation.js";
import logger from "../lib/logger.js";
import TopicMaster from "../models/topicMaster.js";

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

//get customer conversation
export const getCustomerConversation = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  if (!id || !status) {
    return res.status(400).send({ message: "id and status are required" });
  }

  const topicWhereCondition = status !== "all" ? { Status: status } : {};

  console.log(status);

  try {
    const conversationData = await Customer.findOne({
      where: { Id: id },
      attributes: {
        exclude: [
          "StoreId",
          "CustomerId",
          "EmailId",
          "Phone",
          "Company",
          "EmailStatus",
          "Country",
          "TotalOrderPlaced",
          "TotalOrderValue",
          "TotalOrderQuantity",
          "FirstOrderPlaced",
          "LastOrderPlaced",
          "FirstContacted",
          "LastContacted",
          "FirstSeenDate",
          "SignedUp",
          "CreatedAt",
          "UpdatedAt",
        ],
      },
      include: [
        {
          model: TopicMaster,
          foreignKey: "CustomerId",
          required: false,
          where: topicWhereCondition,
          attributes: {
            exclude: ["CreatedAt", "UpdatedAt", "DateOfLastCommunication"],
          },
          include: [
            {
              model: CustomerEmail,
              foreignKey: "TopicId",
              required: false,
              attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
              order: [["DateTime", "ASC"]],
              limit: 1,
            },
          ],
        },
      ],
    });

    if (!conversationData) {
      return res.status(400).send({ message: "data not found" });
    }

    return res
      .status(200)
      .send({ message: "request success", data: conversationData });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "internal server error" });
  }
};

//get email thread
export const getEmailThread = async (req, res) => {
  const { id } = req.params;
  const { topicid } = req.query;

  if (!id || !topicid) {
    return res.status(400).send({ message: "id and topicid are required" });
  }

  try {
    const emailThread = await Customer.findOne({
      where: { Id: id },
      attributes: {
        exclude: ["CreatedAt", "UpdatedAt"],
      },
      include: [
        {
          model: TopicMaster,
          foreignKey: "CustomerId",
          required: false,
          where: { TopicId: topicid },
          attributes: {
            exclude: ["CreatedAt", "UpdatedAt", "DateOfLastCommunication"],
          },
          include: [
            {
              model: CustomerEmail,
              foreignKey: "TopicId",
              required: false,
              attributes: { exclude: ["CreatedAt", "UpdatedAt"] },
              order: [["DateTime", "DESC"]],
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
        },
      ],
    });

    if (!emailThread) {
      return res.status(400).send({ message: "data not found" });
    }

    return res
      .status(200)
      .send({ message: "request success", data: emailThread });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ message: "internal server error" });
  }
};
