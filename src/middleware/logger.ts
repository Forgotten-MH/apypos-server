import winston from "winston";
import * as path from "path";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "mhxr-server" },
  // transports: [
  //   new winston.transports.Console({
  //     format: winston.format.simple(),
  //   }),
  // ],
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs/combined.log"),
    }),
  ],
});
