import { Router } from "express";
import * as multiReserveRoomController from "./multiReserveRoomController"

const MultiReserveRoom = Router();
MultiReserveRoom.post("/room/reserve", multiReserveRoomController.roomReserve);

MultiReserveRoom.post("/room/reserve/join", multiReserveRoomController.roomReserveJoin);
MultiReserveRoom.post("/room/search", multiReserveRoomController.roomSearch);
MultiReserveRoom.post("/room/join", multiReserveRoomController.roomJoin);
MultiReserveRoom.post("/room/create", multiReserveRoomController.roomCreate);
MultiReserveRoom.post("/room/quick", multiReserveRoomController.roomQuick);
MultiReserveRoom.post("/room/get", multiReserveRoomController.roomGet);
MultiReserveRoom.post("/member/info", multiReserveRoomController.memberInfo);
MultiReserveRoom.post("/invite/targets", multiReserveRoomController.inviteList); //todo


MultiReserveRoom.post("/invite/list", multiReserveRoomController.inviteList);
export default MultiReserveRoom;
