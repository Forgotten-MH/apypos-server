import { z } from 'zod';
import { sessionIdSchema } from '../../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../../schemas/common.schema.js';

export const OtomoTeamSetSchema = z
  .object({
    session_id: sessionIdSchema,
    otomo_teams: z.array(z.unknown()),
  })
  .passthrough();

export type OtomoTeamSetInput = z.infer<typeof OtomoTeamSetSchema>;

export const OtomoTeamSelectSchema = z
  .object({
    session_id: sessionIdSchema,
    index: z.number().int(),
  })
  .passthrough();

export type OtomoTeamSelectInput = z.infer<typeof OtomoTeamSelectSchema>;
