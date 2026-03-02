import { describe, it, expect } from 'vitest';
import { FlagSetSchema, QuestStartSchema } from './tutorial.schema.js';

describe('tutorial.schema', () => {
  it('FlagSetSchema validates', () => {
    expect(FlagSetSchema.safeParse({ session_id: 'sid', flags: [1, 2] }).success).toBe(true);
  });

  it('QuestStartSchema validates', () => {
    expect(QuestStartSchema.safeParse({ session_id: 'sid' }).success).toBe(true);
  });

  it('QuestStartSchema accepts quest_id', () => {
    expect(QuestStartSchema.safeParse({ session_id: 'sid', mst_quest_id: 100 }).success).toBe(true);
  });

  it('QuestStartSchema rejects unknown fields', () => {
    expect(QuestStartSchema.safeParse({ session_id: 'sid', unknown_field: 1 }).success).toBe(false);
  });
});
