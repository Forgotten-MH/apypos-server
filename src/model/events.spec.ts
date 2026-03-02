import { describe, it, expect } from 'vitest';
import Event from './events.js';

describe('Event model', () => {
  it('is registered with correct name', () => {
    expect(Event.modelName).toBe('Event');
  });

  it('has expected schema paths', () => {
    const paths = Object.keys(Event.schema.paths);
    expect(paths.length).toBeGreaterThan(0);
  });
});
