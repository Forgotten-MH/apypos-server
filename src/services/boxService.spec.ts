import { describe, it, expect } from 'vitest';
import type { Box } from '../types/game.js';
import { addItem, removeItem, incrementZeny, updateMonumentLevel, setCapacity } from './boxService.js';

function makeBox(overrides: Partial<Box> = {}): Box {
  return {
    equipments: [],
    materials: [],
    payments: [],
    zeny: 0,
    monument: { augite: [], hr: 0, mlv: { atk: 0, def: 0, hp: 0, sp: 0 } },
    capacity: { equipments: 100 },
    ...overrides,
  };
}

describe('boxService', () => {
  describe('addItem', () => {
    it('pushes item to an existing array field', () => {
      const box = makeBox();
      addItem(box, 'materials', { amount: 1, mst_material_id: 123 });
      expect(box.materials).toEqual([{ amount: 1, mst_material_id: 123 }]);
    });

    it('pushes multiple items', () => {
      const box = makeBox();
      addItem(box, 'equipments', { equipment_id: 'a' });
      addItem(box, 'equipments', { equipment_id: 'b' });
      expect(box.equipments).toHaveLength(2);
    });

    it('throws when field is not an array', () => {
      const box = makeBox();
      expect(() => addItem(box, 'zeny', 100)).toThrow("Field 'zeny' is not an array");
    });
  });

  describe('removeItem', () => {
    it('removes item matching all matcher keys', () => {
      const box = makeBox({
        materials: [
          { amount: 1, mst_material_id: 100 },
          { amount: 2, mst_material_id: 200 },
        ] as never,
      });
      removeItem(box, 'materials', { mst_material_id: 100 });
      expect(box.materials).toEqual([{ amount: 2, mst_material_id: 200 }]);
    });

    it('does nothing when no items match', () => {
      const box = makeBox({
        materials: [{ amount: 1, mst_material_id: 100 }] as never,
      });
      removeItem(box, 'materials', { mst_material_id: 999 });
      expect(box.materials).toHaveLength(1);
    });

    it('removes multiple matching items', () => {
      const box = makeBox({
        materials: [
          { amount: 1, mst_material_id: 100 },
          { amount: 1, mst_material_id: 100 },
          { amount: 2, mst_material_id: 200 },
        ] as never,
      });
      removeItem(box, 'materials', { mst_material_id: 100 });
      expect(box.materials).toEqual([{ amount: 2, mst_material_id: 200 }]);
    });

    it('throws when field is not an array', () => {
      const box = makeBox();
      expect(() => removeItem(box, 'zeny', { id: 1 })).toThrow("Field 'zeny' is not an array");
    });
  });

  describe('incrementZeny', () => {
    it('adds to existing zeny', () => {
      const box = makeBox({ zeny: 50 });
      incrementZeny(box, 100);
      expect(box.zeny).toBe(150);
    });

    it('initializes from zero when zeny is undefined', () => {
      const box = makeBox({ zeny: undefined });
      incrementZeny(box, 200);
      expect(box.zeny).toBe(200);
    });
  });

  describe('updateMonumentLevel', () => {
    it('increments the specified stat', () => {
      const box = makeBox();
      updateMonumentLevel(box, 'atk', 5);
      expect(box.monument!.mlv.atk).toBe(5);
    });

    it('increments multiple stats independently', () => {
      const box = makeBox();
      updateMonumentLevel(box, 'hp', 10);
      updateMonumentLevel(box, 'def', 3);
      expect(box.monument!.mlv.hp).toBe(10);
      expect(box.monument!.mlv.def).toBe(3);
      expect(box.monument!.mlv.atk).toBe(0);
    });

    it('throws for invalid stat when monument is missing', () => {
      const box = makeBox({ monument: undefined });
      expect(() => updateMonumentLevel(box, 'atk', 1)).toThrow('Invalid monument stat');
    });
  });

  describe('setCapacity', () => {
    it('sets capacity value for a key', () => {
      const box = makeBox();
      setCapacity(box, 'equipments', 200);
      expect(box.capacity!.equipments).toBe(200);
    });

    it('adds new capacity key', () => {
      const box = makeBox();
      setCapacity(box, 'materials', 500);
      expect(box.capacity!.materials).toBe(500);
    });

    it('throws when capacity is undefined', () => {
      const box = makeBox({ capacity: undefined });
      expect(() => setCapacity(box, 'equipments', 100)).toThrow('Box capacity is undefined');
    });
  });
});
