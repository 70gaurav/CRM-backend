import express from "express";
import { addStoreValidation, addStoreSettingsValidation } from "../middlewares/validators/storeValidator.js";
const router = express.Router();

import { addStore, addStoreSettings } from "../controllers/storeController.js";
import {
  getCustomers,
  getCustomerById,
} from "../controllers/customerController.js";
import { getOrders } from "../controllers/orderController.js";

//add store information
router.post("/StoreImapDetails", addStoreValidation, addStore);

//add store settings
router.post("/StoreSettings", addStoreSettingsValidation, addStoreSettings);

//get customers list
router.get("/CustomerList/:storeId", getCustomers);

//get customer details
router.get("/CustomerDetails/:customerId", getCustomerById);

//get orders by customer id
router.get("/OrderSummary/:id", getOrders);

export default router;
