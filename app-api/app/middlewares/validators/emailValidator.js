import { body } from "express-validator";

export const emailValidation = [
  body("Id").notEmpty().withMessage("CustomerId is required"),
  body("Subject").notEmpty().withMessage("Subject is required"),
  body("Body").notEmpty().withMessage("Body is required"),
];
