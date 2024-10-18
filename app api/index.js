import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "./app/routes/api.js";
import sequelize from "./app/models/index.js";

config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", router);

app.all("*", (req, res) => {
  return res.status(404).send({
    message: "url not found 🔍",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});
