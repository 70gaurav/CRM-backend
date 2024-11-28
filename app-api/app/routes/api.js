import express from "express";
import {
  addStoreValidation,
  addStoreSettingsValidation,
} from "../middlewares/validators/storeValidator.js";
import { emailValidation } from "../middlewares/validators/emailValidator.js";
import { notesValidation } from "../middlewares/validators/notesValidation.js";

const router = express.Router();

import {
  addStore,
  addStoreSettings,
  // getStore,
} from "../controllers/storeController.js";

import {
  getCustomers,
  getCustomerById,
} from "../controllers/customerController.js";

import { addNote } from "../controllers/notesController.js";

import { getOrders } from "../controllers/orderController.js";

import { emailService, newConversation } from "../controllers/emailController.js";

//add store information
router.post("/StoreSettings", addStoreValidation, addStore);

//add store settings
router.post("/StoreImapDetails", addStoreSettingsValidation, addStoreSettings);

//get customers list
router.get("/CustomerList/:storeId", getCustomers);

//get customer details
router.get("/CustomerDetails/:customerId", getCustomerById);

//get orders by customer id
router.get("/OrderSummary/:id", getOrders);

//send email to customer
router.post("/SendEmail", emailValidation, emailService);

//start new conversation
router.post("/NewEmail", newConversation);

//add note
router.post("/AddNote", notesValidation, addNote);

//get store data
// router.get("/auth", getStore);

export default router;
