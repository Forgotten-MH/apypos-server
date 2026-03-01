import { Request, Response } from 'express';
import { encryptAndSend } from '../../../../services/crypto/encryptionHelpers.js';
import User from '../../../../model/user.js';
import { createLogger } from '../../../../middleware/logger.js';
const log = createLogger('equipSet');

export const equipSetGet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };

    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, 2004);
    }
    const data = { ...doc.equipset } as object;
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetGet:', error);
    encryptAndSend({}, res, req, 1, 2, 'Get equip set failed');
  }
};

export const equipSetSet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const doc = await User.findOne(filter);
    if (!doc?.equipset) {
      return encryptAndSend({}, res, req, 2004);
    }
    if (req.body.equip_sets.length > 0) {
      doc.equipset.equip_sets = req.body.equip_sets;
      doc.equipset.selected_equip_set_index = req.body.selected_equip_set_index;
      doc.equipset.capacity_eqp_set = req.body.capacity_eqp_set;
      const update = { equipset: doc.equipset };

      await User.findByIdAndUpdate(doc.id, update);
    }
    const data = { ...doc.equipset } as object;
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetSet:', error);
    encryptAndSend({}, res, req, 1, 2, 'Set equip set failed');
  }
};

export const equipSetSocialGet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, 2004);
    }
    const data = {
      social_equip_sets: doc.social_equip_sets,
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetSocialGet:', error);
    encryptAndSend({}, res, req, 1, 2, 'Get social equip set failed');
  }
};
export const equipSetSocialSet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };
    const doc = await User.findOne(filter);
    if (!doc) {
      return encryptAndSend({}, res, req, 2004);
    }
    if (req.body.social_equip_sets.length > 0) {
      doc.social_equip_sets = req.body.social_equip_sets;

      const update = { social_equip_sets: doc.social_equip_sets };

      await User.findByIdAndUpdate(doc.id, update);
    }
    const data = doc.social_equip_sets ?? [];
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in equipSetSocialSet:', error);
    encryptAndSend({}, res, req, 1, 2, 'Set social equip set failed');
  }
};
