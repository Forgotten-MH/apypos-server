import { Router } from "express";
import * as userController from "./user.controller";
import * as userModelController from "./model/userModel.controller";
import * as userOtomoTeamController from "./otomoteam/userOtomoTeam.controller";

import * as userEquipSetController from "./equipset/userEquipSet.controller";

const userRouter = Router();
//User
userRouter.post("/get", userController.get);
userRouter.post("/rename", userController.rename);
//Comment
userRouter.post("/comment/set", userController.commentSet);
//Model
userRouter.post("/model/create", userModelController.modelCreate);
userRouter.post("/model/set", userModelController.modelSet);
// userRouter.post("/model/buy", );

//OtomoTeam
userRouter.post("/otomoteam/get", userOtomoTeamController.otomoteamGet);
userRouter.post("/otomoteam/set", userOtomoTeamController.otomoteamSet);
userRouter.post("/otomoteam/select", userOtomoTeamController.otomoteamSelect);

//EquipSet
userRouter.post("/equipset/get", userEquipSetController.equipSetGet);
userRouter.post("/equipset/set", userEquipSetController.equipSetSet);
userRouter.post("/equipset/social/get", userEquipSetController.equipSetSocialGet);
userRouter.post("/equipset/social/set", userEquipSetController.equipSetSocialSet);

//Nav
userRouter.post("/navigation/all", userController.navigationAll);
userRouter.post("/navigation/news", userController.navigationNews);
// userRouter.post("/navigation/reward/receive", );


//Title
userRouter.post("/title/all", userController.titleAll);
userRouter.post("/title/set", userController.titleSet);
userRouter.post("/title/news", userController.titleNews);
userRouter.post("/achievement/news", userController.achievementNews);
userRouter.post("/achievement/all", userController.achievementAll);
// userRouter.post("/achievement/apple/sync", );
// userRouter.post("/achievement/google/sync", );
// userRouter.post("/achievement/reward/receive", );
// userRouter.post("/all/reward/receive", );
// userRouter.post("/gender/change", );
// userRouter.post("/info", );


userRouter.post("/partner/set", userController.partnerGet);


userRouter.post("/offer/check", userController.OfferCheck);
// userRouter.post("/offer/start", );

userRouter.post("/search/userID", userController.searchId);
userRouter.post("/search/gameID", userController.gameId);
export default userRouter;
