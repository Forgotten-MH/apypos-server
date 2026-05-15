import { Request, Response } from "express";

import mongoose from "mongoose";
import { IP } from "../../../config.js";
import Room from "../../../model/room.js";
import User from "../../../model/user.js";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers.js";

const server = "http://" + IP + "/";

export const roomReserve = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const existingRoom = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] } 
    });
    
    if (existingRoom) {
      console.log(`User ${user.user_id} already in room ${existingRoom.room_id}, returning existing room info`);
      const data = {
        url: server,
        rooms: existingRoom.toRoomInfo()
      };
      return encryptAndSend(data, res, req);
    }

    const roomData = {
      host_id: user.user_id,
      host_name: user.character_name,
      room_name: req.body.room_name || `${user.character_name}的房间`,
      quest_id: req.body.quest_id,
      quest_name: req.body.quest_name || "",
      auto_flag: req.body.auto_flag || 0,
      quick_match: req.body.quick_match || 0,
      kick: req.body.kick || 0,
      restart: req.body.restart || 0,
      tag: req.body.tag || 0,
      max_members: req.body.max_members || 4,
      is_private: req.body.is_private || false,
      description: req.body.description || "",
      server_url: server,
      type: req.body.type || 1,
      reserve_members: req.body.reserve_members || []
    };

    const room = await Room.createRoom(roomData);
    
    room.addMember(user.user_id || "", user.character_name || "", user.game_id || "");
    await room.save();

    console.log(`[Room Reserve] Created room ${room.room_id} for user ${user.user_id}`);
    console.log(`[Room Reserve] Room details: Quest=${room.quest_id}, Phase=${room.phase}, Members=${room.member_count}/${room.max_members}, Locked=${room.is_locked}, Private=${room.is_private}`);

    const data = {
      url: server,
      rooms: room.toRoomInfo()
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room reserve error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};
export const roomReserveJoin = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const existingRoom = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] }
    });
    
    if (existingRoom) {
      return encryptAndSend({}, res, req, 4001); // Already in a room
    }

    const room = await Room.findOne({ room_id: req.body.room_id });
    if (!room) {
      return encryptAndSend({}, res, req, 4002); // Room not found
    }

    if (room.is_locked) {
      return encryptAndSend({}, res, req, 4003); // Room is locked
    }

    if (room.is_full) {
      return encryptAndSend({}, res, req, 4004); // Room is full
    }

    if (room.phase !== 0) {
      return encryptAndSend({}, res, req, 4005); // Room not in waiting phase
    }

    await room.addMember(user.user_id || "", user.character_name || "", user.game_id || "");
    await room.save();

    console.log(`[Room Reserve Join] User ${user.user_id} joined room ${room.room_id}`);
    console.log(`[Room Reserve Join] Room details: Quest=${room.quest_id}, Phase=${room.phase}, Members=${room.member_count}/${room.max_members}`);

    const data = {
      rooms: room.toRoomInfo()
    };
    
    console.log(`[Room Reserve Join] Returning room info to client:`, JSON.stringify(data, null, 2));
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room reserve join error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomSearch = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    console.log(`[Room Search] User ${user.user_id} searching rooms with params:`, req.body);

    const searchConditions: any = {
      phase: 0, 
      is_locked: false,
      is_private: false
    };

    if (req.body.quest_id) {
      searchConditions.quest_id = req.body.quest_id;
    }


    console.log(`[Room Search] Search conditions:`, searchConditions);

    const rooms = await Room.find({
      ...searchConditions,
      $expr: { $lt: ['$member_count', '$max_members'] }
    })
      .sort({ created_at: -1 })
      .limit(req.body.limit || 20);

    console.log(`[Room Search] Found ${rooms.length} rooms`);

    const data = {
      rooms: rooms.map(room => room.toRoomInfo())
    };
    
    console.log(`[Room Search] Returning ${rooms.length} rooms to user ${user.user_id}`);
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room search error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};
export const roomJoin = async (req: Request, res: Response) => {
  try {
    console.log(`[Room Join] Request received - session_id: ${req.body.session_id}, room_id: ${req.body.room_id}`);
    
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      console.log(`[Room Join] User not found for session: ${req.body.session_id}`);
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    console.log(`[Room Join] User authenticated: ${user.user_id} (${user.character_name})`);

    const existingRoom = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] }
    });
    
    if (existingRoom) {
      console.log(`[Room Join] User ${user.user_id} already in room ${existingRoom.room_id}`);
      return encryptAndSend({}, res, req, 4001); // Already in a room
    }

    const room = await Room.findOne({ room_id: req.body.room_id });
    if (!room) {
      console.log(`[Room Join] Room not found: ${req.body.room_id}`);
      return encryptAndSend({}, res, req, 4002); // Room not found
    }
    
    console.log(`[Room Join] Found room ${room.room_id}: Phase=${room.phase}, Locked=${room.is_locked}, Members=${room.member_count}/${room.max_members}`);

    if (room.is_locked) {
      return encryptAndSend({}, res, req, 4003); // Room is locked
    }

    if (room.is_full) {
      return encryptAndSend({}, res, req, 4004); // Room is full
    }

    if (room.phase !== 0) {
      return encryptAndSend({}, res, req, 4005); // Room not in waiting phase
    }

    await room.addMember(user.user_id || "", user.character_name || "", user.game_id || "");
    await room.save();

    console.log(`[Room Join] User ${user.user_id} successfully joined room ${room.room_id}`);
    console.log(`[Room Join] Room now has ${room.member_count}/${room.max_members} members`);

    const data = {
      rooms: room.toRoomInfo()
    };

    console.log(`[Room Join] Returning room info to client:`, JSON.stringify(data, null, 2));
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room join error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomQuick = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const existingRoom = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] }
    });
    
    if (existingRoom) {
      console.log(`User ${user.user_id} already in room ${existingRoom.room_id}, returning existing room info`);
      const data = {
        rooms: existingRoom.toRoomInfo()
      };
      return encryptAndSend(data, res, req);
    }

    const searchConditions: any = {
      phase: 0,
      is_locked: false,
      is_private: false,
      quick_match: 1 
    };

    if (req.body.quest_id) {
      searchConditions.quest_id = req.body.quest_id;
    }

    if (req.body.tag !== undefined) {
      searchConditions.tag = req.body.tag;
    }

    const room = await Room.findOne({
      ...searchConditions,
      $expr: { $lt: ['$member_count', '$max_members'] }
    })
      .sort({ created_at: -1 });

    if (!room) {
      const roomData = {
        host_id: user.user_id,
        host_name: user.character_name,
        room_name: req.body.name || `${user.character_name}的快速房间`,
        quest_id: req.body.quest_id,
        auto_flag: req.body.auto_flag || 0,
        quick_match: 1,
        kick: req.body.kick || 0,
        restart: req.body.restart || 0,
        tag: req.body.tag || 0,
        max_members: req.body.max_members || 4,
        server_url: server,
        type: req.body.type || 1,
        reserve_members: req.body.reserve_members || []
      };

      const newRoom = await Room.createRoom(roomData);
      newRoom.addMember(user.user_id || "", user.character_name || "", user.game_id || "");
      await newRoom.save();

      console.log(`[Room Quick] Created new room ${newRoom.room_id} for user ${user.user_id}`);
      console.log(`[Room Quick] Room details: Quest=${newRoom.quest_id}, Phase=${newRoom.phase}, Members=${newRoom.member_count}/${newRoom.max_members}`);

      const data = {
        rooms: newRoom.toRoomInfo()
      };

      encryptAndSend(data, res, req);
    } else {
      console.log(`[Room Quick] User ${user.user_id} joining existing room ${room.room_id}`);
      room.addMember(user.user_id || "", user.character_name || "", user.game_id || "");
      await room.save();

      console.log(`[Room Quick] Joined room ${room.room_id}, now has ${room.member_count}/${room.max_members} members`);

      const data = {
        rooms: room.toRoomInfo()
      };

      encryptAndSend(data, res, req);
    }
  } catch (error) {
    console.error("Room quick match error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomGet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    let room = null;

    if (req.body.room_id) {
      room = await Room.findOne({ room_id: req.body.room_id });
    }

    if (!room) {
      room = await Room.findOne({
        "members.user_id": user.user_id,
        phase: { $in: [0, 1, 2, 3] }
      });
    }

    if (!room) {
      return encryptAndSend({}, res, req, 4002); // Not in any room
    }

    const data = {
      check_join: 1,
      rooms: room.toRoomInfo()
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room get error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomCreate = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const existingRoom = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] } 
    });
    
    if (existingRoom) {
      console.log(`User ${user.user_id} already in room ${existingRoom.room_id}, returning existing room info`);
      const data = {
        rooms: existingRoom.toRoomInfo()
      };
      return encryptAndSend(data, res, req);
    }

    const roomData = {
      host_id: user.user_id,
      host_name: user.character_name,
      room_name: req.body.name || `${user.character_name}的房间`,
      quest_id: req.body.quest_id,
      quest_name: req.body.quest_name || "",
      auto_flag: req.body.auto_flag || 0,
      quick_match: req.body.quick_match || 0,
      kick: req.body.kick || 0,
      restart: req.body.restart || 0,
      tag: req.body.tag || 0,
      max_members: req.body.max_members || 4,
      is_private: req.body.is_private || false,
      is_locked: req.body.is_locked || false,
      description: req.body.description || "",
      server_url: server,
      type: req.body.type || 1,
      reserve_members: req.body.reserve_members || []
    };

    const room = await Room.createRoom(roomData);
    
    room.addMember(user.user_id || "", user.character_name || "", user.game_id || "");
    await room.save();

    console.log(`[Room Create] Created room ${room.room_id} for user ${user.user_id}`);
    console.log(`[Room Create] Room details: Quest=${room.quest_id}, Phase=${room.phase}, Members=${room.member_count}/${room.max_members}, Locked=${room.is_locked}, Private=${room.is_private}`);

    const data = {
      rooms: room.toRoomInfo()
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room create error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};
export const inviteList = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const data = {
      rooms: []
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Invite list error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomLeave = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    console.log(`[Room Leave] User ${user.user_id} attempting to leave room`);

    const room = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1, 2, 3] } 
    });

    if (!room) {
      return encryptAndSend({}, res, req, 4002); // Not in any room
    }

    const wasHost = room.host_id === user.user_id;
    const roomId = room.room_id;

    console.log(`[Room Leave] User ${user.user_id} ${wasHost ? '(HOST)' : '(MEMBER)'} leaving room ${roomId}`);

    room.removeMember(user.user_id || "");
    await room.save();

    if (room.phase === -1) {
      await Room.deleteOne({ room_id: roomId });
      console.log(`[Room Leave] Room ${roomId} deleted because ${wasHost ? 'host left' : 'room is empty'}`);
      
      const data = {
        message: wasHost ? "Room deleted - host left" : "Room deleted - room is empty",
        room_deleted: true,
        room_id: roomId
      };
      encryptAndSend(data, res, req);
    } else {
      console.log(`[Room Leave] User ${user.user_id} left room ${roomId}, ${room.member_count} members remaining`);
      
      const data = {
        message: "Successfully left room",
        room_deleted: false,
        room_id: roomId,
        remaining_members: room.member_count
      };
      encryptAndSend(data, res, req);
    }

  } catch (error) {
    console.error("Room leave error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomLock = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const { is_locked } = req.body;

    if (is_locked === undefined) {
      return encryptAndSend({}, res, req, 4006); // Missing required parameter
    }

    const room = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] }
    });

    if (!room) {
      return encryptAndSend({}, res, req, 4002); // Not in any room
    }

    if (room.host_id !== user.user_id) {
      return encryptAndSend({}, res, req, 4007); // Not the host
    }

    room.is_locked = is_locked;
    await room.save();

    console.log(`[Room Lock] Room ${room.room_id} ${is_locked ? 'locked' : 'unlocked'} by ${user.user_id}`);

    const data = {
      success: true,
      rooms: room.toRoomInfo()
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room lock error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomKick = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const { target_user_id } = req.body;

    if (!target_user_id) {
      return encryptAndSend({}, res, req, 4006); // Missing required parameter
    }

    const room = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] }
    });

    if (!room) {
      return encryptAndSend({}, res, req, 4002); // Not in any room
    }

    if (room.host_id !== user.user_id) {
      return encryptAndSend({}, res, req, 4007); // Not the host
    }

    if (target_user_id === user.user_id) {
      return encryptAndSend({}, res, req, 4008); // Cannot kick yourself
    }

    const targetMember = room.members.find((member: any) => member.user_id === target_user_id);
    if (!targetMember) {
      return encryptAndSend({}, res, req, 4009); // Target user not in room
    }

    room.removeMember(target_user_id);
    await room.save();

    console.log(`[Room Kick] User ${target_user_id} kicked from room ${room.room_id} by ${user.user_id}`);

    const data = {
      success: true,
      rooms: room.toRoomInfo()
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room kick error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const roomReady = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    const { is_ready } = req.body;

    if (is_ready === undefined) {
      return encryptAndSend({}, res, req, 4006); // Missing required parameter
    }

    const room = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1] }
    });

    if (!room) {
      return encryptAndSend({}, res, req, 4002); // Not in any room
    }

    room.setMemberReady(user.user_id || "", is_ready);
    await room.save();

    console.log(`[Room Ready] User ${user.user_id} ${is_ready ? 'ready' : 'not ready'} in room ${room.room_id}`);

    const data = {
      success: true,
      rooms: room.toRoomInfo()
    };
    
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("Room ready error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const memberInfo = async (req: Request, res: Response) => {
  try {
    const session_id = req.body.session_id || req.query.session_id;
    const sequence = req.body.sequence !== undefined ? req.body.sequence : req.query.sequence;

    const filter = { current_session: session_id };
    const user = await User.findOne(filter);
    if (!user) {
      console.log(`[MemberInfo] Authentication failed for session: ${session_id}`);
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }

    console.log(`[MemberInfo] Request from user ${user.user_id} (${user.character_name})`);

    const room = await Room.findOne({
      "members.user_id": user.user_id,
      phase: { $in: [0, 1, 2, 3] }
    });

    if (!room) {
      console.log(`[MemberInfo] User ${user.user_id} not in any room`);
      return encryptAndSend({}, res, req, 4002); // Not in any room
    }

    console.log(`[MemberInfo] Room ${room.room_id} found with ${room.members.length} members`);
    console.log(`[MemberInfo] Room members:`, room.members.map((m: any) => ({
      user_id: m.user_id,
      character_name: m.character_name,
      player_id: m.player_id
    })));

    const memberUserIds = room.members.map((member: any) => member.user_id);
    const memberUsers = await User.find({ user_id: { $in: memberUserIds } });

    console.log(`[MemberInfo] Found ${memberUsers.length} user records for ${memberUserIds.length} members`);

    const playerDetails = room.members.map((member: any, index: number) => {
      const userInfo = memberUsers.find(u => u.user_id === member.user_id);
      if (!userInfo) {
        console.log(`[MemberInfo] ⚠️ No user info found for member ${member.user_id}`);
        return null;
      }

      console.log(`[MemberInfo] Processing member ${index}: ${member.user_id} (${member.character_name})`);

      const selectedEquipSetIndex = userInfo.equipset?.selected_equip_set_index || 1;
      const selectedEquipSet = userInfo.equipset?.equip_sets?.find(
        (set: any) => set.index === selectedEquipSetIndex
      ) || userInfo.equipset?.equip_sets?.[0];

      const getEquipHash = (equipmentId: string | undefined, slotName: string): number => {
        if (!equipmentId || equipmentId === "NO_EQUIP") {
          console.log(`[MemberInfo]   ${slotName}: NO_EQUIP -> hash=0`);
          return 0;
        }
        const equipment = userInfo.box?.equipments?.find((e: any) => e.equipment_id === equipmentId);
        const hash = equipment?.mst_equipment_id || 0;
        console.log(`[MemberInfo]   ${slotName}: ${equipmentId} -> hash=${hash}`);
        return hash;
      };

      const useSocialEquip = userInfo.social_equip_sets?.[0]?.is_used || 0;
      const socialEquipSet: any = userInfo.social_equip_sets?.[0]?.knight || {};

      const playerDetail = {
        user_id: member.user_id,  
        name: member.character_name,  // character_name
        game_id: member.game_id,
        comment: userInfo.comment || "",
        created: Math.floor((userInfo as any).created_at?.getTime() / 1000) || 0,
        friend_at: 0,
        is_captomo: 0,
        is_friend: 0,
        last_access_at: Math.floor((userInfo as any).last_access_at?.getTime() / 1000) || 0,
        login_freq: 0,
        now: Math.floor(Date.now() / 1000),
        use_social_equip: useSocialEquip,
        
        guild_info: {
          gid: userInfo.guild_info?.gid || "",
          is_guild: userInfo.guild_info?.is_guild || 0,
          is_same: userInfo.guild_info?.is_same || 0,
          member_type: userInfo.guild_info?.member_type || 0,
          name: userInfo.guild_info?.name || "",
          rank: userInfo.guild_info?.rank || 0,
        },
        
        model_info: {
          face: userInfo.model_info?.face || 0,
          gender: userInfo.model_info?.gender || 0,
          hair: userInfo.model_info?.hair || 0,
          hair_color: userInfo.model_info?.hair_color || 0,
          inner: userInfo.model_info?.inner || 0,
          skin: userInfo.model_info?.skin || 0,
        },
        
        monument_info: {
          attack: userInfo.box?.monument?.mlv?.atk || 0,
          auto_play: 0,
          defence: userInfo.box?.monument?.mlv?.def || 0,
          hp: userInfo.box?.monument?.mlv?.hp || 0,
          hunter_rank: userInfo.box?.monument?.hr || 0,
          sp: userInfo.box?.monument?.mlv?.sp || 0,
        },
        
        equip_arm: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.arm?.equipment_id, "ARM"),  // offset 86
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_body: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.body?.equipment_id, "BODY"),  // offset 89
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_head: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.head?.equipment_id, "HEAD"),  // offset 92
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_leg: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.leg?.equipment_id, "LEG"),  // offset 95
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_secret_weapon: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.secret_weapon?.equipment_id, "SECRET_WEAPON"),
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_waist: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.waist?.equipment_id, "WAIST"),  // offset 98
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_weapon: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.weapon?.equipment_id, "WEAPON"),
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        equip_talisman: {
          equip_info: {
            hash: getEquipHash(selectedEquipSet?.talisman?.equipment_id, "TALISMAN"),
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },
        
        social_equip: {
          social_arm: {
            equipment_id: socialEquipSet.social_arm?.equipment_id || "NO_EQUIP",
            mst_equipment_id: socialEquipSet.social_arm?.mst_equipment_id || 0,
          },
          social_body: {
            equipment_id: socialEquipSet.social_body?.equipment_id || "NO_EQUIP",
            mst_equipment_id: socialEquipSet.social_body?.mst_equipment_id || 0,
          },
          social_head: {
            equipment_id: socialEquipSet.social_head?.equipment_id || "NO_EQUIP",
            mst_equipment_id: socialEquipSet.social_head?.mst_equipment_id || 0,
          },
          social_leg: {
            equipment_id: socialEquipSet.social_leg?.equipment_id || "NO_EQUIP",
            mst_equipment_id: socialEquipSet.social_leg?.mst_equipment_id || 0,
          },
          social_waist: {
            equipment_id: socialEquipSet.social_waist?.equipment_id || "NO_EQUIP",
            mst_equipment_id: socialEquipSet.social_waist?.mst_equipment_id || 0,
          },
        },
        
        title: {
          mst_title_id: 0,
        },
      };

      console.log(`[MemberInfo] ✓ Completed processing member ${index}: user_id=${playerDetail.user_id}`);
      return playerDetail;
    }).filter(Boolean);

    console.log(`[MemberInfo] Successfully built ${playerDetails.length} player_details`);
    console.log(`[MemberInfo] Player details summary:`, playerDetails.map((p: any) => ({
      user_id: p.user_id,
      name: p.name,
      equip_arm_hash: p.equip_arm.equip_info.hash,
      equip_body_hash: p.equip_body.equip_info.hash,
      equip_head_hash: p.equip_head.equip_info.hash
    })));

    const data = {
      free: [],
      group: [],
      order: room.members.map((m: any) => m.user_id),
      phase: room.phase,
      player_details: playerDetails,
      reserve: room.reserve_members || [],
      reserve_order: [],
      sequence: sequence,
    };
    
    console.log(`[MemberInfo] Sending response with ${playerDetails.length} player_details`);
    encryptAndSend(data, res, req);
  } catch (error) {
    console.error("[MemberInfo] Error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};


export const groupJoin = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }
    return encryptAndSend({}, res, req); 
  }
  catch (error) {
    console.error("Group join error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};

export const groupLeave = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const user = await User.findOne(filter);
    if (!user) {
      return encryptAndSend({}, res, req, 2004); // Not authenticated
    }
    return encryptAndSend({}, res, req); 
  }
  catch (error) {
    console.error("Group leave error:", error);
    encryptAndSend({}, res, req, 5000); // Server error
  }
};
