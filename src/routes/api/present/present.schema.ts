import { z } from 'zod';
import { sessionIdSchema, commonRequestFields } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const PresentReceiveSchema = z
  .object({
    _ids: z.array(z.string()),
    session_id: sessionIdSchema,
    ...commonRequestFields,
  })
  .loose();

export type PresentReceiveInput = z.infer<typeof PresentReceiveSchema>;
