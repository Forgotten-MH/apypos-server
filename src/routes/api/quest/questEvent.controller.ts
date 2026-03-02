import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { createLogger } from '../../../middleware/logger.js';
import { Event, AssualtEvents, M16Events, ScoreEvents, StandingEvents, TicketEvents, TourEvents, enrichEvent } from '../../../model/events/index.js';
const log = createLogger('quest');

import QuestSheet from '../../../model/questSheet.js';
import type { EventStartInput } from './quest.schema.js';

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

export const eventTicketFree = (req: Request, res: Response) => {
  const data = {
    infos: [
      {
        free_group_id: 1,
        max_free_count: 10,
        remain_free_count: 10,
        text: 'TICKET FREE',
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
  try {
    const { mst_quest_id } = req.body as EventStartInput;

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
          {
            mst_enemy_id: 1618895799,
            point: 0,
          },
        ],
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

    const quest = await QuestSheet.findOne({ mQuestID: String(mst_quest_id) });
    const blocks = quest?.mBlocks || [];

    if (blocks.length === 0) {
      return encryptAndSend({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    }
    blocks.forEach((block, index) => {
      data.instance_data.block_list.push({
        block_idx: index + 1,
        block_instance_list: [{ instance_id: 0, serial_no: 1 }],
        drop_list: [],
        instance_id: 0,
        is_insert: 0,
        is_raid: 0,
        mst_block_id: block,
        repop_list: [{ amount: 0, serial_no: 0 }],
      });
    });

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in eventNormalStart:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Event normal start failed');
  }
};

export const eventTicketStart = async (req: Request, res: Response) => {
  try {
    const { mst_quest_id } = req.body as EventStartInput;
    const startedQuest = mst_quest_id;

    const quest = await QuestSheet.findOne({ mQuestID: String(startedQuest) });
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
          {
            mst_enemy_id: 1618895799,
            point: 0,
          },
        ],
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
        block_instance_list: [{ instance_id: 0, serial_no: 1 }],
        drop_list: [],
        instance_id: 0,
        is_insert: 0,
        is_raid: 0,
        mst_block_id: block,
        repop_list: [{ amount: 0, serial_no: 0 }],
      });
    });

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in eventTicketStart:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Event ticket start failed');
  }
};

export const eventScoreStart = async (req: Request, res: Response) => {
  try {
    const { mst_quest_id } = req.body as EventStartInput;
    const startedQuest = mst_quest_id;

    const quest = await QuestSheet.findOne({ mQuestID: String(startedQuest) });
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
          {
            mst_enemy_id: 1618895799,
            point: 0,
          },
        ],
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
        block_instance_list: [{ instance_id: 0, serial_no: 1 }],
        drop_list: [],
        instance_id: 0,
        is_insert: 0,
        is_raid: 0,
        mst_block_id: block,
        repop_list: [{ amount: 0, serial_no: 0 }],
      });
    });

    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in eventScoreStart:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Event score start failed');
  }
};

export const eventListAll = async (req: Request, res: Response) => {
  try {
    const event = (await Event.findOne({}).exec())!.toObject();
    const data = {
      big_node_order_array: event.big_node_order_array,
      event_list: {
        assault: enrichEvent(
          (await AssualtEvents.find().exec()).map((d) => d.toObject({ getters: true })),
        ),
        m16: enrichEvent((await M16Events.find().exec()).map((d) => d.toObject({ getters: true }))),
        score: enrichEvent(
          (await ScoreEvents.find().exec()).map((d) => d.toObject({ getters: true })),
        ),
        standing: enrichEvent(
          (await StandingEvents.find().exec()).map((d) => d.toObject({ getters: true })),
        ),
        ticket: await TicketEvents.find({}).exec(),
        tour: enrichEvent((await TourEvents.find().exec()).map((d) => d.toObject({ getters: true }))),
      },
      next_day_start: event.next_day_start,
      next_latest_node_infos: event.next_latest_node_infos,
      now_latest_node_info_remain: event.now_latest_node_info_remain,
      now_latest_node_infos: event.now_latest_node_infos,
    };

    encryptAndSend(data, res, req);
    log.debug('Score events: %o', data.event_list.score);
  } catch (error) {
    log.error('Error in eventListAll:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Event list failed');
  }
};
