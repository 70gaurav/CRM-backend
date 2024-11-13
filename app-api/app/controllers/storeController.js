import Store from "../models/store.js";
import logger from "../lib/logger.js";
import { validationResult } from "express-validator";
import StoreSettings from "../models/storeSettings.js";
import BigCommerce from "node-bigcommerce";

const bigCommerce = new BigCommerce({
  clientId: "e0mtvqzr4a4nkvj2ull1h9e5ibgjutp",
  secret: "3c1d9ba573c720f5fe8d616d4f0f6fe686daa9c96ddae209ac4e4cefe29c7e22",
  callback: "https://favcrm.softwareexato.com/api/auth",
  responseType: "json",
});

//function to get store info
export const getStore = async (req, res, next) => {
  try {
    const data = await bigCommerce.authorize(req.query);
    // Successfully authorized, render the response
    next()
    // res.render('integrations/auth', { title: 'Authorized!', data: data });
    // res.status(200).send({ title: "Authorized!", data: data });
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
};

//function to add store
export const addStore = async (req, res) => {
  try {
    const { StoreName, ClientId, StoreHash, AccessToken, CustomerEmail } =
      req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" & ");
      return res.status(400).json({ message: errorMessages });
    }

    const data = await Store.create({
      StoreName,
      ClientId,
      StoreHash,
      AccessToken,
      CustomerEmail,
    });

    res.status(200).send({ message: "store added", data: data });
  } catch (error) {
    logger.error("error in function addStore", error);
    return res.status(500).send({ message: error });
  }
};

//function to add store settings
export const addStoreSettings = async (req, res) => {
  try {
    const { StoreId, SMTP, IMAP, UserEmailId, Password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(" & ");
      return res.status(400).json({ message: errorMessages });
    }

    const data = await StoreSettings.create({
      StoreId,
      SMTP,
      IMAP,
      UserEmailId,
      Password,
    });

    res.status(200).send({ message: "store settings added", data: data });
  } catch (error) {
    logger.error("error in function addStore", error);
    return res.status(500).send({ message: error });
  }
};
