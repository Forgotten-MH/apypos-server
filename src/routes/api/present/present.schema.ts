import { z } from 'zod';
import { sessionIdSchema } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const PresentReceiveSchema = z
  .object({
    _ids: z.array(z.string()),
    session_id: sessionIdSchema,
  })
  .passthrough();

export type PresentReceiveInput = z.infer<typeof PresentReceiveSchema>;
