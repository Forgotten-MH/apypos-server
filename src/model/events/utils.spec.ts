import { describe, it, expect, vi } from 'vitest';

vi.mock('../../middleware/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

import { getDurationFromValue, enrichEvent } from './utils.js';

describe('event utils', () => {
  describe('getDurationFromValue', () => {
    it('returns null for null value', () => {
      expect(getDurationFromValue(null)).toBeNull();
    });

    it('returns null for undefined value', () => {
      expect(getDurationFromValue(undefined)).toBeNull();
    });

    it('returns duration in seconds for future date', () => {
      const futureDate = { getTime: () => Date.now() + 60_000 };
      const result = getDurationFromValue(futureDate);
      expect(result).toBeGreaterThanOrEqual(59);
      expect(result).toBeLessThanOrEqual(60);
    });

    it('returns 0 for past date', () => {
      const pastDate = { getTime: () => Date.now() - 60_000 };
      expect(getDurationFromValue(pastDate)).toBe(0);
    });
  });

  describe('enrichEvent', () => {
    it('returns events unchanged when no matching node found', () => {
      const events = [{ mst_event_node_id: 999999 }];
      const result = enrichEvent(events);
      expect(result).toHaveLength(1);
      expect(result[0]?.mst_event_node_id).toBe(999999);
    });

    it('handles empty event list', () => {
      expect(enrichEvent([])).toEqual([]);
    });
  });
});
