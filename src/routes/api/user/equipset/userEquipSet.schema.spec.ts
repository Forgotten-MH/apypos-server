import { describe, it, expect } from 'vitest';
import { EquipSetSetSchema, EquipSetSocialSetSchema } from './userEquipSet.schema.js';

describe('userEquipSet.schema', () => {
  it('EquipSetSetSchema validates', () => {
    expect(
      EquipSetSetSchema.safeParse({
        session_id: 'sid',
        equip_sets: [],
        selected_equip_set_index: 0,
        capacity_eqp_set: 10,
      }).success,
    ).toBe(true);
  });

  it('EquipSetSocialSetSchema validates', () => {
    expect(
      EquipSetSocialSetSchema.safeParse({ session_id: 'sid', social_equip_sets: [] }).success,
    ).toBe(true);
  });
});
