import { Router } from 'express';
import maintenanceRouter from './api/maintenance/maintenance.router.js';
import accountRouter from './api/account/account.router.js';
import questRouter from './api/quest/quest.router.js';
import dictionaryRouter from './api/dictionary/dictionary.router.js';
import welcomeRouter from './api/welcome/welcome.router.js';
import versionRouter from './version/version.router.js';
import webRouter from './web/web.router.js';
import guildRouter from './api/guild/guild.router.js';
import maintenanceEnvRouter from './maintenance/maintenanceEnv.router.js';
import tutorialRouter from './api/tutorial/tutorial.router.js';
import boxRouter from './api/box/box.router.js';
import userRouter from './api/user/user.router.js';
import activityRouter from './api/activity/activity.router.js';
import noticeRouter from './api/notice/notice.router.js';
import capLinkRouter from './api/caplink/caplink.router.js';
import eventRouter from './api/event/event.router.js';
import shopRouter from './api/shop/shop.router.js';
import nyankenRouter from './api/nyanken/nyanken.router.js';
import checkRouter from './api/check/check.router.js';
import bannerRouter from './api/banner/banner.router.js';
import ticketRouter from './api/ticket/ticket.router.js';
import popupRouter from './api/popup/popup.router.js';
import storyRouter from './api/story/story.router.js';
import multiRouter from './api/multi/multi.router.js';
import presentRouter from './api/present/present.router.js';
import friendRouter from './api/friend/friend.router.js';
import courseRouter from './api/course/course.router.js';
import purchaseRouter from './api/purchase/purchase.router.js';
import systemRouter from './api/system/system.router.js';

const router = Router();

// API
router.use('/api/maintenance', maintenanceRouter);
router.use('/api/account', accountRouter);
router.use('/api/check', checkRouter);
router.use('/api/quest', questRouter);
router.use('/api/box', boxRouter);
router.use('/api/event', eventRouter);
router.use('/api/user', userRouter);
router.use('/api/guild', guildRouter);
router.use('/api/activity', activityRouter);
router.use('/api/notice', noticeRouter);
router.use('/api/caplink', capLinkRouter);
router.use('/api/shop', shopRouter);
router.use('/api/nyanken', nyankenRouter);
router.use('/api/dictionary', dictionaryRouter);
router.use('/api/welcome', welcomeRouter);
router.use('/api/tutorial', tutorialRouter);
router.use('/api/banner', bannerRouter);
router.use('/api/ticket', ticketRouter);
router.use('/api/popup', popupRouter);
router.use('/api/story', storyRouter);
router.use('/api/multi', multiRouter);
router.use('/api/present', presentRouter);
router.use('/api/friend', friendRouter);
router.use('/api/course', courseRouter);
router.use('/api/purchase', purchaseRouter);
router.use('/api/kpi', purchaseRouter);
router.use('/api/system', systemRouter);

// For version json
router.use('', versionRouter);

// For web
router.use('/web/', webRouter);

//Maintenance Forced
router.use('/maintenance_env', maintenanceEnvRouter);

export default router;
