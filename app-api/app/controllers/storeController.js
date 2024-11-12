import Store from "../models/store.js";
import { validationResult } from "express-validator";
import StoreSettings from "../models/storeSettings.js";
// import BigCommerce from "node-bigcommerce";

// const bigCommerce = new BigCommerce({
//   clientId: "cxl3n94q9lkrdsy03nnc1zc2sxrsr1p",
//   secret: "fde0dae4e86ca64e7b7db91445afe6904e4744ae0782525ee92f720fdd83e935",
//   callback: "https://fav-frontend-one.vercel.app/",
//   responseType: "json",
// });

//function to get store info
export const getStore = async (req, res) => {
  try {
   
    console.log(req.body);
    return res.status(200).send({message: "request success", data: req.body})
    // res.render('integrations/auth', { title: 'Authorized!', data });
  } catch (error) {
    // next(error);
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
