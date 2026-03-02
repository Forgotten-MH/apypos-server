import { describe, it, expect } from 'vitest';
import {
  QuestIdOnlySchema,
  IslandStartSchema,
  IslandEndSchema,
  IslandMapAllSchema,
  EventStartSchema,
  EternalStartSchema,
} from './quest.schema.js';

describe('quest.schema', () => {
  it('QuestIdOnlySchema validates', () => {
    expect(QuestIdOnlySchema.safeParse({ mst_quest_id: 100 }).success).toBe(true);
  });

  it('IslandStartSchema validates', () => {
    expect(IslandStartSchema.safeParse({ mst_quest_id: 100, session_id: 'sid' }).success).toBe(true);
  });

  it('IslandEndSchema validates', () => {
    expect(IslandEndSchema.safeParse({ mst_quest_id: 100, clear_time: 300, session_id: 'sid' }).success).toBe(true);
  });

  it('IslandMapAllSchema validates', () => {
    expect(IslandMapAllSchema.safeParse({ session_id: 'sid' }).success).toBe(true);
  });

  it('EventStartSchema validates', () => {
    expect(EventStartSchema.safeParse({ mst_quest_id: 100 }).success).toBe(true);
  });

  it('EternalStartSchema validates', () => {
    expect(EternalStartSchema.safeParse({ mst_quest_id: 100, mst_eternal_node_id: 1 }).success).toBe(true);
  });

  it('QuestIdOnlySchema rejects string', () => {
    expect(QuestIdOnlySchema.safeParse({ mst_quest_id: 'bad' }).success).toBe(false);
  });
});
