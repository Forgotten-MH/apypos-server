import { z } from 'zod';
import { sessionIdSchema, questIdSchema } from '../../../schemas/common.schema.js';

export const QuestIdOnlySchema = z
  .object({
    mst_quest_id: questIdSchema,
  })
  .loose();

export type QuestIdOnlyInput = z.infer<typeof QuestIdOnlySchema>;

export const IslandStartSchema = z
  .object({
    mst_quest_id: questIdSchema,
    session_id: sessionIdSchema,
  })
  .loose();

export type IslandStartInput = z.infer<typeof IslandStartSchema>;

export const IslandEndSchema = z
  .object({
    mst_quest_id: questIdSchema,
    clear_time: z.number().int(),
    session_id: sessionIdSchema,
  })
  .loose();

export type IslandEndInput = z.infer<typeof IslandEndSchema>;

export const IslandMapAllSchema = z
  .object({
    session_id: sessionIdSchema,
  })
  .loose();

export type IslandMapAllInput = z.infer<typeof IslandMapAllSchema>;

export const EventStartSchema = z
  .object({
    mst_quest_id: questIdSchema,
    block_seq: z.number().int().optional(),
    app_ver: z.string().optional(),
    res_ver: z.number().int().optional(),
    atk: z.number().int().optional(),
    def: z.number().int().optional(),
    increase: z.number().int().optional(),
    is_auto: z.number().int().optional(),
    kyokuti_field_id_1: z.number().int().optional(),
    kyokuti_field_id_2: z.number().int().optional(),
    kyokuti_field_value_1: z.number().int().optional(),
    kyokuti_field_value_2: z.number().int().optional(),
    mst_event_node_id: z.number().int().optional(),
    multi_room_id: z.number().int().optional(),
    otomo: z.array(z.unknown()).optional(),
    partner_id: z.string().optional(),
    power_up: z.number().int().optional(),
    select_fix_equipment_idx: z.number().int().optional(),
  })
  .loose();

export type EventStartInput = z.infer<typeof EventStartSchema>;

export const EternalStartSchema = z
  .object({
    mst_quest_id: questIdSchema,
    mst_eternal_node_id: z.number().int(),
    block_seq: z.number().int().optional(),
    atk: z.number().int().optional(),
    def: z.number().int().optional(),
    increase: z.number().int().optional(),
    is_auto: z.number().int().optional(),
    otomo: z.array(z.unknown()).optional(),
    partner_id: z.string().optional(),
    power_up: z.number().int().optional(),
  })
  .loose();

export type EternalStartInput = z.infer<typeof EternalStartSchema>;
