import winston from "winston";
import path from "path";

const { combine, timestamp, json } = winston.format;

const logsFolder = "logs";

const logger = winston.createLogger({
  level: "debug",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: path.join(logsFolder, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsFolder, "combined.log"),
    }),
  ],
});

// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }

export default logger;
