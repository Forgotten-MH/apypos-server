import { z } from 'zod';

export const RegistSchema = z
  .object({
    uu_id: z.string(),
    secret_id: z.string(),
    session_id: z.string().optional(),
  })
  .loose();

export type RegistInput = z.infer<typeof RegistSchema>;

export const LoginSchema = z
  .object({
    uu_id: z.string(),
    secret_id: z.string(),
    session_id: z.string().optional(),
  })
  .loose();

export type LoginInput = z.infer<typeof LoginSchema>;

export const MigrationReadySchema = z
  .object({
    login_id: z.string(),
    secret_id: z.string(),
    mst_himitsu_question_id: z.number().int(),
    himitsu_answer: z.string(),
    migration_pass: z.string(),
  })
  .loose();

export type MigrationReadyInput = z.infer<typeof MigrationReadySchema>;

export const MigrationAuthSchema = z
  .object({
    migration_id: z.string(),
    migration_pass: z.string(),
    secret_id: z.string(),
    uu_id: z.string(),
  })
  .loose();

export type MigrationAuthInput = z.infer<typeof MigrationAuthSchema>;
