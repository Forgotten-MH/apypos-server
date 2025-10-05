import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const forestRestart = (req: Request, res: Response) => {
  const data = {
    boost_type: 0,
    enable_limited_skill_id_list: [],
    enable_partner_limited_skill_id_list: [],
    enable_talisman: 0,
    enable_talisman_partner: 0,
    floor_map_id: 0,
    forest_block_list: [
      // {
      //   area_no: 0,
      //   block_idx: 0,
      //   block_type: 0,
      //   disaster_id: 0,
      //   forest_block_instance_list: [
      //     {
      //       hunter_info: {
      //         model_info: {
      //           face: 1,
      //           gender: 1,
      //           hair: 1,
      //           hair_color: 1,
      //           inner: 1,
      //           skin: 1,
      //         },
      //         name: "sdes",
      //       },
      //       instance_id: 0,
      //       instance_type: 0,
      //       monster_info: {
      //         enemy_no: 3,
      //         is_boss_place: 0,
      //         other_table_id: 4,
      //         param_table_id: 7,
      //       },
      //       monster_parts_info: {
      //         parent_serial_no: 0,
      //         rem_no: 0,
      //       },
      //       pick_info: {
      //         element: 0,
      //       },
      //       serial_no: 1,
      //     },
      //   ],
      //   forest_drop_list: [
      //     {
      //       item_list: {},
      //       serial_no: 0,
      //       tmp_item_list: {
      //         bingocards: [{ amount: 0, item_id: 0 }],
      //         bugis: [{ item_id: 0, remain_area_count: 0 }],
      //         equipskills: [{ is_equip: 0, item_id: 0 }],
      //         shinikiitems: [{ amount: 0, item_id: 0, place_id: 0 }],
      //       },
      //       instance_id: 0,
      //       map_no: 1,
      //       place_id: 1,
      //     },
      //   ],
      //   instance_id: 0,
      //   playing_level: 1,
      //   playing_node_info: {
      //     mst_forest_node_id: 1266345260,
      //     mst_forest_quest_id: 2045337685,
      //   },
      // },
    ],
  };
  encryptAndSend(data, res, req);
};

export const forestInfoGet = (req: Request, res: Response) => {
  const data = {
    boost_consume_fuel_magnification: 1,
    boost_point_magnification: 1,
    event_name: "forest Info Get",
    forest_item_list: [{ amount: 0, item_id: 0, place_id: 0 }],
    mst_event_info_id: 3424126991,
    now_fuel: 6,
    open_forest_node_list: [
      {
        idx: 1,
        level_infos: [
          {
            clear_reward_item_list: {
              //item_list...
            },
            consume_fuel: 1,
            is_fixed_floor_boss: 0,
            mst_forest_quest_id: 2200962261,
            state: 1,
          },
        ],
        mst_forest_node_id:1276584245
      },
    ],
    remain_fuel_full: 2,

  };
  encryptAndSend(data, res, req);
};

export const questForestProgress = (req: Request, res: Response) => {
  const data = {
    instance_id: 0,
    mst_event_info_id: 3424126991,
    playing_node_info: {
      mst_forest_node_id: 1276584245,
      mst_forest_quest_id: 2200962261,
    },
    progress: 1,
  };
  encryptAndSend(data, res, req);
};

export const questForestRestart = (req: Request, res: Response) => {
  const data = {
    boost_type: 0,
    enable_limited_skill_id_list: [], //s64
    enable_partner_limited_skill_id_list: [],
    enable_talisman: 0,
    enable_talisman_partner: 0,
    floor_map_id: 0,
    forest_block_list: [
    //   {
    //     area_no: 1,
    //     block_idx: 1,
    //     block_type: 0,
    //     disaster_id: 0,
    //     forest_block_instance_list: [
    //       {
    //         hunter_info:{
    //           model_info:{
    //             face: 0, gender: 0, hair: 0, hair_color: 0, inner: 0, skin: 0 
    //           },
    //           name:"test"
    //         },
    //         instance_id:0,
    //         instance_type:0,
    //         monster_info: {
    //           enemy_no: 3,
    //           is_boss_place: 0,
    //           other_table_id: 4,
    //           param_table_id: 7,
    //         },
    //         monster_parts_info: {
    //           parent_serial_no: 0,
    //           rem_no: 0,
    //         },
    //         pick_info: {
    //           element: 0,
    //         },
    //         serial_no: 1,
    //       }
    //     ],
    //     forest_drop_list: [
    //   //     {item_list: {
    //   //     collections: [{ mst_collection_id: 0 }],
    //   //     equipments: [
    //   //       {
    //   //         auto_potential_composite: 0,
    //   //         awaked: 0,
    //   //         created: 0,
    //   //         elv: 0,
    //   //         endAwakeCount: 0,
    //   //         endAwakeRemain: 0,
    //   //         end_remain: 0,
    //   //         equipment_id: "",
    //   //         evolve_start_time: 0,
    //   //         favorite: 0,
    //   //         is_awake: 0,
    //   //         is_complete_auto_potential_composite: 0,
    //   //         mst_equipment_id: 0,
    //   //         potential: 0,
    //   //         slv: 0,
    //   //         start_remain: 0,
    //   //       },
    //   //     ],
    //   //     growth_items: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_growth_item_id: 0,
    //   //       },
    //   //     ],
    //   //     katamaris: [
    //   //       {
    //   //         mst_katamari_type_id: 0,
    //   //         equipments: [
    //   //           {
    //   //             auto_potential_composite: 0,
    //   //             awaked: 0,
    //   //             created: 0,
    //   //             elv: 0,
    //   //             endAwakeCount: 0,
    //   //             endAwakeRemain: 0,
    //   //             end_remain: 0,
    //   //             equipment_id: "",
    //   //             evolve_start_time: 0,
    //   //             favorite: 0,
    //   //             is_awake: 0,
    //   //             is_complete_auto_potential_composite: 0,
    //   //             mst_equipment_id: 0,
    //   //             potential: 0,
    //   //             slv: 0,
    //   //             start_remain: 0,
    //   //           },
    //   //         ],
    //   //       },
    //   //     ],
    //   //     limiteds: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_limited_id: 0,
    //   //       },
    //   //     ],
    //   //     matatabis: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_matatabi_id: 0,
    //   //       },
    //   //     ],
    //   //     materials: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_material_id: 0,
    //   //       },
    //   //     ],
    //   //     monument: {
    //   //       augite: [
    //   //         {
    //   //           amount: 0,
    //   //           mst_augite_id: 0,
    //   //           mst_monument_type_id: 0,
    //   //         },
    //   //       ],
    //   //       hr: 0,
    //   //       mlv: {
    //   //         atk: 1,
    //   //         def: 1,
    //   //         hp: 1,
    //   //         sp: 1,
    //   //       },
    //   //     },
    //   //     otomos: [
    //   //       {
    //   //         created: 0,
    //   //         exp: 0,
    //   //         mst_otomo_id: 2092467563,
    //   //         otomo_id: "OT_OTOMO_CHAR_ID_001",
    //   //         subskill: [0],
    //   //       },
    //   //     ],
    //   //     payments: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_payment_id: 0,
    //   //       },
    //   //     ],
    //   //     pcoins: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_pcoin_id: 0,
    //   //       },
    //   //     ],
    //   //     points: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_event_point_id: 0,
    //   //       },
    //   //     ],
    //   //     powers: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_power_id: 0,
    //   //       },
    //   //     ],
    //   //     stamp_sets: [
    //   //       {
    //   //         amount: 0,
    //   //         mst_stamp_set_id: 0,
    //   //       },
    //   //     ],
    //   //     zenny: 0,
    //   //   },
    //   //   serial_no:0,
    //   //   tmp_item_list: {
    //   //     bingocards: [{ amount: 0, item_id: 0 }],
    //   //     bugis: [{ item_id: 0, remain_area_count: 0 }],
    //   //     equipskills: [{ is_equip: 0, item_id: 0 }],
    //   //     shinikiitems: [{ amount: 0, item_id: 0, place_id: 0 }],
    //   //   },
    //   //   instance_id: 0,
    //   //   map_no: 1,
    //   //   place_id: 1,
    //   // }
    // ],
    //     instance_id: 0,
    //     map_no: 0,
    //     place_id: 0,
    //   },
    ],
    instance_id: 0,
    playing_level: 0,
    playing_node_info: {
      mst_forest_node_id: 1276584245,
      mst_forest_quest_id: 1889559732,
    },
  };
  encryptAndSend(data, res, req);
};

export const questForestEnd = (req: Request, res: Response) => {
  const data = {
    boost_point_magnification: 0,
    boost_type: 0,
    campaign_value: 0,
    enemy_point: 0,
    equip_skill_magnification: 0,
    event_item_skill_magnification: 0,
    event_point_id: 0,
    forest_equip_skill_magnification: 0,
    is_complete_forest: 0,
    mst_event_info_id: 3424126991,
    new_open_forest_node_id_list: [],
    new_open_forest_quest_id_list: [],
    now_fuel: 0,
    pop_list: [],
    item_list: {
      collections: [
        // { mst_collection_id: 0 }
      ],
      equipments: [
        // {
        //   auto_potential_composite: 0,
        //   awaked: 0,
        //   created: 0,
        //   elv: 0,
        //   endAwakeCount: 0,
        //   endAwakeRemain: 0,
        //   end_remain: 0,
        //   equipment_id: "",
        //   evolve_start_time: 0,
        //   favorite: 0,
        //   is_awake: 0,
        //   is_complete_auto_potential_composite: 0,
        //   mst_equipment_id: 0,
        //   potential: 0,
        //   slv: 0,
        //   start_remain: 0
        // }
      ],
      growth_items: [
        //   {
        //   amount: 0,
        //   mst_growth_item_id: 0
        // }
      ],
      katamaris: [
        // {
        //   mst_katamari_type_id: 0,
        //   equipments: [
        //     {
        //       auto_potential_composite: 0,
        //       awaked: 0,
        //       created: 0,
        //       elv: 0,
        //       endAwakeCount: 0,
        //       endAwakeRemain: 0,
        //       end_remain: 0,
        //       equipment_id: "",
        //       evolve_start_time: 0,
        //       favorite: 0,
        //       is_awake: 0,
        //       is_complete_auto_potential_composite: 0,
        //       mst_equipment_id: 0,
        //       potential: 0,
        //       slv: 0,
        //       start_remain: 0
        //     }
        //   ]
        // }
      ],
      limiteds: [
        //   {
        //   amount: 0,
        //   mst_limited_id: 0
        // }
      ],
      matatabis: [
        //   {
        //   amount: 0,
        //   mst_matatabi_id: 0
        // }
      ],
      materials: [
        //   {
        //   amount: 0,
        //   mst_material_id: 0
        // }
      ],
      monument: {
        augite: [
          //   {
          //   amount: 0,
          //   mst_augite_id: 0,
          //   mst_monument_type_id: 0
          // }
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
        // {
        //   amount: 0,
        //   mst_pcoin_id: 0
        // }
      ],
      points: [
        // {
        //   amount: 0,
        //   mst_event_point_id: 0
        // }
      ],
      powers: [
        // {
        //   amount: 0,
        //   mst_power_id: 0
        // }
      ],
      stamp_sets: [
        // {
        //   amount: 0,
        //   mst_stamp_set_id: 0
        // }
      ],
      zenny: 0,
    },
    total_event_point_info: [
      // { amount: 0, mst_event_point_id: 0 }
    ],
    total_point: 0,
  };
  encryptAndSend(data, res, req);
};
