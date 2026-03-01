import { Request, Response } from 'express';
import { encryptAndSend } from '../../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../../constants/error.codes.js';
import User from '../../../../model/user.js';
import { createLogger } from '../../../../middleware/logger.js';
const log = createLogger('otomoTeam');

export const otomoteamGet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };

    const doc = await User.findOne(filter);
    if (!doc?.otomoteam) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }
    const data = {
      capacity: doc.otomoteam.capacity,
      otomo_teams: doc.otomoteam.otomo_team,
      selected_index: doc.otomoteam.selected_index,
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in otomoteamGet:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Get otomo team failed');
  }
};

export const otomoteamSet = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };

    const doc = await User.findOne(filter);
    if (!doc?.otomoteam) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }

    if (req.body.otomo_teams.length > 0) {
      const newTeam = req.body.otomo_teams[0];

      const arrayIndex = doc.otomoteam.otomo_team.findIndex((team) => team.index === newTeam.index);
      log.debug('Found index:', arrayIndex);

      if (arrayIndex !== -1) {
        log.debug('Existing otomo!');
        doc.otomoteam.otomo_team[arrayIndex] = newTeam;
      } else {
        log.debug('New otomo!');
        doc.otomoteam.otomo_team.push(newTeam);
      }

      await doc.save();
    }

    const data = {
      capacity: doc.otomoteam.capacity,
      otomo_team: doc.otomoteam.otomo_team,
      selected_index: doc.otomoteam.selected_index,
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in otomoteamSet:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Set otomo team failed');
  }
};

export const otomoteamSelect = async (req: Request, res: Response) => {
  try {
    const filter = { current_session: req.body.session_id };

    let doc = await User.findOne(filter);
    if (!doc?.otomoteam) {
      return encryptAndSend({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    }
    doc.otomoteam.selected_index = req.body.index;

    const update = { otomoteam: doc.otomoteam };
    doc = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    const data = {
      selected_index: doc!.otomoteam!.selected_index,
    };
    encryptAndSend(data, res, req);
  } catch (error) {
    log.error('Error in otomoteamSelect:', error);
    encryptAndSend({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Select otomo team failed');
  }
};
