import { z } from 'zod';
import { commonRequestFields, sessionIdSchema } from '../../../schemas/common.schema.js';

export const RoomReserveSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    room_name: z.string().optional(),
    quest_id: z.number().int(),
    quest_name: z.string().optional(),
    auto_flag: z.number().int().optional(),
    quick_match: z.number().int().optional(),
    kick: z.number().int().optional(),
    restart: z.number().int().optional(),
    tag: z.number().int().optional(),
    max_members: z.number().int().optional(),
    is_private: z.boolean().optional(),
    description: z.string().optional(),
    type: z.number().int().optional(),
    reserve_members: z.array(z.string()).optional(),
    ...commonRequestFields,
  })
  .loose();

export type RoomReserveInput = z.infer<typeof RoomReserveSchema>;

export const RoomReserveJoinSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    room_id: z.number().int(),
    ...commonRequestFields,
  })
  .loose();

export type RoomReserveJoinInput = z.infer<typeof RoomReserveJoinSchema>;

export const RoomSearchSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    auto_flag: z.number().int().optional(),
    kick: z.number().int().optional(),
    quest_id: z.number().int().optional(),
    quick_match: z.number().int().optional(),
    restart: z.number().int().optional(),
    limit: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type RoomSearchInput = z.infer<typeof RoomSearchSchema>;

export const RoomJoinSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    auto_flag: z.number().int().optional(),
    kick: z.number().int().optional(),
    quest_id: z.number().int().optional(),
    quick_match: z.number().int().optional(),
    reserve_members: z.array(z.string()).optional(),
    restart: z.number().int().optional(),
    room_id: z.number().int(),
    ...commonRequestFields,
  })
  .loose();

export type RoomJoinInput = z.infer<typeof RoomJoinSchema>;

export const RoomCreateSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    auto_flag: z.number().int().optional(),
    kick: z.number().int().optional(),
    name: z.string().optional(),
    quest_id: z.number().int(),
    quest_name: z.string().optional(),
    quick_match: z.number().int().optional(),
    reserve_members: z.array(z.string()).optional(),
    restart: z.number().int().optional(),
    tag: z.number().int().optional(),
    max_members: z.number().int().optional(),
    is_private: z.boolean().optional(),
    is_locked: z.boolean().optional(),
    description: z.string().optional(),
    type: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type RoomCreateInput = z.infer<typeof RoomCreateSchema>;

export const RoomQuickSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    auto_flag: z.number().int().optional(),
    kick: z.number().int().optional(),
    name: z.string().optional(),
    quest_id: z.number().int().optional(),
    quick_match: z.number().int().optional(),
    reserve_members: z.array(z.string()).optional(),
    restart: z.number().int().optional(),
    tag: z.number().int().optional(),
    max_members: z.number().int().optional(),
    type: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type RoomQuickInput = z.infer<typeof RoomQuickSchema>;

export const RoomGetSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    quest_id: z.number().int().optional(),
    room_id: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type RoomGetInput = z.infer<typeof RoomGetSchema>;

export const RoomLockSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    is_locked: z.boolean(),
    ...commonRequestFields,
  })
  .loose();

export type RoomLockInput = z.infer<typeof RoomLockSchema>;

export const RoomKickSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    target_user_id: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type RoomKickInput = z.infer<typeof RoomKickSchema>;

export const RoomReadySchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    is_ready: z.boolean(),
    ...commonRequestFields,
  })
  .loose();

export type RoomReadyInput = z.infer<typeof RoomReadySchema>;

export const MemberInfoSchema = z
  .object({
    session_id: sessionIdSchema.optional(),
    sequence: z.number().int().optional(),
    ...commonRequestFields,
  })
  .loose();

export type MemberInfoInput = z.infer<typeof MemberInfoSchema>;
