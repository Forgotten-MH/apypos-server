import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";
import Present from "../../../model/presents";

export const get = async(req: Request, res: Response) => {
   const { session_id } = req.body;
    const userDoc = await User.findOne({ current_session: session_id })
    if (!userDoc) {
      return encryptAndSend({}, res, req, 2004); //Not authenticated
    }
  
    const presentCount = await Present.countDocuments({
      uu_id: userDoc.uu_id,
      received: { $ne: 1 }
    });

console.log('Count of unreceived presents:', presentCount);  // Incomplete
  const data = {
    banner_list: {
      outer_banner_list: [
        //Unknown Beahviour
        // {
        //   area_id: 2,
        //   outer_banner_id: "coev_04480",
        //   url: "",
        // },
      ],
      resident_banner_list: [
        //Unknown Beahviour
        // {
        //   resident_banner_id: 8090,
        //   url: "",
        // },
      ],
    },
    campaign_list: {
      event_campaign_list: [
        {
          campaigns: [
            //Shows crown over event selected
            {
              end_remain: 36000,
              message: "Notice/Get event_campaign_list",
              mst_quest_campaign_type_id: 1,
              start_remain: 0,
              value: 1,
            },
          ],
          mst_event_node_id: 2392657253, //Event Selected
        },
      ],
      forest_campaign_list: [
        //Unknown Beahviour probably similar to above...
        {
          forest_campaigns: [
            {
              end_remain: 3600,
              message: "test",
              mst_forest_campaign_type_id: 1,
              start_remain: 0,
              value: 234,
            },
          ],
          mst_event_info_id: 3424126991,
        },
      ],

      island_campaign_list: [
        //Sets a message above the island and on quests
        {
          campaigns: [
            {
              end_remain: 36000, // 9 hours left
              message: "Notice/Get island_campaign",
              mst_quest_campaign_type_id: 2,
              start_remain: 0,
              value: 5,
            },
          ],
          mst_part_id: 3815380063, //Selected Island...
        },
      ],
      m16_campaign_list: [
        // {
        //   m16_campaigns: [
        //     {
        //       end_remain: 36000,
        //       message: "test",
        //       mst_m16_campaign_type_id: 1,
        //       normal_max: 1,
        //       normal_remain: 36000,
        //       special_max: 1,
        //       special_remain: 36000,
        //       start_remain: 3600,
        //       value: 1,
        //     },
        //   ],
        //   mst_event_info_id: 1,
        // },
      ],
      point_campaign_list: [
        // {
        //   mst_event_info_id:1,
        //   point_campaigns:[{
        //     end_remain: 36000,
        //     message: "test",
        //     mst_point_campaign_type_id:1,
        //     start_remain:3600,
        //     value:1
        //   }]
        // }
      ],
      purchase_campaign_list: [
        //Changes purchase to blue icon!
        // {
        //   end_remain:36000,
        //   start_remain:0
        // }
      ],
      score_campaign_list: [
        // {
        //   mst_event_info_id:1,
        //   score_campaigns:[{
        //     end_remain: 36000,
        //     message: "test",
        //     mst_score_campaign_type_id:1,
        //     start_remain:3600,
        //     value:1
        //   }]
        // }
      ],
      strengthen_campaign_list: [
      //   {
      //   end:3600,
      //   message:"strengthen",
      //   mst_strengthen_campaign_type_id:1,
      //   start_remain:0,
      //   value:1
      // }
    ],
    },
    emergency_info_list: [
      //Adds more notices similar to /activity/get
      // {
      //   created: 214,
      //   mst_activity_id: 1,
      //   mst_activity_type_id: 1,
      //   text: "Notice 1",
      //   user_id: "",
      // },
      // {
      //   created: 214,
      //   mst_activity_id: 2,
      //   mst_activity_type_id: 2,
      //   text: "Notice 2",
      //   user_id: "",
      // },
      // {
      //   created: 214,
      //   mst_activity_id: 3,
      //   mst_activity_type_id: 3,
      //   text: "Notice 3",
      //   user_id: "",
      // },
      // {
      //   created: 214,
      //   mst_activity_id: 4,
      //   mst_activity_type_id: 4,
      //   text: "Notice 4",
      //   user_id: "",
      // },
      // {
      //   created: 214,
      //   mst_activity_id: 5,
      //   mst_activity_type_id: 5,
      //   text: "Notice 5",
      //   user_id: "",
      // },
    ],
    free_auto: 0,
    fuwafuwa_time: Date.now(),
    increase_info: {
      max_num: 0,
      now_num: 0,
      remain_time: 3600,
    },
    invite_num: 0,
    navigationNum: {
      notClearNum: 5,
      notClearNumLimited: 1,
      notReceivedNum: 1,
      notReceivedNumLimited: 1,
    },
    offer_products: [
      // {
      //   additional_point:0,
      //   additional_state:0,
      //   amount:0,
      //   banner:"",
      //   explain:"",
      //   id:"",
      //   is_started:0,
      //   name:"",
      //   remain:0,
      //   start:0,
      //   state:0,
      // }
    ],
    purchase_increase_info: [
      // {
      //   end_timestamp:0,
      //   product_id:"",
      //   sale_id:0,
      //   sale_type:0
      // }
    ],
    purchase_stamp_info: [
      // {
      //   display_idx:0,
      //   end:0,
      //   mst_stamp_set_id:0,
      //   remain_time:0,
      //   start:0
      // }
    ],
    stretch_effect_info: {
      exchange_present: 0,
      free_auto_add: 0,
      free_auto_infinity: 0,
      increase_add: 0,
      increase_inf: 0,
      mst_event_info_id: 3454260853,
      time_info: {
        exchange_present: {
          end: 36000,
          end_remain: 36000,
          start: 0,
          start_remain: 0,
        },
        free_auto_add: {
          end: 36000,
          end_remain: 36000,
          start: 0,
          start_remain: 0,
        },
        free_auto_infinity: {
          end: 36000,
          end_remain: 36000,
          start: 0,
          start_remain: 0,
        },
        increase_add: {
          end: 36000,
          end_remain: 36000,
          start: 0,
          start_remain: 0, 
        },
      },
    },
    treasureBanner: {
      type: 2,
      url: "",
    },
    unreadCount: 0,
    new_mail: 0,
    new_present: presentCount,
  };
  encryptAndSend(data, res, req);
};
