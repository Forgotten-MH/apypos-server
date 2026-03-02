import { z } from 'zod';
import { commonRequestFields } from '../../../schemas/common.schema.js';

export const ShopBuySchema = z
  .object({
    amount: z.number().int(),
    mst_shop_id: z.number().int(),
    mst_shop_item_id: z.number().int(),
    ...commonRequestFields,
  })
  .loose();

export type ShopBuyInput = z.infer<typeof ShopBuySchema>;
