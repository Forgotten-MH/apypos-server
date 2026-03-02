import { z } from 'zod';

export const sessionIdSchema = z.string();
export const questIdSchema = z.number().int();

/** Common protocol fields sent on nearly every request by the game client */
export const commonRequestFields = {
  block_seq: z.number().int().optional(),
  app_ver: z.string().optional(),
  res_ver: z.number().int().optional(),
};

export const modelInfoSchema = z
  .object({
    face: z.number().int(),
    gender: z.number().int(),
    hair: z.number().int(),
    hair_color: z.number().int(),
    inner: z.number().int(),
    skin: z.number().int(),
  })
  .loose();

/** Schema for routes that only require session_id */
export const SessionOnlySchema = z
  .object({
    session_id: sessionIdSchema,
    ...commonRequestFields,
  })
  .strict();

export type SessionOnlyInput = z.infer<typeof SessionOnlySchema>;
