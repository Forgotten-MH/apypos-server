import { describe, it, expect, beforeEach } from 'vitest';
import { TimeService } from './timeService.js';

describe('TimeService', () => {
  let timeService: TimeService;

  beforeEach(() => {
    timeService = new TimeService();
  });

  it('getCurrentTime returns a recent timestamp in milliseconds', () => {
    const now = Date.now();
    const result = timeService.getCurrentTime();
    expect(result).toBeGreaterThanOrEqual(now - 1000);
    expect(result).toBeLessThanOrEqual(now + 1000);
  });

  it('getOneDayTime returns 3600', () => {
    expect(timeService.getOneDayTime()).toBe(3600);
  });

  it('getTotalSecondsToday returns a value between 0 and 86400', () => {
    const result = timeService.getTotalSecondsToday();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(86400);
  });

  it('getNowTime returns a value between 0 and 3600', () => {
    const result = timeService.getNowTime();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(3600);
  });

  it('getRelogTime returns a number', () => {
    const result = timeService.getRelogTime();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(100000);
  });

  it('getJapanTime is 9 hours ahead of UTC', () => {
    const japanTime = timeService.getJapanTime();
    const utcNow = new Date();
    const diffMs = japanTime.getTime() - utcNow.getTime();
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    expect(diffHours).toBe(9);
  });
});
