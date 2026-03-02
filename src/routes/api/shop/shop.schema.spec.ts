import { describe, it, expect } from 'vitest';
import { ShopBuySchema } from './shop.schema.js';

describe('shop.schema', () => {
  it('validates correct buy input', () => {
    expect(ShopBuySchema.safeParse({ amount: 1, mst_shop_id: 1, mst_shop_item_id: 100 }).success).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(ShopBuySchema.safeParse({ amount: 1 }).success).toBe(false);
  });
});
