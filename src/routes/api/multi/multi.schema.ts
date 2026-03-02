import { z } from 'zod';

export const RoomReserveSchema = z
  .object({
    quest_id: z.number().int(),
    quick_match: z.number().int(),
    reserve: z.array(z.unknown()),
    restart: z.number().int(),
  })
  .loose();

export type RoomReserveInput = z.infer<typeof RoomReserveSchema>;

export const RoomSearchSchema = z
  .object({
    auto_flag: z.number().int(),
    kick: z.number().int(),
    quest_id: z.number().int(),
    quick_match: z.number().int(),
    restart: z.number().int(),
  })
  .loose();

export type RoomSearchInput = z.infer<typeof RoomSearchSchema>;

export const RoomJoinSchema = z
  .object({
    auto_flag: z.number().int(),
    kick: z.number().int(),
    quest_id: z.number().int(),
    quick_match: z.number().int(),
    reserve: z.array(z.unknown()),
    restart: z.number().int(),
    room_id: z.number().int(),
  })
  .loose();

export type RoomJoinInput = z.infer<typeof RoomJoinSchema>;

export const RoomCreateSchema = z
  .object({
    auto_flag: z.number().int(),
    kick: z.number().int(),
    name: z.string(),
    quest_id: z.number().int(),
    quick_match: z.number().int(),
    reserve: z.array(z.unknown()),
    restart: z.number().int(),
    tag: z.number().int(),
  })
  .loose();

export type RoomCreateInput = z.infer<typeof RoomCreateSchema>;

export const RoomQuickSchema = z
  .object({
    auto_flag: z.number().int(),
    kick: z.number().int(),
    name: z.string(),
    quest_id: z.number().int(),
    quick_match: z.number().int(),
    reserve: z.array(z.unknown()),
    restart: z.number().int(),
    tag: z.number().int(),
  })
  .loose();

export type RoomQuickInput = z.infer<typeof RoomQuickSchema>;

export const RoomGetSchema = z
  .object({
    quest_id: z.number().int(),
    room_id: z.number().int(),
  })
  .loose();

export type RoomGetInput = z.infer<typeof RoomGetSchema>;

export const MemberInfoSchema = z
  .object({
    sequence: z.number().int(),
  })
  .loose();

export type MemberInfoInput = z.infer<typeof MemberInfoSchema>;
