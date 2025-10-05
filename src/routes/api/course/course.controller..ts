import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const premiumList = (req: Request, res: Response) => {
  const data = {
    premium_course_list: [
      {
        day: 1,
        explanation: "explanation",
        is_enable: 1,
        mst_course_premium_id: 1,
        price: 20,
        remain: 3600,
        term: 1,
        title: "title",
        reward_list: [
          {
            idx: 1,
            item_list: {
              equipments: [
                {
                  auto_potential_composite: 1,
                  awaked: 0,
                  created: 1,
                  elv: 1,
                  endAwakeCount: 5,
                  endAwakeRemain: 10,
                  end_remain: 15,
                  equipment_id: "AD_BODY006",
                  evolve_start_time: 1609459200,
                  favorite: 1,
                  is_awake: 0,
                  is_complete_auto_potential_composite: 1,
                  mst_equipment_id: 1801022340,
                  potential: 100,
                  slv: 1,
                  start_remain: 20,
                },
              ],
              growth_items: [
                {
                  amount: 0,
                  mst_growth_item_id: 0,
                },
              ],
              katamaris: [
                {
                  mst_katamari_type_id: 0,
                  equipments: [
                    {
                      auto_potential_composite: 0,
                      awaked: 0,
                      created: 0,
                      elv: 0,
                      endAwakeCount: 0,
                      endAwakeRemain: 0,
                      end_remain: 0,
                      equipment_id: "",
                      evolve_start_time: 0,
                      favorite: 0,
                      is_awake: 0,
                      is_complete_auto_potential_composite: 0,
                      mst_equipment_id: 0,
                      potential: 0,
                      slv: 0,
                      start_remain: 0,
                    },
                  ],
                },
              ],
              limiteds: [
                {
                  amount: 0,
                  mst_limited_id: 0,
                },
              ],
              matatabis: [
                {
                  amount: 0,
                  mst_matatabi_id: 0,
                },
              ],
              materials: [
                {
                  amount: 1,
                  mst_material_id: 2507637144,
                },
              ],
              monument: {
                augite: [
                  // {
                  //   amount: 0,
                  //   mst_augite_id: 0,
                  //   mst_monument_type_id: 0,
                  // },
                ],
                hr: 0,
                mlv: {
                  atk: 0,
                  def: 0,
                  hp: 0,
                  sp: 0,
                },
              },
              otomos: [
                // {
                //   created: 0,
                //   exp: 0,
                //   mst_otomo_id: 2092467563,
                //   otomo_id: "OT_OTOMO_CHAR_ID_001",
                //   subskill: [0],
                // },
              ],
              payments: [
                {
                  amount: 50,
                  mst_payment_id: 1573159746,
              },
              ],
              pcoins: [
                {
                  amount: 0,
                  mst_pcoin_id: 0,
                },
              ],
              points: [
                {
                  amount: 0,
                  mst_event_point_id: 3190222199,
                },
              ],
              powers: [
                {
                  amount: 0,
                  mst_power_id: 0,
                },
              ],
              stamp_sets: [
                {
                  amount: 0,
                  mst_stamp_set_id: 487830804,
                },
              ],
              zenny: 0,
              pickup: 0,
            },
          },
        ],
      },
    ],
  };
  encryptAndSend(data, res, req);
};
