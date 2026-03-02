// Quest Error Codes
// 10001,10002,10003,10005 Failed to get Quest Info other error codes
//10000 Quest Error
//10004 The selected quest is out of session or does not exist
//10006 The quest is already in progress
//10007 Quest not unlocked
import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { createLogger } from '../../../middleware/logger.js';
const log = createLogger('quest');

import QuestSheet from '../../../model/questSheet.js';
import type { EternalStartInput } from './quest.schema.js';

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

export const eternalStart = async (req: Request, res: Response) => {
  try {
    const { mst_quest_id } = req.body as EternalStartInput;
    const startedQuest = mst_quest_id;

    const quest = await QuestSheet.findOne({ mQuestID: String(startedQuest) });
    const data = {
      instance_data: {
        block_list: [] as BlockListItem[],
        bomb_lot_num: [],
        bomb_lottery: [],

        enable_limited_skill_id_list: [],
        enable_partner_limited_skill_id_list: [],
        enable_talisman: 0,
        enable_talisman_partner: 0,
        enemy_point_list: [],
        instance_id: 0,
        mission_message: 'start',
        mst_quest_id,
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
    log.error('Error in eternalStart:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Eternal start failed');
  }
};

export const eternalAll = (req: Request, res: Response) => {
  //ukyu_0010000 - Eternal Island (Argo)
  //ukyu_0020000 - Wind & Thunder (Kirin)
  //ukyu_0030000 - Explosion (Brachydios)
  const data = {
    banner_path: 'ukyu_00100',
    eternal_collection_list: [],
    eternal_nodes: [
      {
        banner_path: 'ukyu_00100',
        eternal_quest_list: [
          { clear_time: 0, idx: 0, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2574015882, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 1, is_collection_quest: 0, is_enable: 1, mst_quest_id: 6622256, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 2, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2002926758, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 3, is_collection_quest: 0, is_enable: 1, mst_quest_id: 3909527813, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 4, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2650904979, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 5, is_collection_quest: 0, is_enable: 1, mst_quest_id: 118016041, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 6, is_collection_quest: 0, is_enable: 1, mst_quest_id: 1880094911, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 7, is_collection_quest: 0, is_enable: 1, mst_quest_id: 3769689390, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 8, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2545407416, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 9, is_collection_quest: 0, is_enable: 1, mst_quest_id: 4151336029, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 10, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2155310283, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 11, is_collection_quest: 0, is_enable: 1, mst_quest_id: 427703665, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 12, is_collection_quest: 0, is_enable: 1, mst_quest_id: 1853427175, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 13, is_collection_quest: 0, is_enable: 1, mst_quest_id: 4028471364, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 14, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2266671314, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 15, is_collection_quest: 0, is_enable: 1, mst_quest_id: 504625512, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 16, is_collection_quest: 0, is_enable: 1, mst_quest_id: 1762970110, quest_subtargets: [], state: 0 },
          { idx: 17, is_collection_quest: 0, is_enable: 1, mst_quest_id: 4188787823, quest_subtargets: [], state: 0 },
          { idx: 18, is_collection_quest: 0, is_enable: 1, mst_quest_id: 2393695481, quest_subtargets: [], state: 0 },
          { clear_time: 0, idx: 19, is_collection_quest: 0, is_enable: 1, mst_quest_id: 3697086366, quest_subtargets: [], state: 0 },
        ],
        mst_eternal_node_id: 1,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
