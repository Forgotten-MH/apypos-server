import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";
import Present from "../../../model/presents";
import { Box, BoxService } from "../../../services/boxService";

export const presentSync = async (req: Request, res: Response) => {
  const { session_id } = req.body;
  const userDoc = await User.findOne({ current_session: session_id });

  encryptAndSend(
    {
      presentDetail: await Present.find({ uu_id: userDoc.uu_id }),
    },
    res,
    req
  );
};

export const presentReceive = async (req: Request, res: Response) => {
  const requestedIdsToBePutInBox: string[] = req.body._ids;
  //Mark present as recieved
  const { session_id } = req.body;
  const userDoc = await User.findOne({ current_session: session_id });

  const presents = await Present.find({
    _id: { $in: requestedIdsToBePutInBox },
  });

  type BoxKey = keyof Box;
  presents.map(async(present) => {
    for (const [key, value] of Object.entries(present.toObject().content)) {
      console.log("CONTENT KEY",key)
      if (Array.isArray(value)) {
        value.forEach((item) => {
          console.log("ADDED ITEM TO BOX",key,item)
          BoxService.addItem(userDoc.box, key as BoxKey, item);
        });
      }
    }
    await Present.updateOne({_id:present._id},{received:1})
  });
  await User.updateOne(
    { uu_id: userDoc.uu_id },
    { box: userDoc.box },
  );

  const data = {
    presentDetail: await Present.find({ uu_id: userDoc.uu_id }), //this should only be
    receive_num: presents.length,
  };
  encryptAndSend(data, res, req);
};
