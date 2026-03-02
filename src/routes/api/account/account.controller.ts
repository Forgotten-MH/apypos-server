import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { createLogger } from '../../../middleware/logger.js';
import {
  generateToken,
  updateMigrationData,
  processMigrationAuth,
  createUser,
  loginUser,
} from '../../../services/accountService.js';
import type { MigrationReadyInput, MigrationAuthInput, RegistInput, LoginInput } from './account.schema.js';
const log = createLogger('account');

const DEFAULT_TIME_INFO_ENTRY = { end: 3600, end_remain: 3600, start: 0, start_remain: 0 };

const DEFAULT_TIME_INFO = {
  exchange_present: DEFAULT_TIME_INFO_ENTRY,
  free_auto_add: DEFAULT_TIME_INFO_ENTRY,
  free_auto_infinity: DEFAULT_TIME_INFO_ENTRY,
  increase_add: DEFAULT_TIME_INFO_ENTRY,
};

const buildStretchEffectInfo = (overrides: {
  exchange_present?: number;
  free_auto_add?: number;
  free_auto_infinity?: number;
  increase_add?: number;
  increase_inf?: number;
  mst_event_info_id?: number;
} = {}) => ({
  exchange_present: overrides.exchange_present ?? 0,
  free_auto_add: overrides.free_auto_add ?? 0,
  free_auto_infinity: overrides.free_auto_infinity ?? 0,
  increase_add: overrides.increase_add ?? 0,
  increase_inf: overrides.increase_inf ?? 0,
  mst_event_info_id: overrides.mst_event_info_id ?? 0,
  time_info: DEFAULT_TIME_INFO,
});

const EMPTY_EQUIPMENT = {
  auto_potential_composite: 0,
  awaked: 0,
  created: 0,
  elv: 0,
  endAwakeCount: 0,
  endAwakeRemain: 0,
  end_remain: 0,
  equipment_id: '',
  evolve_start_time: 0,
  favorite: 0,
  is_awake: 0,
  is_complete_auto_potential_composite: 0,
  mst_equipment_id: 0,
  potential: 0,
  slv: 0,
  start_remain: 0,
};

const EMPTY_MONUMENT = { augite: [], hr: 0, mlv: { atk: 0, def: 0, hp: 0, sp: 0 } };

const emptyItemList = (overrides: Record<string, unknown> = {}) => ({
  collections: [],
  equipments: [{ ...EMPTY_EQUIPMENT }],
  growth_items: [{ amount: 0, mst_growth_item_id: 0 }],
  katamaris: [{ mst_katamari_type_id: 0, equipments: [{ ...EMPTY_EQUIPMENT }] }],
  limiteds: [{ amount: 0, mst_limited_id: 0 }],
  matatabis: [{ amount: 0, mst_matatabi_id: 0 }],
  materials: [{ amount: 0, mst_material_id: 0 }],
  monument: EMPTY_MONUMENT,
  otomos: [],
  payments: [{ amount: 50, mst_payment_id: 1573159746 }],
  pcoins: [{ amount: 0, mst_pcoin_id: 0 }],
  points: [{ amount: 0, mst_event_point_id: 3190222199 }],
  powers: [{ amount: 0, mst_power_id: 0 }],
  stamp_sets: [{ amount: 0, mst_stamp_set_id: 487830804 }],
  zenny: 0,
  pickup: 0,
  ...overrides,
});

export const migrationReady = async (req: Request, res: Response) => {
  try {
    const { login_id, secret_id, mst_himitsu_question_id, himitsu_answer, migration_pass } = req.body as MigrationReadyInput;
    const migration_id = generateToken(8);

    const doc = await updateMigrationData(login_id, secret_id, {
      mst_himitsu_question_id,
      himitsu_answer,
      migration_pass,
      migration_id,
    });
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.LOGIN_FAILED);
    }
    const responseData = {
      migration_id: doc.transfer?.migration_id,
    };
    encryptAndSend(responseData, res, req);
  } catch (error) {
    log.error('Error in migrationReady:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Migration ready failed');
  }
};

export const migrationAuth = async (req: Request, res: Response) => {
  try {
    const { migration_id, migration_pass, secret_id, uu_id } = req.body as MigrationAuthInput;

    const doc = await processMigrationAuth(migration_id, migration_pass, uu_id, secret_id);

    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.LOGIN_FAILED);
    }
    const responseData = {
      login_id: doc.login_id,
      user_id: doc.user_id,
    };
    encryptAndSend(responseData, res, req);
  } catch (error) {
    log.error('Error in migrationAuth:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Migration auth failed');
  }
};

export const registerAccount = async (req: Request, res: Response) => {
  try {
    const { uu_id, secret_id, session_id } = req.body as RegistInput;

    const newUser = await createUser(uu_id, secret_id, session_id ?? '');

    const responseData = {
      game_id: newUser.game_id,
      is_review: 0,
      login_id: newUser.login_id,
      stretch_effect_info: buildStretchEffectInfo({
        exchange_present: 1,
        free_auto_add: 2,
        free_auto_infinity: 3,
        increase_add: 4,
        increase_inf: 5,
        mst_event_info_id: 3424126991,
      }),
      tutorial_step: newUser.tutorial_step,
      user_id: newUser.user_id,
    };

    log.info(`TutorialStepUp: ${responseData.tutorial_step}`);

    encryptAndSend(responseData, res, req);
  } catch (error) {
    log.error('Error in registerAccount:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Account registration failed');
  }
};

export const loginAccount = async (req: Request, res: Response) => {
  try {
    const { uu_id, secret_id, session_id } = req.body as LoginInput;

    const result = await loginUser(uu_id, secret_id, session_id ?? '');

    if (result.error === 'NOT_FOUND') {
      return encryptAndSend({}, res, req, ERROR_CODE.LOGIN_FAILED);
    }
    if (result.error === 'NOT_AUTHENTICATED') {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }

    const doc = result.user;

    let login = {
      auto_course_remain_time: 3600,
      event_login_bonus_info: {
        banner_path: 'coev_04480',
        day: 1,
        disp_name: 'event_login_bonus_info',
        end: '2026/12/30 00:05:00',
        login_bonus_reward_list: [],
        message: 'Message FOR EVENT',
        start: '2020/12/30 00:05:00',
      },
      game_id: doc.game_id,
      gender: doc.model_info?.gender,
      is_review: 1,
      now_sale_premium_login_bonus_id: 0,
      popup_info: [],
      specific_popup_info: [],
      stretch_effect_info: buildStretchEffectInfo(),
      tutorial_step: doc.tutorial_step,
      user_id: doc.user_id,
    };

    const return_login_bonus_info_active = false;
    if (return_login_bonus_info_active) {
      login = {
        ...{
          day: 1,
          end: '2026/12/30 00:05:00',
          login_bonus_reward_list: [{ idx: 1, item_list: emptyItemList({ powers: [{ amount: 0, mst_power_id: 1550991572 }], stamp_sets: [{ amount: 0, mst_stamp_set_id: 67667029 }] }) }],
          start: '2020/12/30 00:05:00',
        },
        ...login,
      };
    }
    const premium_login_bonus_info_active = false;
    if (premium_login_bonus_info_active) {
      login = {
        ...{
          banner_path: 'coev_04490',
          day: 1,
          disp_name: 'premium_login_bonus_info',
          end: '2025/12/30 00:05:00',
          latest_end_unix: 1837836662,
          latest_mst_logbo_premium_id: 1,
          login_bonus_reward_list: [{ idx: 1, item_list: emptyItemList() }],
          message: 'premium_login_bonus_info message',
          start: '2020/12/30 00:05:00',
          term: 1,
        },
        ...login,
      };
    }
    const monthly_login_bonus_info_active = false;
    if (monthly_login_bonus_info_active) {
      login = {
        ...{
          day: 1,
          end: '2026/12/30 00:05:00',
          login_bonus_reward_list: [{
            idx: 1,
            item_list: emptyItemList({
              equipments: [{ ...EMPTY_EQUIPMENT, auto_potential_composite: 1, created: 1, elv: 1, endAwakeCount: 5, endAwakeRemain: 10, end_remain: 15, equipment_id: 'AD_BODY006', evolve_start_time: 1609459200, favorite: 1, is_complete_auto_potential_composite: 1, mst_equipment_id: 1801022340, potential: 100, slv: 1, start_remain: 20 }],
              materials: [{ amount: 1, mst_material_id: 2507637144 }],
            }),
          }],
          start: '2020/12/30 00:05:00',
        },
        ...login,
      };
    }
    const login_bonus_info_active = false;
    if (login_bonus_info_active) {
      login = {
        ...{
          day: 1,
          today_item_list: { item_list: emptyItemList() },
          tomorrow_item_list: { item_list: emptyItemList() },
        },
        ...login,
      };
    }

    log.info(`TutorialStepUp: ${login.tutorial_step}`);

    encryptAndSend(login, res, req);
  } catch (error) {
    log.error('Error in loginAccount:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Login failed');
  }
};
