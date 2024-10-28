import nodemailer from "nodemailer";
import { config } from "dotenv";
import logger from "../lib/logger.js";
import db from "../models/modelAssociation.js";
import { validationResult } from "express-validator";

const Customer = db.Customer;
const StoreSettings = db.StoreSettings;
const CustomerEmail = db.CustomerEmail;

config();

// Email service handler
export const emailService = async (req, res) => {
  const { Id, Subject, Body } = req.body;

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
