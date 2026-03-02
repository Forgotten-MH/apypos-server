import { z } from 'zod';
import { commonRequestFields } from '../../../schemas/common.schema.js';

export const RegistSchema = z
  .object({
    uu_id: z.string(),
    secret_id: z.string(),
    session_id: z.string().optional(),
    ...commonRequestFields,
  })
  .loose();

export type RegistInput = z.infer<typeof RegistSchema>;

export const LoginSchema = z
  .object({
    uu_id: z.string(),
    secret_id: z.string(),
    session_id: z.string().optional(),
    device_id: z.number().int().optional(),
    device_type: z.string().optional(),
    gpu: z.string().optional(),
    login_id: z.string().optional(),
    os_version: z.string().optional(),
    safetynet_result: z.string().optional(),
    status_code: z.number().int().optional(),
    ...commonRequestFields,
  })
  .strict();

export type LoginInput = z.infer<typeof LoginSchema>;

export const MigrationReadySchema = z
  .object({
    login_id: z.string(),
    secret_id: z.string(),
    mst_himitsu_question_id: z.number().int(),
    himitsu_answer: z.string(),
    migration_pass: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type MigrationReadyInput = z.infer<typeof MigrationReadySchema>;

export const MigrationAuthSchema = z
  .object({
    migration_id: z.string(),
    migration_pass: z.string(),
    secret_id: z.string(),
    uu_id: z.string(),
    ...commonRequestFields,
  })
  .loose();

export type MigrationAuthInput = z.infer<typeof MigrationAuthSchema>;
