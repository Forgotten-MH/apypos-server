import { z } from 'zod';

export const ShopBuySchema = z
  .object({
    amount: z.number().int(),
    mst_shop_id: z.number().int(),
    mst_shop_item_id: z.number().int(),
  })
  .loose();

export type ShopBuyInput = z.infer<typeof ShopBuySchema>;
