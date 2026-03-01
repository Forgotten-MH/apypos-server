import { Router } from 'express';
import * as multiController from './multi.controller';

const multiRouter = Router();
multiRouter.post('/room/reserve', multiController.roomReserve);

multiRouter.post('/room/reserve/join', multiController.roomReserveJoin);
multiRouter.post('/room/search', multiController.roomSearch);
multiRouter.post('/room/join', multiController.roomJoin);
multiRouter.post('/room/create', multiController.roomCreate);
multiRouter.post('/room/quick', multiController.roomQuick);
multiRouter.post('/room/get', multiController.roomGet);
multiRouter.post('/member/info', multiController.memberInfo);
multiRouter.post('/invite/targets', multiController.inviteList); //todo

multiRouter.post('/invite/list', multiController.inviteList);
export default multiRouter;
