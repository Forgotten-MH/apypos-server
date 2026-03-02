import { Request, Response } from 'express';
import { encryptAndSend } from '../../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../../constants/error.codes.js';
import User from '../../../../model/user.js';
import { createLogger } from '../../../../middleware/logger.js';
import type { SessionOnlyInput, EquipSetSetInput, EquipSetSocialSetInput } from './userEquipSet.schema.js';
const log = createLogger('equipSet');

export const equipSetGet = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body as SessionOnlyInput;
    const filter = { current_session: session_id };

    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }
    const data = { ...doc.equipset } as object;
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetGet:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Get equip set failed');
  }
};

export const equipSetSet = async (req: Request, res: Response) => {
  try {
    const { session_id, equip_sets, selected_equip_set_index, capacity_eqp_set } = req.body as EquipSetSetInput;
    const filter = { current_session: session_id };
    const doc = await User.findOne(filter);
    if (!doc?.equipset) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }
    if (equip_sets.length > 0) {
      doc.equipset.equip_sets = equip_sets as typeof doc.equipset.equip_sets;
      doc.equipset.selected_equip_set_index = selected_equip_set_index;
      doc.equipset.capacity_eqp_set = capacity_eqp_set;
      const update = { equipset: doc.equipset };

      await User.findByIdAndUpdate(doc.id, update);
    }
    const data = { ...doc.equipset } as object;
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetSet:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Set equip set failed');
  }
};

export const equipSetSocialGet = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body as SessionOnlyInput;
    const filter = { current_session: session_id };
    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }
    const data = {
      social_equip_sets: doc.social_equip_sets,
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetSocialGet:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Get social equip set failed');
  }
};
export const equipSetSocialSet = async (req: Request, res: Response) => {
  try {
    const { session_id, social_equip_sets } = req.body as EquipSetSocialSetInput;
    const filter = { current_session: session_id };
    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }
    if (social_equip_sets.length > 0) {
      doc.social_equip_sets = social_equip_sets as typeof doc.social_equip_sets;

      const update = { social_equip_sets: doc.social_equip_sets };

      await User.findByIdAndUpdate(doc.id, update);
    }
    const data = doc.social_equip_sets ?? [];
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetSocialSet:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Set social equip set failed');
  }
};
