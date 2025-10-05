import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import { IP } from "../../../config";
const server = "http://" + IP + "/";

export const roomReserve = (req: Request, res: Response) => {
  const data = {
    rooms: {
      _id: "1",
      auto_flag: 0,
      created: Math.floor(Date.now() / 1000),
      host_id: "123",
      hose_name: "name",
      is_locked: 0,
      kick: 0,
      member_count: 1,
      members: ["member1"],
      name: "test_name",
      phase: 0,
      quest_id: req.body.quest_id,
      quick_match: req.body.quick_match,
      reserve_members: req.body.reserve,
      restart: req.body.restart,
      room_id: 0,
      server_url: server,
      tag: 0,
      type: 1,
    },
  };
  encryptAndSend(data, res, req);
};
export const roomReserveJoin = (req: Request, res: Response) => {
  const data = {
    rooms: {
      _id: "1",
      auto_flag: 0,
      created: Math.floor(Date.now() / 1000),
      host_id: "123",
      hose_name: "name",
      is_locked: 0,
      kick: 0,
      member_count: 1,
      members: ["member1"],
      name: "test_name",
      phase: 0,
      quest_id: req.body.quest_id,
      quick_match: req.body.quick_match,
      reserve_members: req.body.reserve,
      restart: req.body.restart,
      room_id: 0,
      server_url: server,
      tag: 0,
      type: 1,
    },
  };
  encryptAndSend(data, res, req);
};

export const roomSearch = (req: Request, res: Response) => {
  const members = ["Rsey", "Rse1y"];
  const data = {
    rooms: [
      {
        _id: "1",
        auto_flag: req.body.auto_flag,
        created: Math.floor(Date.now() / 1000),
        host_id: "123",
        hose_name: "Rsey",
        is_locked: 0,
        kick: req.body.kick,
        member_count: members.length,
        members: members,
        name: "Rsey",
        phase: 0,
        quest_id: req.body.quest_id,
        quick_match: req.body.quick_match,
        reserve_members: members,
        restart: req.body.restart,
        room_id: 3,
        server_url: server,
        tag: 20,
        type: 4,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
export const roomJoin = (req: Request, res: Response) => {
  const data = {
    rooms: {
      _id: "1",
      auto_flag: req.body.auto_flag,
      created: Math.floor(Date.now() / 1000),
      host_id: "sdsdsdsdsdsdsdsdsdsdsdsds",
      hose_name: "name",
      is_locked: 0,
      kick: req.body.kick,
      member_count: 1,
      members: ["member1"],
      name: "test_name",
      phase: 6,
      quest_id: req.body.quest_id,
      quick_match: req.body.quick_match,
      reserve_members: req.body.reserve,
      restart: req.body.restart,
      room_id: req.body.room_id ? req.body.room_id : 1,
      server_url: server,
      tag: 0,
      type: 1,
    },



    
  };
  encryptAndSend(data, res, req);
};

export const roomQuick = (req: Request, res: Response) => {
  const data = {
    rooms: {
      _id: "1",
      auto_flag: req.body.auto_flag,
      created: Math.floor(Date.now() / 1000),
      host_id: "1",
      host_name: "name",
      is_locked: 0,
      kick: req.body.kick,
      member_count: 0,
      members: [],
      name: req.body.name,
      phase: 0,
      quest_id: req.body.quest_id,
      quick_match: req.body.quick_match,
      reserve_members: req.body.reserve,
      restart: req.body.restart,
      room_id: 1,
      server_url: server,
      tag: req.body.tag,
      type: 1,
    },
  };
  encryptAndSend(data, res, req);
};

export const roomGet = (req: Request, res: Response) => {
  const data = {
    check_join: 1,
    rooms: {
      _id: "1",
      auto_flag: 0,
      created: Math.floor(Date.now() / 1000),
      host_id: "sdsdsdsdsdsdsdsdsdsdsdsds",
      host_name: "name",
      is_locked: 0,
      kick: 0,
      member_count: 1,
      members: ["member"],
      name: "req.body.name",
      phase: 6,
      quest_id: req.body.quest_id,
      quick_match: 0,
      reserve_members: [],
      restart: 0,
      room_id: req.body.room_id,
      server_url: server,
      tag: 20,
      type: 1,
    },
  };
  encryptAndSend(data, res, req);
};

export const roomCreate = (req: Request, res: Response) => {
  const data = {
    rooms: {
      _id: "0",
      auto_flag: req.body.auto_flag,
      created: 0, //fine
      host_id: "sdsdsdsdsdsdsdsdsdsdsdsds",
      host_name: req.body.name.replace("の部屋", ""), //fine
      is_locked: 1, //fine
      kick: req.body.kick, //fine
      member_count: 1, //fine
      members: ["member"],
      name: req.body.name,
      phase: 7,
      quest_id: req.body.quest_id, //fine
      quick_match: req.body.quick_match, //fine
      reserve_members: req.body.reserve,
      restart: req.body.restart,
      room_id: 400000000, //fine
      server_url: server,
      tag: req.body.tag, //fine
      type: 1,
    },
  };
  encryptAndSend(data, res, req);
};
export const inviteList = (req: Request, res: Response) => {
  const data = {
    rooms: [
      {
        _id: "1",
        auto_flag: 0,
        created: Math.floor(Date.now() / 1000),
        host_id: "host_id",
        host_name: "host_name",
        is_locked: 0,
        kick: 0,
        member_count: 1,
        members: ["member"],
        phase: 0,
        quest_id: 3176462836,
        restart: 0,
        room_id: 12345,
        server_url: server,
        tag: 0,
        type: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const memberInfo = (req: Request, res: Response) => {
  const data = {
    free: [], //numbers
    group: [], //numbers
    order: [], //string
    phase: 6, //needs to be dynamic....
    player_details: [
      
      // {
      //   comment: "Let's hunt together!",
      //   created: 1717843200,
      //   friend_at: 1717000000,
      //   game_id: "GHUNT_123456789",
      //   is_captomo: 1,
      //   is_friend: 0,
      //   last_access_at: 1717839900,
      //   login_freq: 57,
      //   now: 1717845000,
      //   use_social_equip: -1,
      //   user_id: "user_987654321",
      //   name: "AceHunter",
      //   guild_info: {
      //     gid: "GUILD123",
      //     is_guild: 1,
      //     is_same: 0,
      //     member_type: 2,
      //     name: "Hunters United",
      //     rank: 7,
      //   },
      //   model_info: {
      //     face: 0,
      //     gender: 0,
      //     hair: 0,
      //     hair_color: 0,
      //     inner: 0,
      //     skin: 0,
      //   },
      //   monument_info: {
      //     attack: 0,
      //     auto_play: 0,
      //     defence: 0,
      //     hp: 0,
      //     hunter_rank: 0,
      //     sp: 0,
      //   },
      //   equip_arm: {
      //     equip_info: {
      //       hash: 3325982510,
      //       level: 1,
      //       potential: 1,
      //       skill_level: 1,
      //     },
      //   },

      //   equip_body: {
      //     equip_info: {
      //       hash: 1801022340,
      //       level: 1,
      //       potential: 1,
      //       skill_level: 1,
      //     },
      //   },

      //   equip_head: {
      //     equip_info: {
      //       hash: 69277598,
      //       level: 1,
      //       potential: 1,
      //       skill_level: 1,
      //     },
      //   },

      //   equip_leg: {
      //     equip_info: {
      //       hash: 3353202438,
      //       level: 1,
      //       potential: 1,
      //       skill_level: 1,
      //     },
      //   },

      //   equip_secret_weapon: {
      //     equip_info: {
      //       hash: 2006810019,
      //       level: 1,
      //       potential: 1,
      //       skill_level: 1,
      //     },
      //   },
      //   // equip_talisman: {
      //   //   equip_info: {
      //   //     hash: 667788990011223,
      //   //     level: 5,
      //   //     potential: 3,
      //   //     skill_level: 2,
      //   //   },
      //   //   is_awake: 1,
      //   //   is_enable: 1,
      //   // },
      //   social_equip: {
      //     social_arm: {
      //       equipment_id: "NO_EQUIP",
      //       mst_equipment_id: 0,
      //     },
      //     social_body: {
      //       equipment_id: "NO_EQUIP",
      //       mst_equipment_id: 0,
      //     },
      //     social_head: {
      //       equipment_id: "NO_EQUIP",
      //       mst_equipment_id: 0,
      //     },
      //     social_leg: {
      //       equipment_id: "NO_EQUIP",
      //       mst_equipment_id: 0,
      //     },
      //     social_waist: {
      //       equipment_id: "NO_EQUIP",
      //       mst_equipment_id: 0,
      //     },
      //   },
      //   title: {
      //     mst_title_id: 4,
      //   },
      // },
    ],
    reserve: [], //numbers
    reserve_order: [], //strings
    sequence: req.body.sequence,
  };
  encryptAndSend(data, res, req);
};
