import { Router } from 'express';
import * as multiController from './multi.controller.js';
import { validate } from '../../../middleware/validation.js';
import {
  RoomReserveSchema,
  RoomSearchSchema,
  RoomJoinSchema,
  RoomCreateSchema,
  RoomQuickSchema,
  RoomGetSchema,
  MemberInfoSchema,
} from './multi.schema.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const multiRouter = Router();
multiRouter.post('/room/reserve', validate(RoomReserveSchema), multiController.roomReserve);

multiRouter.post('/room/reserve/join', validate(RoomReserveSchema), multiController.roomReserveJoin);
multiRouter.post('/room/search', validate(RoomSearchSchema), multiController.roomSearch);
multiRouter.post('/room/join', validate(RoomJoinSchema), multiController.roomJoin);
multiRouter.post('/room/create', validate(RoomCreateSchema), multiController.roomCreate);
multiRouter.post('/room/quick', validate(RoomQuickSchema), multiController.roomQuick);
multiRouter.post('/room/get', validate(RoomGetSchema), multiController.roomGet);
// IDA 验证: cAPIRoomInfo::getPath 使用 GET multi/member/info
// 同时保留 POST 兼容
multiRouter.get('/member/info', multiController.memberInfo);
multiRouter.post('/member/info', validate(MemberInfoSchema), multiController.memberInfo);
multiRouter.post('/invite/targets', validate(SessionOnlySchema), multiController.inviteList); //todo

multiRouter.post('/invite/list', validate(SessionOnlySchema), multiController.inviteList);
export default multiRouter;
