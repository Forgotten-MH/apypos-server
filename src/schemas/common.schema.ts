import { z } from 'zod';

export const sessionIdSchema = z.string();
export const questIdSchema = z.number().int();

export const modelInfoSchema = z
  .object({
    face: z.number().int(),
    gender: z.number().int(),
    hair: z.number().int(),
    hair_color: z.number().int(),
    inner: z.number().int(),
    skin: z.number().int(),
  })
  .passthrough();

/** Schema for routes that only require session_id */
export const SessionOnlySchema = z
  .object({
    session_id: sessionIdSchema,
  })
  .passthrough();

export type SessionOnlyInput = z.infer<typeof SessionOnlySchema>;
