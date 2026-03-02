import { z } from 'zod';
import { sessionIdSchema, modelInfoSchema, commonRequestFields } from '../../../../schemas/common.schema.js';

export const ModelCreateSchema = z
  .object({
    session_id: sessionIdSchema,
    model_info: modelInfoSchema,
    ...commonRequestFields,
  })
  .loose();

export type ModelCreateInput = z.infer<typeof ModelCreateSchema>;

export const ModelSetSchema = z
  .object({
    session_id: sessionIdSchema,
    model_info: modelInfoSchema,
    ...commonRequestFields,
  })
  .loose();

export type ModelSetInput = z.infer<typeof ModelSetSchema>;
