import { describe, it, expect } from 'vitest';
import { TrainingListSchema, TrainingStartSchema, TrainingEndSchema } from './questTraining.schema.js';

describe('questTraining.schema', () => {
  it('TrainingListSchema validates', () => {
    expect(TrainingListSchema.safeParse({ session_id: 'sid' }).success).toBe(true);
  });

  it('TrainingStartSchema validates', () => {
    expect(TrainingStartSchema.safeParse({ mst_quest_id: 100 }).success).toBe(true);
  });

  it('TrainingEndSchema validates', () => {
    expect(TrainingEndSchema.safeParse({ mst_quest_id: 100, clear_time: 300, session_id: 'sid' }).success).toBe(true);
  });
});
