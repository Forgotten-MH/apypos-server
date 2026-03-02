import { z } from 'zod';
import { sessionIdSchema, commonRequestFields } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const RenameSchema = z
  .object({
    session_id: sessionIdSchema,
    name: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type RenameInput = z.infer<typeof RenameSchema>;

export const CommentSetSchema = z
  .object({
    session_id: sessionIdSchema,
    comment: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type CommentSetInput = z.infer<typeof CommentSetSchema>;

export const TitleSetSchema = z
  .object({
    session_id: sessionIdSchema,
    mst_title_id: z.number().int(),
    ...commonRequestFields,
  })
  .loose();

export type TitleSetInput = z.infer<typeof TitleSetSchema>;

export const PartnerSetSchema = z
  .object({
    session_id: sessionIdSchema,
    main_partner_id: z.union([z.string(), z.number()]),
    quest_partner_id: z.union([z.string(), z.number()]),
    ...commonRequestFields,
  })
  .loose();

export type PartnerSetInput = z.infer<typeof PartnerSetSchema>;

export const SearchUserIdSchema = z
  .object({
    uids: z.array(z.unknown()),
    ...commonRequestFields,
  })
  .loose();

export type SearchUserIdInput = z.infer<typeof SearchUserIdSchema>;

export const SearchGameIdSchema = z
  .object({
    gameIds: z.array(z.unknown()),
    ...commonRequestFields,
  })
  .loose();

export type SearchGameIdInput = z.infer<typeof SearchGameIdSchema>;
