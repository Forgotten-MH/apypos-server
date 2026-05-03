/**
 * Room model for multiplayer room state.
 * Used by both multiServer.ts (socket handler) and multi.controller.ts (HTTP API).
 */

export class Room {
  roomNumber: number;
  hostUserId: number;
  locked: boolean;
  members: Set<string>;
  memberUsers: Map<string, string>;
  memberPlayerIds: Map<string, number>;
  playerInfoData: Map<string, Buffer>;
  readyPlayers: Set<string>;
  questId: number;
  roomName: string;
  maxMembers: number;

  constructor(data: {
    roomNumber: number;
    hostUserId: number;
    questId: number;
    roomName: string;
    maxMembers: number;
  }) {
    this.roomNumber = data.roomNumber;
    this.hostUserId = data.hostUserId;
    this.locked = false;
    this.members = new Set();
    this.memberUsers = new Map();
    this.memberPlayerIds = new Map();
    this.playerInfoData = new Map();
    this.readyPlayers = new Set();
    this.questId = data.questId;
    this.roomName = data.roomName;
    this.maxMembers = data.maxMembers;
  }

  /**
   * Convert room info to API response format.
   * IDA verified (cAPIReserveRoom::Response::setup @ 0x168f314):
   *   - is_locked: read as int (not bool) — IDA: if (is_locked) at 0x17a2d3c
   *   - members: read as string array — IDA: iterate with for..of on array
   *   - name: field name is "name" (not "room_name") — IDA: JSON key confirmed
   *   - url: optional, used for Lobby visibility
   */
  toRoomInfo(url?: string) {
    return {
      room_id: this.roomNumber,
      name: this.roomName,
      quest_id: this.questId,
      is_locked: this.locked ? 1 : 0, // IDA verified: read as int
      members: Array.from(this.members), // IDA verified: string array
      max_members: this.maxMembers,
      host_user_id: this.hostUserId,
      ...(url ? { url } : {}),
    };
  }
}
