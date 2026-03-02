import { z } from 'zod';
import { sessionIdSchema, questIdSchema, commonRequestFields } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const FlagSetSchema = z
  .object({
    session_id: sessionIdSchema,
    flags: z.array(z.number().int()),
    ...commonRequestFields,
  })
  .strict();

export type FlagSetInput = z.infer<typeof FlagSetSchema>;

export const QuestStartSchema = z
  .object({
    mst_quest_id: questIdSchema.optional(),
    session_id: sessionIdSchema,
    ...commonRequestFields,
  })
  .strict();

export type QuestStartInput = z.infer<typeof QuestStartSchema>;
