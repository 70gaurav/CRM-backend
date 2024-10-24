import express from "express";
import cors from "cors";
import { config } from "dotenv";
import router from "./app/routes/api.js";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import sequelize from "./app/models/index.js";
import logger from "./app/lib/logger.js";

config();

const swaggerDocument = readFileSync("./swagger/swagger-output.json", "utf8");
const swaggerJson = JSON.parse(swaggerDocument);

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.all("*", (req, res) => {
  return res.status(404).send({
    message: "url not found 🔍",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});
