import { describe, it, expect } from 'vitest';
import {
  sessionIdSchema,
  questIdSchema,
  modelInfoSchema,
  SessionOnlySchema,
} from './common.schema.js';

describe('common.schema', () => {
  describe('sessionIdSchema', () => {
    it('accepts valid string', () => {
      expect(sessionIdSchema.safeParse('abc123').success).toBe(true);
    });

    it('rejects non-string', () => {
      expect(sessionIdSchema.safeParse(123).success).toBe(false);
    });
  });

  describe('questIdSchema', () => {
    it('accepts valid integer', () => {
      expect(questIdSchema.safeParse(100).success).toBe(true);
    });

    it('rejects non-integer', () => {
      expect(questIdSchema.safeParse('abc').success).toBe(false);
    });
  });

  describe('modelInfoSchema', () => {
    it('accepts valid model info', () => {
      const result = modelInfoSchema.safeParse({
        face: 0,
        gender: 1,
        hair: 2,
        hair_color: 3,
        inner: 0,
        skin: 1,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('SessionOnlySchema', () => {
    it('accepts valid session', () => {
      const result = SessionOnlySchema.safeParse({ session_id: 'test' });
      expect(result.success).toBe(true);
    });
  });
});
