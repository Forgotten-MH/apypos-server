import { z } from 'zod';
import { commonRequestFields } from '../../../schemas/common.schema.js';

export const BannerDlListSchema = z
  .object({
    device_id: z.number().int(),
    session_id: z.string().optional(),
    login_id: z.string().optional(),
    secret_id: z.string().optional(),
    ...commonRequestFields,
  })
  .strict();

export type BannerDlListInput = z.infer<typeof BannerDlListSchema>;
