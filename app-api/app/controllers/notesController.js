import logger from "../lib/logger.js";
import db from "../models/modelAssociation.js";
import { validationResult } from "express-validator";
const Notes = db.Notes;

//add note to db
export const addNote = async (req, res) => {
  const { CustomerEmailId, Title, Note } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(" & ");
    return res.status(400).json({ message: errorMessages });
  }

  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    console.log(formattedDate);
    const data = await Notes.create({
      CustomerEmailId,
      Title,
      DateTime: formattedDate,
      Note,
    });

    return res.status(200).send({ message: "Note added successfully" });
  } catch (error) {
    logger.error("error adding note", error);
    return res.status(500).send({ message: "Error adding note" });
  }
};
