import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const progress = (req: Request, res: Response) => {
  //Initial Load
  const data = {
    balloon_color_id: 3, //0:grau 1:yellow 2:green 3:pink
    currency_ammount: 5,
    discount_currency_ammount: 5,
    island_reward_times: 5,
    message_leaving: "message_leaving",
    message_waiting: "message_waiting",
    mst_nyanken_id: 2022298312, //nyanken quests
    nyanken_icon_id: 0, //unk ids (looking at the files this might be 0 there are 5 icons but no ids other than 0000)
    prob_effect_value: 5,
    rare_appear_time: 5,
    rare_flag: 0, //1:!! 2:pulsating !!
    return_time: 5,
  };
  encryptAndSend(data, res, req);
};

export const islandInfoGet = (req: Request, res: Response) => {
  //Initial Load
  const data = {
    area_info_list: [
      // {
      //   clear_num: 0,
      //   last_reward_type: 0,
      //   reward_id: 0,
      //   reward_type: 0,
      // },
    ],
    area_reward_list: [
      {
        reward_id: 0,
        normal_reward_list: [
          {
            is_reward: 1,
            prob_type_id: 0,
            reward_item: {

              
              katamaris: [
                {
                  mst_katamari_type_id: 1286668442,
                  equipment: [
                    {
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
                      is_awake: 0,
                      is_complete_auto_potential_composite: 0,
                      mst_equipment_id: 3880313379,
                      potential: 0,
                      slv: 0,
                      start_remain: 0,
                    },
                  ],
                },
              ],
            },
          },
        ],
        special_reward_list: [
          // {
          //   is_reward:0,
          //   prob_type_id:0,
          //   reward_item:{
          //     travel: [
          //         {
          //           amount: 0,
          //           mst_travel_id: 0
          //         }
          //       ]
          //   }
          // }
        ],
      },
    ],
    currency_ammount: 0,
    discount_currency_ammount: 0,
    mst_nyanken_id: 9116,
    play_before_result: 0,
    play_result: 0,
    prob_effect_value: 0,
    reward_times: 0,
  };
  encryptAndSend(data, res, req);
};

export const historyGet = (req: Request, res: Response) => {
  const data = {
    balloon_color_id: 0,
    currency_ammount: 0,
    discount_currency_ammount: 0,
    island_reward_times: 0,
    message_leaving: "message_leaving",
    message_waiting: "message_waiting",
    mst_nyanken_id: 9116,
    nyanken_icon_id: 0,
    prob_effect_value: 0,
    rare_appear_time: 0,
    rare_flag: 0,
    return_time: 0,
  };
  encryptAndSend(data, res, req);
};

export const QuestList = (req: Request, res: Response) => {
  const data = {
    questDataList: [
      {
        beginner_flag: 0,
        close: 0,
        currency_ammount: 0,
        currency_type: 0,
        discount_currency_ammount: 0,
        island_info: {
          area_info_list: [
            // {
            //   clear_num:0,
            //   last_reward_type:0,
            //   reward_id:0,
            //   reward_type:0,
            // }
          ],
          area_reward_list: [],
        },
        play_result: 0,
        prob_effect_value: 0,
        reward_times: 0,
        mst_banner_id: 9116,
        mst_nyanken_id: 9116,
        name: "name",
        open: 0,
        play_limit: 0,
        play_now: 0,
        quest_state: 0,
        quest_time: 0,
        sequence_no: 0,
        sort_key: 0,
        start: 0,
        time_display_flag: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
