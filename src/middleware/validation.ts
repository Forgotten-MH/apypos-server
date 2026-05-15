import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { encryptAndSend } from '../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../constants/error.codes.js';
import { createLogger } from './logger.js';
import { ENABLE_VALIDATION } from '../config.js';

const log = createLogger('validation');

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (ENABLE_VALIDATION) {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        log.warn(
          'Validation failed: %s %s — %s',
          req.method,
          req.path,
          JSON.stringify(z.treeifyError(result.error)),
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
      req.body = result.data;
    }
    next();
  };
}
