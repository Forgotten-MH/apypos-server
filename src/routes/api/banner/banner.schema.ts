import { z } from 'zod';

export const BannerDlListSchema = z
  .object({
    device_id: z.number().int(),
  })
  .loose();

export type BannerDlListInput = z.infer<typeof BannerDlListSchema>;
