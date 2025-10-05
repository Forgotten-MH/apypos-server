import { Router } from "express";
import * as boxController from "./box.controller";
import * as notImplemented from "../notImplementedController";

const boxRouter = Router();

boxRouter.post("/get", boxController.get);
boxRouter.post("/payment/get", boxController.PaymentGet);
boxRouter.post("/payment/limit/get", boxController.paymentLimitGet);


boxRouter.post("/otomo/get", boxController.otomoGet);
// boxRouter.post("/otomo/skill/remove", );
// boxRouter.post("/partner/get", );
boxRouter.post("/partner/levelup", notImplemented.blankResponseEncrypted); 
boxRouter.post("/material/sell", notImplemented.blankResponseEncrypted); 

boxRouter.post("/storage/info", boxController.storageInfo);
boxRouter.post("/storage/content/get", boxController.storageGet);
// boxRouter.post("/storage/content/move", );
// boxRouter.post("/storage/rename", );



boxRouter.post("/equipment/levelup", boxController.equipLevelup);
boxRouter.post("/equipment/awake", notImplemented.blankResponseEncrypted);
// boxRouter.post("/equipment/evolve", );
// boxRouter.post("/equipment/get", );
// boxRouter.post("/equipment/potentialup", );
// boxRouter.post("/equipment/wskillup", );
boxRouter.post("/equipment/potentialup/auto/set", notImplemented.blankResponseEncrypted);
boxRouter.post("/equipment/favorite/set", notImplemented.blankResponseEncrypted);
boxRouter.post("/equipment/sale", notImplemented.blankResponseEncrypted);
boxRouter.post("/equipment/capacity/info", boxController.equipCapacityInfo);
boxRouter.post("/equipment/capacity/expand", boxController.equipCapacityExpand);

// boxRouter.post("/growthitem/get", );
// boxRouter.post("/item/get", );
// boxRouter.post("/item/use", );
// boxRouter.post("/matatabi/use", );
// boxRouter.post("/matatabi/get", );
// boxRouter.post("/material/sell", );
// boxRouter.post("/material/get", );
// boxRouter.post("/monument/get", );
// boxRouter.post("/monument/levelup", );
boxRouter.post("/monument/levelup/auto", boxController.leveupAuto);

boxRouter.post("/stamp/get", boxController.stampGet);
boxRouter.post("/stamp/hold/get", boxController.stampHoldGet);
boxRouter.post("/stamp/shop/list", boxController.stampShopList);
// boxRouter.post("/stamp/hold/set", );
// boxRouter.post("/stamp/shop/buy", );



export default boxRouter;
