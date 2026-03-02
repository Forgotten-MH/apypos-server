import { describe, it, expect, vi } from 'vitest';

vi.mock('../../middleware/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

import ScoreEvents from './score.js';
import StandingEvents from './standing.js';
import TicketEvents from './tickets.js';
import TourEvents from './tour.js';
import M16Events from './m16.js';
import AssualtEvents from './assualts.js';

describe('event models', () => {
  it('ScoreEvents model is registered', () => {
    expect(ScoreEvents.modelName).toBe('ScoreEvents');
  });

  it('StandingEvents model is registered', () => {
    expect(StandingEvents.modelName).toBe('StandingEvents');
  });

  it('TicketEvents model is registered', () => {
    expect(TicketEvents.modelName).toBe('TicketEvents');
  });

  it('TourEvents model is registered', () => {
    expect(TourEvents.modelName).toBe('TourEvents');
  });

  it('M16Events model is registered', () => {
    expect(M16Events.modelName).toBe('M16Events');
  });

  it('AssualtEvents model is registered', () => {
    expect(AssualtEvents.modelName).toBe('AssualtEvents');
  });
});
