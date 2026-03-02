import { describe, it, expect } from 'vitest';
import QuestSheet from './questSheet.js';

describe('QuestSheet model', () => {
  it('is registered with correct name', () => {
    expect(QuestSheet.modelName).toBe('QuestSheet');
  });

  it('has expected schema paths', () => {
    const paths = Object.keys(QuestSheet.schema.paths);
    expect(paths).toContain('mQuestID');
    expect(paths).toContain('mQuestName');
    expect(paths).toContain('mBossList');
  });
});
