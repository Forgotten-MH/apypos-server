import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { encryptAndSend } from '../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../constants/error.codes.js';
import { createLogger } from './logger.js';

const log = createLogger('validation');

export function validate<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = schema.safeParse(req.body);
    if (!result.success) {
      log.warn(
        'Validation failed: %s %s — %s',
        req.method,
        req.path,
        JSON.stringify(result.error.flatten()),
      );
      encryptAndSend(
        {},
        res,
        req,
        ERROR_CODE.INVALID_REQUEST,
        ERROR_CATEGORY.ERROR_DIALOG,
      );
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req.body = result.data;
    next();
  };
}
