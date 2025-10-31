import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import * as guildService from "../../../services/guildService";
import User from "../../../model/user";

/**
 * 辅助函数：从 session_id 获取用户信息
 */
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
 * 获取用户的公会信息
 * POST /guild/user/get
 */
export const userGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 获取用户公会信息
    const userGuild = await guildService.getUserGuildInfo(uid);
    
    if (!userGuild) {
      // 用户还没有公会数据，创建一个空的
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

    // 返回用户公会信息
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
    encryptAndSend({ user_guild: null }, res, req, 1, 2, "获取用户公会信息失败");
  }
};

/**
 * 初始化用户公会设置
 * POST /guild/user/setup
 */
export const userSetup = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 返回空的公会设置
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
    encryptAndSend({ user_guild: null }, res, req, 1, 2, "初始化用户公会设置失败");
  }
};

/**
 * 搜索公会结果
 * POST /guild/search/result
 */
export const searchResult = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 获取用户公会信息
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
    encryptAndSend({ user_guild: null }, res, req, 1, 2, "搜索公会失败");
  }
};

/**
 * 创建公会
 * POST /guild/create
 */
export const create = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;
    const name = req.body.name;
    
    if (!name || name.trim() === "") {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "公会名称不能为空");
    }

    // 检查用户是否已在公会中
    const existingUserGuild = await guildService.getUserGuildInfo(uid);
    if (existingUserGuild && existingUserGuild.gid && existingUserGuild.joined === 1) {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "您已经在一个公会中");
    }

    // 创建公会
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

    // 返回创建的公会信息
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
    encryptAndSend({ guild: null }, res, req, 1, 2, "创建公会失败");
  }
};

/**
 * 获取用户所在的公会信息
 * POST /guild/get/user/guild
 */
export const getUserGuild = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 获取用户公会信息
    const userGuild = await guildService.getUserGuildInfo(uid);
    
    if (!userGuild || !userGuild.gid || userGuild.joined === 0) {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "您还未加入公会");
    }

    // 获取公会详细信息
    const guild = await guildService.getGuildById(userGuild.gid);
    
    if (!guild) {
      return encryptAndSend({ guild: null }, res, req, 1, 2, "公会不存在");
    }

    // 返回公会信息
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
    encryptAndSend({ guild: null }, res, req, 1, 2, "获取公会信息失败");
  }
};

/**
 * 获取Bingo活动信息
 * POST /guild/bingo/get
 */
export const bingoGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 获取用户公会信息
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
    encryptAndSend({ bingoDetail: null, holdInfo: null }, res, req, 1, 2, "获取Bingo信息失败");
  }
};

/**
 * 通过搜索ID查找公会，或获取活跃公会列表
 * POST /guild/search/ID
 */
export const searchId = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const searchId = req.body.id;

    console.log("Request Body:", req.body);

    // 通过搜索ID查找公会
    const guild = await guildService.getGuildBySearchId(searchId);
    
    if (!guild) {
      // 找不到公会时返回空列表
      const data = {
        guilds: [],
        total: 0,
        is_recommendation: 0,
      };
      return encryptAndSend(data, res, req, 100, 2, "未找到公会");
    }

    // 返回公会信息（单个公会以列表形式返回，保持一致性）
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
    encryptAndSend({ guild: null }, res, req, 1, 2, "搜索公会失败");
  }
};

/**
 * 申请加入公会
 * POST /guild/apply
 */
export const apply = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;
    const gid = req.body.gid;
    
    if (!gid) {
      return encryptAndSend({}, res, req, 1, 2, "缺少公会ID");
    }

    // 申请加入公会（如果自动招募开启且人数未满则直接加入）
    const result = await guildService.applyToGuild(uid, gid);
    
    const data = {
      result: result.success ? 1 : 0,
      request_id: result.requestId,
      auto_joined: result.autoJoined ? 1 : 0, // 是否自动加入
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in apply:", error);
    const errorMessage = error instanceof Error ? error.message : "申请加入公会失败";
    encryptAndSend({}, res, req, 1, 2, errorMessage);
  }
};

/**
 * 搜索公会
 * POST /guild/search
 */
export const search = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    // 从请求中获取搜索条件
    const filters = {
      name: req.body.name,
      mood: req.body.mood,
      login_freq: req.body.login_freq,
      chat_freq: req.body.chat_freq,
      yarikomi: req.body.yarikomi,
      timezone: req.body.timezone,
      recruit: req.body.recruit,
    };

    // 搜索公会
    const guilds = await guildService.searchGuilds(filters);
    
    // 转换公会列表
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
    encryptAndSend({ guilds: [], total: 0 }, res, req, 1, 2, "搜索公会失败");
  }
};

/**
 * 发送公会聊天消息
 * POST /guild/chat/send
 */
export const chatSend = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;
    const gid = req.body.gid; // 公会ID
    const message = req.body.message || req.body.text; // 消息内容（兼容 message 和 text 字段）
    const characterName = user.character_name || "未命名玩家";

    // 验证输入
    if (!gid) {
      return encryptAndSend({}, res, req, 1, 2, "缺少公会ID");
    }

    if (!message || message.trim() === "") {
      return encryptAndSend({}, res, req, 1, 2, "消息内容不能为空");
    }

    // 发送消息
    const chatMessage = await guildService.sendChatMessage(
      uid,
      gid,
      message.trim(),
      characterName
    );

    // 简化返回格式
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
    const errorMessage = error instanceof Error ? error.message : "发送聊天消息失败";
    encryptAndSend({}, res, req, 1, 2, errorMessage);
  }
};

/**
 * 获取公会聊天记录
 * POST /guild/chat/get
 */
export const chatGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 获取聊天记录
    const getMessages = await guildService.getChatMessages(uid);

    // 构建 chat_logs 数组 - 根据反编译截图，这是一个简单的聊天日志数组
    const chat_logs = getMessages.map((msg: any) => ({
      chatlog: msg.message || "", // 注意字段名是 chatlog 不是 message
    }));

    // 构建 recent_logs 数组 - 与 chat_logs 结构相同，但只取最近20条
    const recent_logs = chat_logs.slice(0, 20);

    // 获取所有发送过消息的用户ID
    const uniqueUserIds = [...new Set(getMessages.map((msg: any) => msg.uid))];
    
    // 批量获取用户信息以构建 chatuser_infos
    const users = await User.find({ uu_id: { $in: uniqueUserIds } });
    
    // 构建 chatuser_infos 数组 - 根据反编译截图包含完整的用户外观信息
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

    // 根据反编译截图中的 aGuildChatGet 结构构建响应
    const data = {
      chat_logs: chat_logs,
      chatuser_infos: chatuser_infos,
      message_id: "1", // 根据截图，这个字段可能不需要或为空
      recent_logs: recent_logs,
    };
    
    encryptAndSend(data, res, req);

  } catch (error) {
    console.error("Error in chatGet:", error);
    const errorMessage = error instanceof Error ? error.message : "获取聊天记录失败";
    encryptAndSend({ 
      chat_logs: [], 
      chatuser_infos: [],
      message_id: "", 
      recent_logs: []
    }, res, req, 1, 2, errorMessage);
  }
};

/**
 * 获取公会邮件列表
 * POST /guild/user/mail/list
 */
export const mailList = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;
    
    const uid = user.uu_id;

    // 获取用户公会信息
    const userGuild = await guildService.getUserGuildInfo(uid);
    
    if (!userGuild || !userGuild.gid || userGuild.joined === 0) {
      return encryptAndSend({ mails: [] }, res, req, 1, 2, "您还未加入公会");
    }

    // TODO: 实现邮件功能
    // 目前返回空列表
    const data = {
      mails: [],
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Error in mailList:", error);
    encryptAndSend({ mails: [] }, res, req, 1, 2, "获取邮件列表失败");
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
    encryptAndSend({ memberList: [] }, res, req, 1, 2, "获取成员列表失败");
  }
}
