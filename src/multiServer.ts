import {
  createMaintenancePacket,
  createChatPacket,
  createInfoPacket,
  createActivityPacket,
  parseHeader,
  createHeader,
} from "./multiUtils";

//Client Sends...
const recv = [
  "host_change_request",
  //"leave",
  //"create",
  //  "join",
  "lock",
  "unlock",
  "kick",
  "entry",
  "cancel",
  "data",
];
//Server Sends...
const events = [
  //   "entry",
  "data",
  "notice",
  //   "create_ok",
  //   "create_ng",
  //   "join",
  //   "join_ok",
  //   "join_ng",
  "entry",
  "entry_ok",
  "entry_ng",
  "cancel",
  "cancel_ok",
  "cancel_ng",
  "match",
  "match_ok",
  "terminate",
  "terminate_ok",
  "lock",
  "lock_ok",
  "lock_ng",
  "unlock",
  "unlock_ok",
  //   "leave",
  //   "leave_ok",
  "host_change",
];

export function onConnect(socket) {
  console.log("Client connected:", socket.id);

  socket.setMaxListeners(50); // or however many you need

  socket.on("heartbeat", (date) => {
    setTimeout(() => {
      console.log("sending heartbeat emit");
      socket.emit("heartbeat", Date.now());
    });
  });
  socket.on("create", (data) => {
    const { header, payload } = parseHeader(data);
    // Extract ASCII string (24 bytes)
    const user_id = payload.slice(0, 24).toString("ascii");
    console.log("user_id:", user_id);

    // Extract uint32 at offset 24 (4 bytes)
    const unkUint32Val = payload.readUInt32LE(24);
    console.log("Uint32 value before change:", unkUint32Val);

    // Change the uint32 value at offset 24 to 0
    payload.writeUInt32LE(0, 24);

    // Verify the change
    const uint32ValAfter = payload.readUInt32LE(24);
    console.log("Uint32 value after change:", uint32ValAfter);

    console.log(
      `sending create Buffer at ${new Date().toISOString()}:\n` +
        data.toString("hex")
    );
    //Guessing...
    socket.emit("create_ok", Buffer.concat([createHeader(header), payload]));

    //socket.emit("create_ng", data);
  });
  socket.on("join", (data) => {
    const { header, payload } = parseHeader(data);

   
    const dataSent = Buffer.from([0x00]);
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
        socket.emit("join", data);

  });

  socket.on("leave", (data) => {
    console.log(
      `sending leave_ok Buffer at ${new Date().toISOString()}:\n` +
        data.toString("hex")
    );
    socket.emit("leave_ok", data);
    //socket.emit("create_ng", data);
  });
  socket.on("data", (data) => {
    const { header, payload } = parseHeader(data);

    switch (header.flag1) {
      case 0x03:
        //Ignore
        break;
      case 0x07:
        console.log(
          "onReceiveInfo recieved room:",
          header.roomNumber,
          "playerId",
          header.playerId
        );
        console.log("type:", payload.readUInt16BE(0));
        switch (payload.readUInt16BE(0)) {
          case 2:
            socket.emit(
              "data",
              Buffer.concat([
                createHeader({
                  roomNumber: 0x17d78400,
                  playerId: 0x0,
                  seq: 0x0004,
                  unk2: 0x0,
                  emitTypeHex: 0x0, //0 data 4 join 7 entry 10 cancel 0xd/13 match 14 terminate 15 lock 18 unlock 21 leave 22 hostchange //TODO.. AUTOMATICALLY APPLY EMIT TYPE BASED ON THIS.
                  flag1: 0x07,
                  pktlen: 64, // auto-calculated
                  flag2: 0x10,
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
              ])
            );
            break;

          default:
            break;
        }
        break;
      case 0x09:
        console.log(
          "client sent chat",
          header.roomNumber,
          "playerId",
          header.playerId
        );
        const user = payload.toString("ascii", 0, payload.indexOf(0, 0));
        const message = payload.toString(
          "ascii",
          payload.indexOf(0x2f),
          payload.indexOf(0, payload.indexOf(0x2f))
        );
        const command = message.split(" ")[0];
        switch (command) {
          case "/chat":
            socket.emit(
              "data",
              createChatPacket(header.roomNumber, message.split(" ")[1])
            );
            break;
          case "/maintenance":
            socket.emit(
              "data",
              createMaintenancePacket({ durationSecondsTill: 4000 })
            );
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  });
  // Handle "disconnect" event
  socket.on("disconnect", (reason) => {
    // clearInterval(heartbeatInterval);
    console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
  });

  // Handle "error" event (optional, handled by default)
  socket.on("error", (error) => {
    console.error(`Error for client ${socket.id}:`, error.message);
  });
}
