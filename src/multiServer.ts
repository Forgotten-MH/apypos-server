import { Socket } from 'socket.io';
import { createMaintenancePacket, createChatPacket, parseHeader, createHeader } from './multiUtils.js';
import { createLogger } from './middleware/logger.js';
import { FLAG1, DEFAULT_SEQ, DEFAULT_FLAG2 } from './constants/multiplayer.js';
const log = createLogger('multiServer');

//Client Sends: host_change_request, lock, unlock, kick, entry, cancel, data
//Server Sends: data, notice, entry, entry_ok, entry_ng, cancel, cancel_ok, cancel_ng,
//  match, match_ok, terminate, terminate_ok, lock, lock_ok, lock_ng, unlock, unlock_ok, host_change

export function onConnect(socket: Socket) {
  log.info('Client connected:', socket.id);

  socket.setMaxListeners(50); // or however many you need

  socket.on('heartbeat', (_date) => {
    setTimeout(() => {
      log.info('sending heartbeat emit');
      socket.emit('heartbeat', Date.now());
    });
  });
  socket.on('create', (data) => {
    const { header, payload } = parseHeader(data);
    // Extract ASCII string (24 bytes)
    const user_id = payload.subarray(0, 24).toString('ascii');
    log.info('user_id:', user_id);

    // Extract uint32 at offset 24 (4 bytes)
    const unkUint32Val = payload.readUInt32LE(24);
    log.info('Uint32 value before change:', unkUint32Val);

    // Change the uint32 value at offset 24 to 0
    payload.writeUInt32LE(0, 24);

    // Verify the change
    const uint32ValAfter = payload.readUInt32LE(24);
    log.info('Uint32 value after change:', uint32ValAfter);

    log.info(`sending create Buffer at ${new Date().toISOString()}:\n` + data.toString('hex'));
    //Guessing...
    socket.emit('create_ok', Buffer.concat([createHeader(header), payload]));

    //socket.emit("create_ng", data);
  });
  socket.on('join', (data) => {
    const { header: _header, payload: _payload } = parseHeader(data);
    // socket.emit(
    //   "join_ok",
    //   Buffer.concat([
    //     createHeader({
    //       roomNumber: header.roomNumber,
    //       playerId: 0xff,
    //       seq: header.seq + 1,
    //       unk2: header.unk2,
    //       emitTypeHex: header.emitTypeHex,
    //       flag1: 0x03,
    //       pktlen: dataSent.length,
    //       flag2: 0x10,
    //     }),
    //     dataSent,
    //   ])
    // );
    //socket.emit("join_ng", data);
    socket.emit('join', data);
  });

  socket.on('leave', (data) => {
    log.info(`sending leave_ok Buffer at ${new Date().toISOString()}:\n` + data.toString('hex'));
    socket.emit('leave_ok', data);
    //socket.emit("create_ng", data);
  });
  socket.on('data', (data) => {
    const { header, payload } = parseHeader(data);

    switch (header.flag1) {
      case FLAG1.SESSION:
        //Ignore
        break;
      case FLAG1.INFO:
        log.info('onReceiveInfo recieved room:', header.roomNumber, 'playerId', header.playerId);
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
                  0x07, //02 /api/multi/member/info if lobby created
                  0x53,
                  0x50,
                  0x36,
                  0x51,
                  0x39,
                  0x48,
                  0x46,
                  0x4a,
                  0x47,
                  0x47,
                  0x48,
                  0x37,
                  0x36,
                  0x48,
                  0x53,
                  0x53,
                  0x53,
                  0x53,
                  0x46,
                  0x4a,
                  0x4e,
                  0x47,
                  0x01,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
                  0x00,
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
      default:
        break;
    }
  });
  // Handle "disconnect" event
  socket.on('disconnect', (reason) => {
    // clearInterval(heartbeatInterval);
    log.info(`Client disconnected: ${socket.id}, Reason: ${reason}`);
  });

  // Handle "error" event (optional, handled by default)
  socket.on('error', (error) => {
    log.error(`Error for client ${socket.id}:`, error.message);
  });
}
