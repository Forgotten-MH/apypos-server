import { z } from 'zod';

export const BannerDlListSchema = z
  .object({
    device_id: z.number().int(),
  })
  .passthrough();

export type BannerDlListInput = z.infer<typeof BannerDlListSchema>;
