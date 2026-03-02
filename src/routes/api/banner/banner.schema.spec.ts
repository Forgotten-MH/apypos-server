import { describe, it, expect } from 'vitest';
import { BannerDlListSchema } from './banner.schema.js';

describe('banner.schema', () => {
  it('validates correct device_id', () => {
    expect(BannerDlListSchema.safeParse({ device_id: 2 }).success).toBe(true);
  });

  it('rejects non-integer', () => {
    expect(BannerDlListSchema.safeParse({ device_id: 'android' }).success).toBe(false);
  });
});
