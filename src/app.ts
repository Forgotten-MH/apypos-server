import express from "express";
import routes from "./routes/routes";
import expressWinston from "express-winston";
import { logger } from "./middleware/logger";
import winston from "winston";
import { decryptAndParse } from "./services/crypto/encryptionHelpers";
import { DEBUG } from "./config";

function sanitize(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj !== null && typeof obj === 'object') {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (!key.startsWith('$')) {
        clean[key] = sanitize(obj[key]);
      }
    }
    return clean;
  }
  return obj;
}

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
      if (DEBUG) {
        console.log("--------------------------------------------------------------------")
        console.log("Request Body:\n", JSON.stringify(req.body,null,"\t"));
      }

      next();
    });

    req.on("error", (err) => {
      console.error("Error processing raw request:", err);
      next(err);
    });
  }
  else {
    if (DEBUG) {
      console.log("--------------------------------------------------------------------")
      console.log("Request Body:\n", JSON.stringify(req.body,null,"\t"));
    }
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
// Sanitize request body: strip keys starting with '$' to prevent MongoDB operator injection
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  next();
});

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
