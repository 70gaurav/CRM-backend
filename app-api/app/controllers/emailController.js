import nodemailer from "nodemailer";
import { config } from "dotenv";
import logger from "../lib/logger.js";
import db from "../models/modelAssociation.js";
import { validationResult } from "express-validator";
import sequelize from "../models/index.js";

const Customer = db.Customer;
const StoreSettings = db.StoreSettings;
const CustomerEmail = db.CustomerEmail;
const TopicMaster = db.TopicMaster;

config();

// Email service handler
export const emailService = async (req, res) => {
  const { Id, Subject, Body, TopicId } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(" & ");
    return res.status(400).json({ message: errorMessages });
  }

  try {
    // Fetch customer data by Id
    const customerData = await Customer.findOne({ where: { Id } });

    if (!customerData) {
      return res.status(400).send({ message: "Customer not found" });
    }

    const { StoreId, EmailId } = customerData;

    const settings = await StoreSettings.findOne({ where: { StoreId } });

    if (!settings) {
      return res.status(400).send({ message: "Store settings not found" });
    }

    const { UserEmailId, Password, SMTP } = settings;

    const emailResponse = await sendEmail(
      EmailId,
      Subject,
      Body,
      UserEmailId,
      Password,
      SMTP
    );

    if (emailResponse.success) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
      await CustomerEmail.create({
        CustomerId: Id,
        TopicId: TopicId,
        Subject: Subject,
        Content: Body,
        DateTime: formattedDate,
        EmailStatus: "sent",
      });

      return res.status(200).send({ message: "Email sent successfully" });
    } else {
      return res.status(500).send({ message: "Failed to send email" });
    }
  } catch (error) {
    console.log(error);
    logger.error("Error in email service:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export const newConversation = async (req, res) => {
  const { Id, Subject, Body } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(" & ");
    return res.status(400).json({ message: errorMessages });
  }

  const customerData = await Customer.findOne({ where: { Id } });

  if (!customerData) {
    return res.status(400).send({ message: "Customer not found" });
  }

  const { StoreId, EmailId } = customerData;

  const settings = await StoreSettings.findOne({ where: { StoreId } });

  if (!settings) {
    return res.status(400).send({ message: "Store settings not found" });
  }

  const { UserEmailId, Password, SMTP } = settings;

  const existingSubject = await TopicMaster.findOne({
    where: {
      CustomerId: Id,
      EmailSubject: Subject,
    },
  });

  if (existingSubject) {
    return res.status(400).send({ message: "subject already exists" });
  }

  const newTopic = await TopicMaster.create({
    EmailSubject: Subject,
    CustomerId: Id,
    Status: "open",
    DateOfFirstEmail: new Date().toISOString(),
    DateOfLastCommunication: new Date().toISOString(),
  });

  const topicId = newTopic.TopicId;

  const emailResponse = await sendEmail(
    EmailId,
    Subject,
    Body,
    UserEmailId,
    Password,
    SMTP
  );

  if (emailResponse.success) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    await CustomerEmail.create({
      CustomerId: Id,
      TopicId: topicId,
      Subject: Subject,
      Content: Body,
      DateTime: formattedDate,
      EmailStatus: "sent",
    });

    return res
      .status(200)
      .send({ message: "Email sent successfully", data: { topicId: topicId } });
  } else {
    return res.status(500).send({ message: "Failed to send email" });
  }
};

// Email sending function
const sendEmail = async (
  EmailId,
  Subject,
  Body,
  UserEmailId,
  Password,
  SMTP
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP,
      port: process.env.MAILPORT,
      auth: {
        user: UserEmailId,
        pass: Password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: UserEmailId,
      to: EmailId,
      subject: Subject,
      text: Body,
    };
    const response = await transporter.sendMail(mailOptions);
    return { success: true, response };
  } catch (error) {
    console.log("Error sending email:", error);
    logger.error("Error sending email:", error);
    return { success: false, error };
  }
};

//change topic status
export const changeTopicStatus = async (req, res) => {
  const { TopicId, Status } = req.body;
  console.log(req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(" & ");
    return res.status(400).json({ message: errorMessages });
  }

  try {
    const topic = await TopicMaster.findOne({ where: { TopicId } });

    if (!topic) {
      return res.status(400).send({ message: "Topic not found" });
    }

    const result = await topic.update({ Status: Status });

    console.log(result);
    if (result) {
      return res
        .status(200)
        .send({ message: "Topic status updated successfully" });
    }

    return res.status(500).send({ message: "something went wrong" });
  } catch (error) {
    console.log("error in changetopic", error);
    logger.error("error in change topic status", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
