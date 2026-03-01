import winston from 'winston';
import * as path from 'path';

const level = process.env.DEBUG === 'true' ? 'debug' : 'info';

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'mhxr-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { timestamp, level, message, context, ...rest } = info;
          const ctx = context ? `[${JSON.stringify(context)}]` : '';
          const extra =
            Object.keys(rest).length > 0 && rest['service'] === undefined
              ? ` ${JSON.stringify(rest)}`
              : '';
          return `${String(timestamp)} ${level} ${ctx} ${String(message)}${extra}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs/combined.log'),
    }),
  ],
});

export function createLogger(context: string) {
  return logger.child({ context });
}
