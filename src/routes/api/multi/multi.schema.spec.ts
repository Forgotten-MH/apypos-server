import { describe, it, expect } from 'vitest';
import {
  RoomReserveSchema,
  RoomSearchSchema,
  RoomJoinSchema,
  RoomCreateSchema,
  RoomQuickSchema,
  RoomGetSchema,
  MemberInfoSchema,
} from './multi.schema.js';

describe('multi.schema', () => {
  it('RoomReserveSchema validates correct input', () => {
    const result = RoomReserveSchema.safeParse({
      quest_id: 1,
      quick_match: 0,
      reserve: [],
      restart: 0,
    });
    expect(result.success).toBe(true);
  });

  it('RoomSearchSchema validates correct input', () => {
    const result = RoomSearchSchema.safeParse({
      auto_flag: 0,
      kick: 0,
      quest_id: 1,
      quick_match: 0,
      restart: 0,
    });
    expect(result.success).toBe(true);
  });

  it('RoomJoinSchema validates correct input', () => {
    const result = RoomJoinSchema.safeParse({
      auto_flag: 0,
      kick: 0,
      quest_id: 1,
      quick_match: 0,
      reserve: [],
      restart: 0,
      room_id: 1,
    });
    expect(result.success).toBe(true);
  });

  it('RoomCreateSchema validates correct input', () => {
    const result = RoomCreateSchema.safeParse({
      auto_flag: 0,
      kick: 0,
      name: 'room',
      quest_id: 1,
      quick_match: 0,
      reserve: [],
      restart: 0,
      tag: 0,
    });
    expect(result.success).toBe(true);
  });

  it('RoomQuickSchema validates correct input', () => {
    const result = RoomQuickSchema.safeParse({
      auto_flag: 0,
      kick: 0,
      name: 'room',
      quest_id: 1,
      quick_match: 0,
      reserve: [],
      restart: 0,
      tag: 0,
    });
    expect(result.success).toBe(true);
  });

  it('RoomGetSchema validates correct input', () => {
    const result = RoomGetSchema.safeParse({
      quest_id: 1,
      room_id: 1,
    });
    expect(result.success).toBe(true);
  });

  it('MemberInfoSchema validates correct input', () => {
    const result = MemberInfoSchema.safeParse({ sequence: 1 });
    expect(result.success).toBe(true);
  });

  it('RoomReserveSchema rejects invalid input', () => {
    const result = RoomReserveSchema.safeParse({ quest_id: 'bad' });
    expect(result.success).toBe(false);
  });
});
