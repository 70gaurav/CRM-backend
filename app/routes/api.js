import express from "express";
const router = express.Router();

import { addStore } from "../controllers/storeController.js";
import { getCustomers } from "../controllers/customerController.js";
import { getOrders } from "../controllers/orderController.js";

//add store information
router.post("/store", addStore);

//get customers list
router.get("/customers", getCustomers);

//get orders by customer id
router.get("/orders/:id", getOrders);

export default router;
