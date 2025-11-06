import Guild from "../model/guild";
import User from "../model/user";
import { generateUniqueId } from "./crypto/encryptionHelpers";

export const generateGuildId = async (): Promise<string> => {
  let gid: string;
  let exists = true;
  
  while (exists) {
    gid = Math.floor(100000 + Math.random() * 900000).toString();
    const guild = await Guild.findOne({ gid });
    exists = !!guild;
  }
  
  return gid;
};

export const generateSearchId = async (): Promise<string> => {
  let searchId: string;
  let exists = true;
  
  while (exists) {
    searchId = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    
    const guild = await Guild.findOne({ search_id: searchId });
    exists = !!guild;
  }
  
  return searchId;
};

export const createGuild = async (
  uid: string,
  name: string,
  options: {
    auto_recruit?: number;
    chat_freq?: number;
    explusion_rule?: number;
    free_comment?: string;
    login_freq?: number;
    mood?: number;
    recruit?: number;
    timezone?: number;
    yarikomi?: number;
  }
) => {
  const gid = await generateGuildId();
  const searchId = await generateSearchId();
  const now = Date.now();

  const guild = new Guild({
    gid,
    name,
    search_id: searchId,
    auto_recruit: options.auto_recruit || 0,
    chat_freq: options.chat_freq || 0,
    explusion_rule: options.explusion_rule || 0,
    free_comment: options.free_comment || "",
    login_freq: options.login_freq || 0,
    mood: options.mood || 0,
    recruit: options.recruit || 0,
    timezone: options.timezone || 0,
    yarikomi: options.yarikomi || 0,
    rank: 1,
    exp: 0,
    joined: 1,
    member: {
      leader: {
        created: now,
        last_login: now,
        uid: uid,
      },
      normal: [],
      sub: [],
    },
    created: now,
    updated: now,
  });

  await guild.save();

  await User.updateOne(
    { uu_id: uid },
    {
      $set: {
        "guild_info.gid": gid,
        "guild_info.is_guild": 1,
        "guild_info.member_type": 3, //3 = Leader
        "guild_info.name": name,
        "guild_info.rank": 1,
      },
    }
  );

  return guild;
};

export const getUserGuildInfo = async (uid: string) => {
  const user = await User.findOne({ uu_id: uid });
  if (!user) return null;
  
  return {
    uid: user.uu_id,
    gid: user.guild_info?.gid || "",
    joined: user.guild_info?.is_guild || 0,
    login_freq: user.guild_info?.login_freq || 0,
    chat_freq: user.guild_info?.chat_freq || 0,
    yarikomi: user.guild_info?.yarikomi || 0,
    mood: user.guild_info?.mood || 0,
    timezone: user.guild_info?.timezone || 0,
    waited: user.guild_info?.waited || 0,
    receive: user.guild_info?.receive || [],
    send: user.guild_info?.send || [],
    created: 0,
    updated: 0,
  };
};

export const getGuildById = async (gid: string) => {
  const guild = await Guild.findOne({ gid });
  return guild;
};

export const getGuildBySearchId = async (searchId: string) => {
  const guild = await Guild.findOne({ search_id: searchId });
  return guild;
};

export const searchGuilds = async (filters: {
  name?: string;
  mood?: number;
  login_freq?: number;
  chat_freq?: number;
  yarikomi?: number;
  timezone?: number;
  recruit?: number;
}) => {
  const query: any = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }
  if (filters.mood !== undefined) {
    query.mood = filters.mood;
  }
  if (filters.login_freq !== undefined) {
    query.login_freq = filters.login_freq;
  }
  if (filters.chat_freq !== undefined) {
    query.chat_freq = filters.chat_freq;
  }
  if (filters.yarikomi !== undefined) {
    query.yarikomi = filters.yarikomi;
  }
  if (filters.timezone !== undefined) {
    query.timezone = filters.timezone;
  }
  if (filters.recruit !== undefined) {
    query.recruit = filters.recruit;
  }

  const guilds = await Guild.find(query).limit(50);
  return guilds;
};

export const getActiveGuilds = async (limit: number = 20) => {
  const guilds = await Guild.find({
    recruit: { $gte: 1 },
    joined: { $lt: 30 },
  })
    .sort({
      rank: -1,
      joined: -1,
      updated: -1,
    })
    .limit(limit);

  return guilds;
};

export const applyToGuild = async (uid: string, gid: string) => {
  const guild = await Guild.findOne({ gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  const user = await User.findOne({ uu_id: uid });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.guild_info?.gid && user.guild_info?.is_guild === 1) {
    throw new Error("You are already in another guild");
  }

  const now = Date.now();
  const MAX_GUILD_MEMBERS = 50;

  const isAutoRecruit = guild.auto_recruit > 0;
  const isNotFull = guild.joined < MAX_GUILD_MEMBERS;

  if (isAutoRecruit && isNotFull) {
    console.log(`[Guild Auto Recruit] User ${uid} automatically joined guild ${gid}`);
    
    guild.member.normal.push({
      created: now,
      last_login: now,
      uid: uid,
    });
    guild.joined += 1;
    guild.updated = now;
    await guild.save();

    await User.updateOne(
      { uu_id: uid },
      {
        $set: {
          "guild_info.gid": gid,
          "guild_info.is_guild": 1,
          "guild_info.member_type": 1, // 1=Normal
          "guild_info.name": guild.name,
          "guild_info.rank": guild.rank,
        },
      }
    );

    return { success: true, autoJoined: true, requestId: null };
  } else {
    const requestId = generateUniqueId();

    guild.receive.push({
      _id: requestId,
      created: now,
      gid: gid,
      uid: uid,
    });
    await guild.save();

    await User.updateOne(
      { uu_id: uid },
      {
        $push: {
          "guild_info.send": {
            _id: requestId,
            created: now,
            gid: gid,
            uid: uid,
          },
        },
      }
    );

    return { success: true, autoJoined: false, requestId };
  }
};

export const inviteUserToGuild = async (gid: string, uid: string) => {
  const guild = await Guild.findOne({ gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  const user = await User.findOne({ uu_id: uid });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.guild_info?.gid && user.guild_info?.is_guild === 1) {
    throw new Error("You are already in another guild");
  }

  const now = Date.now();
  const requestId = generateUniqueId();

  guild.send.push({
    _id: requestId,
    created: now,
    gid: gid,
    uid: uid,
  });
  await guild.save();

  await User.updateOne(
    { uu_id: uid },
    {
      $push: {
        "guild_info.receive": {
          _id: requestId,
          created: now,
          gid: gid,
          uid: uid,
        },
      },
    }
  );

  return { success: true, requestId };
};

export const getMemberType = (guild: any, uid: string): number => {
  if (guild.member.leader.uid === uid) {
    return 3; // Leader
  }
  if (guild.member.sub.some((m: any) => m.uid === uid)) {
    return 2; // Sub
  }
  if (guild.member.normal.some((m: any) => m.uid === uid)) {
    return 1; // Normal
  }
  return 0; // Not a member
};

export const joinGuild = async (uid: string, gid: string) => {
  const guild = await Guild.findOne({ gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  const user = await User.findOne({ uu_id: uid });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.guild_info?.gid && user.guild_info?.is_guild === 1) {
    throw new Error("You are already in another guild");
  }

  const now = Date.now();

  guild.member.normal.push({
    created: now,
    last_login: now,
    uid: uid,
  });
  guild.joined += 1;
  await guild.save();

  await User.updateOne(
    { uu_id: uid },
    {
      $set: {
        "guild_info.gid": gid,
        "guild_info.is_guild": 1,
        "guild_info.member_type": 1, // 1=Normal
        "guild_info.name": guild.name,
        "guild_info.rank": guild.rank,
      },
    }
  );

  return { success: true };
};

export const leaveGuild = async (uid: string) => {
  const user = await User.findOne({ uu_id: uid });
  if (!user || !user.guild_info?.gid || user.guild_info?.is_guild === 0) {
    throw new Error("You are not in any guild");
  }

  const guild = await Guild.findOne({ gid: user.guild_info.gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  if (guild.member.leader.uid === uid) {
    if (guild.member.sub.length > 0) {
      const newLeader = guild.member.sub[0];
      guild.member.leader.uid = newLeader.uid;
      guild.member.leader.created = newLeader.created;
      guild.member.leader.last_login = newLeader.last_login;
      guild.member.sub.splice(0, 1);
    } else if (guild.member.normal.length > 0) {
      const newLeader = guild.member.normal[0];
      guild.member.leader.uid = newLeader.uid;
      guild.member.leader.created = newLeader.created;
      guild.member.leader.last_login = newLeader.last_login;
      guild.member.normal.splice(0, 1);
    } else {
      await Guild.deleteOne({ gid: guild.gid });
      
      await User.updateOne(
        { uu_id: uid },
        {
          $set: {
            "guild_info.gid": "",
            "guild_info.is_guild": 0,
            "guild_info.member_type": 0,
            "guild_info.name": "",
            "guild_info.rank": 0,
          },
        }
      );
      
      return { success: true, disbanded: true };
    }
  } else {
    const normalMember = guild.member.normal.find((m: any) => m.uid === uid);
    if (normalMember) {
      guild.member.normal.pull(normalMember);
    }
    const subMember = guild.member.sub.find((m: any) => m.uid === uid);
    if (subMember) {
      guild.member.sub.pull(subMember);
    }
  }

  guild.joined -= 1;
  await guild.save();

  await User.updateOne(
    { uu_id: uid },
    {
      $set: {
        "guild_info.gid": "",
        "guild_info.is_guild": 0,
        "guild_info.member_type": 0,
        "guild_info.name": "",
        "guild_info.rank": 0,
      },
    }
  );

  return { success: true, disbanded: false };
};

export const updateGuild = async (gid: string, updates: any) => {
  const guild = await Guild.findOne({ gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  Object.assign(guild, updates);
  guild.updated = Date.now();
  await guild.save();

  if (updates.name || updates.rank) {
    const updateData: any = {};
    if (updates.name) {
      updateData["guild_info.name"] = updates.name;
    }
    if (updates.rank !== undefined) {
      updateData["guild_info.rank"] = updates.rank;
    }

    await User.updateOne({ uu_id: guild.member.leader.uid }, { $set: updateData });

    for (const sub of guild.member.sub) {
      await User.updateOne({ uu_id: sub.uid }, { $set: updateData });
    }

    for (const normal of guild.member.normal) {
      await User.updateOne({ uu_id: normal.uid }, { $set: updateData });
    }
  }

  return guild;
};



export const getMemberList = async (gid: string) => {
  const guild = await Guild.findOne({ gid });
  if (!guild) {
    return { memberList: [] };
  }

  return { memberList: guild.member };
};

export const sendChatMessage = async (
  uid: string,
  gid: string,
  message: string,
  characterName: string
) => {
  const user = await User.findOne({ uu_id: uid });
  if (!user || user.guild_info?.gid !== gid || user.guild_info?.is_guild === 0) {
    throw new Error("You are not in any guild");
  }

  const guild = await Guild.findOne({ gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  const chatMessage = {
    uid,
    character_name: characterName,
    message,
    timestamp: Date.now(),
  };

  guild.chat_messages.push(chatMessage);

  if (guild.chat_messages.length > 100) {
    const toRemove = guild.chat_messages.length - 100;
    guild.chat_messages.splice(0, toRemove);
  }

  guild.updated = Date.now();
  await guild.save();

  return chatMessage;
};

export const getChatMessages = async (uid: string) => {
  const user = await User.findOne({ uu_id: uid });
  if (!user || !user.guild_info?.gid || user.guild_info?.is_guild === 0) {
    throw new Error("You are not in any guild");
  }

  const guild = await Guild.findOne({ gid: user.guild_info.gid });
  if (!guild) {
    throw new Error("Guild not found");
  }

  const messages = [...guild.chat_messages].reverse();
  
  return messages;
};