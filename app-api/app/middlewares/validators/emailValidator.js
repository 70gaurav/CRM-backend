import { body } from "express-validator";

export const emailValidation = [
  body("Id").notEmpty().withMessage("CustomerId is required"),
  body("TopicId").notEmpty().withMessage("TopicId is required"),
  body("Subject").notEmpty().withMessage("Subject is required"),
  body("Body").notEmpty().withMessage("Body is required"),
];

export const changeTopicStatusValidation = [
  body("TopicId").notEmpty().withMessage("TopicId is required"),
  body("Status").notEmpty().withMessage("Status is required"),
]
