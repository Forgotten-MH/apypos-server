import { describe, it, expect } from 'vitest';
import { ModelCreateSchema, ModelSetSchema } from './userModel.schema.js';

describe('userModel.schema', () => {
  const validModel = {
    session_id: 'sid',
    model_info: { face: 0, gender: 1, hair: 2, hair_color: 3, inner: 0, skin: 1 },
  };

  it('ModelCreateSchema validates', () => {
    expect(ModelCreateSchema.safeParse(validModel).success).toBe(true);
  });

  it('ModelSetSchema validates', () => {
    expect(ModelSetSchema.safeParse(validModel).success).toBe(true);
  });
});
