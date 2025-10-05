import { Request, Response } from "express";
import { encryptAndSend } from "../../../../services/crypto/encryptionHelpers";
import User from "../../../../model/user";

export const otomoteamGet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  let doc = await User.findOne(filter);
  const data = {
    capacity: doc.otomoteam.capacity,
    otomo_teams: doc.otomoteam.otomo_team,
    selected_index: doc.otomoteam.selected_index,
  };
  encryptAndSend(data, res, req);
};

export const otomoteamSet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  let doc = await User.findOne(filter);

  if (req.body.otomo_teams.length > 0) {
  const newTeam = req.body.otomo_teams[0];

    const arrayIndex = doc.otomoteam.otomo_team.findIndex(
      (team) => team.index === newTeam.index
    );
    console.log("Found index:", arrayIndex);

    if (arrayIndex !== -1) {
      console.log("Existing otomo!");
      doc.otomoteam.otomo_team[arrayIndex] = newTeam;
    } else {
      console.log("New otomo!");
      doc.otomoteam.otomo_team.push(newTeam);
    }

    // Save the modified document
    await doc.save();
  }

  const data = {
    capacity: doc.otomoteam.capacity,
    otomo_team: doc.otomoteam.otomo_team,
    selected_index: doc.otomoteam.selected_index,
  };
  encryptAndSend(data, res, req);
};

export const otomoteamSelect = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  let doc = await User.findOne(filter);
  doc.otomoteam.selected_index = req.body.index;

  let update = { otomoteam: doc.otomoteam };
  doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });

  const data = {
    selected_index: doc.otomoteam.selected_index,
  };
  encryptAndSend(data, res, req);
};
