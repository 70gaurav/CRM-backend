import express from "express";
import {
  addStoreValidation,
  addStoreSettingsValidation,
} from "../middlewares/validators/storeValidator.js";
import {
  emailValidation,
  changeTopicStatusValidation,
} from "../middlewares/validators/emailValidator.js";
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
  getCustomerConversation,
  getEmailThread,
} from "../controllers/customerController.js";

import { addNote } from "../controllers/notesController.js";

import { getOrders } from "../controllers/orderController.js";

import {
  changeTopicStatus,
  emailService,
  newConversation,
} from "../controllers/emailController.js";

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

//get customer conversation
router.get("/GetCustomerConversation/:id", getCustomerConversation);

//get email thread
router.get("/GetEmailThread/:id", getEmailThread);

//change topic status
router.post(
  "/ChangeTopicStatus",
  changeTopicStatusValidation,
  changeTopicStatus
);

//add note
router.post("/AddNote", notesValidation, addNote);

export default router;
