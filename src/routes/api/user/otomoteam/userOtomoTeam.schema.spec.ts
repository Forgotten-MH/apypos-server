import { describe, it, expect } from 'vitest';
import { OtomoTeamSetSchema, OtomoTeamSelectSchema } from './userOtomoTeam.schema.js';

describe('userOtomoTeam.schema', () => {
  it('OtomoTeamSetSchema validates', () => {
    expect(OtomoTeamSetSchema.safeParse({ session_id: 'sid', otomo_teams: [] }).success).toBe(true);
  });

  it('OtomoTeamSelectSchema validates', () => {
    expect(OtomoTeamSelectSchema.safeParse({ session_id: 'sid', index: 0 }).success).toBe(true);
  });
});
