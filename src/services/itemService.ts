function buildExtendedItemList(rewardEntries) {
  const item_list = {
    collections: [
      // {
      //     mst_collection_id: Number,
      // }
    ],
    equipments: [
      //   {
      //     auto_potential_composite: Number,
      //     awaked: Number,
      //     created: Number,
      //     elv: Number,
      //     endAwakeCount: Number,
      //     endAwakeRemain: Number,
      //     end_remain: Number,
      //     equipment_id: String,
      //     evolve_start_time: Number,
      //     favorite: Number,
      //     is_awake: Number,
      //     is_complete_auto_potential_composite: Number,
      //     mst_equipment_id: Number,
      //     potential: Number,
      //     slv: Number,
      //     start_remain: Number,
      //   },
    ],
    growth_items: [
      //   {
      //     amount: Number,
      //     mst_growth_item_id: Number,
      //   },
    ],
    katamaris: [
      //   {
      //         mst_katamari_type_id: 0,
      //         equipments: [
      //           {
      //             auto_potential_composite: 0,
      //             awaked: 0,
      //             created: 0,
      //             elv: 0,
      //             endAwakeCount: 0,
      //             endAwakeRemain: 0,
      //             end_remain: 0,
      //             equipment_id: "",
      //             evolve_start_time: 0,
      //             favorite: 0,
      //             is_awake: 0,
      //             is_complete_auto_potential_composite: 0,
      //             mst_equipment_id: 0,
      //             potential: 0,
      //             slv: 0,
      //             start_remain: 0,
      //           },
      //         ],
      //       },
    ],

    limiteds: [
      //   {
      //     amount: Number,
      //     mst_limited_id: Number,
      //   },
    ],
    matatabis: [
      //   {
      //     amount: Number,
      //     mst_matatabi_id: Number,
      //   },
    ],
    materials: [
      //   {
      //     amount: Number,
      //     mst_material_id: Number,
      //   },
    ],
    monument: {
      augite: [
        // {
        //   amount: Number,
        //   mst_augite_id: Number,
        //   mst_monument_type_id: Number,
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
      //   {
      //     created: Number,
      //     exp: Number,
      //     mst_otomo_id: Number,
      //     otomo_id: String,
      //     subskill: { type: [Number], default: [] },
      //     attack: Number,
      //     defense: Number,
      //     hp: Number,
      //     level: Number,
      //   },
    ],
    partners: [
      //   {
      //     created: Number,
      //     exp: Number,
      //     exp_max: Number,
      //     level: Number,
      //     level_cap_tier: Number,
      //     level_max: Number,
      //     mst_partner_id: Number,
      //     partner_id: String,
      //   },
    ],
    payments: [
      //   {
      //     amount: Number,
      //     mst_payment_id: Number,
      //   },
    ],
    pcoins: [
      //   {
      //     amount: Number,
      //     mst_pcoin_id: Number,
      //   },
    ],
    points: [
      //   {
      //     amount: Number,
      //     mst_event_point_id: Number,
      //   },
    ],
    powers: [
      //   {
      //     amount: Number,
      //     mst_power_id: Number,
      //   },
    ],
    stamp_sets: [
      //   {
      //     amount: Number,
      //     mst_stamp_set_id: Number,
      //   },
    ],
    zenny: 0,
  };

  for (const entry of rewardEntries) {
    const { type, id, amount = 1, value = 1, key } = entry;

    switch (type) {
      case "material":
      case "equipment":
      case "growth_item":
      case "limited":
      case "matatabi":
      case "otomo":
      case "partner":
      case "payment":
      case "pcoin":
      case "point":
      case "power":
      case "stamp_set":
      case "collection":
        // pluralize type for key matching
        const listKey = type + (type.endsWith("s") ? "" : "s");
        if (Array.isArray(item_list[listKey])) {
          item_list[listKey].push({
            type,
            amount,
            id,
            value,
          });
        }
        break;

      case "monument_hr":
        item_list.monument.hr += value;
        break;

      case "monument_mlv":
        if (key && item_list.monument.mlv.hasOwnProperty(key)) {
          item_list.monument.mlv[key] += value;
        }
        break;

      case "monument_augite":
        item_list.monument.augite.push({ id, amount, value });
        break;

      case "zenny":
        item_list.zenny += value;
        break;

      default:
        console.warn(`Unknown reward type: ${type}`);
        break;
    }
  }

  return { item_list };
}
