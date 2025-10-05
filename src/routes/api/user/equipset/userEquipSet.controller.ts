import { Request, Response } from "express";
import { encryptAndSend } from "../../../../services/crypto/encryptionHelpers";
import User from "../../../../model/user";

export const equipSetGet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = doc.equipset;
  encryptAndSend(data, res, req);
};

export const equipSetSet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  if (req.body.equip_sets.length > 0) {
    doc.equipset.equip_sets = req.body.equip_sets;
    doc.equipset.selected_equip_set_index = req.body.selected_equip_set_index;
    doc.equipset.capacity_eqp_set = req.body.capacity_eqp_set;
    const update = { equipset: doc.equipset };

    await User.findByIdAndUpdate(doc.id, update);
  }
  const data = doc.equipset;
  encryptAndSend(data, res, req);
};

export const equipSetSocialGet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  const data = {
    social_equip_sets: doc.social_equip_sets,
  };
  encryptAndSend(data, res, req);
};
export const equipSetSocialSet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  if (req.body.social_equip_sets.length > 0) {
    doc.social_equip_sets = req.body.social_equip_sets;

    const update = { social_equip_sets: doc.social_equip_sets };

    await User.findByIdAndUpdate(doc.id, update);
  }
  const data = doc.social_equip_sets;
  // const data = {
  //   social_equip_sets: [
  //     {
  //       gunner: {
  //         social_arm: {
  //           equipment_id: "NO_EQUIP",
  //         mst_equipment_id: 0,
  //         },
  //         social_body: {
  //           equipment_id: "NO_EQUIP",
  //           mst_equipment_id: 0,
  //         },
  //         social_head: {
  //           equipment_id: "NO_EQUIP",
  //           mst_equipment_id: 0,
  //         },
  //         social_leg: {
  //           equipment_id: "NO_EQUIP",
  //         mst_equipment_id: 0,
  //         },
  //         social_waist: {
  //           equipment_id: "NO_EQUIP",
  //           mst_equipment_id: 0,
  //         },
  //       },
  //       is_used: 0,
  //       knight: {
  //         social_arm: {
  //           equipment_id: "NO_EQUIP",
  //         mst_equipment_id: 0,
  //         },
  //         social_body: {
  //           equipment_id: "NO_EQUIP",
  //           mst_equipment_id: 0,
  //         },
  //         social_head: {
  //           equipment_id: "NO_EQUIP",
  //           mst_equipment_id: 0,
  //         },
  //         social_leg: {
  //           equipment_id: "NO_EQUIP",
  //         mst_equipment_id: 0,
  //         },
  //         social_waist: {
  //           equipment_id: "NO_EQUIP",
  //           mst_equipment_id: 0,
  //         },
  //       },
  //       mst_partner_id: 0,
  //     },
  //     // Additional sets if there are more
  //   ],
  // };
  encryptAndSend(data, res, req);
};
