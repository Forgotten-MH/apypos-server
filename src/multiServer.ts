import type { Event, Server, Socket } from "socket.io";
import Room from "./model/room.js";
import User from "./model/user.js";
import { parseHeader, createHeader, createChatPacket, createMaintenancePacket } from "./multiUtils.js";


type RoomState = {
  roomNumber: number;
  hostSocketId: string | null;
  hostUserId: string | null; 
  locked: boolean;
  members: Set<string>; 
  memberUsers: Map<string, string>; 
  memberPlayerIds: Map<string, number>; 
  playerInfoData: Map<string, Buffer>; 
  readyPlayers: Set<string>; 
  questId?: number;
  roomName?: string;
  maxMembers?: number;
};

const rooms: Map<number, RoomState> = new Map();

const socketToUser: Map<string, string> = new Map();
const userToSocket: Map<string, string> = new Map();


const DEBUG_MULTIPLAYER = process.env.DEBUG_MULTIPLAYER === 'true' || false;

function logDebug(message: string, ...args: unknown[]) {
  if (DEBUG_MULTIPLAYER) {
    console.log(`[Multiplayer Debug] ${message}`, ...args);
  }
}

function logRoomState(roomNumber: number, action: string) {
  const room = rooms.get(roomNumber);
  if (room) {
    logDebug(`Room ${roomNumber} ${action}:`, {
      host: room.hostSocketId,
      locked: room.locked,
      memberCount: room.members.size,
      members: Array.from(room.members)
    });
  }
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
      readyPlayers: new Set()
    };
    rooms.set(roomNumber, room);
  }
  return room;
}


async function authenticateUser(socket: Socket, sessionId: string): Promise<string | null> {
  try {
    if (!sessionId) {
      logDebug("No session ID provided for authentication");
      return null;
    }

    const user = await User.findOne({ current_session: sessionId });
    if (!user) {
      logDebug(`Authentication failed: No user found for session ${sessionId}`);
      return null;
    }

    const userId = user.user_id;
    if (!userId) {
      logDebug(`Authentication failed: User has no user_id for session ${sessionId}`);
      return null;
    }

    
    const oldSocketId = userToSocket.get(userId);
    if (oldSocketId && oldSocketId !== socket.id) {
      socketToUser.delete(oldSocketId);
      logDebug(`Cleaned up old socket mapping for user ${userId}: ${oldSocketId}`);
    }

    
    socketToUser.set(socket.id, userId);
    userToSocket.set(userId, socket.id);
    
    logDebug(`User authenticated: ${user.user_id} (${user.character_name}) -> socket ${socket.id}`);
    return userId;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}


function getUserId(socket: Socket): string | null {
  return socketToUser.get(socket.id) || null;
}


function cleanupUserMapping(socket: Socket) {
  const userId = socketToUser.get(socket.id);
  if (userId) {
    socketToUser.delete(socket.id);
    userToSocket.delete(userId);
    logDebug(`Cleaned up user mapping: ${userId} -> ${socket.id}`);
  }
}

function addMemberToRoom(roomNumber: number, socket: Socket, playerId?: number): RoomState {
  const room = ensureRoom(roomNumber);
  const userId = getUserId(socket);
  
  room.members.add(socket.id);
  if (userId) {
    room.memberUsers.set(socket.id, userId);
  }
  
 
  const assignedPlayerId = playerId !== undefined ? playerId : (room.members.size - 1);
  room.memberPlayerIds.set(socket.id, assignedPlayerId);
  logDebug(`[addMemberToRoom] Assigned playerId=${assignedPlayerId} to socket ${socket.id}`);
  
  if (!room.hostSocketId) {
    room.hostSocketId = socket.id;
    room.hostUserId = userId;
  }
  return room;
}

function removeMemberFromRoom(roomNumber: number, socket: Socket): RoomState | null {
  const room = rooms.get(roomNumber);
  if (!room) return null;
  
  const wasHost = room.hostSocketId === socket.id;
  const userId = room.memberUsers.get(socket.id);
  
  room.members.delete(socket.id);
  room.memberUsers.delete(socket.id);
  room.memberPlayerIds.delete(socket.id);
  room.playerInfoData.delete(socket.id);
  room.readyPlayers.delete(socket.id);
  
  
  if (wasHost) {
    logDebug(`Host ${userId} left room ${roomNumber}, cleaning up entire room from memory`);
    
    
    rooms.delete(roomNumber);
    logDebug(`Room ${roomNumber} deleted from memory (host left)`);
    
  
    return null;
  }
  
  if (room.members.size === 0) {
    logDebug(`Room ${roomNumber} is now empty, cleaning up entire room from memory`);
    
    
    rooms.delete(roomNumber);
    logDebug(`Room ${roomNumber} deleted from memory (empty)`);
    
    
    return null;
  }
  return room;
}

function isHost(socket: Socket, roomNumber: number): boolean {
  const room = rooms.get(roomNumber);
  const userId = getUserId(socket);
  return !!room && room.hostSocketId === socket.id && room.hostUserId === userId;
}

function isRoomMember(socket: Socket, roomNumber: number): boolean {
  const room = rooms.get(roomNumber);
  return !!room && room.members.has(socket.id);
}

function isAuthenticated(socket: Socket): boolean {
  return getUserId(socket) !== null;
}

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
    console.log(`[Memory Cleanup] Cleaned up ${cleanedCount} expired rooms from memory`);
  }

  return cleanedCount;
}


export function cleanupAllRoomsFromMemory() {
  const roomCount = rooms.size;
  rooms.clear();
  socketToUser.clear();
  userToSocket.clear();
  
  console.log(`[Memory Cleanup] Cleared all ${roomCount} rooms from memory`);
  return roomCount;
}

export function onConnect(io: Server, socket: Socket) {
  console.log("Client connected:", socket.id);

  socket.setMaxListeners(50); 

 
  socket.use((packet: Event, next: (err?: Error) => void) => {
    const [event] = packet;
    
    
    const publicEvents = [
      'heartbeat', 'authenticate', 'create', 'join', 'data',
      'lock', 'unlock', 'kick', 'entry', 'cancel', 'host_change_request',
      'match'
    ];
    if (publicEvents.includes(event)) {
      return next();
    }

    
    if (!isAuthenticated(socket)) {
      logDebug(`Unauthenticated access to ${event} from ${socket.id}`);
      socket.emit('auth_required', { message: 'Authentication required' });
      return next(new Error('Authentication required'));
    }

    next();
  });

 
  socket.on("authenticate", async (data: { session_id: string }) => {
    try {
      const { session_id } = data;
      const userId = await authenticateUser(socket, session_id);
      
      if (userId) {
        socket.emit("auth_success", { user_id: userId });
        logDebug(`Authentication successful for socket ${socket.id}`);
      } else {
        socket.emit("auth_failed", { message: "Invalid session" });
        logDebug(`Authentication failed for socket ${socket.id}`);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      socket.emit("auth_failed", { message: "Authentication error" });
    }
  });

  socket.on("heartbeat", () => {
    setTimeout(() => {
      logDebug(`heartbeat → ${socket.id}`);
      socket.emit("heartbeat", Date.now());
    });
  });
  socket.on("create", async (data: Buffer) => {
    const { header, payload } = parseHeader(data);
    logDebug(`[Create] from socket ${socket.id}, room=${header.roomNumber}, hex=${data.toString('hex')}`);
    try {
      let userId = getUserId(socket);
      const extractedUserId = payload.subarray(0, 24).toString("ascii").replace(/\0/g, '');

      
      if (!userId && extractedUserId) {
        try {
          const user = await User.findOne({ user_id: extractedUserId });
          if (user?.current_session && user.user_id) {
            socketToUser.set(socket.id, user.user_id);
            userToSocket.set(user.user_id, socket.id);
            userId = user.user_id;
            logDebug(`[Create] Authenticated user ${userId} via payload`);
          }
        } catch (extractError) {
          console.error(`[Create] Failed to extract user info from payload:`, extractError);
        }
      }

      
      if (!userId) {
        if (extractedUserId) {
          userId = extractedUserId;
          socketToUser.set(socket.id, userId);
          userToSocket.set(userId, socket.id);
          logDebug(`[Create] Using extracted user_id ${userId} without session (temporary)`);
        } else {
          logDebug(`[Create] Create rejected: user not authenticated`);
          socket.emit("create_ng", data);
          return;
        }
      }
      
      void socket.join(String(header.roomNumber));
      const room = addMemberToRoom(header.roomNumber, socket);
      
      // Extract room metadata from payload if available
      const user_id = payload.subarray(0, 24).toString("ascii").replace(/\0/g, '');
      const questId = payload.readUInt32LE(24);
      
      // Update room metadata
      if (room) {
        room.questId = questId;
        room.roomName = user_id || `Room_${header.roomNumber}`;
        room.maxMembers = 4; // Default max members
      }
      
      logDebug(`Room created: ${header.roomNumber}`, {
        host: socket.id,
        user_id,
        questId,
        roomName: room?.roomName
      });
      
      // Create response payload
      const responsePayload = Buffer.alloc(payload.length);
      payload.copy(responsePayload);

      // Change the uint32 value at offset 24 to 0 (success indicator)
      responsePayload.writeUInt32LE(0, 24);

      
      const createOkHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: header.playerId,
        seq: header.seq,
        unk2: header.unk2,
        emitTypeHex: 2,  
        flag1: header.flag1,
        pktlen: responsePayload.length,
        flag2: header.flag2,
      });

      const responseData = Buffer.concat([createOkHeader, responsePayload]);
      logDebug(`[Create] create_ok hex:\n${responseData.toString('hex')}`);

      // Send success response
      socket.emit("create_ok", responseData);
      const createSlot = room?.memberPlayerIds.get(socket.id);
      console.log(`[Create] create_ok → user=${userId} room=${header.roomNumber} slot=${createSlot}`);

    } catch (e) {
      console.error("create room failed", e);
      socket.emit("create_ng", data);
    }
  });
  socket.on("join", async (data: Buffer) => {
    const { header, payload } = parseHeader(data);
    logDebug(`[Join] from socket ${socket.id}, room=${header.roomNumber}, hex=${data.toString('hex')}`);
    try {
      const room = ensureRoom(header.roomNumber);
      let userId = getUserId(socket);
      const extractedUserId = payload.subarray(0, 24).toString("ascii").replace(/\0/g, '');

      
      if (!userId && extractedUserId) {
        try {
          const user = await User.findOne({ user_id: extractedUserId });
          if (user?.current_session && user.user_id) {
            socketToUser.set(socket.id, user.user_id);
            userToSocket.set(user.user_id, socket.id);
            userId = user.user_id;
            logDebug(`[Join] Authenticated user ${userId} via payload`);
          }
        } catch (extractError) {
          console.error(`[Join] Failed to extract user info from payload:`, extractError);
        }
      }

      
      if (!userId) {
        if (extractedUserId) {
          userId = extractedUserId;
          socketToUser.set(socket.id, userId);
          userToSocket.set(userId, socket.id);
          logDebug(`[Join] Using extracted user_id ${userId} without session (temporary)`);
        } else {
          logDebug(`[Join] Join rejected: user not authenticated`);
          socket.emit("join_ng", data);
          return;
        }
      }
      
      // Check if room is locked
      if (room.locked) {
        socket.emit("join_ng", data);
        logDebug(`Join rejected: room ${header.roomNumber} is locked`);
        return;
      }

      // Check room capacity
      const maxMembers = room.maxMembers || 4;
      if (room.members.size >= maxMembers) {
        socket.emit("join_ng", data);
        logDebug(`Join rejected: room ${header.roomNumber} is full (${room.members.size}/${maxMembers})`);
        return;
      }

      // Check if already in room
      if (room.members.has(socket.id)) {
        socket.emit("join_ng", data);
        logDebug(`Join rejected: ${socket.id} already in room ${header.roomNumber}`);
        return;
      }
      
      void socket.join(String(header.roomNumber));
      
     
      const newPlayerId = room.members.size; 
      logDebug(`[Join] Assigning playerId ${newPlayerId} to user ${userId}`);

     
      const existingMembers = Array.from(room.memberPlayerIds.entries());
      logDebug(`[Join] Room has ${existingMembers.length} existing members before new player joins`);
      
      addMemberToRoom(header.roomNumber, socket, newPlayerId);
      
      
      const joinOkPayload = Buffer.alloc(208, 0);   
      joinOkPayload[0] = newPlayerId;                
      joinOkPayload[200] = 1;                       

      const joinOkHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: 0xff,  
        seq: header.seq,
        unk2: header.unk2,
        emitTypeHex: 5,  
        flag1: header.flag1,
        pktlen: joinOkPayload.length, 
        flag2: 0x10,
      });
      
      const joinOkData = Buffer.concat([joinOkHeader, joinOkPayload]);
      logDebug(`[Join] join_ok hex:\n${joinOkData.toString('hex')}`);
      socket.emit("join_ok", joinOkData);
      const joinSlot = room.memberPlayerIds.get(socket.id);
      console.log(`[Join] join_ok → user=${userId} room=${header.roomNumber} slot=${joinSlot}`);


      
      if (existingMembers.length > 0) {
        
        const newPlayerCachedInfo = room.playerInfoData.get(socket.id);
        const joinNotifyPayload = Buffer.alloc(208, 0);
        if (newPlayerCachedInfo && newPlayerCachedInfo.length >= 208) {
          newPlayerCachedInfo.copy(joinNotifyPayload, 0, 0, 208);
        }
        joinNotifyPayload[0] = 1;  

        const joinNotifyHeader = createHeader({
          roomNumber: header.roomNumber,
          playerId: newPlayerId,  
          seq: 0,
          unk2: 0,
          emitTypeHex: 0,  
          flag1: 0x03,
          pktlen: joinNotifyPayload.length,  
          flag2: 0x10,
        });
        const joinNotifyPkt = Buffer.concat([joinNotifyHeader, joinNotifyPayload]);
        socket.to(String(header.roomNumber)).emit("join", joinNotifyPkt);
        logDebug(`[Join] Bug1Fix: Notified ${existingMembers.length} existing members of new player slot=${newPlayerId}, pktlen=${joinNotifyPayload.length}`);
      }

      
      if (existingMembers.length > 0) {
        for (const [existingSocketId, existingSlot] of existingMembers) {
          const cachedInfo = room.playerInfoData.get(existingSocketId);
          const existingMemberPayload = Buffer.alloc(208, 0);
          if (cachedInfo && cachedInfo.length >= 208) {
            cachedInfo.copy(existingMemberPayload, 0, 0, 208);
          }
          existingMemberPayload[0] = 1;  

          const existingMemberHeader = createHeader({
            roomNumber: header.roomNumber,
            playerId: existingSlot,  
            seq: 0,
            unk2: 0,
            emitTypeHex: 0,  
            flag1: 0x03,
            pktlen: existingMemberPayload.length,  
            flag2: 0x10,
          });
          const existingMemberPkt = Buffer.concat([existingMemberHeader, existingMemberPayload]);
          socket.emit("join", existingMemberPkt);  
          logDebug(`[Join] Bug2Fix: Sent existing member slot=${existingSlot} info to new player slot=${newPlayerId}`);
        }
      }
      
      logRoomState(header.roomNumber, "member joined");
      
    } catch (e) {
      console.error("join failed", e);
      socket.emit("join_ng", data);
    }

  });

  socket.on("leave", async (data: Buffer) => {
    const { header } = parseHeader(data);
    logDebug(`[Leave] from socket ${socket.id}, room=${header.roomNumber}, hex=${data.toString('hex')}`);
    try {
      const userId = getUserId(socket);
      const room = rooms.get(header.roomNumber);

      if (!room) {
        socket.emit("leave_ok", data);
        return;
      }

      
      const leavingPlayerId = room.memberPlayerIds.get(socket.id) ?? header.playerId;
      const wasHost = room.hostSocketId === socket.id;
      logDebug(`[Leave] User ${userId} (playerId=${leavingPlayerId}, ${wasHost ? 'HOST' : 'MEMBER'}) leaving room ${header.roomNumber}`);

     
      if (userId) {
        try {
          const dbRoom = await Room.findOne({ room_id: header.roomNumber });
          if (dbRoom) {
            try {
              dbRoom.removeMember(userId);
              if (dbRoom.phase === -1) {
                await Room.deleteOne({ room_id: header.roomNumber });
                logDebug(`[Leave] Deleted room ${header.roomNumber} from database`);
              } else {
                await dbRoom.save();
                logDebug(`[Leave] Updated DB room ${header.roomNumber}, member_count=${dbRoom.member_count}`);
              }
            } catch (dbError) {
              console.error(`[Leave] Error updating room in database:`, dbError);
            }
          }
        } catch (error) {
          console.error(`[Leave] Error accessing database:`, error);
        }
      }

      
      const updatedRoom = removeMemberFromRoom(header.roomNumber, socket);
      void socket.leave(String(header.roomNumber));

      
      socket.emit("leave_ok", data);

      
      if (updatedRoom && updatedRoom.members.size > 0) {
        const leavePayload = Buffer.from([leavingPlayerId]);
        const leaveHeader = createHeader({
          roomNumber: header.roomNumber,
          playerId: leavingPlayerId,
          seq: header.seq,
          unk2: header.unk2,
          emitTypeHex: header.emitTypeHex,
          flag1: header.flag1,
          pktlen: leavePayload.length,
          flag2: header.flag2,
        });

        const leaveData = Buffer.concat([leaveHeader, leavePayload]);
        logDebug(`[Leave] Broadcasting leave for player ${leavingPlayerId}, hex=${leaveData.toString('hex')}`);

        
        socket.to(String(header.roomNumber)).emit("leave", leaveData);
        console.log(`[Leave] user=${userId} left room=${header.roomNumber}, remaining=${updatedRoom.members.size}`);
      }

      logRoomState(header.roomNumber, "member left");
    } catch (e) {
      console.error("[Leave] leave failed", e);
      socket.emit("leave_ok", data);
    }
  });

  // Lock room - only host can lock
  socket.on("lock", (data: Buffer) => {
    try {
      const { header } = parseHeader(data);
      if (!isHost(socket, header.roomNumber)) {
        socket.emit("lock_ng", data);
        logDebug(`Non-host ${socket.id} attempted to lock room ${header.roomNumber}`);
        return;
      }
      
      const room = rooms.get(header.roomNumber);
      if (room) {
        room.locked = true;
        socket.emit("lock_ok", data);
        
        socket.to(String(header.roomNumber)).emit("lock", data);
        logRoomState(header.roomNumber, "locked");
      } else {
        socket.emit("lock_ng", data);
      }
    } catch (e) {
      console.error("lock failed", e);
      socket.emit("lock_ng", data);
    }
  });

  // Unlock room - only host can unlock
  socket.on("unlock", (data: Buffer) => {
    try {
      const { header } = parseHeader(data);
      if (!isHost(socket, header.roomNumber)) {
        socket.emit("unlock_ng", data);
        logDebug(`Non-host ${socket.id} attempted to unlock room ${header.roomNumber}`);
        return;
      }

      const room = rooms.get(header.roomNumber);
      if (room) {
        room.locked = false;
        socket.emit("unlock_ok", data);
        socket.to(String(header.roomNumber)).emit("unlock", data);
        logRoomState(header.roomNumber, "unlocked");
      } else {
        socket.emit("unlock_ng", data);
      }
    } catch (e) {
      console.error("unlock failed", e);
      socket.emit("unlock_ng", data);
    }
  });

  // Kick member - only host can kick
  socket.on("kick", (data: Buffer) => {
    try {
      const { header, payload } = parseHeader(data);
      if (!isHost(socket, header.roomNumber)) {
        socket.emit("kick_ng", data);
        logDebug(`Non-host ${socket.id} attempted to kick from room ${header.roomNumber}`);
        return;
      }
      
      // Extract target player ID from payload (assuming it's in the first few bytes)
      const targetPlayerId = payload.readUInt8(0);
      const room = rooms.get(header.roomNumber);
      
      if (room && room.members.size > 1) {
        // Find socket by player ID (this is simplified - in reality you'd need a mapping)
        // For now, we'll broadcast the kick to all and let clients handle it
        socket.to(String(header.roomNumber)).emit("kick", data);
        logDebug(`Host ${socket.id} kicked player ${targetPlayerId} from room ${header.roomNumber}`);
      } else {
        socket.emit("kick_ng", data);
      }
    } catch (e) {
      console.error("kick failed", e);
      socket.emit("kick_ng", data);
    }
  });

  
  socket.on("host_change_request", (data: Buffer) => {
    try {
      const { header } = parseHeader(data);
      const room = rooms.get(header.roomNumber);
      if (!room || !room.members.has(socket.id)) {
        socket.emit("host_change_ng", data);
        return;
      }

      
      const requesterSlot = room.memberPlayerIds.get(socket.id) ?? header.playerId;  
      const hostSlot = 0;  
      const responsePayload = Buffer.alloc(4);
      responsePayload.writeInt32LE(hostSlot, 0);  
      const responseHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: hostSlot,
        seq: header.seq,
        unk2: header.unk2,
        emitTypeHex: header.emitTypeHex,
        flag1: header.flag1,
        pktlen: responsePayload.length,
        flag2: header.flag2,
      });
      const hostChangePkt = Buffer.concat([responseHeader, responsePayload]);
      socket.emit("host_change", hostChangePkt);
      logDebug(`[HostChange] Sent host_change hostSlot=0 (requesterSlot=${requesterSlot}) room=${header.roomNumber} hex=${hostChangePkt.toString('hex')}`);
    } catch (e) {
      console.error("host_change_request failed", e);
      socket.emit("host_change_ng", data);
    }
  });

  // Cancel operation
  socket.on("cancel", (data: Buffer) => {
    try {
      const { header } = parseHeader(data);
      if (!isRoomMember(socket, header.roomNumber)) {
        socket.emit("cancel_ng", data);
        return;
      }
      
      socket.emit("cancel_ok", data);
      socket.to(String(header.roomNumber)).emit("cancel", data);
      logDebug(`Cancel operation in room ${header.roomNumber} by ${socket.id}`);
    } catch (e) {
      console.error("cancel failed", e);
      socket.emit("cancel_ng", data);
    }
  });

  
  socket.on("entry", (data: Buffer) => {
    try {
      const { header, payload } = parseHeader(data);
      if (!isRoomMember(socket, header.roomNumber)) {
        socket.emit("entry_ng", data);
        return;
      }

      const room = rooms.get(header.roomNumber);
      if (!room) {
        socket.emit("entry_ng", data);
        return;
      }

      
      const entryType = payload.length >= 2 ? payload.readUInt8(1) : 8;
      const isReady = entryType === 8;

      if (isReady) {
        room.readyPlayers.add(socket.id);
      } else {
        room.readyPlayers.delete(socket.id);
      }

      const readyCount = room.readyPlayers.size;
      const totalCount = room.members.size;
      logDebug(`[Entry] room=${header.roomNumber}: player ${socket.id} ${isReady ? 'ready' : 'cancel'}, ready=${readyCount}/${totalCount}`);

     
      const playerSlot = room.memberPlayerIds.get(socket.id) ?? 0;
      const broadcastData = Buffer.from(data);
      broadcastData.writeUInt8(playerSlot, 4);
      socket.emit("entry_ok", data);
      socket.to(String(header.roomNumber)).emit("entry", broadcastData);

     
      if (isReady && readyCount === totalCount && totalCount > 0) {
        console.log(`[Entry] All ${totalCount} players ready in room ${header.roomNumber}`);
      }

      logDebug(`Entry operation in room ${header.roomNumber} by ${socket.id}, isReady=${isReady}`);
    } catch (e) {
      console.error("entry failed", e);
      socket.emit("entry_ng", data);
    }
  });

  
  socket.on("match", (data: Buffer) => {
    try {
      const { header } = parseHeader(data);
      if (!isRoomMember(socket, header.roomNumber)) {
        socket.emit("match_ng", data);
        return;
      }
      
      
      const room = rooms.get(header.roomNumber);
      const actualPlayerId = room?.memberPlayerIds.get(socket.id) ?? header.playerId;

      
      const entryBitmask = Buffer.alloc(2);
      let bitmask = 0;
      if (room) {
        for (const [, playerId] of room.memberPlayerIds) {
          if (playerId < 16) bitmask |= (1 << playerId);
        }
      }
      entryBitmask.writeUInt16LE(bitmask, 0);

      const matchOkHeader = createHeader({
        roomNumber: header.roomNumber,
        playerId: actualPlayerId,
        seq: header.seq,
        unk2: header.unk2,
        emitTypeHex: header.emitTypeHex,
        flag1: header.flag1,
        pktlen: 2,  
        flag2: header.flag2,
      });
      const matchOkData = Buffer.concat([matchOkHeader, entryBitmask]);

     
      io.to(String(header.roomNumber)).emit("match_ok", matchOkData);
      logDebug(`[Match] Broadcasted match_ok with bitmask=0x${bitmask.toString(16)} room=${header.roomNumber} playerId=${actualPlayerId}`);
    } catch (e) {
      console.error("match failed", e);
      socket.emit("match_ng", data);
    }
  });


  socket.on("terminate", (data: Buffer) => {
    try {
      const { header } = parseHeader(data);
      if (!isRoomMember(socket, header.roomNumber)) {
        socket.emit("terminate_ng", data);
        return;
      }

      if (!isHost(socket, header.roomNumber)) {
        logDebug(`[Terminate] Rejected: socket ${socket.id} is not host of room ${header.roomNumber}`);
        socket.emit("terminate_ng", data);
        return;
      }

      
      const room = rooms.get(header.roomNumber);
      if (!room) {
        socket.emit("terminate_ng", data);
        return;
      }

      
      if (!room.readyPlayers.has(socket.id)) {
        logDebug(`[Terminate] Rejected: host is not ready room=${header.roomNumber}`);
        socket.emit("terminate_ng", data);
        return;
      }
      logDebug(`[Terminate] Host ready, members=${room.members.size} room=${header.roomNumber}`);

     
      io.to(String(header.roomNumber)).emit("terminate_ok", data);
      console.log(`[Terminate] Game start room=${header.roomNumber} players=${room.members.size}`);
    } catch (e) {
      console.error("terminate failed", e);
      socket.emit("terminate_ng", data);
    }
  });

  socket.on("data", (data: Buffer) => {
    let bufferOffset = 0;
    while (bufferOffset + 16 <= data.length) {
    const packetStart = bufferOffset;
    const { header, payload } = parseHeader(data.subarray(packetStart));
    bufferOffset += 16 + header.pktlen;
    const userId = getUserId(socket);

    logDebug(`[Data] user=${userId} socket=${socket.id} flag1=0x${header.flag1.toString(16)} room=${header.roomNumber} pktlen=${header.pktlen} hex=${data.subarray(packetStart, bufferOffset).toString('hex')}`);

    switch (header.flag1) {
      case 0x03:
        
        logDebug(`[Data] flag1=0x03: heartbeat from playerId=${header.playerId}, room=${header.roomNumber}`);
        socket.to(String(header.roomNumber)).emit("data", data.subarray(packetStart, bufferOffset));

        break;
      
      case 0x06: {

        if (payload.length < 4) {
          logDebug(`[Data] flag1=0x06 rejected: payload too short (${payload.length})`);
          break;
        }
        const originalPayloadType = payload.readUInt8(2);
        const actionType = payload.readUInt8(3);
        logDebug(`[Data] flag1=0x06: type=${originalPayloadType} subType=${actionType} socket=${socket.id} room=${header.roomNumber}`);

        
        const roomForAction = rooms.get(header.roomNumber);

        if (!roomForAction || !roomForAction.members.has(socket.id)) {
          logDebug(`[Data] flag1=0x06 rejected: room/member not found`);
          break;
        }

        const actualPlayerIdAction = roomForAction.memberPlayerIds.get(socket.id);
        if (actualPlayerIdAction === undefined) {
          logDebug(`[Data] flag1=0x06 rejected: socket ${socket.id} has no playerId mapping`);
          break;
        }

        const maxMembers = roomForAction.maxMembers ?? 4;
        if (actualPlayerIdAction < 0 || actualPlayerIdAction >= maxMembers) {
          logDebug(`[Data] flag1=0x06 rejected: slot=${actualPlayerIdAction} out of range`);
          break;
        }

        
        let fixedPayload: Buffer;

        if (originalPayloadType >= 17) {
          fixedPayload = Buffer.from(payload);
          const typeName = originalPayloadType === 17 ? 'enemyAction' : originalPayloadType === 18 ? 'enemySystem' : `enemy(${originalPayloadType})`;
         
          if (originalPayloadType === 17 && actualPlayerIdAction !== 0) {
            logDebug(`[enemyAction] dropped from slot=${actualPlayerIdAction} (non-host)`);
            break;
          }

          logDebug(`[Data] ${typeName} subType=${actionType} slot=${actualPlayerIdAction} → ${roomForAction.members.size - 1} players`);
        } else {
          
          fixedPayload = Buffer.from(payload);
          const correctedPlayerId = actualPlayerIdAction + 1;  // 1-based UniqueId

          if (correctedPlayerId < 1 || correctedPlayerId > 16) {
            logDebug(`[Data] flag1=0x06 ASSERTION FAILED: correctedPlayerId=${correctedPlayerId} out of range, dropping`);
            break;
          }

          fixedPayload.writeUInt8(correctedPlayerId, 2);
          logDebug(`[Data] playerAction slot=${actualPlayerIdAction} UniqueId=${correctedPlayerId} actionType=${actionType} room=${header.roomNumber}${originalPayloadType !== correctedPlayerId ? ` (fixed payload[2] ${originalPayloadType}→${correctedPlayerId})` : ''}`);
          if ((actionType === 3 || actionType === 5) && fixedPayload.length >= 52) {
            fixedPayload.writeUInt16LE(0, 48);
            fixedPayload.writeUInt16LE(0, 50);
            logDebug(`[Data] area-entry actionType=${actionType}: zeroed payload[48:52] → remote player starts idle`);
          }
        }

        const broadcastHeaderAction = createHeader({
          roomNumber: header.roomNumber,
          playerId: actualPlayerIdAction, 
          seq: header.seq,
          unk2: header.unk2,
          emitTypeHex: header.emitTypeHex,
          flag1: 0x06,
          pktlen: header.pktlen,  
          flag2: header.flag2,
        });

        const broadcastDataAction = Buffer.concat([broadcastHeaderAction, fixedPayload]);
        socket.to(String(header.roomNumber)).emit("data", broadcastDataAction);
        break;
      }

      case 0x07: {
        const infoType = payload.readUInt16BE(0);
        const subType = payload.readUInt8(1);  
        logDebug(`[Data] flag1=0x07: infoType=${infoType} subType=${subType} room=${header.roomNumber}`);

        const room = rooms.get(header.roomNumber);
        if (!room || !room.members.has(socket.id)) {
          logDebug(`[Data] Info exchange rejected: socket not in room`);
          break;
        }

        const actualPlayerId = room.memberPlayerIds.get(socket.id) ?? header.playerId;

        if (subType === 4) {
          room.playerInfoData.set(socket.id, Buffer.from(payload));
          logDebug(`[Data] Saved player info data for playerId=${actualPlayerId}, size=${payload.length}`);
        }

        if (subType === 4 && room.members.size > 1) {
          const existingPlayers = Array.from(room.memberPlayerIds.entries())
            .filter(([sid]) => sid !== socket.id);

          logDebug(`[Data] Step 0: Sending ${existingPlayers.length} existing players info to new player ${actualPlayerId}`);

          for (const [existingSocketId, existingPlayerId] of existingPlayers) {
            const existingPlayerPayload = room.playerInfoData.get(existingSocketId);
            if (!existingPlayerPayload) {
              logDebug(`[Data] Warning: No saved data for player ${existingPlayerId}, skipping`);
              continue;
            }

            const existingPlayerHeader = createHeader({
              roomNumber: header.roomNumber,
              playerId: existingPlayerId,
              seq: header.seq,
              unk2: header.unk2,
              emitTypeHex: header.emitTypeHex,
              flag1: 0x07,
              pktlen: existingPlayerPayload.length,
              flag2: header.flag2,
            });

            socket.emit("data", Buffer.concat([existingPlayerHeader, existingPlayerPayload]));
            logDebug(`[Data] Sent player ${existingPlayerId} info to new player ${actualPlayerId}`);
          }
        }

        const responseHeader = createHeader({
          roomNumber: header.roomNumber,
          playerId: actualPlayerId,
          seq: header.seq + 1,  
          unk2: header.unk2,
          emitTypeHex: 0x0,     
          flag1: 0x07,
          pktlen: payload.length,
          flag2: 0x10,         
        });

        const responsePayload = Buffer.from(payload);
        const responseData = Buffer.concat([responseHeader, responsePayload]);

        logDebug(`[Data] Step 1: Sending confirmation infoType=${infoType} subType=${subType} to playerId=${actualPlayerId} hex=${responsePayload.length <= 64 ? responsePayload.toString('hex') : '...'}`);

        socket.emit("data", responseData);

        if (subType === 4) {
          const phase1EndPayload = Buffer.alloc(2);
          phase1EndPayload.writeUInt16BE(0x0006, 0);  

          const phase1EndHeader = createHeader({
            roomNumber: header.roomNumber,
            playerId: actualPlayerId,
            seq: header.seq + 2,  
            unk2: header.unk2,
            emitTypeHex: 0x00,
            flag1: 0x07,
            pktlen: phase1EndPayload.length,
            flag2: 0x10,
          });

          socket.emit("data", Buffer.concat([phase1EndHeader, phase1EndPayload]));
          logDebug(`[Data] Step 1.5: Sent phase1End (infoType=0x0006) to playerId=${actualPlayerId}`);
        }

        if (room.members.size > 1) {
          const broadcastHeader = createHeader({
            roomNumber: header.roomNumber,
            playerId: actualPlayerId,
            seq: header.seq,
            unk2: header.unk2,
            emitTypeHex: header.emitTypeHex,
            flag1: 0x07,
            pktlen: payload.length,
            flag2: header.flag2,
          });

          const broadcastData = Buffer.concat([broadcastHeader, payload]);

          logDebug(`[Data] Step 2: Broadcasting infoType=${infoType} subType=${subType} to ${room.members.size - 1} others`);
          socket.to(String(header.roomNumber)).emit("data", broadcastData);
        }

        if (subType === 3 && isHost(socket, header.roomNumber)) {
          const terminateOkHeader = createHeader({
            roomNumber: header.roomNumber,
            playerId: 0,
            seq: header.seq,
            unk2: 0,
            emitTypeHex: 0,   
            flag1: 0x03,      
            pktlen: 0,
            flag2: 0,
          });
          socket.to(String(header.roomNumber)).emit("terminate_ok", terminateOkHeader);
          logDebug(`[Data] sendLobbyEnd detected (infoType=3 subType=3): sent terminate_ok to non-host players in room ${header.roomNumber}`);
        }

        break;
      }
      case 0x09: {

        logDebug(`[Data] flag1=0x09: Chat from playerId=${header.playerId}, room=${header.roomNumber}`);

        const currentRoom = rooms.get(header.roomNumber);
        const chatPlayerId = currentRoom?.memberPlayerIds.get(socket.id) ?? header.playerId;
        
        const playerNameEnd = payload.indexOf(0, 0);
        const user = playerNameEnd > 0 ? payload.toString("ascii", 0, playerNameEnd) : "";
        
        const messageStart = 54;
        const messageEnd = payload.indexOf(0, messageStart);
        const message = messageEnd > messageStart 
          ? payload.toString("ascii", messageStart, messageEnd)
          : "";
        
        logDebug(`[Chat] Player "${user}" (playerId=${chatPlayerId}): "${message}"`);
        
        const command = message.split(" ")[0];
        
        if (!message.startsWith("/")) {
          
          const chatHeader = createHeader({
            roomNumber: header.roomNumber,
            playerId: chatPlayerId,  
            seq: header.seq,
            unk2: header.unk2,
            emitTypeHex: header.emitTypeHex,
            flag1: 0x09,
            pktlen: payload.length,
            flag2: header.flag2,
          });
          const chatData = Buffer.concat([chatHeader, payload]);
   
          socket.to(String(header.roomNumber)).emit("data", chatData);
          break;
        }
        
        switch (command) {
          case "/chat": {
            const chatMessage = message.split(" ")[1] || "";
            const chatPacket = createChatPacket(header.roomNumber, chatMessage, chatPlayerId);

            socket.to(String(header.roomNumber)).emit("data", chatPacket);
            break;
          }
          case "/maintenance":
            socket.emit(
              "data",
              createMaintenancePacket({ durationSecondsTill: 4000 })
            );
            break;
          case "/roominfo": {
            const room = rooms.get(header.roomNumber);
            if (room) {
              const roomInfo = {
                roomNumber: room.roomNumber,
                host: room.hostSocketId,
                hostUserId: room.hostUserId,
                locked: room.locked,
                memberCount: room.members.size,
                maxMembers: room.maxMembers || 4,
                questId: room.questId,
                roomName: room.roomName,
                members: Array.from(room.memberUsers.entries()).map(([socketId, userId]) => ({
                  socketId,
                  userId
                }))
              };
              socket.emit("data", createChatPacket(header.roomNumber, `Room Info: ${JSON.stringify(roomInfo, null, 2)}`, chatPlayerId));
            }
            break;
          }
          case "/listrooms": {
            const roomList = Array.from(rooms.values()).map(room => ({
              roomNumber: room.roomNumber,
              memberCount: room.members.size,
              locked: room.locked,
              roomName: room.roomName,
              hostUserId: room.hostUserId
            }));
            socket.emit("data", createChatPacket(header.roomNumber, `Active Rooms: ${JSON.stringify(roomList, null, 2)}`, chatPlayerId));
            break;
          }
          case "/userinfo": {
            const userId = getUserId(socket);
            socket.emit("data", createChatPacket(header.roomNumber, `Your User ID: ${userId || 'Not authenticated'}`, chatPlayerId));
            break;
          }
          default:
            break;
        }
        break;
      }

      case 0x08: {

        const activityType = payload.length > 1 ? payload.readUInt8(1) : 0;
        logDebug(`[Data] flag1=0x08: Activity type=${activityType} playerId=${header.playerId} room=${header.roomNumber}`);
        
        const roomForActivity = rooms.get(header.roomNumber);
        if (roomForActivity && roomForActivity.members.has(socket.id)) {
          const actualPlayerIdActivity = roomForActivity.memberPlayerIds.get(socket.id) ?? header.playerId;
          
          const broadcastHeaderActivity = createHeader({
            roomNumber: header.roomNumber,
            playerId: actualPlayerIdActivity, 
            seq: header.seq,
            unk2: header.unk2,
            emitTypeHex: header.emitTypeHex,
            flag1: 0x08,
            pktlen: payload.length,
            flag2: header.flag2,
          });
          
          const broadcastDataActivity = Buffer.concat([broadcastHeaderActivity, payload]);
          
          socket.to(String(header.roomNumber)).emit("data", broadcastDataActivity);
        }
        break;
      }

      case 0x0A: {

        logDebug(`[Data] flag1=0x0A: Notice from playerId=${header.playerId}, room=${header.roomNumber}`);
        
        const roomForNotice = rooms.get(header.roomNumber);
        if (roomForNotice && roomForNotice.members.has(socket.id)) {
          const actualPlayerIdNotice = roomForNotice.memberPlayerIds.get(socket.id) ?? header.playerId;
          
          const broadcastHeaderNotice = createHeader({
            roomNumber: header.roomNumber,
            playerId: actualPlayerIdNotice,  
            seq: header.seq,
            unk2: header.unk2,
            emitTypeHex: header.emitTypeHex,
            flag1: 0x0A,
            pktlen: payload.length,
            flag2: header.flag2,
          });
          
          const broadcastDataNotice = Buffer.concat([broadcastHeaderNotice, payload]);
          
          socket.to(String(header.roomNumber)).emit("data", broadcastDataNotice);
        }
        break;
      }

      default:
        
        logDebug(`[Data] flag1=0x${header.flag1.toString(16).padStart(2, '0')}: Unknown type, attempting to forward`);
        try {
          const room = rooms.get(header.roomNumber);
          if (room && room.members.has(socket.id)) {
            const forwardPlayerId = room.memberPlayerIds.get(socket.id) ?? header.playerId;
            const forwardHeader = createHeader({
              roomNumber: header.roomNumber,
              playerId: forwardPlayerId,
              seq: header.seq,
              unk2: header.unk2,
              emitTypeHex: header.emitTypeHex,
              flag1: header.flag1,
              pktlen: payload.length,
              flag2: header.flag2,
            });
            const forwardData = Buffer.concat([forwardHeader, payload]);
            logDebug(`[Data] Forwarding flag1=0x${header.flag1.toString(16)} from ${userId} to room ${header.roomNumber}, hex=${forwardData.toString('hex')}`);
            socket.to(String(header.roomNumber)).emit("data", forwardData);
          }
        } catch (e) {
          console.error("[Data] Forward data failed:", e);
        }
        break;
    }
    } // end while (multi-packet loop)
  });
  // Handle "disconnect" event
  socket.on("disconnect", async (reason: string) => {
    // clearInterval(heartbeatInterval);
    const userId = socketToUser.get(socket.id);
    console.log(`[Disconnect] Client disconnected: ${socket.id} (user: ${userId}), Reason: ${reason}`);
    
    cleanupUserMapping(socket);
    
    // Clean up from all rooms
    const affectedRooms: number[] = [];
    for (const [roomNumber, room] of rooms) {
      if (room.members.has(socket.id)) {
        const wasHost = room.hostSocketId === socket.id;
        const roomUserId = room.memberUsers.get(socket.id);
        const leavingPlayerId = room.memberPlayerIds.get(socket.id) ?? 0;
        
        const remainingMembersBeforeRemoval = room.members.size - 1;
        
        console.log(`[Disconnect] user=${roomUserId} playerId=${leavingPlayerId} ${wasHost ? 'HOST' : 'MEMBER'} left room=${roomNumber} remaining=${remainingMembersBeforeRemoval}`);
        
        if (roomUserId) {
          try {
            const dbRoom = await Room.findOne({ room_id: roomNumber });
            
            if (dbRoom) {
              try {
                dbRoom.removeMember(roomUserId);
                
                if (dbRoom.phase === -1) {
                  await Room.deleteOne({ room_id: roomNumber });
                  logDebug(`[Disconnect] Deleted room ${roomNumber} from DB (${wasHost ? 'host' : 'empty'})`);
                } else {
                  await dbRoom.save();
                  logDebug(`[Disconnect] Updated DB room ${roomNumber}, member_count=${dbRoom.member_count}`);
                }
              } catch (dbError) {
                console.error(`[Disconnect] Error updating room in database:`, dbError);
              }
            }
          } catch (error) {
            console.error(`[Disconnect] Error accessing database:`, error);
          }
        }
        
        removeMemberFromRoom(roomNumber, socket);
        affectedRooms.push(roomNumber);
        
        // Notify remaining members about the disconnect
        const updatedRoom = rooms.get(roomNumber);
        if (updatedRoom && updatedRoom.members.size > 0) {
          const leavePayload = Buffer.from([leavingPlayerId]);
          const leaveHeader = createHeader({
            roomNumber: roomNumber,
            playerId: leavingPlayerId,  
            seq: 1,
            unk2: 0,
            emitTypeHex: 0,
            flag1: 0x03,
            pktlen: leavePayload.length,
            flag2: 0x10,
          });
          
          const leaveData = Buffer.concat([leaveHeader, leavePayload]);
          logDebug(`[Disconnect] Broadcasting leave playerId=${leavingPlayerId} to ${updatedRoom.members.size} members hex=${leaveData.toString('hex')}`);

          socket.to(String(roomNumber)).emit("leave", leaveData);
        }
      }
    }
    
    if (affectedRooms.length > 0) {
      logDebug(`[Disconnect] Cleanup completed for rooms: ${affectedRooms.join(', ')}`);
    }
    
    if (userId) {
      try {
        
        const emptyRooms = await Room.find({
          host_id: userId,
          member_count: { $lte: 1 }, 
          phase: { $in: [0, 1] } 
        });
        
        if (emptyRooms.length > 0) {
          const deleteResult = await Room.deleteMany({
            host_id: userId,
            member_count: { $lte: 1 },
            phase: { $in: [0, 1] }
          });
          
          if (deleteResult.deletedCount > 0) {
            logDebug(`[Disconnect] Cleaned up ${deleteResult.deletedCount} empty rooms for user ${userId}`);
          }
        }
      } catch (error) {
        console.error("Error cleaning up rooms on disconnect:", error);
      }
    }
  });

  // Handle "error" event (optional, handled by default)
  socket.on("error", (error: Error) => {
    console.error(`Error for client ${socket.id}:`, error.message);
  });
}
