import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";
import { calcMstId } from "../../../services/defineService";

export const get = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = {
    box: doc.box,
  };
  encryptAndSend(data, res, req);
};
export const storageInfo = (req: Request, res: Response) => {
  const data = {
    storage_info: {
      storage_details: [
        {
          max: 200,
          name: "装備倉庫1",
          now: 0,
          storage_idx: 1,
        },
      ],
      storage_limit: 5,
      storage_num: 1,
    },
  };
  encryptAndSend(data, res, req);
};

export const storageGet = (req: Request, res: Response) => {
  const { target_idx } = req.body;

  const data = {
    storage_info: {
      storage_details: [
        {
          max: 200,
          name: "装備倉庫1",
          now: 0,
          storage_idx: 1,
        },
      ],
      storage_limit: 5,
      storage_num: 1,
    },

    storages: [
      {
        awaked: 1,
        created: 1625155200,
        elv: 5,
        endAwakeCount: 3,
        endAwakeRemain: 1,
        end_remain: 10,
        equipment_id: "EQP123456",
        favorite: 0,
        is_awake: 1,
        mst_equipment_id: 2006810019,
        potential: 120,
        slv: 4,
        start_remain: 15,
        storage_idx: 1,
      },
     
    ],
  };
  encryptAndSend(data, res, req);
};

export const otomoGet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = {
    otomos: doc.box.otomos,
  };
  encryptAndSend(data, res, req);
};

export const equipCapacityInfo = (req: Request, res: Response) => {
  const data = {
    max: 10000,
    now: 0,
    price: 0,
  };
  encryptAndSend(data, res, req);
};

export const equipCapacityExpand = (req: Request, res: Response) => {
  const data = {
    max: 10000,
    now: 0,
    price: 0,
  };
  encryptAndSend(data, res, req);
};

export const stampGet = (req: Request, res: Response) => {
  const data = {
    stamp_sets: [
      {
        created: 0,
        mst_stamp_set_id: 67667029,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
export const stampHoldGet = (req: Request, res: Response) => {
  const data = {
    hold_stamp_ids: [
      //numbers
    ],
  };
  encryptAndSend(data, res, req);
};
export const stampShopList = (req: Request, res: Response) => {
  const data = {
    stamp_shop_list: [
      {
        end: 0,
        mst_stamp_set_id: 67667029,
        remain_id: 0,
        start: 0,
        type: 0,
        value: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
export const paymentLimitGet = (req: Request, res: Response) => {
  const data = {
    payment_limits: [
      {
        amount: 10000,
        created: 1725029111,
        limit: 10000,
        mst_payment_id: 1573159746,
      },
      {
        amount: 10000,
        created: 1725029111,
        limit: 10000,
        mst_payment_id: 3301823224,
      },
      {
        amount: 10000,
        created: 1725029111,
        limit: 10000,
        mst_payment_id: 3016417902,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const PaymentGet = (req: Request, res: Response) => {
  const data = {
    payments: [
      {
        amount: 50,
        mst_payment_id: 1573159746,
      },
      {
        amount: 25,
        mst_payment_id: 3301823224,
      },
      {
        amount: 5,
        mst_payment_id: 3016417902,
      },
      {
        amount: 3,
        mst_payment_id: 766408653,
      },
      {
        amount: 2,
        mst_payment_id: 1521043291,
      },
      {
        amount: 1,
        mst_payment_id: 3282048737,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const equipLevelup = async (req: Request, res: Response) => {
  //TODO:
  //This function upgrades equipment it uses req.body.eqp_obj_id to find the equipment in the box
  //based on req.body.num is the amount of steps it needs to be upgraded
  if (req.body.is_use_reinforcement == 2) {
    //use zenny and armor sphere
  }

  const data = {
    levelup: {
      equipment: {
        auto_potential_composite: 0,
        awaked: 0,
        created: 0,
        elv: 1,
        endAwakeCount: 0,
        endAwakeRemain: 0,
        end_remain: 0,
        equipment_id: req.body.eqp_obj_id,
        evolve_start_time: 0,
        favorite: 0,
        is_awake: 0,
        is_complete_auto_potential_composite: 0,
        mst_equipment_id: calcMstId(req.body.eqp_obj_id),
        potential: 0,
        slv: 0,
        start_remain: 0,
      },
      // materials: [
      //   // {
      //   //   amount:0,
      //   //   mst_material_id:0
      //   // }
      // ],
      // payments: [
      //   // {
      //   //   amount: 50,
      //   //   mst_payment_id: 1573159746,
      //   // },
      // ],
      //zenny: 0,
    },
  };
  encryptAndSend(data, res, req);
};
export const awake = async (req: Request, res: Response) => {
  const { use_karidama, resource_equipment_ids, base_equipment_id } = req.body;

  const data = {
    //TODO
  };
  encryptAndSend(data, res, req);
};

export const potentialupAutoSet = async (req: Request, res: Response) => {
  const { eqp_obj_infos } = req.body;
  //todo make real data
  const data = {
    base_equipment: {
      auto_potential_composite: 12345,
      awaked: 1,
      created: 1700000000,
      elv: 5,
      endAwakeCount: 10,
      endAwakeRemain: 3,
      end_remain: 100,
      equipment_id: "EQP_ABC123",
      evolve_start_time: 1700001234,
      favorite: 0,
      is_awake: 1,
      is_complete_auto_potential_composite: 0,
      mst_equipment_id: 987654,
      potential: 222,
      slv: 3,
      start_remain: 200,
    },
    payments: [
      {
        amount: 500,
        mst_payment_id: 1001,
      },
    ],
    resource_equipments: [
      {
        auto_potential_composite: 123,
        awaked: 0,
        created: 1699999999,
        elv: 2,
        endAwakeCount: 5,
        endAwakeRemain: 1,
        end_remain: 50,
        equipment_id: "EQP_XYZ999",
        evolve_start_time: 1700001111,
        favorite: 1,
        is_awake: 1,
        is_complete_auto_potential_composite: 0,
        mst_equipment_id: 444444,
        potential: 333,
        slv: 2,
        start_remain: 75,
      },
    ],
    resource_materials: [
      {
        amount: 20,
        mst_material_id: 3001,
      },
      {
        amount: 50,
        mst_material_id: 3002,
      },
    ],
    zeny: 999999,
  };

  encryptAndSend(data, res, req);
};

export const sale = async (req: Request, res: Response) => {
  const { eqp_obj_ids } = req.body;
  //todo real data
  const data = {
    equip_sell: {
      eqp_obj_ids: ["EQP_OBJ_12345", "EQP_OBJ_67890", "EQP_OBJ_ABCDE"],
      point: {
        amount: 2500,
        mst_event_point_id: 42,
      },
      zeny: 750000,
    },
  };
  encryptAndSend(data, res, req);
};

export const favoriteSet = async (req: Request, res: Response) => {
  const { is_favorite, eqp_obj_id } = req.body;
  //todo real data
  const data = {
    favorite_set: {
      equipment: {
        auto_potential_composite: 123,
        awaked: 1,
        created: 1700000000,
        elv: 5,
        endAwakeCount: 10,
        endAwakeRemain: 3,
        end_remain: 100,
        equipment_id: eqp_obj_id,
        evolve_start_time: 1700001234,
        favorite: is_favorite,
        is_awake: 1,
        is_complete_auto_potential_composite: 0,
        mst_equipment_id: 987654,
        potential: 222,
        slv: 3,
        start_remain: 200,
      },
    },
  };
  encryptAndSend(data, res, req);
};

export const leveupAuto = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  let targetIndex;
  switch (req.body.type) {
    case "hp":
      // Increment HP
      doc.box.monument.mlv.hp = doc.box.monument.mlv.hp + 1;
      // Increase HR
      doc.box.monument.hr = doc.box.monument.hr + 1;
      // Find the index of the augite item
      targetIndex = doc.box.monument.augite.findIndex(
        (item) => item.mst_augite_id === 2047024966
      );

      // Replace the item in the array
      doc.box.monument.augite[targetIndex].amount = Math.max(
        doc.box.monument.augite[targetIndex].amount - 10,
        0
      );

      break;
  }
  const update = { box: doc.box };

  await User.findByIdAndUpdate(doc.id, update);
  const data = {
    monument_levelup: {
      capacity: doc.box.capacity,
      monument: doc.box.monument,
    },
  };
  encryptAndSend(data, res, req);
};
