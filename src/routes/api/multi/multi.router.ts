import { Router } from "express";
import { roomCreate, roomJoin, roomLeave, roomSearch, roomGet, roomQuick, roomLock, roomKick, roomReady, roomReserve, roomReserveJoin, memberInfo, inviteList, groupJoin, groupLeave } from "./multi.controller.js";

const MultiReserveRoom = Router();

MultiReserveRoom.post("/room/create", roomCreate);
MultiReserveRoom.post("/room/join", roomJoin);
MultiReserveRoom.post("/room/leave", roomLeave);
MultiReserveRoom.post("/room/search", roomSearch);
MultiReserveRoom.post("/room/get", roomGet);
MultiReserveRoom.post("/room/quick", roomQuick);
MultiReserveRoom.post("/room/lock", roomLock);
MultiReserveRoom.post("/room/kick", roomKick);
MultiReserveRoom.post("/room/ready", roomReady);
MultiReserveRoom.post("/room/reserve", roomReserve);
MultiReserveRoom.post("/room/reserve/join", roomReserveJoin);
MultiReserveRoom.get("/member/info", memberInfo);
MultiReserveRoom.post("/member/info", memberInfo);
MultiReserveRoom.post("/invite/targets", inviteList);
MultiReserveRoom.post("/invite/list", inviteList);
MultiReserveRoom.post("/group/join", groupJoin);
MultiReserveRoom.post("/group/leave", groupLeave);

export default MultiReserveRoom;
