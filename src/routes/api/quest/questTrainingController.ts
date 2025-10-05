import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import { calcMstId } from "../../../services/defineService";
import User from "../../../model/user";
import Present from "../../../model/presents";
const getRewardItemByQuestId = (questId: number) => {
  switch (questId) {
    case calcMstId("TRAINING00001"):
      return {
        equipment_id: "WD_SWORD002",
        mst_equipment_id: calcMstId("WD_SWORD002"),
      };
    case calcMstId("TRAINING00002"):
      return {
        equipment_id: "WD_WSWORD002",
        mst_equipment_id: calcMstId("WD_WSWORD002"),
      };
    case calcMstId("TRAINING00003"):
      return {
        equipment_id: "WD_LSWORD2002",
        mst_equipment_id: calcMstId("WD_LSWORD2002"),
      };
    case calcMstId("TRAINING00004"):
      return {
        equipment_id: "WD_LSWORD002",
        mst_equipment_id: calcMstId("WD_LSWORD002"),
      };
    case calcMstId("TRAINING00005"):
      return {
        equipment_id: "WD_PIPE002",
        mst_equipment_id: calcMstId("WD_PIPE002"),
      };
    case calcMstId("TRAINING00006"):
      return {
        equipment_id: "WD_HAMMER002",
        mst_equipment_id: calcMstId("WD_HAMMER002"),
      };
    case calcMstId("TRAINING00007"):
      return {
        equipment_id: "WD_LANCE002",
        mst_equipment_id: calcMstId("WD_LANCE002"),
      };
    case calcMstId("TRAINING00008"):
      return {
        equipment_id: "WD_GUNLANCE002",
        mst_equipment_id: calcMstId("WD_GUNLANCE002"),
      };
    case calcMstId("TRAINING00009"):
      return {
        equipment_id: "WD_AXE002",
        mst_equipment_id: calcMstId("WD_AXE002"),
      };
    case calcMstId("TRAINING00010"):
      return {
        equipment_id: "WD_CHAXE002",
        mst_equipment_id: calcMstId("WD_CHAXE002"),
      };
    case calcMstId("TRAINING00011"):
      return {
        equipment_id: "WD_LBOWGUN002",
        mst_equipment_id: calcMstId("WD_LBOWGUN002"),
      };
    case calcMstId("TRAINING00012"):
      return {
        equipment_id: "WD_HBOWGUN002",
        mst_equipment_id: calcMstId("WD_HBOWGUN002"),
      };
    case calcMstId("TRAINING00013"):
      return {
        equipment_id: "WD_BOW034",
        mst_equipment_id: calcMstId("WD_BOW034"),
      };
    case calcMstId("TRAINING00014"):
      return {
        equipment_id: "WD_STICK002",
        mst_equipment_id: calcMstId("WD_STICK002"),
      };
    case calcMstId("TRAINING00015"):
      return {
        equipment_id: "WD_ACAXE002",
        mst_equipment_id: calcMstId("WD_ACAXE002"),
      };
    default:
      return null;
  }
};
export const trainingEnd = async (req: Request, res: Response) => {
  const reward = getRewardItemByQuestId(req.body.mst_quest_id);
  const cleared_quest = req.body.mst_quest_id;
  const clearTime = req.body.clear_time;
  const filter = { current_session: req.body.session_id };

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
  let trainingPresent = new Present();
  trainingPresent.uu_id = doc.uu_id;
  trainingPresent.content = {
    equipments: [
      {
        ...reward,
        auto_potential_composite: 0,
        awaked: 0,
        elv: 0,
        endAwakeCount: 0,
        endAwakeRemain: 0,
        end_remain: 0,
        evolve_start_time: 0,
        favorite: 0,
        is_awake: 0,
        is_complete_auto_potential_composite: 0,
        potential: 0,
        slv: 0,
        start_remain: 0,
        created: Date.now(),
      },
    ],
  };
  trainingPresent.message ="Training Reward"
  trainingPresent.save();


  const data = {
    mst_quest_id: req.body.mst_quest_id,
    pop_list: [
      {
        pop_id: 1,
        item_list: {
          equipments: [reward],
        },
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const trainingStart = (req: Request, res: Response) => {
  const data = {
    instance_data: {
      block_list: [
        {
          block_idx: 1,
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
          mst_block_id: calcMstId("l00_m08_a01_0101"),
          repop_list: [{ amount: 0, serial_no: 0 }],
        },
        {
          block_idx: 2,
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
          mst_block_id: calcMstId("l00_m08_a01_0102"),
          repop_list: [{ amount: 0, serial_no: 0 }],
        },
      ],
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
  encryptAndSend(data, res, req);
};
const isTrainingCleared = (cleared_quests, questID) => {
  return cleared_quests.find((q) => q.mst_quest_id === questID) ? 1 : 0;
};

export const trainingList = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = {
    training_list: [
      {
        equip_type: 1,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00001")
        ),
        mst_quest_id: calcMstId("TRAINING00001"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_SWORD002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_SWORD002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Sword & Shield",
      },
      {
        equip_type: 11,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00002")
        ),
        mst_quest_id: calcMstId("TRAINING00002"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_WSWORD002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_WSWORD002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Dual Blades",
      },
      {
        equip_type: 7,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00003")
        ),
        mst_quest_id: calcMstId("TRAINING00003"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_LSWORD2002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_LSWORD2002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Long Sword",
      },
      {
        equip_type: 0,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00004")
        ),
        mst_quest_id: calcMstId("TRAINING00004"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_LSWORD002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_LSWORD002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Great Sword",
      },
      {
        equip_type: 12,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00005")
        ),
        mst_quest_id: calcMstId("TRAINING00005"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_PIPE002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_PIPE002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Hunting Horn",
      },
      {
        equip_type: 2,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00006")
        ),
        mst_quest_id: calcMstId("TRAINING00006"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_HAMMER002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_HAMMER002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Hammer",
      },
      {
        equip_type: 3,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00007")
        ),
        mst_quest_id: calcMstId("TRAINING00007"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_LANCE002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_LANCE002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Lance",
      },
      {
        equip_type: 9,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00008")
        ),
        mst_quest_id: calcMstId("TRAINING00008"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_GUNLANCE002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_GUNLANCE002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Gunlance",
      },
      {
        equip_type: 8,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00009")
        ),
        mst_quest_id: calcMstId("TRAINING00009"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_AXE002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_AXE002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Switch Axe",
      },
      {
        equip_type: 14,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00010")
        ),
        mst_quest_id: calcMstId("TRAINING00010"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_CHAXE002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_CHAXE002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Charge Blade",
      },
      {
        equip_type: 6,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00011")
        ),
        mst_quest_id: calcMstId("TRAINING00011"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_LBOWGUN002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_LBOWGUN002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Light Bowgun",
      },
      {
        equip_type: 4,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00012")
        ),
        mst_quest_id: calcMstId("TRAINING00012"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_HBOWGUN002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_HBOWGUN002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Heavy Bowgun",
      },
      {
        equip_type: 10,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00013")
        ),
        mst_quest_id: calcMstId("TRAINING00013"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_BOW034",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_BOW034"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Bow",
      },
      {
        equip_type: 13,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00014")
        ),
        mst_quest_id: calcMstId("TRAINING00014"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_STICK002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_STICK002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Insect Glaive",
      },
      {
        equip_type: 15,
        is_clear: isTrainingCleared(
          doc.cleared_quests,
          calcMstId("TRAINING00015")
        ),
        mst_quest_id: calcMstId("TRAINING00015"),
        reward_item: {
          //4002688025
          equipments: [
            {
              auto_potential_composite: 0,
              awaked: 0,
              created: 0,
              elv: 0,
              endAwakeCount: 0,
              endAwakeRemain: 0,
              end_remain: 0,
              equipment_id: "WD_ACAXE002",
              evolve_start_time: 0,
              favorite: 0,
              is_awake: 0,
              is_complete_auto_potential_composite: 0,
              mst_equipment_id: calcMstId("WD_ACAXE002"),
              potential: 0,
              slv: 0,
              start_remain: 0,
            },
          ],
        },
        reward_text: "Accel Axe",
      },
    ],
  };
  encryptAndSend(data, res, req);
};
