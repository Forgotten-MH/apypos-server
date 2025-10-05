import { Router } from "express";
import * as questController from "./questController";
import * as questForestController from "./questForestController";
import * as questTrainingController from "./questTrainingController";

import * as notImplemented from "../notImplementedController";

const questRouter = Router();

questRouter.post("/progress", questController.questProgress);
questRouter.post("/result/end", questController.questResultEnd);
//questRouter.post("/result/retry", );

questRouter.post("/retire", notImplemented.blankResponseEncrypted);
questRouter.post("/continue", notImplemented.blankResponseEncrypted);

//Island
questRouter.post("/island/map/all", questController.islandMapAll);
//questRouter.post("/island/map/ocean", );
questRouter.post("/island/start", questController.islandStart);
questRouter.post("/island/end", questController.islandEnd);
//questRouter.post("/island/restart", );

//Eternal
questRouter.post("/eternal/all", questController.eternalAll);
questRouter.post("/eternal/start", questController.eternalStart);
//questRouter.post("/eternal/restart", );

//Event
questRouter.post("/event/list/all", questController.eventListAll);
//questRouter.post("event/m16/end", );
questRouter.post("/event/m16/restart", notImplemented.blankResponseEncrypted);
//questRouter.post("/event/m16/start", );
//questRouter.post("/event/normal/end", );
//questRouter.post("/event/normal/restart", );
questRouter.post("/event/normal/start", questController.eventNormalStart);
questRouter.post("/event/score/end", questController.islandEnd);
//questRouter.post("/event/score/restart", );
questRouter.post("/event/score/start", questController.eventScoreStart);
questRouter.post("/event/ticket/end", questController.islandEnd);
questRouter.post("/event/ticket/free", questController.eventTicketFree);
//questRouter.post("/event/ticket/restart", );
questRouter.post("/event/ticket/start", questController.eventTicketStart);

// Forest
questRouter.post("/forest/end", questForestController.questForestEnd);
//questRouter.post("/forest/fuel/recovery", );
questRouter.post("/forest/info/get", questForestController.forestInfoGet);
//questRouter.post("/forest/item/organize", );
//questRouter.post("/forest/lottery/info/get", );
//questRouter.post("/forest/lottery/lot", );
//questRouter.post("/forest/lottery/reset", );
questRouter.post("/forest/progress", questForestController.questForestProgress);
questRouter.post("/forest/restart", questForestController.questForestRestart);
questRouter.post("/forest/end", questForestController.questForestEnd);


//Training
questRouter.post("/training/list", questTrainingController.trainingList);
questRouter.post("/training/start", questTrainingController.trainingStart);
questRouter.post("/training/end", questTrainingController.trainingEnd);


//questRouter.post("/reward/exchange", );
//questRouter.post("/reward/final", );
//questRouter.post("/reward/normal", );

//questRouter.post("/reward/m16/point", );

questRouter.post("/katamari/content/get", notImplemented.blankResponseEncrypted);



export default questRouter;
