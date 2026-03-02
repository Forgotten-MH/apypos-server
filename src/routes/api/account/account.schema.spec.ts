import { describe, it, expect } from 'vitest';
import {
  RegistSchema,
  LoginSchema,
  MigrationReadySchema,
  MigrationAuthSchema,
} from './account.schema.js';

describe('account.schema', () => {
  it('RegistSchema validates', () => {
    expect(RegistSchema.safeParse({ uu_id: 'u1', secret_id: 's1' }).success).toBe(true);
  });

  it('LoginSchema validates', () => {
    expect(LoginSchema.safeParse({ uu_id: 'u1', secret_id: 's1' }).success).toBe(true);
  });

  it('MigrationReadySchema validates', () => {
    expect(
      MigrationReadySchema.safeParse({
        login_id: 'l1',
        secret_id: 's1',
        mst_himitsu_question_id: 1,
        himitsu_answer: 'ans',
        migration_pass: 'pass',
      }).success,
    ).toBe(true);
  });

  it('MigrationAuthSchema validates', () => {
    expect(
      MigrationAuthSchema.safeParse({
        migration_id: 'm1',
        migration_pass: 'pass',
        secret_id: 's1',
        uu_id: 'u1',
      }).success,
    ).toBe(true);
  });
});
