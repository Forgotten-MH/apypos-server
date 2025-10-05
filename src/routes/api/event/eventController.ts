import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const infoGet = (req: Request, res: Response) => {
  const data = {
    beginner_node_id: [1122664016],
    event_info: [
      
      // {
      //   accumulate_rewards: [
      //     // {
      //     //   is_clear: 0,
      //     //   item_list: {
      //     //     //items
      //     //   },
      //     //   reward_id: 0,
      //     //   str_id: 0,
      //     //   limit_enable: 0,
      //     //   other_item_list: {
      //     //     display: [
      //     //       // {
      //     //       //   amount:0,
      //     //       //   mst_display_id:0
      //     //       // }
      //     //     ],
      //     //     remain_time: 0,
      //     //     score: 0,
      //     //   },
      //     // },
      //   ],
      //   banner_id: 40001,
      //   bingo_point_multiplication: 5,
      //   event_type_id: 6,   //6 = Genki
      //   force_howto_reference_time: 2,
      //   fuel_karidama_recovery_value: 5,
      //   fuel_max_value: 5,
      //   fuel_recovery_karidama_amount: 5,
      //   guild_accumulate_rewards: [
      //     // {
      //     //   is_clear: 0,
      //     //   item_list: {
      //     //     //items
      //     //   },
      //     //   reward_id: 0,
      //     //   str_id: 0,
      //     //   limit_enable: 0,
      //     //   other_item_list: {
      //     //     display: [
      //     //       // {
      //     //       //   amount:0,
      //     //       //   mst_display_id:0
      //     //       // }
      //     //     ],
      //     //     remain_time: 0,
      //     //     score: 0,
      //     //   },
      //     // },
      //   ],
      //   guild_stretch_rewards: [
      //     // {
      //     //   is_clear: 0,
      //     //   item_list: {
      //     //     //items
      //     //   },
      //     //   reward_id: 0,
      //     //   str_id: 0,
      //     //   limit_enable: 0,
      //     //   other_item_list: {
      //     //     display: [
      //     //       // {
      //     //       //   amount:0,
      //     //       //   mst_display_id:0
      //     //       // }
      //     //     ],
      //     //     remain_time: 0,
      //     //     score: 0,
      //     //   },
      //     // },
      //   ],
      //   guild_stretch_total_point: 0,
      //   is_guild_event: -1,
      //   loop_random_rewards: {
      //     interval: 0,
      //     next_random_reward: {
      //       next_score: 0,
      //     },
      //     random_reward_table: [
      //       // {
      //       //   item_list:{},
      //       //   reward_id:0
      //       //   str_id:0
      //       // }
      //     ],
      //   },
      //   loop_rewards: {
      //     interval: 0,
      //     loop_reward_table: [
      //       // {
      //       //   item_list:{},
      //       //   reward_id:0
      //       // }
      //     ],
      //     next_loop_reward: {
      //       next_score: 0,
      //       reward_id: 0,
      //     },
      //   },
      //   loop_start_value: 5,
      //   m16_meta_normal_node_id: 0,
      //   mst_event_info_id: 628862266, //controls the event  (eventHome.xml) if (mIsDisplayHome == true) then it displays a button for monster //also populates the url  id 
      //   mst_event_point_id: 4081529372, //point type for event
      //   mst_event_shop_id: 1,   //TODO find out how to trigger shop
      //   mst_power_id: 1958874842,
      //   name: "Event Name",
      //   now_fuel: 5,
      //   open: 0,
      //   open_remain: 0,
      //   close: 3600,  //epoch time
      //   close_remain: 3600, //mili seconds
      //   end: 3600,    //epoch time
      //   end_remain: 3600,  //mili seconds
      //   start: 0,
      //   start_remain: 0,
      //   opening_mst_drama_id: 2596409178, //plays cutscene before entering....
      //   part_extend_ids: [2200962261], //numbers
      //   quest_extend_ids: [2200962261], //numbers
      //   recovery_fuel_second: 2,
      //   remain_fuel_full: 4,
      //   target_event_node_infos: [3424126991], //numbers
      //   target_forest_quest_id: 2200962261,
      //   target_lottery_id: 1,
      //   target_part_infos: [2200962261], //numbers
      //   target_score_node_infos: [], //numbers
      //   total_guild_point: 23,
      //   total_point: 24,
      // },
      
    ],
    total_event_point_info: [
      {
        amount: 20,
        mst_event_point_id: 898968147,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const limitedskillGet = (req: Request, res: Response) => {
  const data = {
    limited_skill_excl_ev_infos: [],
    limited_skill_infos: [],
  };
  encryptAndSend(data, res, req);
};
