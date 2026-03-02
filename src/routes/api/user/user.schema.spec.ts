import { describe, it, expect } from 'vitest';
import {
  RenameSchema,
  CommentSetSchema,
  TitleSetSchema,
  PartnerSetSchema,
  SearchUserIdSchema,
  SearchGameIdSchema,
} from './user.schema.js';

describe('user.schema', () => {
  it('RenameSchema validates', () => {
    expect(RenameSchema.safeParse({ session_id: 'sid', name: 'Hunter' }).success).toBe(true);
  });

  it('CommentSetSchema validates', () => {
    expect(CommentSetSchema.safeParse({ session_id: 'sid', comment: 'hi' }).success).toBe(true);
  });

  it('TitleSetSchema validates', () => {
    expect(TitleSetSchema.safeParse({ session_id: 'sid', mst_title_id: 1 }).success).toBe(true);
  });

  it('PartnerSetSchema validates', () => {
    expect(
      PartnerSetSchema.safeParse({
        session_id: 'sid',
        main_partner_id: 'p1',
        quest_partner_id: 'p2',
      }).success,
    ).toBe(true);
  });

  it('SearchUserIdSchema validates', () => {
    expect(SearchUserIdSchema.safeParse({ uids: ['u1'] }).success).toBe(true);
  });

  it('SearchGameIdSchema validates', () => {
    expect(SearchGameIdSchema.safeParse({ gameIds: ['g1'] }).success).toBe(true);
  });
});
