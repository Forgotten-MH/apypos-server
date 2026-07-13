import { Router } from "express";
import { validate } from "../../../middleware/validation.js";
import { SessionOnlySchema } from "../../../schemas/common.schema.js";
import { roomCreate, roomJoin, roomLeave, roomSearch, roomGet, roomQuick, roomLock, roomKick, roomReady, roomReserve, roomReserveJoin, memberInfo, inviteList, groupJoin, groupLeave } from "./multi.controller.js";
import {
  RoomCreateSchema,
  RoomGetSchema,
  RoomJoinSchema,
  RoomKickSchema,
  RoomLockSchema,
  RoomQuickSchema,
  RoomReadySchema,
  RoomReserveJoinSchema,
  RoomReserveSchema,
  RoomSearchSchema,
  MemberInfoSchema,
} from "./multi.schema.js";

const MultiReserveRoom = Router();

MultiReserveRoom.post("/room/create", validate(RoomCreateSchema), roomCreate);
MultiReserveRoom.post("/room/join", validate(RoomJoinSchema), roomJoin);
MultiReserveRoom.post("/room/leave", validate(SessionOnlySchema), roomLeave);
MultiReserveRoom.post("/room/search", validate(RoomSearchSchema), roomSearch);
MultiReserveRoom.post("/room/get", validate(RoomGetSchema), roomGet);
MultiReserveRoom.post("/room/quick", validate(RoomQuickSchema), roomQuick);
MultiReserveRoom.post("/room/lock", validate(RoomLockSchema), roomLock);
MultiReserveRoom.post("/room/kick", validate(RoomKickSchema), roomKick);
MultiReserveRoom.post("/room/ready", validate(RoomReadySchema), roomReady);
MultiReserveRoom.post("/room/reserve", validate(RoomReserveSchema), roomReserve);
MultiReserveRoom.post("/room/reserve/join", validate(RoomReserveJoinSchema), roomReserveJoin);
MultiReserveRoom.get("/member/info", memberInfo);
MultiReserveRoom.post("/member/info", validate(MemberInfoSchema), memberInfo);
MultiReserveRoom.post("/invite/targets", validate(SessionOnlySchema), inviteList);
MultiReserveRoom.post("/invite/list", validate(SessionOnlySchema), inviteList);
MultiReserveRoom.post("/group/join", validate(SessionOnlySchema), groupJoin);
MultiReserveRoom.post("/group/leave", validate(SessionOnlySchema), groupLeave);

export default MultiReserveRoom;
