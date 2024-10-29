import { body } from "express-validator";

export const notesValidation = [
  body("CustomerEmailId").notEmpty().withMessage("CustomerEmailId is required"),
  body("Title").notEmpty().withMessage("Title is required"),
  body("Note").notEmpty().withMessage("Note is required"),
];
