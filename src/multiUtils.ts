import { createLogger } from './middleware/logger.js';
import { FLAG1, HEADER_SIZE, DEFAULT_SEQ, DEFAULT_FLAG2, SERVER_PLAYER_ID } from './constants/multiplayer.js';
const log = createLogger('multiUtils');

export function createHeader({
  roomNumber,
  playerId,
  seq,
  unk2,
  emitTypeHex,
  flag1,
  flag2,
  pktlen,
}: {
  roomNumber: number;
  playerId: number;
  seq: number;
  unk2: number;
  emitTypeHex: number;
  flag1: number;
  flag2: number;
  pktlen: number;
}) {
  /*
uint32 roomid;
ubyte unk1;
uint16 sequence;
ubyte unk2;
ubyte emitType;
ubyte flag1;
uint16 pktlength;
uint32 flag2;
ubyte array[pktlength];
 */
  const header = Buffer.alloc(HEADER_SIZE);
  let offset = 0;
  header.writeUInt32LE(roomNumber, offset);
  offset += 4;
  header.writeUInt8(playerId, offset); //Unk but seems to be related to session size so 4 for 4 player and 16 for 16 player ff being like server maybe???
  offset += 1;
  header.writeUInt16LE(seq, offset); // this is the packet ordering... it increments every packet sent or recieved.
  offset += 2;
  header.writeUInt8(unk2, offset); // very much unk
  offset += 1;
  header.writeUInt8(emitTypeHex, offset); //This is the emit type.. If you do .emit(data,pkt)  this byte no matter what will be replaced by the byte version of what is set in the .emit
  offset += 1;
  header.writeUInt8(flag1, offset); // This seems to be a listener pkt id... there is a descrepency. Sometimes you need +5 added to the value you see in the setDataListener (Examples)
  /**
   * sMHiSession::setSystemCallback(sMHiSession::mpInstance,3,puVar2,onSessionEvent,0);                            pkt id for this is 3 
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,2,param_1,onReceiveInfo,0);                 pkt id for this is 2 but its actually 7 so 2+5
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,4,param_1,onReceiveChat,0);                 pkt id for this is 4 but its actually 9 so 4+5
    uVar2 = sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,5,param_1,onReceiveNotice,0);       pkt id for this is 5 but its actually 10 so 5+5

    // IDA verified (sAppProcedure::startup @ 0x1793cb4, setDataListener @ 0x17afcd8):
    //   setDataListener(a2) → setReceiveCallback(a2 + 5)  ← +5 rule confirmed in IDA
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,1,param_1,onReceiveParam,0);     // flag1 = 1+5 = 6
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,3,param_1,onReceiveActivity,0);  // flag1 = 3+5 = 8
   */
  offset += 1;
  header.writeUInt16LE(pktlen, offset);
  offset += 2;
  header.writeUInt32LE(flag2, offset);
  return header;
}

function createMaintenance({ durationSecondsTill }: { durationSecondsTill: number }) {
  // pktId=0x0a: setDataListener(5, onReceiveNotice) → 5+5=10=0x0a
  // IDA onReceiveNotice @ 0x179c468: reads *a3 as uint32 LE (seconds), requires a4>=4
  const pktId = FLAG1.NOTICE;
  const data = Buffer.alloc(4);
  log.debug('Maintenance Message Sent: ', durationSecondsTill);

  data.writeUInt32LE(durationSecondsTill, 0);
  return { data, pktId };
}

export function createMaintenancePacket({ durationSecondsTill }: { durationSecondsTill: number }) {
  //10 onRecieveNotice
  const { data, pktId } = createMaintenance({ durationSecondsTill });
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: SERVER_PLAYER_ID,
    seq: DEFAULT_SEQ,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length,
    flag2: DEFAULT_FLAG2,
  });
  return Buffer.concat([header, data]);
}

///////////////

function createChat(message: string) {
  // IDA onReceiveChat @ 0x179c188:
  //   name  = payload[0..15]  (sa = *(_OWORD *)s, read as 16-byte block)
  //   message = payload[54]   (v6 = s + 54 = 0x36, confirmed by disasm)
  const data = Buffer.alloc(100);
  const messageStartIndex = 0x36; // IDA verified: v6 = s + 54 (0x36)
  const name = 'Command User';
  log.debug('Message From: ', name, '-', message);
  data.write(name, 0x00, 'ascii');
  data[0x00 + name.length] = 0x00; // null terminator
  data.write(message, messageStartIndex, 'ascii');
  data[messageStartIndex + message.length + 1] = 0x00; // null terminator

  return { data };
}

export function createChatPacket(roomNo: number, messsage: string) {
  //9 onRecieveChat
  const playerId = Math.floor(Math.random() * 10);

  const { data } = createChat(messsage);
  const header = createHeader({
    roomNumber: roomNo,
    playerId: playerId,
    seq: DEFAULT_SEQ,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: FLAG1.CHAT,
    pktlen: data.length,
    flag2: DEFAULT_FLAG2,
  });
  return Buffer.concat([header, data]);
}

///////////////

function createInfo(msgType: number) {
  // pktId=0x07: setDataListener(2, onReceiveInfo) → 2+5=7=0x07
  // IDA onReceiveInfo @ 0x179bd18: switch on *((_BYTE*)a3 + 1) → msgType at payload[1]
  const pktId = FLAG1.INFO;

  const data = Buffer.alloc(100);

  data.writeUInt8(0x00, 0); // payload[0]: unused header byte
  data.writeUInt8(msgType, 1); // payload[1]: msgType — IDA verified: switch(*((_BYTE*)a3+1))
  switch (msgType) {
    case 0x00: // moveRoom16Start()
      // No extra data
      break;

    case 0x01: // moveRoom16Finish(roomId, someInt)
      data.writeUInt16LE(1234, 2); // roomId
      data.writeInt32LE(1, 4); // some int
      break;

    case 0x02: // callBackGroundAPI if field == 0xe, else set flag
      // No extra data needed
      break;

    case 0x03: // setLobbyEndFlg + setMultiPowerUpFlg
      data.writeInt16LE(1, 2); // true as short
      break;

    case 0x04: // setPowerUpEnable
      data.writeUInt16LE(0x000a, 2); // example enable flag
      break;

    case 0x05: // setSelectedRoomNoFromID + string
      data.writeUInt32LE(1234, 4); // Room ID at offset 4
      data.write('Room42\0', 8, 'ascii'); // Null-terminated ASCII string
      break;

    case 0x06: // setPhase1EndFlg
      // No extra data
      break;

    case 0x07: // callBackGroundAPI if field == 0xe this might be /api/multi/room/get
      // No extra data
      break;

    case 0x08: // setSelectFixedEquipSetID
      data.writeUInt16LE(5, 2); // EquipSetId
      break;

    case 0x09: // set float if > 30.0
      data.writeUInt16LE(3, 2); // Will set to 4.0 (3 + 1)
      break;
    default:
      throw new Error(`Unhandled msgType: ${msgType}`);
  }

  return { data, pktId };
}
export function createInfoPacket() {
  //7 onRecieveInfo
  //--------------------
  //0 moveRoom16Start
  //1 moveRoom16Finish
  //2 calls api?
  //3 setLobbyEndFlg
  //4 setPowerUpEnable
  //5 setSelectedRoomNoFromId
  //6 setPhase1EndFlg
  //7 ???
  //8 setSelectedFixedEquipID
  //9 ?? some float?
  const allowed = [0, 2, 3, 4, 5, 6, 7, 8, 9];
  const msgType = allowed[Math.floor(Math.random() * allowed.length)]!;
  const playerId = Math.floor(Math.random() * 4);
  log.debug('msg', msgType, 'pId', playerId);
  const { data, pktId } = createInfo(msgType); // 0 to 9 (0x0 to 0x09)
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: DEFAULT_SEQ,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length,
    flag2: DEFAULT_FLAG2,
  });
  return Buffer.concat([header, data]);
}

function createActivity() {
  // pktId=0x08: setDataListener(3, onReceiveActivity) → 3+5=8=0x08
  // IDA sAppProcedure::startup @ 0x1793d20: MOV W1,#3 → BL setDataListener → onReceiveActivity
  // ⚠️ 原代码错误使用 0x06，0x06 实际触发 onReceiveParam（listener 1），已修复
  const pktId = FLAG1.ACTIVITY;
  const data = Buffer.from([
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20,
    0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a,
  ]);
  return { data, pktId };
}

export function createActivityPacket() {
  //8 onRecieveActivity
  const playerId = Math.floor(Math.random() * 4);

  const { data, pktId } = createActivity();
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: DEFAULT_SEQ,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length,
    flag2: DEFAULT_FLAG2,
  });
  return Buffer.concat([header, data]);
}

function creatSession() {
  const pktId = FLAG1.SESSION;
  const data = Buffer.from([0x01, 0x02]);
  //the
  return { data, pktId };
}

export function createSessionPacket() {
  //0x03 onRecieveActivity
  const playerId = Math.floor(Math.random() * 4);

  const { data, pktId } = creatSession();
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: DEFAULT_SEQ,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length,
    flag2: DEFAULT_FLAG2,
  });
  return Buffer.concat([header, data]);
}

export function parseHeader(buffer: Buffer) {
  if (buffer.length < HEADER_SIZE) {
    throw new Error('Buffer too short to contain valid header');
  }

  let offset = 0;
  const roomNumber = buffer.readUInt32LE(offset);
  offset += 4;

  const playerId = buffer.readUInt8(offset);
  offset += 1;

  const seq = buffer.readUInt16LE(offset);
  offset += 2;

  const unk2 = buffer.readUInt8(offset);
  offset += 1;

  const emitTypeHex = buffer.readUInt8(offset);
  offset += 1;

  const flag1 = buffer.readUInt8(offset);
  offset += 1;

  const pktlen = buffer.readUInt16LE(offset);
  offset += 2;

  const flag2 = buffer.readUInt32LE(offset);
  offset += 4;

  // Payload: only read pktlen bytes (not the entire remaining buffer!)
  // This is crucial when multiple packets are sent in one buffer
  const payload = buffer.subarray(offset, offset + pktlen);
  return {
    header: {
      roomNumber,
      playerId,
      seq,
      unk2,
      emitTypeHex,
      flag1,
      pktlen,
      flag2,
    },
    payload,
  };
}
