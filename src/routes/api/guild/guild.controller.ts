import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import * as guildService from "../../../services/guildService";
import User from "../../../model/user";


const getUserFromSession = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  const user = await User.findOne(filter);
  
  if (!user) {
    encryptAndSend({}, res, req, 2004); // Not authenticated
    return null;
  }
  
  return user;
};

/**
 * Get user guild information
 * POST /guild/user/get
 */
export const userGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);
    
    if (!userGuild) {
      const data = {
        user_guild: {
          __v: 0,
          _id: "",
          chat_freq: 0,
          created: 0,
          gid: "",
          joined: 0,
          login_freq: 0,
          mood: 0,
          receive: [],
          send: [],
          timezone: 0,
          uid: uid,
          updated: 0,
          waited: 0,
          yarikomi: 0,
        }
      };
      return encryptAndSend(data, res, req);
    }

    const data = {
      user_guild: {
        __v: 5,
        _id: userGuild?.gid || "",
        chat_freq: userGuild?.chat_freq || 0,
        created: userGuild?.created || 0,
        gid: userGuild?.gid || "",
        joined: userGuild?.joined || 0,
        login_freq: userGuild?.login_freq || 0,
        mood: userGuild?.mood || 0,
        receive: userGuild?.receive || [],
        send: userGuild?.send || [],
        timezone: userGuild?.timezone || 0,
        uid: userGuild?.uid || uid,
        updated: userGuild?.updated || 0,
        waited: userGuild?.waited || 0,
        yarikomi: userGuild?.yarikomi || 0,
      }
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in userGet:", error);
    encryptAndSend({ user_guild: null }, res, req, 1, 2, "Get user guild information failed");
  }
};

/**
 * Initialize user guild settings
 * POST /guild/user/setup
 */
export const userSetup = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const data = {
      user_guild: {
        __v: 0,
        _id: "",
        chat_freq: 0,
        created: 0,
        gid: "",
        joined: 0,
        login_freq: 0,
        mood: 0,
        receive: [],
        send: [],
        timezone: 0,
        uid: uid,
        updated: 0,
        waited: 0,
        yarikomi: 0,
      }
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in userSetup:", error);
    encryptAndSend({ user_guild: null }, res, req, 1, 2, "Initialize user guild settings failed");
  }
};

/**
 * Search guild result
 * POST /guild/search/result
 */
export const searchResult = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);
    
    const data = {
      user_guild: {
        __v: 5,
        _id: userGuild?.gid || "",
        chat_freq: userGuild?.chat_freq || 0,
        created: userGuild?.created || 0,
        gid: userGuild?.gid || "",
        joined: userGuild?.joined || 0,
        login_freq: userGuild?.login_freq || 0,
        mood: userGuild?.mood || 0,
        receive: userGuild?.receive || [],
        send: userGuild?.send || [],
        timezone: userGuild?.timezone || 0,
        uid: uid,
        updated: userGuild?.updated || 0,
        waited: userGuild?.waited || 0,
        yarikomi: userGuild?.yarikomi || 0,
      }
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in searchResult:", error);
    encryptAndSend({ user_guild: null }, res, req, 1, 2, "Search guild failed");
  }
};

/**
 * Create guild
 * POST /guild/create
 */
export const create = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;
    const name = req.body.name;
    
    if (!name || name.trim() === "") {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "Guild name cannot be empty");
    }

    const existingUserGuild = await guildService.getUserGuildInfo(uid);
    if (existingUserGuild && existingUserGuild.gid && existingUserGuild.joined === 1) {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "You are already in a guild");
    }

    const guild = await guildService.createGuild(uid, name, {
      auto_recruit: req.body.auto_recruit || 0,
      chat_freq: req.body.chat_freq || 0,
      explusion_rule: req.body.explusion_rule || 0,
      free_comment: req.body.free_comment || "",
      login_freq: req.body.login_freq || 0,
      mood: req.body.mood || 0,
      recruit: req.body.recruit || 0,
      timezone: req.body.timezone || 0,
      yarikomi: req.body.yarikomi || 0,
    });

    const data = {
      guild: {
        __v: 0,
        _id: guild.gid?.toString() || "",
        auto_recruit: guild.auto_recruit,
        bingo: guild.bingo,
        bonus_value: guild.bonus_value,
        chat_freq: guild.chat_freq,
        comment: guild.comment,
        created: guild.created,
        exp: guild.exp,
        explusion_rule: guild.explusion_rule,
        free_comment: guild.free_comment,
        holding_bingo_id: guild.holding_bingo_id,
        mark_box: guild.mark_box,
        member: guild.member,
        gid: guild.gid,
        joined: guild.joined,
        login_freq: guild.login_freq,
        mood: guild.mood,
        name: guild.name,
        rank: guild.rank,
        receive: guild.receive,
        recruit: guild.recruit,
        search_id: guild.search_id,
        set_mark: guild.set_mark,
        timezone: guild.timezone,
        updated: guild.updated,
        yarikomi: guild.yarikomi,
      }
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in create:", error);
    encryptAndSend({ guild: null }, res, req, 1, 2, "Create guild failed");
  }
};

/**
 * Get user guild information
 * POST /guild/get/user/guild
 */
export const getUserGuild = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);
    
    if (!userGuild || !userGuild.gid || userGuild.joined === 0) {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "You are not in a guild");
    }

    const guild = await guildService.getGuildById(userGuild.gid);
    
    if (!guild) {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "Guild not found");
    }

    const data = {
      guild: {
        __v: 5,
        _id: guild.gid?.toString() || "",
        auto_recruit: guild.auto_recruit,
        bingo: guild.bingo,
        bonus_value: guild.bonus_value,
        chat_freq: guild.chat_freq,
        comment: guild.comment,
        created: guild.created,
        exp: guild.exp,
        explusion_rule: guild.explusion_rule,
        free_comment: guild.free_comment,
        holding_bingo_id: guild.holding_bingo_id,
        mark_box: guild.mark_box,
        member: guild.member,
        gid: guild.gid,
        joined: guild.joined,
        login_freq: guild.login_freq,
        mood: guild.mood,
        name: guild.name,
        rank: guild.rank,
        receive: guild.receive,
        recruit: guild.recruit,
        search_id: guild.search_id,
        set_mark: guild.set_mark,
        timezone: guild.timezone,
        updated: guild.updated,
        yarikomi: guild.yarikomi,
      }
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in getUserGuild:", error);
    encryptAndSend({ guild: null }, res, req, 1, 2, "Get guild information failed");
  }
};

/**
 * Get Bingo activity information
 * POST /guild/bingo/get
 */
export const bingoGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);
    
    let holdInfo = {
      bonus_value: 0,
      is_bonus: 0,
      is_guild: 0,
      is_mission: 0,
    };

    if (userGuild && userGuild.gid && userGuild.joined === 1) {
      holdInfo.is_guild = 1;
    }

    const data = {
      bingoDetail: {
        aligned_line: 0,
        bingo_missions: [],
        end: 0,
        end_remain: 0,
        mst_bingo_sheet_id: 0,
        reward_end: 0,
        reward_remain: 0,
        sheet_index: 0,
        start: 0,
        start_remain: 0,
      },
      holdInfo: holdInfo,
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in bingoGet:", error);
    encryptAndSend({ bingoDetail: null, holdInfo: null }, res, req, 1, 2, "Get Bingo information failed");
  }
};

/**
 * Search guild by search ID, or get active guild list
 * POST /guild/search/ID
 */
export const searchId = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const searchId = req.body.id;

    console.log("Request Body:", req.body);

    const guild = await guildService.getGuildBySearchId(searchId);
    
    if (!guild) {
      const data = {
        guilds: [],
        total: 0,
        is_recommendation: 0,
      };
      return encryptAndSend(data, res, req, 100, 2, "Guild not found");
    }

    const data = {
      __v: 5,
      _id: guild.gid?.toString() || "",
      auto_recruit: guild.auto_recruit,
      bingo: guild.bingo,
      bonus_value: guild.bonus_value,
      chat_freq: guild.chat_freq,
      comment: guild.comment,
      created: guild.created,
      exp: guild.exp,
      explusion_rule: guild.explusion_rule,
      free_comment: guild.free_comment,
      gid: guild.gid,
      joined: guild.joined,
      holding_bingo_id: guild.holding_bingo_id,
      mark_box: guild.mark_box,
      member: guild.member,
      mood: guild.mood,
      name: guild.name,
      rank: guild.rank,
      receive: guild.receive,
      recruit: guild.recruit,
      hr: 100,
      search_id: guild.search_id,
      send: guild.send,
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in searchId:", error);
    encryptAndSend({ guild: null }, res, req, 1, 2, "Search guild failed");
  }
};

/**
 * Apply to join guild
 * POST /guild/apply
 */
export const apply = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;
    const gid = req.body.gid;
    
    if (!gid) {
      return encryptAndSend({}, res, req, 1, 2, "Missing guild ID");
    }

    const result = await guildService.applyToGuild(uid, gid);
    
    const data = {
      result: result.success ? 1 : 0,
      request_id: result.requestId,
      auto_joined: result.autoJoined ? 1 : 0,
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in apply:", error);
    const errorMessage = error instanceof Error ? error.message : "Apply to join guild failed";
    encryptAndSend({}, res, req, 1, 2, errorMessage);
  }
};

/**
 * Search guild
 * POST /guild/search
 */
export const search = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const filters = {
      name: req.body.name,
      mood: req.body.mood,
      login_freq: req.body.login_freq,
      chat_freq: req.body.chat_freq,
      yarikomi: req.body.yarikomi,
      timezone: req.body.timezone,
      recruit: req.body.recruit,
    };

    const guilds = await guildService.searchGuilds(filters);
    
    const guildList = guilds.map(guild => ({
      __v: 5,
      _id: guild.gid?.toString() || "",
      auto_recruit: guild.auto_recruit,
      bingo: guild.bingo,
      bonus_value: guild.bonus_value,
      chat_freq: guild.chat_freq,
      comment: guild.comment,
      created: guild.created,
      exp: guild.exp,
      explusion_rule: guild.explusion_rule,
      free_comment: guild.free_comment,
      gid: guild.gid,
      joined: guild.joined,
      login_freq: guild.login_freq,
      mood: guild.mood,
      name: guild.name,
      rank: guild.rank,
      recruit: guild.recruit,
      search_id: guild.search_id,
    }));

    const data = {
      guilds: guildList,
      total: guildList.length,
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in search:", error);
    encryptAndSend({ guilds: [], total: 0 }, res, req, 1, 2, "Search guild failed");
  }
};

/**
 * Send guild chat message
 * POST /guild/chat/send
 */
export const chatSend = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;
    const gid = req.body.gid;
    const message = req.body.message || req.body.text;
    const characterName = user.character_name || "Unnamed player";

    if (!gid) {
      return encryptAndSend({}, res, req, 1, 2, "Missing guild ID");
    }

    if (!message || message.trim() === "") {
      return encryptAndSend({}, res, req, 1, 2, "Message content cannot be empty");
    }

    const chatMessage = await guildService.sendChatMessage(
      uid,
      gid,
      message.trim(),
      characterName
    );

    const data = {
      text: chatMessage.message,
      user_id: chatMessage.uid,
      user_name: chatMessage.character_name,
      timestamp: chatMessage.timestamp,
      success: 1,
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in chatSend:", error);
    const errorMessage = error instanceof Error ? error.message : "Send chat message failed";
    encryptAndSend({}, res, req, 1, 2, errorMessage);
  }
};

/**
 * Get guild chat record
 * POST /guild/chat/get
 */
export const chatGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const getMessages = await guildService.getChatMessages(uid);

    const chat_logs = getMessages.map((msg: any) => ({
      chatlog: msg.message || "",
    }));

    const recent_logs = chat_logs.slice(0, 20);

    const uniqueUserIds = [...new Set(getMessages.map((msg: any) => msg.uid))];
    
    const users = await User.find({ uu_id: { $in: uniqueUserIds } });
    
    const chatuser_infos = uniqueUserIds.map((userId: string) => {
      const userData = users.find((u: any) => u.uu_id === userId);
      return {
        model_info: userData?.model_info?.face || 0,
        face: userData?.model_info?.face || 0,
        gender: userData?.model_info?.gender || 0,
        hair: userData?.model_info?.hair || 0,
        hair_color: userData?.model_info?.hair_color || 0,
      };
    });

    const data = {
      chat_logs: chat_logs,
      chatuser_infos: chatuser_infos,
      message_id: "1",
      recent_logs: recent_logs,
    };
    
    encryptAndSend(data, res, req);

  } catch (error) {
    console.error("Error in chatGet:", error);
    const errorMessage = error instanceof Error ? error.message : "Get chat record failed";
    encryptAndSend({ 
      chat_logs: [], 
      chatuser_infos: [],
      message_id: "", 
      recent_logs: []
    }, res, req, 1, 2, errorMessage);
  }
};

/**
 * Get guild mail list
 * POST /guild/user/mail/list
 */
export const mailList = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);
    
    if (!userGuild || !userGuild.gid || userGuild.joined === 0) {
      return encryptAndSend({ mails: [] }, res, req, 1, 2, "You are not in a guild");
    }

    const data = {
      mails: [],
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in mailList:", error);
    encryptAndSend({ mails: [] }, res, req, 1, 2, "Get mail list failed");
  }
};


export const memberList = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const gid = req.body.gid;
    
    const memberList = await guildService.getMemberList(gid);

    const data = {
      members: [],
      total: 0,
    };
    encryptAndSend({},res, req);
    // encryptAndSend({ data }, res, req);
  }
  catch (error) {
    console.error("Error in memberList:", error);
    encryptAndSend({ memberList: [] }, res, req, 1, 2, "Get member list failed");
  }
}
