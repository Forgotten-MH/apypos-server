/**
 * Shared multiplayer room state.
 * Both multiServer.ts (socket handler) and multi.controller.ts (HTTP API) access this.
 */

export type RoomState = {
  roomNumber: number;
  hostSocketId: string | null;
  hostUserId: string | null;
  locked: boolean;
  members: Set<string>; // socket.id set
  memberUsers: Map<string, string>; // socket.id -> user_id
  memberPlayerIds: Map<string, number>; // socket.id -> playerId
  playerInfoData: Map<string, Buffer>; // socket.id -> player info buffer
  readyPlayers: Set<string>; // socket.id set (entry type=8)
  questId?: number;
  roomName?: string;
  maxMembers?: number;
};

export const rooms = new Map<number, RoomState>();
export const socketToUser = new Map<string, string>(); // socket.id -> user_id
export const userToSocket = new Map<string, string>(); // user_id -> socket.id
