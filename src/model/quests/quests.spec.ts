import { describe, it, expect } from 'vitest';
import Quest from './quests.js';

describe('Quest model', () => {
  it('is registered with correct name', () => {
    expect(Quest.modelName).toBe('Quest');
  });
});
