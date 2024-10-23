import { body } from "express-validator";

// add store validation
export const addStoreValidation = [
  body("StoreName").notEmpty().withMessage("StoreName is required"),
  body("ClientId").notEmpty().withMessage("ClientId is required"),
  body("StoreHash").notEmpty().withMessage("StoreHash is required"),
  body("AccessToken").notEmpty().withMessage("AccessToken is required"),
];

//store settings validation
export const addStoreSettingsValidation = [
  body("StoreId").notEmpty().withMessage("StoreId is required"),
  body("SMTP").notEmpty().withMessage("SMTP is required"),
  body("IMAP").notEmpty().withMessage("IMAP is required"),
  body("UserEmailId").notEmpty().withMessage("UserEmailId is required"),
  body("Password").notEmpty().withMessage("AccessToken is required"),
];
