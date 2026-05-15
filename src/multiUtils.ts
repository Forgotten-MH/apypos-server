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
 
  const header = Buffer.alloc(16);
  let offset = 0;
  header.writeUInt32LE(roomNumber, offset); 
  offset += 4;
  header.writeUInt8(playerId, offset); 
  offset += 1;
  header.writeUInt16LE(seq, offset);
  offset += 2;
  header.writeUInt8(unk2, offset);
  offset += 1;
  header.writeUInt8(emitTypeHex, offset); 
  offset += 1;
  header.writeUInt8(flag1, offset);
  offset += 1;
  header.writeUInt16LE(pktlen, offset);
  offset += 2;
  header.writeUInt32LE(flag2, offset);
  offset += 4;
  return header;
}

function createMaintenance({ durationSecondsTill }: { durationSecondsTill: number }) {
  const pktId = 0x0a;
  const data = Buffer.alloc(4);
    console.log("Maintenance Message Sent: ",durationSecondsTill)

  data.writeUInt32LE(durationSecondsTill, 0);
  return { data, pktId };
}

export function createMaintenancePacket({ durationSecondsTill }: { durationSecondsTill: number }) {
  
  const { data, pktId } = createMaintenance({ durationSecondsTill });
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: 0xff,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length, 
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}


function createChat(message: string) {
  const data = Buffer.alloc(100);
  let messageStartIndex = 0x36; 
  let name = "Command User";
  console.log("Message From: ",name,"-",message)
  data.write(name, 0x00, "ascii");
  data[0x00 + name.length] = 0x00; 
  data.write(message, messageStartIndex, "ascii");
  data[messageStartIndex + message.length + 1] = 0x00; 

  return { data };
}

export function createChatPacket(roomNo: number, messsage: string, playerId = 0) {
  const { data } = createChat(messsage);
  const header = createHeader({
    roomNumber: roomNo,
    playerId: playerId,  
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: 0x09,
    pktlen: data.length, 
    flag2: 0x10,
  });
  return Buffer.concat([header,  data]);
}



function createInfo(msgType: number) {
  
  const pktId = 0x07;

  const data = Buffer.alloc(100);

  data.writeUInt8(0x00, 0); 
  data.writeUInt8(msgType, 1); 
  switch (msgType) {
    case 0x00: 
      break;

    case 0x01: 
      data.writeUInt16LE(1234, 2); 
      data.writeInt32LE(1, 4); 
      break;

    case 0x02: 
      break;

    case 0x03: 
      data.writeInt16LE(1, 2); 
      break;

    case 0x04: 
      data.writeUInt16LE(0x000a, 2); 
      break;

    case 0x05: 
      data.writeUInt32LE(1234, 4); 
      data.write("Room42\0", 8, "ascii"); 
      break;

    case 0x06: 
      break;

    case 0x07: 
      break;

    case 0x08: 
      data.writeUInt16LE(5, 2); 
      break;

    case 0x09: 
      data.writeUInt16LE(3, 2); 
      break;
    default:
      throw new Error(`Unhandled msgType: ${msgType}`);
  }

  return { data, pktId };
}
export function createInfoPacket() {
  const allowed = [0, 2, 3, 4, 5, 6, 7, 8, 9];
  const msgType = allowed[Math.floor(Math.random() * allowed.length)]!;
  const playerId = Math.floor(Math.random() * 4);
  console.log("msg", msgType, "pId", playerId);
  const { data, pktId } = createInfo(msgType); 
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length, 
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

function createActivity() {
  const pktId = 0x08;
  const data = Buffer.from([
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
    0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
    0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x2a,
  ]);
  return { data, pktId };
}

export function createActivityPacket() {
 
  const playerId = Math.floor(Math.random() * 4);

  const { data, pktId } = createActivity();
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length, 
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

function creatSession() {
  const pktId = 0x03;
  const data = Buffer.from([0x01, 0x02]);
  
  return { data, pktId };
}

export function createSessionPacket() {

  const playerId = Math.floor(Math.random() * 4);

  const { data, pktId } = creatSession();
  const header = createHeader({
    roomNumber: 0x00000000,
    playerId: playerId,
    seq: 0x0004,
    unk2: 0x0,
    emitTypeHex: 0x0,
    flag1: pktId,
    pktlen: data.length,
    flag2: 0x10,
  });
  return Buffer.concat([header, data]);
}

export function parseHeader(buffer: Buffer) {
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

  
  const payload = buffer.slice(offset, offset + pktlen);

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