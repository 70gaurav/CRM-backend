import express from "express";
const router = express.Router()

import { getCustomersData } from "../controllers/customerController.js";

router.get("/customers", getCustomersData)

export default router;
