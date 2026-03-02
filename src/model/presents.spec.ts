import { describe, it, expect } from 'vitest';
import Present from './presents.js';

describe('Present model', () => {
  it('is registered with correct name', () => {
    expect(Present.modelName).toBe('Present');
  });

  it('has expected schema paths', () => {
    const paths = Object.keys(Present.schema.paths);
    expect(paths).toContain('uu_id');
    expect(paths).toContain('content');
    expect(paths).toContain('message');
  });
});
