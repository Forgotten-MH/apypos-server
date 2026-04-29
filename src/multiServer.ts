import { Server, Socket } from 'socket.io';
import { createMaintenancePacket, createChatPacket, parseHeader, createHeader } from './multiUtils.js';
import { createLogger } from './middleware/logger.js';
import { FLAG1, DEFAULT_SEQ, DEFAULT_FLAG2, SERVER_PLAYER_ID } from './constants/multiplayer.js';
import { rooms, socketToUser, userToSocket, RoomState } from './multiState.js';

const log = createLogger('multiServer');

const DEBUG_MULTIPLAYER = process.env.DEBUG_MULTIPLAYER === '1';
function logDebug(msg: string) {
  if (DEBUG_MULTIPLAYER) log.debug(msg);
}

export type PlayerInfoData = Buffer;

// ============ Helper Functions ============
function isAuthenticated(socket: Socket): boolean {
  return socketToUser.has(socket.id);
}

function getUserId(socket: Socket): string | undefined {
  return socketToUser.get(socket.id);
}

function ensureRoom(roomNumber: number): RoomState {
  let room = rooms.get(roomNumber);
  if (!room) {
    room = {
      roomNumber,
      hostSocketId: null,
      hostUserId: null,
      locked: false,
      members: new Set(),
      memberUsers: new Map(),
      memberPlayerIds: new Map(),
      playerInfoData: new Map(),
      readyPlayers: new Set(),
    };
    rooms.set(roomNumber, room);
  }
  return room;
}

function addMemberToRoom(roomNumber: number, socket: Socket, playerId?: number): RoomState {
  const room = ensureRoom(roomNumber);
  room.members.add(socket.id);
  const assignedPlayerId = playerId !== undefined ? playerId : room.members.size - 1;
  room.memberPlayerIds.set(socket.id, assignedPlayerId);
  logDebug(`[addMemberToRoom] Assigned playerId=${assignedPlayerId} to socket ${socket.id}`);

  if (!room.hostSocketId) {
    room.hostSocketId = socket.id;
  }
  return room;
}

function removeMemberFromRoom(roomNumber: number, socket: Socket): RoomState | null {
  const room = rooms.get(roomNumber);
  if (!room || !room.members.has(socket.id)) return null;

  const wasHost = room.hostSocketId === socket.id;
  room.members.delete(socket.id);
  room.memberUsers.delete(socket.id);
  room.memberPlayerIds.delete(socket.id);
  room.playerInfoData.delete(socket.id);
  room.readyPlayers.delete(socket.id);

  // If host left, clean up entire room
  if (wasHost) {
    rooms.delete(roomNumber);
    logDebug(`[removeMemberFromRoom] Host left, deleted room ${roomNumber}`);
    return null;
  }

  // If room is now empty, clean up
  if (room.members.size === 0) {
    rooms.delete(roomNumber);
    logDebug(`[removeMemberFromRoom] Room empty, deleted room ${roomNumber}`);
    return null;
  }

  return room;
}

// ============ Cleanup Functions ============
export function cleanupExpiredRoomsFromMemory() {
  let cleanedCount = 0;

  for (const [roomNumber, room] of rooms.entries()) {
    const shouldCleanup =
      room.members.size === 0 ||
      (room.hostSocketId && !room.members.has(room.hostSocketId));

    if (shouldCleanup) {
      rooms.delete(roomNumber);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    log.info(`[Memory Cleanup] Cleaned up ${cleanedCount} expired rooms from memory`);
  }

  return cleanedCount;
}

export function cleanupAllRoomsFromMemory() {
  const roomCount = rooms.size;
  rooms.clear();
  socketToUser.clear();
  userToSocket.clear();
  return roomCount;
}

// ============ Socket Connection Handler ============
export function onConnect(io: Server, socket: Socket) {
  log.info('Client connected:', socket.id);

  socket.setMaxListeners(50);

  // ============ Authentication Middleware ============
  socket.use((event, next) => {
    const eventName = event[0] as string;

    // Public events that don't require authentication
    const publicEvents = [
      'heartbeat',
      'authenticate',
      'match',
    ];
    if (publicEvents.includes(eventName)) {
      return next();
    }

    // Check if authenticated
    if (!isAuthenticated(socket)) {
      logDebug(`Unauthenticated access to ${eventName} from ${socket.id}`);
      socket.emit('auth_required', { message: 'Authentication required' });
      return next(new Error('Authentication required'));
    }

    next();
  });

  // ============ Authenticate ============
  socket.on('authenticate', (data: { user_id: string }) => {
    const userId = data.user_id;
    if (userId) {
      socketToUser.set(socket.id, userId);
      userToSocket.set(userId, socket.id);
      log.info(`[Authenticate] User ${userId} authenticated on socket ${socket.id}`);
      socket.emit('authenticate_ok', { user_id: userId });
    } else {
      socket.emit('authenticate_ng', { message: 'Invalid user_id' });
    }
  });

  // ============ Heartbeat ============
  socket.on('heartbeat', (_date) => {
    setTimeout(() => {
      logDebug(`heartbeat → ${socket.id}`);
      socket.emit('heartbeat', Date.now());
    });
  });

  // ============ Create Room ============
  socket.on('create', async (data: Buffer) => {
    const { header, payload } = parseHeader(data);
    logDebug(`[Create] from socket ${socket.id}, room=${header.roomNumber}, hex=${data.toString('hex')}`);

    try {
      let userId = getUserId(socket);
      const extractedUserId = payload.subarray(0, 24).toString('ascii').replace(/\0/g, '');

      // If user not authenticated, try to extract user info from payload
      if (!userId && extractedUserId) {
        // Temporary: allow extracted user_id without session validation
        userId = extractedUserId;
        socketToUser.set(socket.id, userId);
        userToSocket.set(userId, socket.id);
        logDebug(`[Create] Using extracted user_id ${userId} without session (temporary)`);
      }

      if (!userId) {
        logDebug('[Create] Create rejected: user not authenticated');
        socket.emit('create_ng', data);
        return;
      }

      // Add member to room
      const room = addMemberToRoom(header.roomNumber, socket, 0);
      room.memberUsers.set(socket.id, userId);
      if (!room.hostUserId) {
        room.hostUserId = userId;
      }

      // Create response payload
      const responsePayload = Buffer.alloc(payload.length);
      payload.copy(responsePayload);

      // Change the uint32 value at offset 24 to 0 (success indicator)
      responsePayload.writeUInt32LE(0, 24);

      // ⚠️ Fix: IDA analysis shows onCreateTask checks a2[8]==2 for success path
      // Note: Socket.IO's addReceiveBuffer overrides packet[8] with event index
      // "create_ok" event index is 2, so client will always see 2 regardless
      const createOkHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: header.playerId,
        seq: header.seq,
        unk2: header.unk2,
        emitTypeHex: 2, // ⚠️ create_ok index 2 (onCreateTask checks packet[8]==2)
        flag1: header.flag1,
        pktlen: responsePayload.length,
        flag2: header.flag2,
      });

      const responseData = Buffer.concat([createOkHeader, responsePayload]);
      logDebug(`[Create] create_ok hex:\n${responseData.toString('hex')}`);

      socket.emit('create_ok', responseData);
      const createSlot = room.memberPlayerIds.get(socket.id);
      log.info(`[Create] create_ok → user=${userId} room=${header.roomNumber} slot=${createSlot}`);

    } catch (e) {
      log.error('create room failed', e);
      socket.emit('create_ng', data);
    }
  });

  // ============ Join Room ============
  socket.on('join', async (data: Buffer) => {
    const { header, payload } = parseHeader(data);
    logDebug(`[Join] from socket ${socket.id}, room=${header.roomNumber}, hex=${data.toString('hex')}`);

    try {
      const room = ensureRoom(header.roomNumber);
      let userId = getUserId(socket);
      const extractedUserId = payload.subarray(0, 24).toString('ascii').replace(/\0/g, '');

      if (!userId && extractedUserId) {
        userId = extractedUserId;
        socketToUser.set(socket.id, userId);
        userToSocket.set(userId, socket.id);
        logDebug(`[Join] Using extracted user_id ${userId} without session (temporary)`);
      }

      if (!userId) {
        logDebug('[Join] Join rejected: user not authenticated');
        socket.emit('join_ng', data);
        return;
      }

      // Add to room
      addMemberToRoom(header.roomNumber, socket);
      room.memberUsers.set(socket.id, userId);
      socket.join(String(header.roomNumber));

      // Create response
      const responsePayload = Buffer.alloc(payload.length);
      payload.copy(responsePayload);
      responsePayload.writeUInt32LE(0, 24);

      // ⚠️ Fix: join_ok also needs emitTypeHex=2 for client success path
      const joinOkHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: header.playerId,
        seq: header.seq,
        unk2: header.unk2,
        emitTypeHex: 2,
        flag1: header.flag1,
        pktlen: responsePayload.length,
        flag2: header.flag2,
      });

      const responseData = Buffer.concat([joinOkHeader, responsePayload]);
      socket.emit('join_ok', responseData);
      log.info(`[Join] join_ok → user=${userId} room=${header.roomNumber}`);

    } catch (e) {
      log.error('join room failed', e);
      socket.emit('join_ng', data);
    }
  });

  // ============ Data (Game Communication) ============
  socket.on('data', (data: Buffer) => {
    const { header, payload } = parseHeader(data);

    switch (header.flag1) {
      case FLAG1.SESSION:
        // Ignore session packets
        break;

      case FLAG1.INFO:
        log.info('onReceiveInfo room:', header.roomNumber, 'playerId', header.playerId);
        log.info('type:', payload.readUInt16BE(0));
        switch (payload.readUInt16BE(0)) {
          case 2:
            socket.emit(
              'data',
              Buffer.concat([
                createHeader({
                  roomNumber: 0x17d78400,
                  playerId: 0x0,
                  seq: DEFAULT_SEQ,
                  unk2: 0x0,
                  emitTypeHex: 0x0,
                  flag1: FLAG1.INFO,
                  pktlen: 64,
                  flag2: DEFAULT_FLAG2,
                }),
                Buffer.from([
                  0x00,
                  0x07, // 02 /api/multi/member/info if lobby created
                  0x53, 0x50, 0x36, 0x51, 0x39, 0x48, 0x46, 0x4a,
                  0x47, 0x47, 0x48, 0x37, 0x36, 0x48, 0x53, 0x53,
                  0x53, 0x53, 0x46, 0x4a, 0x4e, 0x47, 0x01, 0x00,
                  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                ]),
              ]),
            );
            break;
          default:
            break;
        }
        break;

      case FLAG1.CHAT: {
        log.info('client sent chat', header.roomNumber, 'playerId', header.playerId);
        const _user = payload.toString('ascii', 0, payload.indexOf(0, 0));
        const message = payload.toString(
          'ascii',
          payload.indexOf(0x2f),
          payload.indexOf(0, payload.indexOf(0x2f)),
        );
        const command = message.split(' ')[0];
        switch (command) {
          case '/chat':
            socket.emit('data', createChatPacket(header.roomNumber, message.split(' ')[1] ?? ''));
            break;
          case '/maintenance':
            socket.emit('data', createMaintenancePacket({ durationSecondsTill: 4000 }));
            break;
          default:
            break;
        }
        break;
      }

      case FLAG1.ACTIVITY: {
        // ⚠️ Fix: FLAG1.ACTIVITY is now 0x08 (was incorrectly 0x06)
        // Forward activity data to room members
        const userId = getUserId(socket);
        const room = rooms.get(header.roomNumber);
        if (room && room.members.has(socket.id) && userId) {
          logDebug(`[Data] Forwarding flag1=0x${header.flag1.toString(16)} from ${userId} to room ${header.roomNumber}`);
          socket.to(String(header.roomNumber)).emit('data', data);
        }
        break;
      }

      default: {
        // Forward any other data to room members
        const userId = getUserId(socket);
        const room = rooms.get(header.roomNumber);
        if (room && room.members.has(socket.id) && userId) {
          logDebug(`[Data] Forwarding flag1=0x${header.flag1.toString(16)} from ${userId} to room ${header.roomNumber}`);
          socket.to(String(header.roomNumber)).emit('data', data);
        }
        break;
      }
    }
  });

  // ============ Leave Room ============
  socket.on('leave', (data: Buffer) => {
    const { header } = parseHeader(data);
    logDebug(`[Leave] from socket ${socket.id}, room=${header.roomNumber}`);

    const room = removeMemberFromRoom(header.roomNumber, socket);
    socket.leave(String(header.roomNumber));

    if (room) {
      // Broadcast leave to remaining members
      // IDA verified: onLeaveMember uses "leave" event (not "leave_ok")
      const leavePayload = Buffer.alloc(4);
      leavePayload.writeUInt32LE(header.playerId, 0);

      const leaveHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: SERVER_PLAYER_ID,
        seq: DEFAULT_SEQ,
        unk2: 0x0,
        emitTypeHex: 0x0,
        flag1: FLAG1.SESSION,
        pktlen: leavePayload.length,
        flag2: DEFAULT_FLAG2,
      });

      const leaveData = Buffer.concat([leaveHeader, leavePayload]);
      socket.to(String(header.roomNumber)).emit('leave', leaveData);
    }

    socket.emit('leave_ok', data);
  });

  // ============ Disconnect ============
  socket.on('disconnect', async (reason) => {
    log.info(`Client disconnected: ${socket.id}, Reason: ${reason}`);

    const userId = getUserId(socket);
    const affectedRooms: number[] = [];

    // Collect affected rooms first (avoid modifying Map during iteration)
    const affectedRoomEntries: [number, RoomState][] = [];
    for (const [roomNumber, room] of rooms.entries()) {
      if (room.members.has(socket.id)) {
        affectedRoomEntries.push([roomNumber, room]);
      }
    }

    for (const [roomNumber, room] of affectedRoomEntries) {
      const leavingPlayerId = room.memberPlayerIds.get(socket.id);

      // Remove from room
      const updatedRoom = removeMemberFromRoom(roomNumber, socket);
      socket.leave(String(roomNumber));

      if (updatedRoom && leavingPlayerId !== undefined) {
        // Broadcast leave to remaining members
        // IDA verified: disconnect also triggers onLeaveMember, uses "leave" event
        const leavePayload = Buffer.alloc(4);
        leavePayload.writeUInt32LE(leavingPlayerId, 0);

        const leaveHeader = createHeader({
          roomNumber: roomNumber,
          playerId: SERVER_PLAYER_ID,
          seq: DEFAULT_SEQ,
          unk2: 0x0,
          emitTypeHex: 0x0,
          flag1: FLAG1.SESSION,
          pktlen: leavePayload.length,
          flag2: DEFAULT_FLAG2,
        });

        const leaveData = Buffer.concat([leaveHeader, leavePayload]);
        logDebug(`[Disconnect] Broadcasting leave playerId=${leavingPlayerId} to ${updatedRoom.members.size} members`);

        // IDA: disconnect triggers onLeaveMember, use "leave" event (not "leave_ok")
        socket.to(String(roomNumber)).emit('leave', leaveData);
      }
    }

    const affectedRooms = affectedRoomEntries.map(([n]) => n);

    if (affectedRooms.length > 0) {
      logDebug(`[Disconnect] Cleanup completed for rooms: ${affectedRooms.join(', ')}`);
    }

    // Clean up socket mappings
    if (userId) {
      socketToUser.delete(socket.id);
      userToSocket.delete(userId);
    }
  });

  // ============ Error ============
  socket.on('error', (error) => {
    log.error(`Error for client ${socket.id}:`, error.message);
  });
}
