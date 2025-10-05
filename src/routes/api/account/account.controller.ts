import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";

function generateToken(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}

export const migrationReady = async (req: Request, res: Response) => {
  const login_id = req.body.login_id;
  const secret_id = req.body.secret_id;
  //himitsu = security question
  const mst_himitsu_question_id = req.body.mst_himitsu_question_id;
  const himitsu_answer = req.body.himitsu_answer;
  const migration_pass = req.body.migration_pass;
  const migration_id = generateToken(8);
  const filter = { login_id: login_id, secret_id: secret_id };
  let update = {
    mst_himitsu_question_id: mst_himitsu_question_id,
    himitsu_answer: himitsu_answer,
    migration_pass: migration_pass,
    migration_id: migration_id,
  };

  const doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });
  const responseData = {
    migration_id: doc.migration_id,
  };
  encryptAndSend(responseData, res, req);
};

export const migrationAuth = async (req: Request, res: Response) => {
  const migration_id = req.body.migration_id;
  const migration_pass = req.body.migration_pass;
  const secret_id = req.body.secret_id; //vBoXkQhwGEPI
  const uu_id = req.body.uu_id; //0F5D39CF3EA1F0A0_

  const filter = { migration_id: migration_id, migration_pass: migration_pass };
  let update = { uu_id: uu_id, secret_id: secret_id };

  const doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });

  const responseData = {
    login_id: doc.login_id,
    user_id: doc.user_id,
  };
  encryptAndSend(responseData, res, req);
};

export const registerAccount = async (req: Request, res: Response) => {
  const uu_id = req.body.uu_id;
  const secret_id = req.body.secret_id;

  //TODO: Generate random login,user and game ids
  const newUser = new User({
    uu_id: uu_id,
    secret_id: secret_id,
    login_id: generateToken(8),
    user_id: generateToken(27),
    game_id: generateToken(8),
    current_session: req.body.session_id,
    tutorial_step: 110,
  });

  await newUser.save();

  const responseData = {
    game_id: newUser.game_id,
    is_review: 0,
    login_id: newUser.login_id,

    stretch_effect_info: {
      exchange_present: 1,
      free_auto_add: 2,
      free_auto_infinity: 3,
      increase_add: 4,
      increase_inf: 5,
      mst_event_info_id: 3424126991,
      time_info: {
        exchange_present: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
        free_auto_add: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
        free_auto_infinity: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
        increase_add: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
      },
    },
    tutorial_step: newUser.tutorial_step,
    user_id: newUser.user_id,
  };

  console.log(`TutorialStepUp: ${responseData.tutorial_step}`);

  encryptAndSend(responseData, res, req);
};

export const loginAccount = async (req: Request, res: Response) => {
  //1. Does user exist?
  let filter = { uu_id: req.body.uu_id };
  let doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 4004); //Login failed. Would you like to create another account?
  }
  if (doc.secret_id !== req.body.secret_id) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  //3. Create Session
  let update = { current_session: req.body.session_id };
  doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });

  let login = {
    auto_course_remain_time: 3600,
    event_login_bonus_info: {
      banner_path: "coev_04480",
      day: 1,
      disp_name: "event_login_bonus_info",
      end: "2026/12/30 00:05:00",
      login_bonus_reward_list: [
        // {
        //   idx: 1,
        //   item_list: {
        //     equipments: [
        //       {
        //         auto_potential_composite: 1,
        //         awaked: 0,
        //         created: 1,
        //         elv: 1,
        //         endAwakeCount: 5,
        //         endAwakeRemain: 10,
        //         end_remain: 15,
        //         equipment_id: "AD_BODY006",
        //         evolve_start_time: 1609459200,
        //         favorite: 1,
        //         is_awake: 0,
        //         is_complete_auto_potential_composite: 1,
        //         mst_equipment_id: 1801022340,
        //         potential: 100,
        //         slv: 1,
        //         start_remain: 20,
        //       },
        //     ],
        //     zenny: 1000000,
        //     pickup: 1,
        //   },
        // },
      ],
      message: "Message FOR EVENT",
      start: "2020/12/30 00:05:00",
    },
    game_id: doc.game_id,
    gender: doc.model_info.gender,
    is_review: 1,
    now_sale_premium_login_bonus_id: 0,
    popup_info: [
      // {
      //   id: 1,
      //   url: "/popup1",
      // },
    ],
    specific_popup_info: [
      // {
      //   display_time: 1, //how long pop up lasts
      //   id: 1,
      //   title: "Test",
      //   url: "/test",
      // },
    ],
    // reserve_room_id: "test", //triggers /multi/reserver/join on start up if within the object...
    stretch_effect_info: {
      exchange_present: 0,
      free_auto_add: 0,
      free_auto_infinity: 0,
      increase_add: 0,
      increase_inf: 0,
      mst_event_info_id: 0,
      time_info: {
        exchange_present: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
        free_auto_add: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
        free_auto_infinity: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
        increase_add: {
          end: 3600,
          end_remain: 3600,
          start: 0,
          start_remain: 0,
        },
      },
    },
    tutorial_step: doc.tutorial_step,
    user_id: doc.user_id,
  };

  const return_login_bonus_info_active = false;
  if (return_login_bonus_info_active) {
    const return_login_bonus_info = {
      day: 1,
      end: "2026/12/30 00:05:00",
      login_bonus_reward_list: [
        {
          idx: 1,
          item_list: {
            collections: [
              //{ mst_collection_id: 0 }
            ],
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
                amount: 0,
                mst_material_id: 0,
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
                mst_power_id: 1550991572,
              },
            ],
            stamp_sets: [
              {
                amount: 0,
                mst_stamp_set_id: 67667029,
              },
            ],
            zenny: 0,
            pickup: 0,
          },
        },
      ],
      start: "2020/12/30 00:05:00",
    };
    login = { ...return_login_bonus_info, ...login };
  }
  const premium_login_bonus_info_active = false;
  if (premium_login_bonus_info_active) {
    const premium_login_bonus_info = {
      banner_path: "coev_04490",
      day: 1,
      disp_name: "premium_login_bonus_info",
      end: "2025/12/30 00:05:00",
      latest_end_unix: 1837836662,
      latest_mst_logbo_premium_id: 1,
      login_bonus_reward_list: [
        {
          idx: 1,
          item_list: {
            collections: [
              //{ mst_collection_id: 0 }
            ],
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
                amount: 0,
                mst_material_id: 0,
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
      message: "premium_login_bonus_info message",
      start: "2020/12/30 00:05:00",
      term: 1,
    };
    login = { ...premium_login_bonus_info, ...login };
  }
  const monthly_login_bonus_info_active = false;
  if (monthly_login_bonus_info_active) {
    const monthly_login_bonus_info = {
      day: 1,
      end: "2026/12/30 00:05:00",
      login_bonus_reward_list: [
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
      start: "2020/12/30 00:05:00",
    };
    login = { ...monthly_login_bonus_info, ...login };
  }
  const login_bonus_info_active = false;
  if (login_bonus_info_active) {
    const login_bonus_info = {
      day: 1,
      today_item_list: {
        item_list: {
          collections: [
            // { mst_collection_id: 0 }
          ],
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
              amount: 0,
              mst_material_id: 0,
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
      tomorrow_item_list: {
        item_list: {
          collections: [
            //{ mst_collection_id: 0 }
          ],
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
                  equipment_id: 0,
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
              amount: 0,
              mst_material_id: 0,
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
    };
    login = { ...login_bonus_info, ...login };
  }

  console.log(`TutorialStepUp: ${login.tutorial_step}`);

  encryptAndSend(login, res, req);
};
