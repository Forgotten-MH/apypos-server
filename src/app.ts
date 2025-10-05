import express from "express";
import routes from "./routes/routes";
import expressWinston from "express-winston";
import { logger } from "./middleware/logger";
import winston from "winston";
import { decryptAndParse } from "./services/crypto/encryptionHelpers";

const app = express();
// Middleware to capture raw data from 'application/octet-stream' content type
app.use((req, res, next) => {
  if (req.is("application/octet-stream")) {
    let data = [];

    req.on("data", (chunk) => {
      data.push(chunk);
    });

    req.on("end", () => {
      const rawBody = Buffer.concat(data);
      const decryptedBody = decryptAndParse(rawBody);
      req.body = decryptedBody;
      console.log("--------------------------------------------------------------------")
      console.log("Request Body:\n", JSON.stringify(req.body,null,"\t"));

      next();
    });

    

    req.on("error", (err) => {
      console.error("Error processing raw request:", err);
      next(err);
    });
  } 
  else {
    console.log("--------------------------------------------------------------------")
    console.log("Request Body:\n", JSON.stringify(req.body,null,"\t"));
    next();
  }
});
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
      }),
      winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message} \n`),
    ),
    meta: true,
    expressFormat: true,
    colorize: true,

    dynamicMeta: (req, res) => {
      return {
        body: req.body,
      };
    },
  }),
);
// Setup routes
app.use("/", routes);
app.use('/', express.static(__dirname + '/public'));
// Error logger middleware
app.use(
  expressWinston.errorLogger({
    transports: logger.transports,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
    ),
  }),
);

export { app}
