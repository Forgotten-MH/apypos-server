import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import User from "../../../model/user";

export const rename = async (req: Request, res: Response) => {
  const name = req.body.name;
  const filter = { current_session: req.body.session_id };
  const update = { character_name: name };
  const doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });

  // Set name in db
  // Send request back
  const data = {
    name: doc.character_name,
  };
  encryptAndSend(data, res, req);
};

export const get = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }

  const selectedOtomoTeam = doc.otomoteam.otomo_team.find(
    (team) => team.index === doc.otomoteam.selected_index
  );
  const data = {
    payment_model_info: {
      face: {
        man: [],
        woman: [],
      },
    },
    user_info: {
      capacity_eqp_set: doc.equipset.capacity_eqp_set,
      caplink_id: "caplnk",
      comment: doc.comment,
      equip_sets: doc.equipset.equip_sets,
      game_id: doc.game_id,
      model_info: doc.model_info,
      name: doc.character_name,
      otomo_team: {
        main: doc.box.otomos.find(
          (otomo) => otomo.otomo_id === selectedOtomoTeam.otomo_ids[0]
        ),
        sub: doc.box.otomos.find(
          (otomo) => otomo.otomo_id === selectedOtomoTeam.otomo_ids[1]
        ),
      },
      parameter: {
        //POSSIBLY NEED TO SEPERATE THESE OUT IN THE DB DUE TO BOX AND THIS BEING SEPERATE THINGS!?
        attack: doc.box.monument.mlv.atk,
        defence: doc.box.monument.mlv.def,
        hp: doc.box.monument.mlv.hp,
        rank: doc.box.monument.hr,
        sp: doc.box.monument.mlv.sp,
      },
      selected_equip_set_index: doc.equipset.selected_equip_set_index,
      selected_partner: {
        main_partner_id: doc.selected_partner.main_partner_id,
        quest_partner_id: doc.selected_partner.quest_partner_id,
      },
      social_equip: {
        social_arm: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_body: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_head: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_leg: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_waist: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
      },
      title: {
        mst_title_id: 0,
      },
      use_social_equip: -1,
      user_id: doc.user_id,
    },
  };

  encryptAndSend(data, res, req);
};

export const commentSet = async (req: Request, res: Response) => {
  const comment = req.body.comment;
  const filter = { current_session: req.body.session_id };
  const update = { comment: comment };
  const doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });

  const data = {
    comment: doc.comment,
  };

  encryptAndSend(data, res, req);
};

export const navigationNews = async (req: Request, res: Response) => {
  const data = {
    navigations: [
      //uncomment for achievement
    ],
  };
  if (false) {
    data.navigations.push({
      close_at: 3600,
      end_at: 3600,
      explain: "explain",
      is_clear: 0,
      is_reward: 0,
      item_list: {},
      limited_flag: 0,
      mst_navigation_id: 1,
      name: "Achivement Name",
      progress: 0,
      progress_max: 99,
      start_at: 1,
    });
  }

  encryptAndSend(data, res, req);
};

export const achievementNews = async (req: Request, res: Response) => {
  const data = {
    achievements: [],
    apple_achievements: [],
    google_achievements: [],
  };

  encryptAndSend(data, res, req);
};

export const achievementAll = async (req: Request, res: Response) => {
  const data = {
    achievements: [
      // {is_clear:0,
      //   is_reward:0,
      //   mst_achievement_id:0,
      //   progress:0,
      //   progress_max:100
      // }
    ],
  };

  encryptAndSend(data, res, req);
};

export const OfferCheck = async (req: Request, res: Response) => {
  const data = {
    offer_products: [
      {
        additional_point: 0,
        additional_state: 0,
        amount: 1,
        banner: "coev_04480",
        explain: "Explain offer...",
        id: 0,
        is_started: 1,
        name: "Offer Name",
        remain: 3600,
        start: 0,
        state: 1,
      },
    ],
  };

  encryptAndSend(data, res, req);
};

export const navigationAll = (req: Request, res: Response) => {
  const data = {
    //This is the left hand menu with the compass. It is a way of guding the user to do things and reward them when they have done it.
    navigations: [
      {
        close_at: 360000,
        end_at: 36000,
        explain: "Explaination! Quick brown fox.",
        is_clear: 0,
        is_reward: 0,
        item_list: {
          payments: [
            {
              amount: 50,
              mst_payment_id: 1573159746,
            },
          ],
        },
        limited_flag: 0,
        mst_navigation_id: 0,
        name: "Name 1!",
        progress: 1,
        progress_max: 6,
        start_at: 0,
      },
      {
        close_at: 360000,
        end_at: 36000,
        explain: "Explaination! Quick brown fox.",
        is_clear: 0,
        is_reward: 0,
        item_list: {
          payments: [
            {
              amount: 50,
              mst_payment_id: 1573159746,
            },
          ],
        },
        limited_flag: 1,
        mst_navigation_id: 1,
        name: "Name 2!",
        progress: 1,
        progress_max: 6,
        start_at: 0,
      },
      {
        close_at: 360000,
        end_at: 36000,
        explain: "Explaination! Quick brown fox.",
        is_clear: 0,
        is_reward: 0,
        item_list: {
          payments: [
            {
              amount: 50,
              mst_payment_id: 1573159746,
            },
          ],
        },
        limited_flag: 2,
        mst_navigation_id: 2,
        name: "Name 3!",
        progress: 6,
        progress_max: 6,
        start_at: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const titleAll = (req: Request, res: Response) => {
  const data = {
    new_titles: [
      //Makes pop up on enter
      // {
      //   is_clear: 0,
      //   mst_title_id: 0,
      //   progress: 0,
      //   progress_max: 20
      // }
    ],
    server_time: Date.now(),
    titles: [
      {
        is_clear: 1,
        mst_title_id: 2,
        progress: 0,
        progress_max: 20,
      },
      {
        is_clear: 1,
        mst_title_id: 4,
        progress: 0,
        progress_max: 20,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const titleNews = (req: Request, res: Response) => {
  const data = {
    server_time: Date.now(),
    titles: [
      // Uncomment for title pop up
      // {
      //   is_clear: 1,
      //   is_review: 0,
      //   mst_title_id: 4,
      //   progress: 1,
      //   progress_max: 99,
      // },
    ],
  };
  encryptAndSend(data, res, req);
};

export const titleSet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  const doc = await User.findOne(filter);
  if (!doc) {
    return encryptAndSend({}, res, req, 2004); //Not authenticated
  }
  const selectedOtomoTeam = doc.otomoteam.otomo_team.find(
    (team) => team.index === doc.otomoteam.selected_index
  );
  const data = {
    user_info: {
      capacity_eqp_set: doc.equipset.capacity_eqp_set,
      caplink_id: "caplnk",
      comment: doc.comment,
      equip_sets: doc.equipset.equip_sets,
      game_id: doc.game_id,
      model_info: doc.model_info,
      name: doc.character_name,
      otomo_team: {
        main: doc.box.otomos.find(
          (otomo) => otomo.otomo_id === selectedOtomoTeam.otomo_ids[0]
        ),
        sub: doc.box.otomos.find(
          (otomo) => otomo.otomo_id === selectedOtomoTeam.otomo_ids[1]
        ),
      },
      parameter: {
        attack: 1,
        defence: 1,
        hp: 1,
        rank: 1,
        sp: 1,
      },
      selected_equip_set_index: 1,
      selected_partner: {
        main_partner_id: doc.selected_partner.main_partner_id,
        quest_partner_id: doc.selected_partner.quest_partner_id,
      },
      social_equip: {
        social_arm: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_body: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_head: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_leg: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
        social_waist: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: 0,
        },
      },
      title: {
        mst_title_id: req.body.mst_title_id,
      },
      use_social_equip: -1,
      user_id: doc.user_id,
    },
  };
  encryptAndSend(data, res, req);
};

export const partnerGet = async (req: Request, res: Response) => {
  const filter = { current_session: req.body.session_id };

  let doc = await User.findOne(filter);
  doc.selected_partner.main_partner_id = req.body.main_partner_id;
  doc.selected_partner.quest_partner_id = req.body.quest_partner_id;

  let update = { selected_partner: doc.selected_partner };
  doc = await User.findOneAndUpdate(filter, update, {
    new: true,
  });

  const data = {
    selected_partner: {
      main_partner_id: doc.selected_partner.main_partner_id,
      quest_partner_id: doc.selected_partner.quest_partner_id,
    },
  };

  encryptAndSend(data, res, req);
};
export const searchId = async (req: Request, res: Response) => {
  const { uids } = req.body;
  //TODO search by uid loop over then produce below...
  const data = {
    capacity_eqp_set: 1,

    player_details: [
      {
        comment: "<string>",
        created: 12345,

        equip_arm: {
          equip_info: {
            hash: 3325982510,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        equip_body: {
          equip_info: {
            hash: 1801022340,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        equip_head: {
          equip_info: {
            hash: 69277598,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        equip_leg: {
          equip_info: {
            hash: 3353202438,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        equip_secret_weapon: {
          equip_info: {
            hash: 2006810019,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        // equip_talisman: {
        //   equip_info: {
        //     hash: 1701921942,
        //     level: 1,
        //     potential: 1,
        //     skill_level: 1,
        //   },
        // },

        is_awake: 0,
        is_enable: 0,

        equip_waist: {
          equip_info: {
            hash: 62957325,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        equip_weapon: {
          equip_info: {
            hash: 2006810019,
            level: 1,
            potential: 1,
            skill_level: 1,
          },
        },

        friend_at: 1,
        game_id: "<string>",

        guild_info: {
          gid: "<string>",
          is_guild: 1,
          is_same: 1,
          member_type: 1,
          name: "<string>",
          rank: 1,
        },

        is_captomo: 1,
        is_friend: 1,
        last_access_at: 12,
        login_freq: 1,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
export const gameId = async (req: Request, res: Response) => {
  const { gameIds } = req.body;
  //TODO search by gameIds loop over then produce below...
  const data = {
    capacity_eqp_set: 3,
    player_details: [
      {
        comment: "test",
        created: 0,
        equip_arm: {
          equip_info: {
            hash: 794677787,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        equip_body: {
          equip_info: {
            hash: 2184892081,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        equip_head: {
          equip_info: {
            hash: 3980571307,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        equip_leg: {
          equip_info: {
            hash: 784230963,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        equip_secret_weapon: {
          equip_info: {
            hash: 133663020,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        // equip_talisman: {
        //   equip_info: {
        //     hash: 1701921942,
        //     level: 0,
        //     potential: 0,
        //     skill_level: 0,
        //   },
        // },
        is_awake: 1,
        is_enable: 1,
        equip_waist: {
          equip_info: {
            hash: 3936551480,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        equip_weapon: {
          equip_info: {
            hash: 133663020,
            level: 0,
            potential: 0,
            skill_level: 0,
          },
        },
        friend_at: 1,
        game_id: "abcdef1234567890",
        guild_info: {
          gid: "5f8e7a2b9a1b3c1d2e3f4a5b",
          is_guild: 1,
          is_same: 1,
          member_type: 1,
          name: "Guild of Heroes",
          rank: 54,
        },
        is_captomo: 1,
        is_friend: 1,
        last_access_at: 1,
        login_freq: 1,
        player_id: "abcdef1234567890",
        player_name: "test",
        player_rank: 1,
        player_rank_point: 1,
        player_s_flag: 1,
        player_search_rank: 1,
        player_skin_hash: 1,
        player_skin_level: 1,
        player_skin_potential: 1,
        player_skin_skill_level: 1,
        player_total_score: 1,
      },
    ],
  };

  encryptAndSend(data, res, req);
};
