import express from "express";
const router = express.Router();

import { addStore } from "../controllers/storeController.js";
import {
  getCustomers,
  getCustomerById,
} from "../controllers/customerController.js";
import { getOrders } from "../controllers/orderController.js";

//add store information
router.post("/StoreImapDetails", addStore);

//get customers list
router.get("/CustomerList/:storeId", getCustomers);

//get customer details
router.get("/CustomerDetails/:customerId", getCustomerById);

//get orders by customer id
router.get("/OrderSummary/:id", getOrders);

export default router;
