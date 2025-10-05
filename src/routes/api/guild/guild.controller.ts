import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const userGet = (req: Request, res: Response) => {
  const data = {
    user_guild:{
      __v:5,
      _id:"6838b19f3dcb94b5a96fdf56",
      chat_freq:0,
      created:0,
      gid:"1",
      joined:1,
      login_freq:0,
      mood:0,
      receive:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      send:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      timezone:0,
      uid:"1",
      updated:0,
      waited:0,
      yarikomi:0.
    }
  };
  encryptAndSend(data, res,req);
};
export const userSetup = (req: Request, res: Response) => {
  const data = {
    user_guild:{
       __v:5,
      _id:"6838b19f3dcb94b5a96fdf56",
      chat_freq:0,
      created:0,
      gid:"",
      joined:0,
      login_freq:0,
      mood:0,
      receive:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      send:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      timezone:0,
      uid:"",
      updated:0,
      waited:0,
      yarikomi:0.
    }
  };
  encryptAndSend(data, res,req);
};
export const searchResult = (req: Request, res: Response) => {
  const data = {
    user_guild:{
       __v:5,
      _id:"6838b19f3dcb94b5a96fdf56",
      chat_freq:0,
      created:0,
      gid:"",
      joined:0,
      login_freq:0,
      mood:0,
      receive:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      send:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      timezone:0,
      uid:"",
      updated:0,
      waited:0,
      yarikomi:0.
    }
  };
  encryptAndSend(data, res,req);
};
export const create = (req: Request, res: Response) => {

  const data = {
   guild:{
    __v:0,
    _id:"",
    auto_recruit:req.body.auto_recruit,
    bingo:[],//numbers
    bonus_value:0,
    chat_freq:req.body.chat_freq,
    comment:"",
    created:0,
    exp:0,
    explusion_rule:req.body.explusion_rule,
    free_comment:req.body.free_comment,
    holding_bingo_id:0,
    mark_box:[],//numbers
    member:{
      leader:{
        created:0,
        last_login:0,
        uid:"4DC04FC7E9230A0F_"
      },
      normal:[],
      sub:[]
    },
    gid:"1",
    joined:0,
    login_freq:0,
    mood:req.body.mood,
    name:req.body.name,
    rank:0,
    receive:[
      // {
      //   _id:"",
      //   created:0,
      //   gid:"",
      //   uid:""
      // }
    ],
    recruit:req.body.recruit,
    search_id:"",
    set_mark:0,
    timezone:req.body.time,
    updated:0,
    yarikomi:req.body.yarikomi
   }
  };
  encryptAndSend(data, res,req);
};


export const getUserGuild = (req: Request, res: Response) => {
  const data = {
    guild:{
           __v:5,
      _id:"6838b19f3dcb94b5a96fdf56",
      auto_recruit:0,
      bingo:[],//numbers
      bonus_value:0,
      chat_freq:0,
      comment:"",
      created:0,
      exp:0,
      explusion_rule:0,
      free_comment:"req.body.free_comment",
      holding_bingo_id:0,
      mark_box:[],//numbers
      member:{
        leader:{
          created:0,
          last_login:0,
          uid:"4DC04FC7E9230A0F_"
        },
        normal:[],
        sub:[]
      },
      gid:"1",
      joined:1,
      login_freq:0,
      mood:0,
      name:"req.body.name",
      rank:0,
      receive:[
        // {
        //   _id:"",
        //   created:0,
        //   gid:"",
        //   uid:""
        // }
      ],
      recruit:0,
      search_id:"",
      set_mark:0,
      timezone:0,
      updated:0,
      yarikomi:0
     }
  };
  encryptAndSend(data, res,req);
};


export const bingoGet = (req: Request, res: Response) => {
  const data = {
    bingoDetail:{
      aligned_line:0,
      bingo_missions:[],
      end:0,
      end_remain:0,
      mst_bingo_sheet_id:0,
      reward_end:0,
      reward_remain:0,
      sheet_index:0,
      start:0,
      start_remain:0,
   },
   holdInfo:{
    bonus_value:1,
    is_bonus:0,
    is_guild:0,
    is_mission:0
   }
  };
  encryptAndSend(data, res,req);
};



export const searchId = (req: Request, res: Response) => {
 

  const data = {
  guild: {
    __v: 1,
    _id: "5f8e7a2b9a1b3c1d2e3f4a5b",
    auto_recruit: true,
    bingo: [101, 202, 303],
    bonus_value: 1500,
    chat_freq: 3,
    comment: "This is a guild comment",
    created: 1622548800,
    exp: 987654,
    explusion_rule: 1,
    free_comment: "Open to all hunters!",
    holding_bingo_id: 42,
    mark_box: [1, 2, 3],
    member: {
      leader: {
        created: 1622548700,
        last_login: 1622635100,
        uid: "abcdef1234567890"
      },
      normal: [
        // {
        //   created: 1622548711,
        //   last_login: 1622635111,
        //   uid: "user001"
        // },
        // {
        //   created: 1622548722,
        //   last_login: 1622635122,
        //   uid: "user002"
        // }
      ],
      sub: [
        // {
        //   created: 1622548733,
        //   last_login: 1622635133,
        //   uid: "user101"
        // }
      ]
    },
    mood: 4,
    name: "Guild of Heroes",
    rank: 7,
    receive: [
      // {
      //   _id: "recvmsg001",
      //   created: 1622550000,
      //   gid: "guild123",
      //   uid: "player456"
      // },
      // {
      //   _id: "recvmsg002",
      //   created: 1622551111,
      //   gid: "guild456",
      //   uid: "player789"
      // }
    ],
    recruit: 2,
    search_id: "search987",
    send: [
      // {
      //   _id: "sendmsg001",
      //   created: 1622552222,
      //   gid: "guild789",
      //   uid: "player321"
      // }
    ]
  }
}

  encryptAndSend(data, res,req);
};