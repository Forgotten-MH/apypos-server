export function createHeader({
  roomNumber,
  playerId,
  seq,
  unk2,
  emitTypeHex,
  flag1,
  flag2,
  pktlen,
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
  const header = Buffer.alloc(16);
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

    // as of today not been able to trigger these. 
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,1,param_1,onReceiveParam,0); //Player actions? sAppProcedure::applyRecvData
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,3,param_1,onReceiveActivity,0); sAppProcedure::applyRecvActivity
   */
  offset += 1;
  header.writeUInt16LE(pktlen, offset);
  offset += 2;
  header.writeUInt32LE(flag2, offset);
  offset += 4;
  return header;
}

function createMaintenance({ durationSecondsTill }) {
  const pktId = 0x0a;
  const data = Buffer.alloc(4);
    console.log("Maintenance Message Sent: ",durationSecondsTill)

  data.writeUInt32LE(durationSecondsTill, 0);
  return { data, pktId };
}

export function createMaintenancePacket({ durationSecondsTill }) {
  //10 onRecieveNotice
  const { data, pktId } = createMaintenance({ durationSecondsTill });
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: 0xff,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length, // auto-calculated
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

///////////////

function createChat(message) {
  const data = Buffer.alloc(100);
  let messageStartIndex = 0x36;
  let name = "Command User";
  console.log("Message From: ",name,"-",message)
  data.write(name, 0x00, "ascii");
  data[0x00 + name.length] = 0x00; // null terminator
  data.write(message, messageStartIndex, "ascii");
  data[messageStartIndex + message.length + 1] = 0x00; // null terminator

  return { data };
}

export function createChatPacket(roomNo,messsage) {
  //9 onRecieveChat
  const playerId = Math.floor(Math.random() * 10);

  const { data } = createChat(messsage);
  const header = createHeader({
    roomNumber: roomNo,
    playerId: playerId,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: 0x09,
    pktlen: data.length, // auto-calculated
    flag2: 0x10,
  });
  return Buffer.concat([header,  data]);
}

///////////////

function createInfo(msgType) {
  const pktId = 0x07;

  // Allocate a buffer: 54 bytes padding + "hello\0" = 60 bytes total
  const data = Buffer.alloc(100); // Total size: 15 bytes

  data.writeUInt8(0x00, 0); // Header (unused)
  data.writeUInt8(msgType, 1); // msgType = 5
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
      data.write("Room42\0", 8, "ascii"); // Null-terminated ASCII string
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
  const msgType = allowed[Math.floor(Math.random() * allowed.length)];
  const playerId = Math.floor(Math.random() * 4);
  console.log("msg", msgType, "pId", playerId);
  const { data, pktId } = createInfo(msgType); // 0 to 9 (0x0 to 0x09)
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length, // auto-calculated
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

function createActivity() {
  const pktId = 0x06;
  const data = Buffer.from([
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
    0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
    0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x2a,
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
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length, // auto-calculated
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

function creatSession() {
  const pktId = 0x03;
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
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0, //0 data 4 join 7 entry 10 cancel 0xd/13 match 14 terminate 15 lock 18 unlock 21 leave 22 hostchange //TODO.. AUTOMATICALLY APPLY EMIT TYPE BASED ON THIS.
    flag1: pktId,
    pktlen: data.length, // auto-calculated
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

function createRandomBuffer(minLength = 50, maxLength = 300) {
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const buffer = Buffer.alloc(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = Math.floor(Math.random() * 256); // byte value from 0 to 255
  }

  return buffer;
}

export function parseHeader(buffer) {
  if (buffer.length < 16) {
    throw new Error("Buffer too short to contain valid header");
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

  // Payload is everything after the header bytes
  const payload = buffer.slice(offset);
  console.log({
      roomNumber,
      playerId,
      seq,
      unk2,
      emitTypeHex,
      flag1,
      pktlen,
      flag2,
    })
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