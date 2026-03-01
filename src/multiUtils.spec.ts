import { describe, it, expect } from 'vitest';
import {
  createHeader,
  parseHeader,
  createMaintenancePacket,
  createChatPacket,
  createInfoPacket,
  createActivityPacket,
  createSessionPacket,
} from './multiUtils.js';
import { FLAG1, HEADER_SIZE, DEFAULT_SEQ, DEFAULT_FLAG2, SERVER_PLAYER_ID } from './constants/multiplayer.js';

describe('multiUtils', () => {
  describe('createHeader / parseHeader round-trip', () => {
    it('round-trips all 8 header fields', () => {
      const input = {
        roomNumber: 0x12345678,
        playerId: 0x0a,
        seq: 0x1234,
        unk2: 0x05,
        emitTypeHex: 0x07,
        flag1: 0x09,
        pktlen: 42,
        flag2: 0x10,
      };
      const header = createHeader(input);
      const { header: parsed } = parseHeader(header);

      expect(parsed.roomNumber).toBe(input.roomNumber);
      expect(parsed.playerId).toBe(input.playerId);
      expect(parsed.seq).toBe(input.seq);
      expect(parsed.unk2).toBe(input.unk2);
      expect(parsed.emitTypeHex).toBe(input.emitTypeHex);
      expect(parsed.flag1).toBe(input.flag1);
      expect(parsed.pktlen).toBe(input.pktlen);
      expect(parsed.flag2).toBe(input.flag2);
    });

    it('produces a buffer of exactly HEADER_SIZE bytes', () => {
      const header = createHeader({
        roomNumber: 0,
        playerId: 0,
        seq: 0,
        unk2: 0,
        emitTypeHex: 0,
        flag1: 0,
        pktlen: 0,
        flag2: 0,
      });
      expect(header.length).toBe(HEADER_SIZE);
    });

    it('round-trips with zero values', () => {
      const input = {
        roomNumber: 0,
        playerId: 0,
        seq: 0,
        unk2: 0,
        emitTypeHex: 0,
        flag1: 0,
        pktlen: 0,
        flag2: 0,
      };
      const header = createHeader(input);
      const { header: parsed } = parseHeader(header);
      expect(parsed).toEqual(input);
    });

    it('round-trips with max uint8/uint16/uint32 values', () => {
      const input = {
        roomNumber: 0xffffffff,
        playerId: 0xff,
        seq: 0xffff,
        unk2: 0xff,
        emitTypeHex: 0xff,
        flag1: 0xff,
        pktlen: 0xffff,
        flag2: 0xffffffff,
      };
      const header = createHeader(input);
      const { header: parsed } = parseHeader(header);
      expect(parsed).toEqual(input);
    });
  });

  describe('parseHeader', () => {
    it('throws on buffer shorter than 16 bytes', () => {
      expect(() => parseHeader(Buffer.alloc(15))).toThrow('Buffer too short');
    });

    it('returns payload after header', () => {
      const payload = Buffer.from([0xaa, 0xbb, 0xcc]);
      const header = createHeader({
        roomNumber: 1,
        playerId: 2,
        seq: 3,
        unk2: 4,
        emitTypeHex: 5,
        flag1: 6,
        pktlen: payload.length,
        flag2: 7,
      });
      const result = parseHeader(Buffer.concat([header, payload]));
      expect(Buffer.from(result.payload)).toEqual(payload);
    });
  });

  describe('createMaintenancePacket', () => {
    it('creates a packet with FLAG1.NOTICE and correct duration', () => {
      const packet = createMaintenancePacket({ durationSecondsTill: 4000 });
      const { header, payload } = parseHeader(packet);

      expect(header.flag1).toBe(FLAG1.NOTICE);
      expect(header.playerId).toBe(SERVER_PLAYER_ID);
      expect(header.seq).toBe(DEFAULT_SEQ);
      expect(header.flag2).toBe(DEFAULT_FLAG2);
      expect(payload.readUInt32LE(0)).toBe(4000);
    });

    it('encodes duration=0 correctly', () => {
      const packet = createMaintenancePacket({ durationSecondsTill: 0 });
      const { payload } = parseHeader(packet);
      expect(payload.readUInt32LE(0)).toBe(0);
    });
  });

  describe('createChatPacket', () => {
    it('creates a packet with FLAG1.CHAT and the room number', () => {
      const packet = createChatPacket(42, 'Hello');
      const { header } = parseHeader(packet);

      expect(header.flag1).toBe(FLAG1.CHAT);
      expect(header.roomNumber).toBe(42);
      expect(header.seq).toBe(DEFAULT_SEQ);
      expect(header.flag2).toBe(DEFAULT_FLAG2);
    });

    it('contains the message in the payload at offset 0x36', () => {
      const message = 'TestMsg';
      const packet = createChatPacket(1, message);
      const { payload } = parseHeader(packet);
      const extracted = payload.toString('ascii', 0x36, 0x36 + message.length);
      expect(extracted).toBe(message);
    });

    it('contains sender name at payload start', () => {
      const packet = createChatPacket(1, 'hi');
      const { payload } = parseHeader(packet);
      const name = payload.toString('ascii', 0, payload.indexOf(0, 0));
      expect(name).toBe('Command User');
    });
  });

  describe('createInfoPacket', () => {
    it('creates a packet with FLAG1.INFO', () => {
      const packet = createInfoPacket();
      const { header } = parseHeader(packet);
      expect(header.flag1).toBe(FLAG1.INFO);
    });

    it('has seq=DEFAULT_SEQ and flag2=DEFAULT_FLAG2', () => {
      const packet = createInfoPacket();
      const { header } = parseHeader(packet);
      expect(header.seq).toBe(DEFAULT_SEQ);
      expect(header.flag2).toBe(DEFAULT_FLAG2);
    });

    it('has a valid msgType byte in payload', () => {
      const allowed = [0, 2, 3, 4, 5, 6, 7, 8, 9];
      const packet = createInfoPacket();
      const { payload } = parseHeader(packet);
      const msgType = payload.readUInt8(1);
      expect(allowed).toContain(msgType);
    });
  });

  describe('createActivityPacket', () => {
    it('creates a packet with FLAG1.ACTIVITY', () => {
      const packet = createActivityPacket();
      const { header } = parseHeader(packet);
      expect(header.flag1).toBe(FLAG1.ACTIVITY);
    });

    it('has a 42-byte payload', () => {
      const packet = createActivityPacket();
      const { header } = parseHeader(packet);
      expect(header.pktlen).toBe(42);
    });

    it('has seq=DEFAULT_SEQ and flag2=DEFAULT_FLAG2', () => {
      const packet = createActivityPacket();
      const { header } = parseHeader(packet);
      expect(header.seq).toBe(DEFAULT_SEQ);
      expect(header.flag2).toBe(DEFAULT_FLAG2);
    });
  });

  describe('createSessionPacket', () => {
    it('creates a packet with FLAG1.SESSION', () => {
      const packet = createSessionPacket();
      const { header } = parseHeader(packet);
      expect(header.flag1).toBe(FLAG1.SESSION);
    });

    it('has a 2-byte payload', () => {
      const packet = createSessionPacket();
      const { header } = parseHeader(packet);
      expect(header.pktlen).toBe(2);
    });

    it('has seq=DEFAULT_SEQ and flag2=DEFAULT_FLAG2', () => {
      const packet = createSessionPacket();
      const { header } = parseHeader(packet);
      expect(header.seq).toBe(DEFAULT_SEQ);
      expect(header.flag2).toBe(DEFAULT_FLAG2);
    });
  });
});
