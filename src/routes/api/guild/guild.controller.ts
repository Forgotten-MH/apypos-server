import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import * as guildService from '../../../services/guildService.js';
import User from '../../../model/user.js';
import { createLogger } from '../../../middleware/logger.js';
import type { SessionOnlyInput, CreateInput, SearchIdInput, ApplyInput, SearchInput, ChatSendInput, MemberListInput } from './guild.schema.js';
const log = createLogger('guild');

interface EquipPiece {
  hash?: number;
  level?: number;
  potential?: number;
  skill_level?: number;
}

interface SocialEquipPart {
  equipment_id?: string;
  mst_equipment_id?: number;
}

// Fields expected by the guild member details builder.
// Some of these are not yet in the User schema and will resolve to undefined
// (handled by || defaults in buildMemberDetails).
interface GuildMemberData {
  comment?: string;
  created?: number;
  equip_arm?: EquipPiece;
  equip_body?: EquipPiece;
  equip_head?: EquipPiece;
  equip_leg?: EquipPiece;
  equip_secret_weapon?: EquipPiece;
  equip_talisman?: EquipPiece & { is_awake?: number; is_enable?: number };
  equip_waist?: EquipPiece;
  equip_weapon?: EquipPiece;
  guild_rank?: number;
  last_login?: number;
  login_freq?: number;
  monument_info?: {
    attack?: number;
    auto_play?: number;
    defence?: number;
    hp?: number;
    hunter_rank?: number;
    sp?: number;
  };
  social_equip?: {
    social_arm?: SocialEquipPart;
    social_body?: SocialEquipPart;
    social_head?: SocialEquipPart;
    social_leg?: SocialEquipPart;
    social_waist?: SocialEquipPart;
  };
  title?: { mst_title_id?: number };
  use_social_equip?: number;
}

interface UserGuildLike {
  chat_freq?: number;
  created?: number;
  gid?: string;
  joined?: number;
  login_freq?: number;
  mood?: number;
  receive?: unknown[];
  send?: unknown[];
  timezone?: number;
  uid?: string;
  updated?: number;
  waited?: number;
  yarikomi?: number;
}

interface GuildLike {
  auto_recruit?: number;
  bingo?: unknown;
  bonus_value?: number;
  chat_freq?: number;
  comment?: string;
  created?: number;
  exp?: number;
  explusion_rule?: number;
  free_comment?: string;
  gid?: string;
  holding_bingo_id?: unknown;
  joined?: number;
  login_freq?: number;
  mark_box?: unknown;
  member?: unknown;
  mood?: number;
  name?: string;
  rank?: number;
  receive?: unknown[];
  recruit?: number;
  search_id?: string;
  send?: unknown[];
  set_mark?: unknown;
  timezone?: number;
  updated?: number;
  yarikomi?: number;
}

const buildUserGuildResponse = (userGuild: UserGuildLike | null, uid: string, version = 0) => ({
  __v: version,
  _id: userGuild?.gid || '',
  chat_freq: userGuild?.chat_freq || 0,
  created: userGuild?.created || 0,
  gid: userGuild?.gid || '',
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
});

const buildGuildResponse = (guild: GuildLike, version = 5) => ({
  __v: version,
  _id: guild.gid || '',
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
  send: guild.send,
  set_mark: guild.set_mark,
  timezone: guild.timezone,
  updated: guild.updated,
  yarikomi: guild.yarikomi,
});

const getUserFromSession = async (req: Request, res: Response) => {
  const { session_id } = req.body as SessionOnlyInput;
  const filter = { current_session: session_id };
  const user = await User.findOne(filter);

  if (!user || !user.uu_id) {
    encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); // Not authenticated
    return null;
  }

  return user as typeof user & { uu_id: string };
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
      return encryptAndSend({ user_guild: buildUserGuildResponse(null, uid) }, res, req);
    }

    encryptAndSend({ user_guild: buildUserGuildResponse(userGuild, uid, 5) }, res, req);
  } catch (error) {
    log.error('Error in userGet:', error);
    encryptAndSend({ user_guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Get user guild information failed');
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

    encryptAndSend({ user_guild: buildUserGuildResponse(null, uid) }, res, req);
  } catch (error) {
    log.error('Error in userSetup:', error);
    encryptAndSend({ user_guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Initialize user guild settings failed');
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

    encryptAndSend({ user_guild: buildUserGuildResponse(userGuild, uid, 5) }, res, req);
  } catch (error) {
    log.error('Error in searchResult:', error);
    encryptAndSend({ user_guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Search guild failed');
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
    const { name, auto_recruit, chat_freq, explusion_rule, free_comment, login_freq, mood, recruit, timezone, yarikomi } = req.body as CreateInput;

    if (!name || name.trim() === '') {
      return encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Guild name cannot be empty');
    }

    const existingUserGuild = await guildService.getUserGuildInfo(uid);
    if (existingUserGuild && existingUserGuild.gid && existingUserGuild.joined === 1) {
      return encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'You are already in a guild');
    }

    const guild = await guildService.createGuild(uid, name, {
      auto_recruit: auto_recruit || 0,
      chat_freq: chat_freq || 0,
      explusion_rule: explusion_rule || 0,
      free_comment: free_comment || '',
      login_freq: login_freq || 0,
      mood: mood || 0,
      recruit: recruit || 0,
      timezone: timezone || 0,
      yarikomi: yarikomi || 0,
    });

    encryptAndSend({ guild: buildGuildResponse(guild, 0) }, res, req);
  } catch (error) {
    log.error('Error in create:', error);
    encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Create guild failed');
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
      return encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'You are not in a guild');
    }

    const guild = await guildService.getGuildById(userGuild.gid);

    if (!guild) {
      return encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Guild not found');
    }

    encryptAndSend({ guild: buildGuildResponse(guild) }, res, req);
  } catch (error) {
    log.error('Error in getUserGuild:', error);
    encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Get guild information failed');
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

    const holdInfo = {
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
    log.error('Error in bingoGet:', error);
    encryptAndSend(
      { bingoDetail: null, holdInfo: null },
      res,
      req,
      1,
      2,
      'Get Bingo information failed',
    );
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

    const { id: searchId } = req.body as SearchIdInput;

    log.debug('Request Body:', req.body);

    const guild = await guildService.getGuildBySearchId(searchId);

    if (!guild) {
      const data = {
        guilds: [],
        total: 0,
        is_recommendation: 0,
      };
      return encryptAndSend(data, res, req, ERROR_CODE.NOT_FOUND, ERROR_CATEGORY.ERROR_DIALOG, 'Guild not found');
    }

    encryptAndSend({ guild: buildGuildResponse(guild) }, res, req);
  } catch (error) {
    log.error('Error in searchId:', error);
    encryptAndSend({ guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Search guild failed');
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
    const { gid } = req.body as ApplyInput;

    if (!gid) {
      return encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Missing guild ID');
    }

    const result = await guildService.applyToGuild(uid, gid);

    if (!result.success) {
      return encryptAndSend(
        { guild: null, user_guild: null },
        res,
        req,
        1,
        2,
        'Failed to apply to join guild',
      );
    }

    const guild = await guildService.getGuildById(gid);
    if (!guild) {
      return encryptAndSend({ guild: null, user_guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Guild not found');
    }

    const userGuild = await guildService.getUserGuildInfo(uid);
    if (!userGuild) {
      return encryptAndSend(
        { guild: null, user_guild: null },
        res,
        req,
        1,
        2,
        'User guild info not found',
      );
    }

    const data = {
      guild: buildGuildResponse(guild, 0),
      user_guild: buildUserGuildResponse(userGuild, uid),
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in apply:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to apply to join guild';
    encryptAndSend({ guild: null, user_guild: null }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, errorMessage);
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

    const { name, mood, login_freq, chat_freq, yarikomi, timezone, recruit } = req.body as SearchInput;
    const filters = {
      name,
      mood,
      login_freq,
      chat_freq,
      yarikomi,
      timezone,
      recruit,
    };

    const guilds = await guildService.searchGuilds(filters);

    const data = {
      guild: guilds.map((guild) => buildGuildResponse(guild)),
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in search:', error);
    encryptAndSend({ guild: [] }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Search guilds failed');
  }
};

/**
 * POST /guild/chat/send
 */
export const chatSend = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;

    const uid = user.uu_id;
    const { gid, message: rawMessage, text } = req.body as ChatSendInput;
    const message = rawMessage || text;
    const characterName = user.character_name || 'Unnamed';

    if (!gid) {
      return encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Missing guild ID');
    }

    if (!message || message.trim() === '') {
      return encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Message cannot be empty');
    }

    const chatMessage = await guildService.sendChatMessage(uid, gid, message.trim(), characterName);

    const data = {
      text: chatMessage.message,
      user_id: chatMessage.uid,
      user_name: chatMessage.character_name,
      timestamp: chatMessage.timestamp,
      success: 1,
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in chatSend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send chat message';
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, errorMessage);
  }
};

/**
 * POST /guild/chat/get
 */
export const chatGet = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;

    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);

    if (!userGuild || !userGuild.gid || userGuild.joined === 0) {
      return encryptAndSend(
        {
          chatLog: {
            __v: 0,
            _id: '',
            chat_logs: [],
            created: 0,
            gid: '',
            recent_logs: [],
            updated: 0,
          },
          chatUserInfos: [],
        },
        res,
        req,
      );
    }

    const gid = userGuild.gid;

    const getMessages = await guildService.getChatMessages(uid);

    const now = Math.floor(Date.now() / 1000);

    const chat_logs = getMessages.map(
      (msg: { message?: string; timestamp?: number; uid?: string }, index: number) => ({
        comment: msg.message || '',
        created: msg.timestamp || now,
        message_id: index + 1,
        type: 0,
        uid: msg.uid || '',
      }),
    );

    const recent_logs = chat_logs.slice(-20);

    const uniqueUserIds = [
      ...new Set(
        getMessages
          .map((msg: { uid?: string }) => msg.uid)
          .filter((uid): uid is string => uid !== undefined),
      ),
    ];

    const users = await User.find({ uu_id: { $in: uniqueUserIds } });

    const chatUserInfos = uniqueUserIds.map((userId: string) => {
      const userData = users.find((u) => u.uu_id === userId);
      return {
        model_info: {
          face: userData?.model_info?.face || 0,
          gender: userData?.model_info?.gender || 0,
          hair: userData?.model_info?.hair || 0,
          hair_color: userData?.model_info?.hair_color || 0,
          inner: userData?.model_info?.inner || 0,
          skin: userData?.model_info?.skin || 0,
        },
        name: userData?.character_name || 'Unnamed',
        uid: userId,
      };
    });

    const data = {
      chatLog: {
        __v: 0,
        _id: gid,
        chat_logs: chat_logs,
        created: now,
        gid: gid,
        recent_logs: recent_logs,
        updated: now,
      },
      chatUserInfos: chatUserInfos,
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in chatGet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get chat messages';
    encryptAndSend(
      {
        chatLog: {
          __v: 0,
          _id: '',
          chat_logs: [],
          created: 0,
          gid: '',
          recent_logs: [],
          updated: 0,
        },
        chatUserInfos: [],
      },
      res,
      req,
      1,
      2,
      errorMessage,
    );
  }
};

/**
 * POST /guild/user/mail/list
 */
export const mailList = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;

    const uid = user.uu_id;

    const userGuild = await guildService.getUserGuildInfo(uid);

    if (!userGuild || !userGuild.gid || userGuild.joined === 0) {
      return encryptAndSend({ mails: [] }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'You are not in a guild');
    }

    const data = {
      mails: [],
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in mailList:', error);
    encryptAndSend({ mails: [] }, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Failed to get mail list');
  }
};

/**
 * POST /guild/member/list
 */
export const memberList = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req, res);
    if (!user) return;

    const uid = user.uu_id;
    const { gid } = req.body as MemberListInput;

    let targetGid = gid;
    if (!targetGid) {
      const userGuild = await guildService.getUserGuildInfo(uid);
      if (!userGuild || !userGuild.gid) {
        return encryptAndSend(
          {
            __v: 0,
            _id: '',
            leader_details: {},
            normal_details: [],
            sub_details: [],
          },
          res,
          req,
          1,
          2,
          'You are not in a guild',
        );
      }
      targetGid = userGuild.gid;
    }

    const guild = await guildService.getGuildById(targetGid);
    if (!guild) {
      return encryptAndSend(
        {
          __v: 0,
          _id: '',
          leader_details: {},
          normal_details: [],
          sub_details: [],
        },
        res,
        req,
        1,
        2,
        'Guild not found',
      );
    }

    const memberList = await guildService.getMemberList(targetGid);

    const now = Math.floor(Date.now() / 1000);

    const buildEquipInfo = (equipData?: {
      hash?: number;
      level?: number;
      potential?: number;
      skill_level?: number;
    }) => ({
      equip_info: {
        hash: equipData?.hash || 0,
        level: equipData?.level || 0,
        potential: equipData?.potential || 0,
        skill_level: equipData?.skill_level || 0,
      },
    });

    const buildMemberDetails = async (memberUid: string, memberType: number) => {
      const memberUser = await User.findOne({ uu_id: memberUid });

      if (!memberUser) {
        return null;
      }

      const memberData = memberUser.toObject() as GuildMemberData;

      return {
        comment: memberData.comment || '',
        created: memberData.created || now,
        equip_arm: buildEquipInfo(memberData.equip_arm),
        equip_body: buildEquipInfo(memberData.equip_body),
        equip_head: buildEquipInfo(memberData.equip_head),
        equip_leg: buildEquipInfo(memberData.equip_leg),
        equip_secret_weapon: buildEquipInfo(memberData.equip_secret_weapon),
        equip_talisman: {
          equip_info: {
            hash: memberData.equip_talisman?.hash || 0,
            level: memberData.equip_talisman?.level || 0,
            potential: memberData.equip_talisman?.potential || 0,
            skill_level: memberData.equip_talisman?.skill_level || 0,
          },
          is_awake: memberData.equip_talisman?.is_awake || 0,
          is_enable: memberData.equip_talisman?.is_enable || 0,
        },
        equip_waist: buildEquipInfo(memberData.equip_waist),
        equip_weapon: buildEquipInfo(memberData.equip_weapon),
        friend_at: 0, // TODO: Implement friend system later
        game_id: memberUser.uu_id || '',
        guild_info: {
          gid: targetGid,
          is_guild: 1,
          is_same: 0,
          member_type: memberType,
          name: guild.name || '',
          rank: memberData.guild_rank || 0,
        },
        is_captomo: 0,
        is_friend: 0,
        last_access_at: memberData.last_login || now,
        login_freq: memberData.login_freq || 0,
        model_info: {
          face: memberUser.model_info?.face || 0,
          gender: memberUser.model_info?.gender || 0,
          hair: memberUser.model_info?.hair || 0,
          hair_color: memberUser.model_info?.hair_color || 0,
          inner: memberUser.model_info?.inner || 0,
          skin: memberUser.model_info?.skin || 0,
        },
        monument_info: {
          attack: memberData.monument_info?.attack || 0,
          auto_play: memberData.monument_info?.auto_play || 0,
          defence: memberData.monument_info?.defence || 0,
          hp: memberData.monument_info?.hp || 0,
          hunter_rank: memberData.monument_info?.hunter_rank || 0,
          sp: memberData.monument_info?.sp || 0,
        },
        name: memberUser.character_name || 'Unnamed',
        now: now,
        social_equip: {
          social_arm: {
            equipment_id: memberData.social_equip?.social_arm?.equipment_id || '',
            mst_equipment_id: memberData.social_equip?.social_arm?.mst_equipment_id || 0,
          },
          social_body: {
            equipment_id: memberData.social_equip?.social_body?.equipment_id || '',
            mst_equipment_id: memberData.social_equip?.social_body?.mst_equipment_id || 0,
          },
          social_head: {
            equipment_id: memberData.social_equip?.social_head?.equipment_id || '',
            mst_equipment_id: memberData.social_equip?.social_head?.mst_equipment_id || 0,
          },
          social_leg: {
            equipment_id: memberData.social_equip?.social_leg?.equipment_id || '',
            mst_equipment_id: memberData.social_equip?.social_leg?.mst_equipment_id || 0,
          },
          social_waist: {
            equipment_id: memberData.social_equip?.social_waist?.equipment_id || '',
            mst_equipment_id: memberData.social_equip?.social_waist?.mst_equipment_id || 0,
          },
        },
        title: {
          mst_title_id: memberData.title?.mst_title_id || 0,
        },
        use_social_equip: memberData.use_social_equip || 0,
        user_id: memberUser.uu_id || '',
      };
    };

    let leaderDetails = {};
    const subDetailsList = [];
    const normalDetailsList = [];

    const members = memberList as {
      leader?: { uid: string };
      sub?: { uid: string }[];
      normal?: { uid: string }[];
    };

    if (members?.leader?.uid) {
      const leaderMemberDetails = await buildMemberDetails(members.leader.uid, 0);
      if (leaderMemberDetails) {
        leaderDetails = leaderMemberDetails;
      }
    }

    if (members?.sub) {
      for (const subMember of members.sub) {
        if (subMember.uid) {
          const subMemberDetails = await buildMemberDetails(subMember.uid, 1);
          if (subMemberDetails) {
            subDetailsList.push(subMemberDetails);
          }
        }
      }
    }

    if (members?.normal) {
      for (const normalMember of members.normal) {
        if (normalMember.uid) {
          const memberDetails = await buildMemberDetails(normalMember.uid, 2);
          if (memberDetails) {
            normalDetailsList.push(memberDetails);
          }
        }
      }
    }

    const data = {
      __v: 0,
      _id: targetGid,
      leader_details: leaderDetails,
      normal_details: normalDetailsList,
      sub_details: subDetailsList,
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in memberList:', error);
    const errorMessage = error instanceof Error ? error.message : 'Get member list failed';
    encryptAndSend(
      {
        __v: 0,
        _id: '',
        leader_details: {},
        normal_details: [],
        sub_details: [],
      },
      res,
      req,
      1,
      2,
      errorMessage,
    );
  }
};
