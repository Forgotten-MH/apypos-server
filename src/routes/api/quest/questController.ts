// Quest Error Codes
// 10001,10002,10003,10005 Failed to get Quest Info other error codes
//10000 Quest Error
//10004 The selected quest is out of session or does not exist
//10006 The quest is already in progress
//10007 Quest not unlocked
import path from "path";

import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";
import Event from "../../../model/events";
import AssualtEvents from "../../../model/events/assualts";

const full_island = require(
  path.resolve(__dirname, "../../../json/full_enabled_state.json")
);

import { readFile } from "fs/promises";
import QuestSheet from "../../../model/questSheet";
import { enrichEvent } from "../../../model/events/utils";
import M16Events from "../../../model/events/m16";
import ScoreEvents from "../../../model/events/score";
import StandingEvents from "../../../model/events/standing";
import TicketEvents from "../../../model/events/tickets";
import TourEvents from "../../../model/events/tour";

export const questProgress = (req: Request, res: Response) => {
  const data = {
    continue_num: 0,
    is_16multi: 0,
    is_multi_play: 0,
    is_progress: -1,
    mst_quest_id: 0,
    quest_instance_id: 0,
    result_step: 0,
  };
  encryptAndSend(data, res, req);
};

export const questResultEnd = (req: Request, res: Response) => {
  const data = {
    //empty in ida
  };
  encryptAndSend(data, res, req);
};

export const eventTicketFree = (req: Request, res: Response) => {
  const data = {
    infos: [
      {
        free_group_id: 1,
        max_free_count: 10,
        remain_free_count: 10,
        text: "TICKET FREE",
      },
    ],
    quests: [
      {
        free_group_id: 1,
        mst_quest_id: 2546022365,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
export const eventNormalStart = async (req: Request, res: Response) => {
  /*
  Request Body:
 {
        "session_id": "4466edfe-4191-4a72-968d-7cc3a06ff3cb",
        "block_seq": 46,
        "app_ver": "09.03.06",
        "res_ver": 282,
        "atk": 105,
        "def": 85,
        "increase": 0,
        "is_auto": 0,
        "kyokuti_field_id_1": -1,
        "kyokuti_field_id_2": -1,
        "kyokuti_field_value_1": -1,
        "kyokuti_field_value_2": -1,
        "mst_event_node_id": 1587403803,
        "mst_quest_id": 2974642427,
        "multi_room_id": 0,
        "otomo": [],
        "partner_id": "",
        "power_up": 0,
        "select_fix_equipment_idx": -1
}
  */

  const data = {
    instance_data: {
      block_list: [],
      bomb_lot_no: [
        {
          bomb_lottery: [{ bomb_id: 0, weight: 0 }],
        },
      ],
      enable_limited_skill_id_list: [],
      enable_partner_limited_skill_id_list: [],
      enable_talisman: 0,
      enable_talisman_partner: 0,
      enemy_point_list: [
        {
          mst_enemy_id: 1618895799,
          point: 0,
        },
      ],
      instance_id: 0,
      mission_message: "start",
      mst_quest_id: req.body.mst_quest_id,
      multi_leave_check_time: 0,
      point_info: {
        armor_skill_value: 0,
        campaign_value: 0,
        get_point: 0,
        guild_bingo_bonus: 0,
        guild_total_point: 0,
        m16_get_point: 0,
        mst_event_info_id: 2740334662,
        mst_event_point_id: 2992123464,
        now_point: 0,
        total_point: 0,
      },
      power_up: 0,
      select_fix_equipment_idx: 0,
      subtargets: [{ instance_id: 0, mst_subtarget_id: 0 }],
    },
  };

  const quest = await QuestSheet.findOne({ mQuestID: req.body.mst_quest_id });
  const blocks = quest?.mBlocks || [];

  if (blocks.length === 0) {
    return encryptAndSend({}, res, req, 10001);
  }
  blocks.forEach((block, index) => {
    data.instance_data.block_list.push({
      block_idx: index + 1,
      block_instance_list: [{ instance_id: 0, serial_no: 1 }],
      drop_list: [
        //   {
        //    item_list: {
        //   },
        //   serial_no: 0
        // }
      ],
      instance_id: 0,
      is_insert: 0,
      is_raid: 0,
      mst_block_id: block,
      repop_list: [{ amount: 0, serial_no: 0 }],
    });
  });

  encryptAndSend(data, res, req);
};
export const eventTicketStart = async (req: Request, res: Response) => {
  /*
  Request Body:
  {
  session_id: 'b647115b-47cc-4fd8-a96e-15897f531e59',
  block_seq: 71,
  app_ver: '09.03.06',
  res_ver: 282,
  atk: 102,
  def: 0,
  increase: 0,
  is_auto: 0,
  mst_quest_id: 248014439,
  multi_room_id: 0,
  otomo: [ 'OT_OTOMO_CHAR_ID_118', 'OT_OTOMO_CHAR_ID_119' ],
  partner_id: 'PT_CHAR_ID_001',
  power_up: 0
}
  */
  const startedQuest = req.body.mst_quest_id;

  const quest = await QuestSheet.findOne({ mQuestID: startedQuest });
  const data = {
    instance_data: {
      block_list: [],
      bomb_lot_no: [
        {
          bomb_lottery: [{ bomb_id: 0, weight: 0 }],
        },
      ],
      enable_limited_skill_id_list: [],
      enable_partner_limited_skill_id_list: [],
      enable_talisman: 0,
      enable_talisman_partner: 0,
      enemy_point_list: [
        {
          mst_enemy_id: 1618895799,
          point: 0,
        },
      ],
      instance_id: 0,
      mission_message: "start",
      mst_quest_id: req.body.mst_quest_id,
      multi_leave_check_time: 0,
      point_info: {
        armor_skill_value: 0,
        campaign_value: 0,
        get_point: 0,
        guild_bingo_bonus: 0,
        guild_total_point: 0,
        m16_get_point: 0,
        mst_event_info_id: 2740334662,
        mst_event_point_id: 2992123464,
        now_point: 0,
        total_point: 0,
      },
      power_up: 0,
      select_fix_equipment_idx: 0,
      subtargets: [{ instance_id: 0, mst_subtarget_id: 0 }],
    },
  };
  //Get Quest: From Hash -> QuestName req.body.mst_quest_id
  //Split Quest Name
  const blocks = quest.mBlocks;
  if (blocks.length === 0) {
    return encryptAndSend({}, res, req, 10001);
  }
  blocks.forEach((block, index) => {
    data.instance_data.block_list.push({
      block_idx: index + 1,
      block_instance_list: [{ instance_id: 0, serial_no: 1 }],
      drop_list: [
        //   {
        //    item_list: {
        //   },
        //   serial_no: 0
        // }
      ],
      instance_id: 0,
      is_insert: 0,
      is_raid: 0,
      mst_block_id: block,
      repop_list: [{ amount: 0, serial_no: 0 }],
    });
  });

  encryptAndSend(data, res, req);
};
export const eventScoreStart = async (req: Request, res: Response) => {
  /*
  Request Body:
 {
        "session_id": "4466edfe-4191-4a72-968d-7cc3a06ff3cb",
        "block_seq": 46,
        "app_ver": "09.03.06",
        "res_ver": 282,
        "atk": 105,
        "def": 85,
        "increase": 0,
        "is_auto": 0,
        "kyokuti_field_id_1": -1,
        "kyokuti_field_id_2": -1,
        "kyokuti_field_value_1": -1,
        "kyokuti_field_value_2": -1,
        "mst_event_node_id": 1587403803,
        "mst_quest_id": 2974642427,
        "multi_room_id": 0,
        "otomo": [],
        "partner_id": "",
        "power_up": 0,
        "select_fix_equipment_idx": -1
}
  */
  const startedQuest = req.body.mst_quest_id;

  const quest = await QuestSheet.findOne({ mQuestID: startedQuest });
  const data = {
    instance_data: {
      block_list: [],
      bomb_lot_no: [
        {
          bomb_lottery: [{ bomb_id: 0, weight: 0 }],
        },
      ],
      enable_limited_skill_id_list: [],
      enable_partner_limited_skill_id_list: [],
      enable_talisman: 0,
      enable_talisman_partner: 0,
      enemy_point_list: [
        {
          mst_enemy_id: 1618895799,
          point: 0,
        },
      ],
      instance_id: 0,
      mission_message: "start",
      mst_quest_id: req.body.mst_quest_id,
      multi_leave_check_time: 0,
      point_info: {
        armor_skill_value: 0,
        campaign_value: 0,
        get_point: 0,
        guild_bingo_bonus: 0,
        guild_total_point: 0,
        m16_get_point: 0,
        mst_event_info_id: 2740334662,
        mst_event_point_id: 2992123464,
        now_point: 0,
        total_point: 0,
      },
      power_up: 0,
      select_fix_equipment_idx: 0,
      subtargets: [{ instance_id: 0, mst_subtarget_id: 0 }],
    },
  };
  //Get Quest: From Hash -> QuestName req.body.mst_quest_id
  //Split Quest Name
  const blocks = quest.mBlocks;
  if (blocks.length === 0) {
    return encryptAndSend({}, res, req, 10001);
  }
  blocks.forEach((block, index) => {
    data.instance_data.block_list.push({
      block_idx: index + 1,
      block_instance_list: [{ instance_id: 0, serial_no: 1 }],
      drop_list: [
        //   {
        //    item_list: {
        //   },
        //   serial_no: 0
        // }
      ],
      instance_id: 0,
      is_insert: 0,
      is_raid: 0,
      mst_block_id: block,
      repop_list: [{ amount: 0, serial_no: 0 }],
    });
  });

  encryptAndSend(data, res, req);
};
export const eternalStart = async (req: Request, res: Response) => {
  /*
  Request Body:
 {
                                                                                                                                                                                                                                                                         
  session_id: '70507a54-28c8-405d-ba53-c6eca57a1dad',                                                                                                                                                                                                                                      
  block_seq: 46,
  app_ver: '09.03.06',                                                                                                                                                                                                                                                                     
  res_ver: 282,                                                                                                                                                                                                                                                                            
  atk: 105,
  def: 85,
  increase: 0,
  is_auto: 0,                                                                                                                                                                                                                                                                              
  mst_eternal_node_id: 517825253,
  mst_quest_id: 2002926758,                                                                                                                                                                                                                                                                
  otomo: [],                                                                                                                                                                                                                                                                               
  partner_id: '',
  power_up: 0                                                                                                                                                                                                                                                                              

}
  */
  const startedQuest = req.body.mst_quest_id;

  const quest = await QuestSheet.findOne({ mQuestID: startedQuest });
  const data = {
    instance_data: {
      block_list: [],
      bomb_lot_num: [],
      bomb_lottery: [],

      enable_limited_skill_id_list: [],
      enable_partner_limited_skill_id_list: [],
      enable_talisman: 0,
      enable_talisman_partner: 0,
      enemy_point_list: [],
      instance_id: 0,
      mission_message: "start",
      mst_quest_id: req.body.mst_quest_id,
      multi_leave_check_time: 0,
      point_info: {
        armor_skill_value: 0,
        campaign_value: 0,
        get_point: 0,
        guild_bingo_bonus: 0,
        guild_total_point: 0,
        m16_get_point: 0,
        mst_event_info_id: 2740334662,
        mst_event_point_id: 2992123464,
        now_point: 0,
        total_point: 0,
      },
      power_up: 0,
      select_fix_equipment_idx: 0,
      subtargets: [{ instance_id: 0, mst_subtarget_id: 0 }],
    },
  };
  const blocks = quest.mBlocks;
  if (blocks.length === 0) {
    return encryptAndSend({}, res, req, 10001);
  }
  blocks.forEach((block, index) => {
    data.instance_data.block_list.push({
      block_idx: index + 1,
      block_instance_list: [
        // { instance_id: 0, serial_no: 1 }
      ],
      drop_list: [],
      instance_id: 0,
      is_insert: 0,
      is_raid: 0,
      mst_block_id: block,
      repop_list: [
        // { amount: 0, serial_no: 0 }
      ],
    });
  });
  encryptAndSend(data, res, req);
};

export const eventListAll = async (req: Request, res: Response) => {
  //This is the multiplayer tab
  //Big Nodes
  // Easy	90000
  // Limited Event	90001
  // Polar Assualt	90002
  // Hard	90003
  // Forbidden	90004
  // Material Tour	90005
  // Past Quests	90006
  // Unk	90037
  //middle nodes

  const event = (await Event.findOne({}).exec()).toObject();
  const data = {
    big_node_order_array: event.big_node_order_array,
    event_list: {
      assault: enrichEvent(
        (await AssualtEvents.find().exec()).map((d) =>
          d.toObject({ getters: true })
        )
      ),
      m16: enrichEvent(
        (await M16Events.find().exec()).map((d) =>
          d.toObject({ getters: true })
        )
      ),
      score: enrichEvent(
        (await ScoreEvents.find().exec()).map((d) =>
          d.toObject({ getters: true })
        )
      ), //Collabration Events Type Takes SCORE prefixed events and quests
      standing: enrichEvent(
        (await StandingEvents.find().exec()).map((d) =>
          d.toObject({ getters: true })
        )
      ),
      ticket: await TicketEvents.find({}).exec(), //Ticket prefixed quests
      tour: enrichEvent(
        (await TourEvents.find().exec()).map((d) =>
          d.toObject({ getters: true })
        )
      ),
    },
    next_day_start: event.next_day_start,
    next_latest_node_infos: event.next_latest_node_infos,
    now_latest_node_info_remain: event.now_latest_node_info_remain,
    now_latest_node_infos: event.now_latest_node_infos,
  };

  encryptAndSend(data, res, req);
  console.log(data.event_list.score)
};

export const eternalAll = (req: Request, res: Response) => {
  //ukyu_0010000 - Eternal Island (Argo)
  //ukyu_0020000 - Wind & Thunder (Kirin)
  //ukyu_0030000 - Explosion (Brachydios)
  const data = {
    banner_path: "ukyu_00100",
    eternal_collection_list: [
      // {
      //   mst_collection_id: 2416931437,
      //   state: 1,
      // },
    ],
    eternal_nodes: [
      {
        banner_path: "ukyu_00100",
        eternal_quest_list: [
          {
            clear_time: 0,
            idx: 0,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2574015882,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 1,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 6622256,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 2,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2002926758,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 3,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 3909527813,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 4,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2650904979,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 5,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 118016041,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 6,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 1880094911,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 7,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 3769689390,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 8,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2545407416,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 9,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 4151336029,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 10,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2155310283,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 11,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 427703665,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 12,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 1853427175,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 13,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 4028471364,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 14,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2266671314,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 15,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 504625512,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 16,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 1762970110,
            quest_subtargets: [],
            state: 0,
          },
          {
            // clear_time: 0,
            idx: 17,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 4188787823,
            quest_subtargets: [],
            state: 0,
          },
          {
            // clear_time: 0,
            idx: 18,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 2393695481,
            quest_subtargets: [],
            state: 0,
          },
          {
            clear_time: 0,
            idx: 19,
            is_collection_quest: 0,
            is_enable: 1,
            mst_quest_id: 3697086366,
            quest_subtargets: [],
            state: 0,
          },
        ],
        mst_eternal_node_id: 1,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const islandStart = async (req: Request, res: Response) => {
  const startedQuest = req.body.mst_quest_id;
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);

  const quest = await QuestSheet.findOne({ mQuestID: startedQuest });

  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  let cleared_quests = doc.cleared_quests;

  const questExists = cleared_quests.some(
    (q) => q.mst_quest_id === startedQuest
  );

  if (!questExists) {
    console.log("Inserted Quest as seen");
    cleared_quests.push({ mst_quest_id: startedQuest });
  }

  const update = { cleared_quests: cleared_quests };

  // Await the update so you know it completed
  await User.findOneAndUpdate(filter, update, { new: true });
  const data = {
    instance_data: {
      block_list: [],
      bomb_lot_no: [
        {
          bomb_lottery: [{ bomb_id: 0, weight: 0 }],
        },
      ],
      enable_limited_skill_id_list: [],
      enable_partner_limited_skill_id_list: [],
      enable_talisman: 0,
      enable_talisman_partner: 0,
      enemy_point_list: [
        // {
        //   mst_enemy_id: 1618895799,
        //   point: 0,
        // },
      ],
      instance_id: 0,
      mission_message: "start",
      mst_quest_id: startedQuest,
      multi_leave_check_time: 0,
      point_info: {
        armor_skill_value: 0,
        campaign_value: 0,
        get_point: 0,
        guild_bingo_bonus: 0,
        guild_total_point: 0,
        m16_get_point: 0,
        mst_event_info_id: 2740334662,
        mst_event_point_id: 2992123464,
        now_point: 0,
        total_point: 0,
      },
      power_up: 0,
      select_fix_equipment_idx: 0,
      subtargets: [{ instance_id: 0, mst_subtarget_id: 0 }],
    },
  };

  const blocks = quest.mBlocks;
  if (blocks.length === 0) {
    return encryptAndSend({}, res, req, 10001);
  }
  blocks.forEach((block, index) => {
    data.instance_data.block_list.push({
      block_idx: index + 1,
      block_instance_list: [
        // { instance_id: 0, serial_no: 1 }
      ],
      drop_list: [],
      instance_id: 0,
      is_insert: 0,
      is_raid: 0,
      mst_block_id: block,
      repop_list: [
        // { amount: 0, serial_no: 0 }
      ],
    });
  });
  encryptAndSend(data, res, req);
};

export const islandEnd = async (req: Request, res: Response) => {
  //TODO update quest in cleared_quests with complete time
  const cleared_quest = req.body.mst_quest_id;
  const clearTime = req.body.clear_time;
  const filter = { current_session: req.body.session_id };
  const quest = await QuestSheet.findOne({ mQuestID: cleared_quest });
  console.log("Rewards:", quest.mRewardItemList);
  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  let cleared_quests = doc.cleared_quests;

  const questIndex = cleared_quests.findIndex(
    (q) => q.mst_quest_id === cleared_quest
  );

  if (questIndex === -1) {
    console.log("Inserted Quest as seen");
    cleared_quests.push({ mst_quest_id: cleared_quest, clear_time: clearTime });
  } else {
    console.log("Updated clear_time for existing quest");
    cleared_quests[questIndex].clear_time = clearTime;
  }

  const update = { cleared_quests: cleared_quests };

  // Await the update so you know it completed
  await User.findOneAndUpdate(filter, update, { new: true });
  const data = {
    advance_bingo_mission_ids: [],
    campaign_info: [
      //{mst_campaign_type_id:0,value:0}
    ],
    clear_bingo_mission_ids: [],
    clear_subtarget_ids: [],
    final_reward_info: {
      multiplier: 5, //Multiplyer on all rewards
      value: 2,
    },
    get_accum_reward_ids: [],
    get_guild_accum_reward_ids: [],
    get_loop_random_reward_ids: [],
    get_loop_reward_ids: [],
    get_mst_otomo_id: 2092467563,
    get_mst_partner_id: 507850012,
    increase_value: 7,
    is_pop_not_enough_zeny: 0, // could not auto synth due to lack of zeny?
    katamari_content_list: [
      // {
      //   elv:0,
      //   end_remain:0,
      //   is_awake:0,
      //   mst_equipment_id:0,
      //   prob_type_id:0,
      //   slv:0,
      //   start_remain:0,
      // }
    ],
    max_potential_equipments: [
      //"stingval"
    ],
    mst_part_id: 3815380063, //current
    open_list: {
      open_ocean: [
        /*{"mst_ocean_id":0}*/
      ],
      open_node: [
        /*{"mst_node_id":0}*/
      ],
      open_part: [
        //{mst_part_id:2053326309}
      ],
    },
    otomo_result: [
      //unk
      // {
      //   get_exp:10,
      //   mst_otomo_subskill_id:1355115484,
      //   otomo_id:"OT_OTOMO_CHAR_ID_001"
      // }
    ],
    partner_cap_list: [
      //unk
      // {
      //   level_cap_tier:0,
      //   mst_partner_id:0
      // }
    ],
    pop_list: [
      //Pops after quest reward screen
      {
        pop_id: 1,
        item_list: {
          materials: [{ amount: 6, mst_material_id: 1714092880 }],
        },
      },
    ],
    ranking_num: 1, //unk
    rewards: {
      luck_value: 4,
      upper_luck_value: 10,
      multi_reward: {
        item_list: {
          materials: [{ amount: 14, mst_material_id: 1714092880 }],
        },
      },
      pick_reward: {
        item_list: {
          materials: [{ amount: 10, mst_material_id: 1714092880 }],
        },
      },
      break_reward: {
        item_list: {
          materials: [{ amount: 3, mst_material_id: 1714092880 }],
        },
      },
      bingo_reward: {
        item_list: {
          materials: [{ amount: 22, mst_material_id: 1714092880 }],
        },
      },
      friend_reward: {
        //Hunting Friend and Hunting Group Reward
        item_list: {
          materials: [{ amount: 5, mst_material_id: 1714092880 }],
        },
      },
      lucky_reward: {
        item_list: {
          materials: [{ amount: 12, mst_material_id: 1714092880 }],
        },
      },
      gold_reward: {
        //Money Luck Skill
        item_list: {
          materials: [{ amount: 6, mst_material_id: 1714092880 }],
        },
      },
      enemy_drop_reward: {
        item_list: {
          materials: [{ amount: 4, mst_material_id: 1714092880 }],
        },
      },
      break_drop_reward: {
        item_list: {
          materials: [{ amount: 2, mst_material_id: 1714092880 }],
        },
      },

      //DOUBLE CHECK BELOW START
      //This is the main reward screen
      normal_reward: {
        other_list_add: [
          {
            idx: 1,
            is_katamari: 0,
            zeny: 1,
            value: 1,
            item_list: {
              materials: [{ amount: 6, mst_material_id: 1714092880 }],
            },
            //Uncomment to get flag
            extend: {
              item_list: {
                points: [
                  {
                    amount: 5,
                    mst_event_point_id: 3994654250,
                  },
                ],
              },
              zeny: 0,
            },
          },
          {
            idx: 2,
            is_katamari: 0,
            zeny: 1,
            value: 1,
            item_list: {
              materials: [{ amount: 6, mst_material_id: 1714092880 }],
            },
            //Uncomment to get flag
            // extend: {
            //   item_list: {
            //     materials: [{ amount: 5, mst_material_id: 1714092880 }],
            //   },
            // },
          },
          {
            idx: 3,
            is_katamari: 0,
            zeny: 1,
            value: 1,
            item_list: {
              materials: [{ amount: 6, mst_material_id: 1714092880 }],
            },
            //Uncomment to get flag
            // extend: {
            //   item_list: {
            //     materials: [{ amount: 5, mst_material_id: 1714092880 }],
            //   },
            // },
          },
          {
            idx: 4,
            is_katamari: 0,
            zeny: 1,
            value: 1,
            item_list: {
              materials: [{ amount: 6, mst_material_id: 1714092880 }],
            },
            //Uncomment to get flag
            // extend: {
            //   item_list: {
            //     materials: [{ amount: 5, mst_material_id: 1714092880 }],
            //   },
            // },
          },
        ],
        add_list: {
          line2: {
            is_open: 1,
            other_list: [
              {
                idx: 1,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
              {
                idx: 2,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
              {
                idx: 3,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
              {
                idx: 4,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
            ],
            price: 5,
          },
          line3: {
            is_open: 1,
            other_list: [
              {
                idx: 1,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
              {
                idx: 2,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
              {
                idx: 3,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
              {
                idx: 4,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
                //Uncomment to get flag
                // extend: {
                //   item_list: {
                //     materials: [{ amount: 3, mst_material_id: 1714092880 }],
                //   },
                // },
              },
            ],
            price: 5,
          },
        },
      },
      raid_reward: {
        item_list: {
          materials: [{ amount: 1, mst_material_id: 1714092880 }],
        },
      },
      point_info: {
        armor_skill_value: 2,
        campaign_value: 2,
        get_point: 2,
        guild_bingo_bonus: 2,
        guild_total_point: 2,
        m16_get_point: 2,
        mst_event_info_id: 2,
        mst_event_point_id: 2,
        now_point: 2,
        total_point: 2,
      },

      score_enemy_list: [
        //unk
        // {
        //   amount:4,
        //   mst_enemy_id:44,
        //   point:5,
        // }
      ],
      zeny: 30,
    },

    view_collection_list: [], ////unk
  };
  encryptAndSend(data, res, req);
};

// --- Types ---
type QuestRow = {
  mQuestID: string;
  mDayNight: string;
  [key: string]: string;
};

type NodeQuestRow = {
  mNodeHash: string;
  mQuestHash: string;
  isCollectionQuest: string;
  isKeyQuest: string;
  [key: string]: string;
};

type QuestSubtargetRow = {
  mQuestID: string;
  mSubTargetID: string;
  mDifficulty: string;
  mFixedItemTableID: string;
  [key: string]: string;
};

// Adjust based on your actual ocean/part/node structure
type QuestObject = {
  clear_time: number;
  is_collection_quest: 0 | 1;
  is_key_quest: 0 | 1;
  mst_quest_id: number;
  quest_subtargets: [];
  state: number;
};

type Node = {
  mst_node_id: number;
  day_quest_list?: QuestObject[];
  night_quest_list?: QuestObject[];
  [key: string]: any;
};

type Part = {
  node_list?: Node[];
  [key: string]: any;
};

type Ocean = {
  mst_ocean_id: number;
  part_list: Part[];
  [key: string]: any;
};

// --- CSV Parser ---
function parseCsv<T = Record<string, string>>(csv: string): T[] {
  const lines = csv.trim().split("\n");
  const headers = lines.shift()!.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, values[i]])) as T;
  });
}

// --- Main Function ---
export async function enrichOceanData(
  oceanData: Ocean[],
  cleared_quests
): Promise<Ocean[]> {
  // Load CSVs in parallel
  const [nodeQuestCsv, questDataCsv, questSubtargetCsv] = await Promise.all([
    readFile(
      path.resolve(
        __dirname,
        "../../../csv/oceans/parts/nodes/2-node-quests.csv"
      ),
      "utf8"
    ),
    readFile(path.resolve(__dirname, "../../../csv/questData.csv"), "utf8"),
    readFile(
      path.resolve(__dirname, "../../../csv/questSubtargetSet.csv"),
      "utf8"
    ),
  ]);

  // Parse CSVs
  const nodeQuests = parseCsv<NodeQuestRow>(nodeQuestCsv);
  const questRows = parseCsv<QuestRow>(questDataCsv);
  const subtargetRows = parseCsv<QuestSubtargetRow>(questSubtargetCsv);

  // Index quest data by quest ID
  const questMap = new Map<number, QuestRow>();
  for (const row of questRows) {
    const questID = Number(row.mQuestID);
    if (!isNaN(questID)) questMap.set(questID, row);
  }

  // Index subtargets by quest ID
  const subtargetMap = new Map<number, QuestSubtargetRow[]>();
  for (const row of subtargetRows) {
    const questID = Number(row.mQuestID);
    if (!isNaN(questID)) {
      if (!subtargetMap.has(questID)) subtargetMap.set(questID, []);
      subtargetMap.get(questID)!.push(row);
    }
  }

  // Index node quests by node hash
  const nodeQuestMap = new Map<number, NodeQuestRow[]>();
  for (const row of nodeQuests) {
    const nodeHash = Number(row.mNodeHash);
    if (!isNaN(nodeHash)) {
      if (!nodeQuestMap.has(nodeHash)) nodeQuestMap.set(nodeHash, []);
      nodeQuestMap.get(nodeHash)!.push(row);
    }
  }
  // Enrich ocean data
  let enrichedOcean = oceanData.map((ocean) => {
    const enrichedParts = ocean.part_list.map((part) => {
      if (!part.node_list) return { ...part };

      const enrichedNodes = part.node_list.map((node) => {
        const nodeID = Number(node.mst_node_id);
        if (isNaN(nodeID)) return { ...node };

        const nodeQuests = nodeQuestMap.get(nodeID) || [];
        const day_quest_list: QuestObject[] = [];
        const night_quest_list: QuestObject[] = [];

        for (const nq of nodeQuests) {
          const questID = Number(nq.mQuestHash);
          const quest = questMap.get(questID);
          if (!quest) continue;

          const clearedQuest = cleared_quests.find(
            (q) => q.mst_quest_id === questID
          );

          let state = 1; // default = NEW
          if (clearedQuest) {
            state = clearedQuest.clear_time != null ? 3 : 0; //clear 3 / 0 nothing
          }

          const clearTime = clearedQuest?.clear_time ?? 0;

          const isCollectionQuestFlag = nq.isCollectionQuest === "true" ? 1 : 0;

          const is_collection_quest = clearTime
            ? isCollectionQuestFlag === 1
              ? 0
              : 1 // invert if clearTime is truthy
            : isCollectionQuestFlag;

          const questObj: QuestObject = {
            clear_time: clearTime,
            is_collection_quest,
            is_key_quest: nq.isKeyQuest === "true" ? 1 : 0,
            mst_quest_id: questID,
            quest_subtargets: [],
            state: state,
          };

          const timeType = Number(quest.mDayNight);
          if (timeType === 1) {
            day_quest_list.push(questObj);
          } else if (timeType === 2) {
            night_quest_list.push(questObj);
          }
        }

        return {
          ...node,
          day_quest_list,
          night_quest_list,
        };
      });

      return {
        ...part,
        node_list: enrichedNodes,
      };
    });
    return {
      ...ocean,
      part_list: enrichedParts,
    };
  });
  return enrichedOcean;
}

export const islandMapAll = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  // let final_ocean = await enrichOceanData(doc.ocean_list.toObject());
  // console.log("FINAL",final_ocean)
  // const data = {
  //   ocean_list: final_ocean,
  // };

  let final_ocean = await enrichOceanData(
    doc.tutorial_step == 0xffff ? full_island : doc.ocean_list.toObject(),
    doc.cleared_quests
  );
  console.log("FINAL", final_ocean);
  const data = {
    ocean_list: final_ocean,
  };

  encryptAndSend(data, res, req);
};
