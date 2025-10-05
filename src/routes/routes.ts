import { Router } from "express";
import maintenanceRouter from "./api/maintenance/maintenance.router";
import accountRouter from "./api/account/account.router";
import questRouter from "./api/quest/quest.router";
import dictionaryRouter from "./api/dictionary/dictionary.router";
import welcomeRouter from "./api/welcome/welcome.router";
import versionRouter from "./version/version.router";
import webRouter from "./web/web.router";
import guildRouter from "./api/guild/guild.router";
import maintenanceEnvRouter from "./maintenance/maintenanceEnv.router";
import tutorialRouter from "./api/tutorial/tutorial.router";
import boxRouter from "./api/box/box.router";
import userRouter from "./api/user/user.router";
import activityRouter from "./api/activity/activity.router";
import noticeRouter from "./api/notice/notice.router";
import capLinkRouter from "./api/caplink/capLink.router";
import eventRouter from "./api/event/event.router";
import shopRouter from "./api/shop/shop.router";
import nyankanRouter from "./api/nyanken/nyanken.router";
import checkRouter from "./api/check/checkRouter";
import bannerRouter from "./api/banner/banner.router";
import ticketRouter from "./api/ticket/ticket.router";
import popupRouter from "./api/popup/popup.router";
import storyRouter from "./api/story/story.router";
import MultiReserveRoom from "./api/multi/multi.router";
import presentRouter from "./api/present/present.router";
import friendRouter from "./api/friend/friend.router";
import courseRouter from "./api/course/course.router";
import purchaseRouter from "./api/purchase/purchase.router";
import systemRouter from "./api/system/system.router";

const router = Router();

// API
router.use("/api/maintenance", maintenanceRouter);
router.use("/api/account", accountRouter);
router.use("/api/check", checkRouter);
router.use("/api/quest", questRouter);
router.use("/api/box", boxRouter);
router.use("/api/event", eventRouter);
router.use("/api/user", userRouter);
router.use("/api/guild", guildRouter);
router.use("/api/activity", activityRouter);
router.use("/api/notice", noticeRouter);
router.use("/api/caplink", capLinkRouter);
router.use("/api/shop", shopRouter);
router.use("/api/nyanken", nyankanRouter);
router.use("/api/dictionary", dictionaryRouter);
router.use("/api/welcome", welcomeRouter);
router.use("/api/tutorial", tutorialRouter);
router.use("/api/banner", bannerRouter);
router.use("/api/ticket", ticketRouter);
router.use("/api/popup", popupRouter);
router.use("/api/story", storyRouter);
router.use("/api/multi", MultiReserveRoom);
router.use("/api/present", presentRouter);
router.use("/api/friend", friendRouter);
router.use("/api/course", courseRouter);
router.use("/api/purchase", purchaseRouter);
router.use("/api/kpi", purchaseRouter);
router.use("/api/system", systemRouter);

// For version json
router.use("", versionRouter);

// For web
router.use("/web/", webRouter);

//Maintenance Forced
router.use("/maintenance_env", maintenanceEnvRouter);

export default router;
