import { z } from 'zod';
import { sessionIdSchema } from '../../../schemas/common.schema.js';

export const BoxGetSchema = z
  .object({
    session_id: sessionIdSchema,
  })
  .loose();

export type BoxGetInput = z.infer<typeof BoxGetSchema>;

export const StorageGetSchema = z
  .object({
    target_idx: z.number().int(),
  })
  .loose();

export type StorageGetInput = z.infer<typeof StorageGetSchema>;

export const EquipLevelupSchema = z
  .object({
    session_id: sessionIdSchema,
    eqp_obj_id: z.string(),
    num: z.number().int().optional(),
  })
  .loose();

export type EquipLevelupInput = z.infer<typeof EquipLevelupSchema>;

export const EquipAwakeSchema = z
  .object({
    session_id: sessionIdSchema,
    base_equipment_id: z.string(),
  })
  .loose();

export type EquipAwakeInput = z.infer<typeof EquipAwakeSchema>;

export const PotentialupAutoSetSchema = z
  .object({
    eqp_obj_infos: z.array(z.unknown()),
  })
  .loose();

export type PotentialupAutoSetInput = z.infer<typeof PotentialupAutoSetSchema>;

export const SaleSchema = z
  .object({
    eqp_obj_ids: z.array(z.string()),
  })
  .loose();

export type SaleInput = z.infer<typeof SaleSchema>;

export const FavoriteSetSchema = z
  .object({
    is_favorite: z.number().int(),
    eqp_obj_id: z.string(),
  })
  .loose();

export type FavoriteSetInput = z.infer<typeof FavoriteSetSchema>;

export const MonumentLevelupSchema = z
  .object({
    session_id: sessionIdSchema,
    type: z.string(),
  })
  .loose();

export type MonumentLevelupInput = z.infer<typeof MonumentLevelupSchema>;
