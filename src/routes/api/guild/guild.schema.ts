import { z } from 'zod';
import { sessionIdSchema, commonRequestFields } from '../../../schemas/common.schema.js';

export { SessionOnlySchema, type SessionOnlyInput } from '../../../schemas/common.schema.js';

export const CreateSchema = z
  .object({
    session_id: sessionIdSchema,
    name: z.string(),
    auto_recruit: z.number().int().optional(),
    chat_freq: z.number().int().optional(),
    explusion_rule: z.number().int().optional(),
    free_comment: z.string().optional(),
    login_freq: z.number().int().optional(),
    mood: z.number().int().optional(),
    recruit: z.number().int().optional(),
    timezone: z.number().int().optional(),
    yarikomi: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type CreateInput = z.infer<typeof CreateSchema>;

export const SearchIdSchema = z
  .object({
    session_id: sessionIdSchema,
    id: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type SearchIdInput = z.infer<typeof SearchIdSchema>;

export const ApplySchema = z
  .object({
    session_id: sessionIdSchema,
    gid: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type ApplyInput = z.infer<typeof ApplySchema>;

export const SearchSchema = z
  .object({
    session_id: sessionIdSchema,
    name: z.string().optional(),
    mood: z.number().int().optional(),
    login_freq: z.number().int().optional(),
    chat_freq: z.number().int().optional(),
    yarikomi: z.number().int().optional(),
    timezone: z.number().int().optional(),
    recruit: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type SearchInput = z.infer<typeof SearchSchema>;

export const ChatSendSchema = z
  .object({
    session_id: sessionIdSchema,
    gid: z.string(),
    message: z.string().optional(),
    text: z.string().optional(),
    ...commonRequestFields,
  })
  .loose();

export type ChatSendInput = z.infer<typeof ChatSendSchema>;

export const MemberListSchema = z
  .object({
    session_id: sessionIdSchema,
    gid: z.string().optional(),
    ...commonRequestFields,
  })
  .loose();

export type MemberListInput = z.infer<typeof MemberListSchema>;
