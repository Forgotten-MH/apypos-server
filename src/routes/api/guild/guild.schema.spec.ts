import { describe, it, expect } from 'vitest';
import {
  CreateSchema,
  SearchIdSchema,
  ApplySchema,
  SearchSchema,
  ChatSendSchema,
  MemberListSchema,
} from './guild.schema.js';

describe('guild.schema', () => {
  it('CreateSchema validates', () => {
    expect(CreateSchema.safeParse({ session_id: 'sid', name: 'guild' }).success).toBe(true);
  });

  it('SearchIdSchema validates', () => {
    expect(SearchIdSchema.safeParse({ session_id: 'sid', id: 'g1' }).success).toBe(true);
  });

  it('ApplySchema validates', () => {
    expect(ApplySchema.safeParse({ session_id: 'sid', gid: 'g1' }).success).toBe(true);
  });

  it('SearchSchema validates', () => {
    expect(SearchSchema.safeParse({ session_id: 'sid' }).success).toBe(true);
  });

  it('ChatSendSchema validates', () => {
    expect(ChatSendSchema.safeParse({ session_id: 'sid', gid: 'g1', text: 'hi' }).success).toBe(true);
  });

  it('MemberListSchema validates', () => {
    expect(MemberListSchema.safeParse({ session_id: 'sid' }).success).toBe(true);
  });
});
