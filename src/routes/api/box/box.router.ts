import { Router } from 'express';
import * as boxController from './box.controller.js';
import * as notImplemented from '../notImplemented.controller.js';
import { validate } from '../../../middleware/validation.js';
import {
  BoxGetSchema,
  StorageGetSchema,
  EquipLevelupSchema,
  MonumentLevelupSchema,
} from './box.schema.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const boxRouter = Router();

boxRouter.post('/get', validate(BoxGetSchema), boxController.get);
boxRouter.post('/payment/get', validate(SessionOnlySchema), boxController.PaymentGet);
boxRouter.post('/payment/limit/get', validate(SessionOnlySchema), boxController.paymentLimitGet);

boxRouter.post('/otomo/get', validate(SessionOnlySchema), boxController.otomoGet);
// boxRouter.post("/otomo/skill/remove", );
// boxRouter.post("/partner/get", );
boxRouter.post('/partner/levelup', notImplemented.blankResponseEncrypted);
boxRouter.post('/material/sell', notImplemented.blankResponseEncrypted);

boxRouter.post('/storage/info', validate(SessionOnlySchema), boxController.storageInfo);
boxRouter.post('/storage/content/get', validate(StorageGetSchema), boxController.storageGet);
// boxRouter.post("/storage/content/move", );
// boxRouter.post("/storage/rename", );

boxRouter.post('/equipment/levelup', validate(EquipLevelupSchema), boxController.equipLevelup);
boxRouter.post('/equipment/awake', notImplemented.blankResponseEncrypted);
// boxRouter.post("/equipment/evolve", );
// boxRouter.post("/equipment/get", );
// boxRouter.post("/equipment/potentialup", );
// boxRouter.post("/equipment/wskillup", );
boxRouter.post('/equipment/potentialup/auto/set', notImplemented.blankResponseEncrypted);
boxRouter.post('/equipment/favorite/set', notImplemented.blankResponseEncrypted);
boxRouter.post('/equipment/sale', notImplemented.blankResponseEncrypted);
boxRouter.post('/equipment/capacity/info', validate(SessionOnlySchema), boxController.equipCapacityInfo);
boxRouter.post('/equipment/capacity/expand', validate(SessionOnlySchema), boxController.equipCapacityExpand);

// boxRouter.post("/growthitem/get", );
// boxRouter.post("/item/get", );
// boxRouter.post("/item/use", );
// boxRouter.post("/matatabi/use", );
// boxRouter.post("/matatabi/get", );
// boxRouter.post("/material/sell", );
// boxRouter.post("/material/get", );
// boxRouter.post("/monument/get", );
// boxRouter.post("/monument/levelup", );
boxRouter.post('/monument/levelup/auto', validate(MonumentLevelupSchema), boxController.leveupAuto);

boxRouter.post('/stamp/get', validate(SessionOnlySchema), boxController.stampGet);
boxRouter.post('/stamp/hold/get', validate(SessionOnlySchema), boxController.stampHoldGet);
boxRouter.post('/stamp/shop/list', validate(SessionOnlySchema), boxController.stampShopList);
// boxRouter.post("/stamp/hold/set", );
// boxRouter.post("/stamp/shop/buy", );

export default boxRouter;
