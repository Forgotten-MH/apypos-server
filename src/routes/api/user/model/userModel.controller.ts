import { Request, Response } from 'express';
import { encryptAndSend } from '../../../../services/crypto/encryptionHelpers';
import User from '../../../../model/user';
import { createLogger } from '../../../../middleware/logger';
const log = createLogger('userModel');



export const modelCreate = async (req: Request, res: Response) => {

  const model_info = req.body.model_info
  const tutorial_step = 210
  const filter = { current_session: req.body.session_id };
  const update = { model_info: model_info, tutorial_step: tutorial_step };
  const doc = await User.findOneAndUpdate(filter, update, {
    new: true
  });

  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  const responseData = {
    model_info: doc.model_info,
    tutorial_step: doc.tutorial_step, // 210 activate video
  };
  log.debug(`TutorialStep : ${responseData.tutorial_step}`);

  encryptAndSend(responseData, res, req);
};


export const modelSet = async(req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  const update = { model_info: req.body.model_info };
  if(req.body.model_info.gender == -1){
    update.model_info.gender = 0
  }
  const doc = await User.findOneAndUpdate(filter, update, {
    new: true
  });

  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  const data = {
    model_info: doc.model_info,
  };

  encryptAndSend(data, res, req);
};

