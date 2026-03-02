import { z } from 'zod';
import { sessionIdSchema, questIdSchema } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const FlagSetSchema = z
  .object({
    session_id: sessionIdSchema,
    flags: z.array(z.number().int()),
  })
  .loose();

export type FlagSetInput = z.infer<typeof FlagSetSchema>;

export const QuestStartSchema = z
  .object({
    mst_quest_id: questIdSchema.optional(),
  })
  .loose();

export type QuestStartInput = z.infer<typeof QuestStartSchema>;
