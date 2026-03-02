import { describe, it, expect } from 'vitest';
import { PresentReceiveSchema } from './present.schema.js';

describe('present.schema', () => {
  it('validates correct input', () => {
    expect(PresentReceiveSchema.safeParse({ _ids: ['id1'], session_id: 'sid' }).success).toBe(true);
  });
});
