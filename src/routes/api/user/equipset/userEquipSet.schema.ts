import { z } from 'zod';
import { sessionIdSchema, commonRequestFields } from '../../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../../schemas/common.schema.js';

export const EquipSetSetSchema = z
  .object({
    session_id: sessionIdSchema,
    equip_sets: z.array(z.unknown()),
    selected_equip_set_index: z.number().int(),
    capacity_eqp_set: z.number().int(),
    ...commonRequestFields,
  })
  .loose();

export type EquipSetSetInput = z.infer<typeof EquipSetSetSchema>;

export const EquipSetSocialSetSchema = z
  .object({
    session_id: sessionIdSchema,
    social_equip_sets: z.array(z.unknown()),
    ...commonRequestFields,
  })
  .loose();

export type EquipSetSocialSetInput = z.infer<typeof EquipSetSocialSetSchema>;
