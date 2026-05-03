// emitType byte values in 16-byte binary packet header
export const EMIT_TYPE = {
  DATA: 0x00,
  JOIN: 0x04,
  ENTRY: 0x07,
  CANCEL: 0x0a,
  MATCH: 0x0d,
  TERMINATE: 0x0e,
  LOCK: 0x0f,
  UNLOCK: 0x12,
  LEAVE: 0x15,
  HOST_CHANGE: 0x16,
} as const;

// flag1 / packet listener IDs
// setSystemCallback(3) -> pkt id 3
// setDataListener(N) -> pkt id N+5 (e.g. 2 -> 7, 4 -> 9, 5 -> 10)
export const FLAG1 = {
  SESSION: 0x03, // setSystemCallback(3) -> onSessionEvent
  ACTIVITY: 0x08, // setDataListener(3) -> onReceiveActivity (3+5=8) — IDA verified: sAppProcedure::startup MOV W1,#3
  INFO: 0x07, // setDataListener(2) -> onReceiveInfo (2+5=7)
  CHAT: 0x09, // setDataListener(4) -> onReceiveChat (4+5=9)
  NOTICE: 0x0a, // setDataListener(5) -> onReceiveNotice (5+5=10)
} as const;

export const HEADER_SIZE = 16;
export const DEFAULT_SEQ = 0x0004;
export const DEFAULT_FLAG2 = 0x10;
export const SERVER_PLAYER_ID = 0xff;
