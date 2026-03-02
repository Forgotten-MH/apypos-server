import { z } from 'zod';
import { sessionIdSchema, commonRequestFields } from '../../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../../schemas/common.schema.js';

export const OtomoTeamSetSchema = z
  .object({
    session_id: sessionIdSchema,
    otomo_teams: z.array(z.unknown()),
    ...commonRequestFields,
  })
  .loose();

export type OtomoTeamSetInput = z.infer<typeof OtomoTeamSetSchema>;

export const OtomoTeamSelectSchema = z
  .object({
    session_id: sessionIdSchema,
    index: z.number().int(),
    ...commonRequestFields,
  })
  .loose();

export type OtomoTeamSelectInput = z.infer<typeof OtomoTeamSelectSchema>;
