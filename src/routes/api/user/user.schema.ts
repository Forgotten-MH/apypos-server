import { z } from 'zod';
import { sessionIdSchema } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const RenameSchema = z
  .object({
    session_id: sessionIdSchema,
    name: z.string(),
  })
  .passthrough();

export type RenameInput = z.infer<typeof RenameSchema>;

export const CommentSetSchema = z
  .object({
    session_id: sessionIdSchema,
    comment: z.string(),
  })
  .passthrough();

export type CommentSetInput = z.infer<typeof CommentSetSchema>;

export const TitleSetSchema = z
  .object({
    session_id: sessionIdSchema,
    mst_title_id: z.number().int(),
  })
  .passthrough();

export type TitleSetInput = z.infer<typeof TitleSetSchema>;

export const PartnerSetSchema = z
  .object({
    session_id: sessionIdSchema,
    main_partner_id: z.union([z.string(), z.number()]),
    quest_partner_id: z.union([z.string(), z.number()]),
  })
  .passthrough();

export type PartnerSetInput = z.infer<typeof PartnerSetSchema>;

export const SearchUserIdSchema = z
  .object({
    uids: z.array(z.unknown()),
  })
  .passthrough();

export type SearchUserIdInput = z.infer<typeof SearchUserIdSchema>;

export const SearchGameIdSchema = z
  .object({
    gameIds: z.array(z.unknown()),
  })
  .passthrough();

export type SearchGameIdInput = z.infer<typeof SearchGameIdSchema>;
