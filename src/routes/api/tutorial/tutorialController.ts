import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";
import { updatePartNoteState } from "../story/storyController";
import { Box, BoxService } from "../../../services/boxService";
// tutorialFlags
// 110 = is characterCreate
// 210 = isFirstTimeDownload
// 310 = isFirstTimeQuest //Jagi
// 1010 = isSecondTimeQuest  //Rathalos
// 2010 = isTrainingDL //weapon training
// 3010 = isStandardDL
// 4010 = isIslandQuestPlay //Menu
// 5010 = isIslandQuestEnd
// 0xFFFF = isTutorialEnd

export const getTutorialFlag = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = {
    flags: doc.tutorial_flags,
  };
  encryptAndSend(data, res, req);
};

export const nyankenList = async (req: Request, res: Response) => {
  const data = {
    questDataList: [
      {
        beginner_flag: 0,
        close: 0,
        currency_ammount: 0,
        currency_type: 1,
        discount_currency_ammount: 0,
        end: 0,
        island_info: {
          area_info_list: [
            // if populated (List populates)
            // {      //   clear_num: 0,
            //   last_reward_type: 0,
            //   reward_id: 1,
            //   reward_type: 2,
            // },
          ],
          area_reward_list: [
            // {      //   normal_reward_list: [
            //     {      //       is_reward: 1,
            //       prob_type_id: 1,
            //       reward_item: {      //         katamaris: [
            //           {      //             mst_katamari_type_id: 1286668442,
            //             equipment: [
            //               {      //                 auto_potential_composite: 0,
            //                 awaked: 0,
            //                 created: 0,
            //                 elv: 0,
            //                 endAwakeCount: 0,
            //                 endAwakeRemain: 0,
            //                 end_remain: 0,
            //                 equipment_id: "WD_AXE103",
            //                 evolve_start_time: 0,
            //                 favorite: 0,
            //                 is_awake: 0,
            //                 is_complete_auto_potential_composite: 0,
            //                 mst_equipment_id: 3880313379,
            //                 potential: 0,
            //                 slv: 0,
            //                 start_remain: 0,
            //               },
            //             ],
            //           },
            //         ],
            //       },
            //     },
            //   ],
            //   reward_id: 1,
            //   special_reward_list: [
            //     {      //       is_reward: 1,
            //       prob_type_id: 0,
            //       reward_item: {      //         travel: [
            //           {      //             amount: 1,
            //             mst_travel_id: 3913115050
            //           },
            //         ]
            //       }
            //     },
            //   ],
            // },
          ],
        },
        play_result: 0,
        prob_effect_value: 0,
        reward_times: 0,
        mst_banner_id: 9116,
        mst_nyanken_id: 2022298312,
        name: "test",
        open: 0,
        play_limit: 0,
        play_now: 0,
        quest_state: 0,
        quest_time: 0,
        sequence_no: 4, //setTaruNekoSeqId ???
        sort_key: 0,
        start: 0,
        time_display_flag: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const nyankenGo = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let update = { tutorial_step: 6010 };

  const doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = {
    currency_ammount: 0,
    discount_currency_ammount: 0,
    mst_nyanken_id: 2022298312,
    rare_appear_time: 0,
    rare_flag: 0,
    return_time: 0,
    tutorial_step: doc.tutorial_step,
  };
  encryptAndSend(data, res, req);
};

export const nyankenResult = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let update = { tutorial_step: 7010 };

  const doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const rewardEquip = {
    auto_potential_composite: 0,
    awaked: 0,
    created: 0,
    elv: 0,
    endAwakeCount: 0,
    endAwakeRemain: 0,
    end_remain: 0,
    equipment_id: "WD_AXE103",
    evolve_start_time: 0,
    favorite: 0,
    is_awake: 1,
    is_complete_auto_potential_composite: 0,
    mst_equipment_id: 3880313379,
    potential: 0,
    slv: 0,
    start_remain: 0,
  };
  BoxService.addItem(doc.box, "equipments", rewardEquip);
  const data = {
    effect_id: 42,
    is_island: 0, //triggers /api/nyanken/islandInfoGet
    island_result: {
      normal_result_list: [
        //Normal item list { equipment:[]}
      ],
      special_result_list: [
        {
          travel: [
            // {      //   amount: 0,
            //   mst_travel_id: 0
            // }
          ],
        },
      ],
    },
    payments: [{ amount: 50, mst_payment_id: 1573159746 }],
    result_list: {
      equipments: [rewardEquip],
    },
    tutorial_step: doc.tutorial_step,
  };
  encryptAndSend(data, res, req);
};

export const TutorialFlagSet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  let newFlags = doc.tutorial_flags;
  req.body.flags.forEach((flag) => {
    newFlags.push(flag);
  });

  let update = { tutorial_flags: newFlags };
  doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const data = {
    flags: doc.tutorial_flags,
  };

  encryptAndSend(data, res, req);
};

export const TutorialQuestStart = async (req: Request, res: Response) => {
  const data = {
    // For item drops to work
    //block_list[1].block_instance_list needs a object with matching instance id to block_list[1].instance_id and serial_no to drop list and also pop_list
    //
    instance_data: {
      block_list: [
        {
          block_idx: 1,
          block_instance_list: [
            // { instance_id: 0, serial_no: 1 }
          ],
          drop_list: [
            {
              item_list: {
                collections: [],
                equipments: [],
                growth_items: [],
                limiteds: [],
                matatabis: [],
                materials: [],
                monument: {
                  augite: [],
                  hr: 0,
                  mlv: { atk: 0, def: 0, hp: 0, sp: 0 },
                },
                otomos: [],
                partners: [],
                payments: [],
                pcoins: [],
                points: [],
                powers: [],
                stamp_sets: [],
                zenny: 100,
              },
              serial_no: 0,
            },
          ],
          instance_id: 0,
          is_insert: 0,
          is_raid: 0,
          mst_block_id: 35439225,
          repop_list: [
            // { amount: 0, serial_no: 0 }
          ],
        },
        {
          block_idx: 2,
          block_instance_list: [{ instance_id: 1, serial_no: 1 }],
          drop_list: [
            {
              item_list: {
                collections: [{ mst_collection_id: 484329504 }],
                equipments: [],
                growth_items: [],
                limiteds: [],
                matatabis: [],
                materials: [],
                monument: {
                  augite: [],
                  hr: 0,
                  mlv: { atk: 0, def: 0, hp: 0, sp: 0 },
                },
                otomos: [],
                partners: [],
                payments: [],
                pcoins: [],
                points: [],
                powers: [],
                stamp_sets: [],
                zenny: 100,
              },
              serial_no: 1,
            },
          ],
          instance_id: 1,
          is_insert: 0,
          is_raid: 0,
          mst_block_id: 4056617285,
          repop_list: [{ amount: 1, serial_no: 1 }],
        },
        {
          block_idx: 3,
          block_instance_list: [
            // { instance_id: 0, serial_no: 1 }
          ],
          drop_list: [
            {
              item_list: {
                collections: [],
                equipments: [],
                growth_items: [],
                limiteds: [],
                matatabis: [],
                materials: [],
                monument: {
                  augite: [],
                  hr: 0,
                  mlv: { atk: 0, def: 0, hp: 0, sp: 0 },
                },
                otomos: [],
                partners: [],
                payments: [],
                pcoins: [],
                points: [],
                powers: [],
                stamp_sets: [],
                zenny: 100,
              },
              serial_no: 0,
            },
          ],
          instance_id: 0,
          is_insert: 0,
          is_raid: 0,
          mst_block_id: 1806235482,
          repop_list: [
            // { amount: 0, serial_no: 0 }
          ],
        },
      ],
      bomb_lot_num: [],
      bomb_lottery: [{ bomb_id: 0, weight: 0 }],
      enable_limited_skill_id_list: [],
      enable_partner_limited_skill_id_list: [],
      enable_talisman: 0,
      enable_talisman_partner: 0,
      enemy_point_list: [
        // {  //   mst_enemy_id: 1618895799,
        //   point: 0,
        // }
      ],
      instance_id: 0,
      mission_message: "start",
      mst_quest_id: req.body.mst_quest_id ? req.body.mst_quest_id : 1778018296,
      multi_leave_check_time: 0,
      point_info: {
        armor_skill_value: 0,
        campaign_value: 0,
        get_point: 0,
        guild_bingo_bonus: 0,
        guild_total_point: 0,
        m16_get_point: 0,
        mst_event_info_id: 0,
        mst_event_point_id: 0,
        now_point: 0,
        total_point: 0,
      },
      power_up: 0,
      select_fix_equipment_idx: 0,
      subtargets: [
        // { instance_id: 0, mst_subtarget_id: 0 }
      ],
    },
  };
  console.log("Quest Request:", data.instance_data.mst_quest_id);

  encryptAndSend(data, res, req);
};

export const stepUP = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);

  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  let update = { tutorial_step: doc.tutorial_step };
  switch (doc.tutorial_step) {
    case 110:
      update = { tutorial_step: 210 };
      break;
    case 210:
      update = { tutorial_step: 310 };
      break;
    case 310:
      update = { tutorial_step: 1010 };
      break;
    case 1010:
      update = { tutorial_step: 2010 };
      break;
    case 2010:
      update = { tutorial_step: 3010 };
      break;
    case 3010:
      update = { tutorial_step: 4010 };
      break;
    case 4010:
      update = { tutorial_step: 5010 };
      break;
    case 5010:
      update = { tutorial_step: 6010 };
      break;
    case 6010:
      update = { tutorial_step: 7010 };
      break;
    case 7010:
      update = { tutorial_step: 0xffff };
      break;
  }

  doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  const data = {
    tutorial_step: update.tutorial_step,
  };
  console.log(
    ` TutorialStepUp: Old: ${doc.tutorial_step} New: ${data.tutorial_step}`
  );

  encryptAndSend(data, res, req);
};

export const TutorialQuestEnd = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };
  let doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  updatePartNoteState(doc.ocean_list, 3525753088, 3815380063, 3758796689, 2);
  doc = await User.findOneAndUpdate(
    filter,
    { tutorial_step: 5010, ocean_list: doc.ocean_list },
    {
      new: true,
    }
  );
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  //TODO make random
  const rewards = [
    { reward_type: "normal", type: "material", amount: 1, id: 1714092880 },
    { reward_type: "normal", type: "material", amount: 1, id: 1642667129 },
    { reward_type: "normal", type: "material", amount: 1, id: 1726002341 },
    { reward_type: "normal", type: "material", amount: 1, id: 1714092880 },
    { reward_type: "add", type: "material", amount: 1, id: 1726002341 },
    { reward_type: "add", type: "material", amount: 1, id: 1714092880 },
    { reward_type: "add", type: "material", amount: 1, id: 1642667129 },
    { reward_type: "add", type: "material", amount: 1, id: 1714092880 },
  ];

  const data = {
    otomo_result: [
      {
        get_exp: 20,
        mst_otomo_id: 2092467563,
        otomo_id: "OT_OTOMO_CHAR_ID_001",
      },
    ],
    tutorial_rewards: {
      tutorial_normal_add: [],
      tutorial_normal_reward: { item_list: {} },
      tutorial_zeny: 100,
    },
    tutorial_step: doc.tutorial_step,
  };

  rewards.forEach((obj, index) => {
    const idField = `mst_${obj.type}_id`;
    let key = obj.type;
    if (key === "material") key = "materials";
    if (obj.reward_type === "normal") {
      if (!data.tutorial_rewards.tutorial_normal_reward.item_list[key]) {
        data.tutorial_rewards.tutorial_normal_reward.item_list[key] = [];
      }
      data.tutorial_rewards.tutorial_normal_reward.item_list[key].push({
        amount: obj.amount,
        [idField]: obj.id,
      });
    }
    if (obj.reward_type === "add") {
      data.tutorial_rewards.tutorial_normal_add.push({
        idx: index + 1,
        value: 1,
        item_list: { [key]: [{ amount: obj.amount, [idField]: obj.id }] },
      });
    }
    //Add to box
    type BoxKey = keyof Box;
    BoxService.addItem(doc.box, key as BoxKey, {
      amount: obj.amount,
      [idField]: obj.id,
    });
  });
  doc = await User.findOneAndUpdate(filter, { box: doc.box });

  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  encryptAndSend(data, res, req);
};
