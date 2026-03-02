import { fileURLToPath } from 'node:url';
import path from 'path';
import { Request, Response } from 'express';

const __dirname = import.meta.dirname ?? fileURLToPath(new URL('.', import.meta.url));
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { createLogger } from '../../../middleware/logger.js';
import User from '../../../model/user.js';
const log = createLogger('quest');

import full_island from '../../../json/full_enabled_state.json' with { type: 'json' };

import { readFile } from 'fs/promises';

import QuestSheet from '../../../model/questSheet.js';
import type { IslandStartInput, IslandEndInput, IslandMapAllInput } from './quest.schema.js';

interface BlockListItem {
  block_idx: number;
  block_instance_list: { instance_id: number; serial_no: number }[];
  drop_list: never[];
  instance_id: number;
  is_insert: number;
  is_raid: number;
  mst_block_id: number;
  repop_list: { amount: number; serial_no: number }[];
}

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
  is_collection_node?: number;
  mst_story_id?: number;
  state?: number;
};

type Part = {
  node_list?: Node[];
  mst_part_id?: number;
  campaign?: { mst_campaign_id: number; remain_time: number }[];
  exploration_note?: {
    note_contents: { mst_note_content_id: number; state: number }[];
    progress: number;
  };
  gingira_node_id?: number;
  object_list?: { mst_object_id: number; state: number }[];
  raid_info?: {
    end_remain: number;
    mst_node_id: number;
    start_remain: number;
  }[];
  silver_bonus?: number;
  state?: number;
};

type Ocean = {
  mst_ocean_id: number;
  part_list: Part[];
};

// --- CSV Parser ---
function parseCsv<T = Record<string, string>>(csv: string): T[] {
  const lines = csv.trim().split('\n');
  const headers = lines.shift()!.split(',');
  return lines.map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]])) as T;
  });
}

// --- Main Function ---
export async function enrichOceanData(
  oceanData: Ocean[],
  cleared_quests: { mst_quest_id: number; clear_time?: number }[],
): Promise<Ocean[]> {
  // Load CSVs in parallel
  const [nodeQuestCsv, questDataCsv, questSubtargetCsv] = await Promise.all([
    readFile(path.resolve(__dirname, '../../../csv/oceans/parts/nodes/2-node-quests.csv'), 'utf8'),
    readFile(path.resolve(__dirname, '../../../csv/questData.csv'), 'utf8'),
    readFile(path.resolve(__dirname, '../../../csv/questSubtargetSet.csv'), 'utf8'),
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
  const enrichedOcean = oceanData.map((ocean) => {
    const enrichedParts = ocean.part_list.map((part) => {
      if (!part.node_list) return { ...part };

      const enrichedNodes = part.node_list.map((node) => {
        const nodeID = node.mst_node_id;
        if (isNaN(nodeID)) return { ...node };

        const nodeQuests = nodeQuestMap.get(nodeID) || [];
        const day_quest_list: QuestObject[] = [];
        const night_quest_list: QuestObject[] = [];

        for (const nq of nodeQuests) {
          const questID = Number(nq.mQuestHash);
          const quest = questMap.get(questID);
          if (!quest) continue;

          const clearedQuest = cleared_quests.find((q) => q.mst_quest_id === questID);

          let state = 1; // default = NEW
          if (clearedQuest) {
            state = clearedQuest.clear_time != null ? 3 : 0; //clear 3 / 0 nothing
          }

          const clearTime = clearedQuest?.clear_time ?? 0;

          const isCollectionQuestFlag = nq.isCollectionQuest === 'true' ? 1 : 0;

          const is_collection_quest = clearTime
            ? isCollectionQuestFlag === 1
              ? 0
              : 1 // invert if clearTime is truthy
            : isCollectionQuestFlag;

          const questObj: QuestObject = {
            clear_time: clearTime,
            is_collection_quest,
            is_key_quest: nq.isKeyQuest === 'true' ? 1 : 0,
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

export const islandStart = async (req: Request, res: Response) => {
  try {
    const { mst_quest_id, session_id } = req.body as IslandStartInput;
    const startedQuest = mst_quest_id;
    const filter = { current_session: session_id };

    const doc = await User.findOne(filter);

    const quest = await QuestSheet.findOne({ mQuestID: String(startedQuest) });

    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); //Not authenticated
    }
    const cleared_quests = doc.cleared_quests;

    const questExists = cleared_quests.some((q) => q.mst_quest_id === startedQuest);

    if (!questExists) {
      log.debug('Inserted Quest as seen');
      cleared_quests.push({ mst_quest_id: startedQuest });
    }

    const update = { cleared_quests: cleared_quests };

    // Await the update so you know it completed
    await User.findOneAndUpdate(filter, update, { new: true });
    const data = {
      instance_data: {
        block_list: [] as BlockListItem[],
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
        mission_message: 'start',
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

    const blocks = quest?.mBlocks || [];
    if (blocks.length === 0) {
      return encryptAndSend({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
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
  } catch (error) {
    log.error('Error in islandStart:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Island start failed');
  }
};

export const islandEnd = async (req: Request, res: Response) => {
  try {
    const { mst_quest_id, clear_time, session_id } = req.body as IslandEndInput;
    const cleared_quest = mst_quest_id;
    const clearTime = clear_time;
    const filter = { current_session: session_id };
    const quest = await QuestSheet.findOne({ mQuestID: String(cleared_quest) });
    log.debug('Rewards: %o', quest?.mRewardItemList);
    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); //Not authenticated
    }
    const cleared_quests = doc.cleared_quests;

    const questIndex = cleared_quests.findIndex((q) => q.mst_quest_id === cleared_quest);

    if (questIndex === -1) {
      log.debug('Inserted Quest as seen');
      cleared_quests.push({ mst_quest_id: cleared_quest, clear_time: clearTime });
    } else {
      log.debug('Updated clear_time...');
      cleared_quests[questIndex]!.clear_time = clearTime;
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
          },
          {
            idx: 3,
            is_katamari: 0,
            zeny: 1,
            value: 1,
            item_list: {
              materials: [{ amount: 6, mst_material_id: 1714092880 }],
            },
          },
          {
            idx: 4,
            is_katamari: 0,
            zeny: 1,
            value: 1,
            item_list: {
              materials: [{ amount: 6, mst_material_id: 1714092880 }],
            },
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
              },
              {
                idx: 2,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
              },
              {
                idx: 3,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
              },
              {
                idx: 4,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 2, mst_material_id: 1714092880 }],
                },
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
              },
              {
                idx: 2,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
              },
              {
                idx: 3,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
              },
              {
                idx: 4,
                is_katamari: 0,
                zeny: 1,
                value: 1,
                item_list: {
                  materials: [{ amount: 3, mst_material_id: 1714092880 }],
                },
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
      ],
      zeny: 30,
    },

    view_collection_list: [], ////unk
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in islandEnd:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Island end failed');
  }
};

export const islandMapAll = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body as IslandMapAllInput;
    const filter = { current_session: session_id };

    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); //Not authenticated
    }

    const plainDoc = doc.toObject();
    const oceanPlain = plainDoc.tutorial_step == 0xffff
      ? full_island
      : plainDoc.ocean_list;
    const clearedPlain = plainDoc.cleared_quests;

    const final_ocean = await enrichOceanData(oceanPlain, clearedPlain);
    log.debug('FINAL ocean data: %o', final_ocean);
    const data = {
      ocean_list: final_ocean,
    };

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in islandMapAll:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Island map all failed');
  }
};
