import { describe, it, expect } from 'vitest';
import { condenseAutoDeleteArrays } from './questList.js';

describe('questList', () => {
  describe('condenseAutoDeleteArrays', () => {
    it('should flatten classref_.mpArray when mAutoDelete is false', () => {
      const obj = {
        someKey: {
          mAutoDelete: false,
          classref_: {
            mpArray: [1, 2, 3],
          },
        },
      };

      condenseAutoDeleteArrays(obj);

      expect(obj.someKey).toEqual([1, 2, 3]);
    });

    it('should flatten array.mpArray when mAutoDelete is "false" (string)', () => {
      const obj = {
        someKey: {
          mAutoDelete: 'false',
          array: {
            mpArray: ['a', 'b'],
          },
        },
      };

      condenseAutoDeleteArrays(obj);

      expect(obj.someKey).toEqual(['a', 'b']);
    });

    it('should prefer classref_.mpArray over array.mpArray', () => {
      const obj = {
        someKey: {
          mAutoDelete: false,
          classref_: {
            mpArray: [1],
          },
          array: {
            mpArray: [2],
          },
        },
      };

      condenseAutoDeleteArrays(obj);

      expect(obj.someKey).toEqual([1]);
    });

    it('should recurse into nested structures', () => {
      const obj = {
        outer: {
          inner: {
            mAutoDelete: false,
            classref_: {
              mpArray: [42],
            },
          },
        },
      };

      condenseAutoDeleteArrays(obj);

      expect((obj.outer as Record<string, unknown>).inner).toEqual([42]);
    });

    it('should leave objects unchanged when mAutoDelete is true', () => {
      const original = {
        someKey: {
          mAutoDelete: true,
          classref_: {
            mpArray: [1, 2, 3],
          },
        },
      };

      condenseAutoDeleteArrays(original);

      expect(original.someKey).toHaveProperty('mAutoDelete', true);
      expect(original.someKey).toHaveProperty('classref_');
    });

    it('should leave objects unchanged when no mpArray is present', () => {
      const original = {
        someKey: {
          mAutoDelete: false,
          otherData: 'hello',
        },
      };

      condenseAutoDeleteArrays(original);

      expect(original.someKey).toHaveProperty('mAutoDelete', false);
      expect(original.someKey).toHaveProperty('otherData', 'hello');
    });

    it('should process arrays by recursing into each element', () => {
      const arr = [
        {
          field: {
            mAutoDelete: false,
            classref_: { mpArray: [10] },
          },
        },
        {
          field: {
            mAutoDelete: false,
            array: { mpArray: [20] },
          },
        },
      ];

      condenseAutoDeleteArrays(arr);

      expect((arr[0] as Record<string, unknown>).field).toEqual([10]);
      expect((arr[1] as Record<string, unknown>).field).toEqual([20]);
    });

    it('should handle null and primitive values without error', () => {
      expect(() => condenseAutoDeleteArrays(null)).not.toThrow();
      expect(() => condenseAutoDeleteArrays(undefined)).not.toThrow();
      expect(() => condenseAutoDeleteArrays(42)).not.toThrow();
      expect(() => condenseAutoDeleteArrays('string')).not.toThrow();
    });
  });
});
