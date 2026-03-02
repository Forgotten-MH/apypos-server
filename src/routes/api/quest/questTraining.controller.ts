import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { createLogger } from '../../../middleware/logger.js';
import { calcMstId } from '../../../services/defineService.js';
import User from '../../../model/user.js';
import Present from '../../../model/presents.js';
import type { TrainingEndInput, TrainingStartInput, TrainingListInput } from './questTraining.schema.js';
const log = createLogger('questTraining');

const TRAINING_QUESTS = [
  { equip_type: 1, questId: 'TRAINING00001', equipmentId: 'WD_SWORD002', rewardText: 'Sword & Shield' },
  { equip_type: 11, questId: 'TRAINING00002', equipmentId: 'WD_WSWORD002', rewardText: 'Dual Blades' },
  { equip_type: 7, questId: 'TRAINING00003', equipmentId: 'WD_LSWORD2002', rewardText: 'Long Sword' },
  { equip_type: 0, questId: 'TRAINING00004', equipmentId: 'WD_LSWORD002', rewardText: 'Great Sword' },
  { equip_type: 12, questId: 'TRAINING00005', equipmentId: 'WD_PIPE002', rewardText: 'Hunting Horn' },
  { equip_type: 2, questId: 'TRAINING00006', equipmentId: 'WD_HAMMER002', rewardText: 'Hammer' },
  { equip_type: 3, questId: 'TRAINING00007', equipmentId: 'WD_LANCE002', rewardText: 'Lance' },
  { equip_type: 9, questId: 'TRAINING00008', equipmentId: 'WD_GUNLANCE002', rewardText: 'Gunlance' },
  { equip_type: 8, questId: 'TRAINING00009', equipmentId: 'WD_AXE002', rewardText: 'Switch Axe' },
  { equip_type: 14, questId: 'TRAINING00010', equipmentId: 'WD_CHAXE002', rewardText: 'Charge Blade' },
  { equip_type: 6, questId: 'TRAINING00011', equipmentId: 'WD_LBOWGUN002', rewardText: 'Light Bowgun' },
  { equip_type: 4, questId: 'TRAINING00012', equipmentId: 'WD_HBOWGUN002', rewardText: 'Heavy Bowgun' },
  { equip_type: 10, questId: 'TRAINING00013', equipmentId: 'WD_BOW034', rewardText: 'Bow' },
  { equip_type: 13, questId: 'TRAINING00014', equipmentId: 'WD_STICK002', rewardText: 'Insect Glaive' },
  { equip_type: 15, questId: 'TRAINING00015', equipmentId: 'WD_ACAXE002', rewardText: 'Accel Axe' },
] as const;

const rewardByQuestId = new Map(
  TRAINING_QUESTS.map((q) => [
    calcMstId(q.questId),
    { equipment_id: q.equipmentId, mst_equipment_id: calcMstId(q.equipmentId) },
  ]),
);

const getRewardItemByQuestId = (questId: number) => rewardByQuestId.get(questId) ?? null;

const emptyEquipmentEntry = (equipmentId: string) => ({
  auto_potential_composite: 0,
  awaked: 0,
  created: 0,
  elv: 0,
  endAwakeCount: 0,
  endAwakeRemain: 0,
  end_remain: 0,
  equipment_id: equipmentId,
  evolve_start_time: 0,
  favorite: 0,
  is_awake: 0,
  is_complete_auto_potential_composite: 0,
  mst_equipment_id: calcMstId(equipmentId),
  potential: 0,
  slv: 0,
  start_remain: 0,
});
export const trainingEnd = async (req: Request, res: Response) => {
  try {
    const { mst_quest_id, clear_time, session_id } = req.body as TrainingEndInput;
    const reward = getRewardItemByQuestId(mst_quest_id);
    const cleared_quest = mst_quest_id;
    const clearTime = clear_time;
    const filter = { current_session: session_id };

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
    const trainingPresent = new Present();
    trainingPresent.uu_id = doc.uu_id!;
    trainingPresent.set('content', {
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
    });
    trainingPresent.message = 'Training Reward';
    await trainingPresent.save();

    const data = {
      mst_quest_id,
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
  } catch (error) {
    log.error('Error in trainingEnd:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Training end failed');
  }
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
          mst_block_id: calcMstId('l00_m08_a01_0101'),
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
          mst_block_id: calcMstId('l00_m08_a01_0102'),
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
      mission_message: 'start',
      mst_quest_id: (req.body as TrainingStartInput).mst_quest_id,
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
const isTrainingCleared = (cleared_quests: { mst_quest_id: number }[], questID: number | null) => {
  return cleared_quests.find((q) => q.mst_quest_id === questID) ? 1 : 0;
};

export const trainingList = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body as TrainingListInput;
    const filter = { current_session: session_id };

    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED); //Not authenticated
    }
    const data = {
      training_list: TRAINING_QUESTS.map((q) => ({
        equip_type: q.equip_type,
        is_clear: isTrainingCleared(doc.cleared_quests, calcMstId(q.questId)),
        mst_quest_id: calcMstId(q.questId),
        reward_item: { equipments: [emptyEquipmentEntry(q.equipmentId)] },
        reward_text: q.rewardText,
      })),
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in trainingList:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Training list failed');
  }
};
