import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

const ActivityID = {
  LOGIN: 1,
  LOGOUT: 2,
  CHAT: 3,
  JOIN_QUEST: 4,
  FIND_HUNTING_PARTY: 5,
};

const ActivityType = {
  WHITE: 1,
  YELLOW: 2,
  BLUE: 3,
  RED: 4,
  GREEN: 5,
};

export const activityGet = (req: Request, res: Response) => {
  const ExamplesFoundFromVideos = [
    {
      created: Date.now(),
      mst_activity_id: 1,
      mst_activity_type_id: 1,
      text: "狩猟団に入団しよう!",
      user_id: "83SP6Q95",
    },
  ];
  const data = {
    activities: [],
  };

  ExamplesFoundFromVideos.forEach((activity) => {
    data.activities.push({
      created: activity.created,
      mst_activity_id: activity.mst_activity_id, //3 Chat, 5 Find Hunting Party
      mst_activity_type_id: activity.mst_activity_type_id, //1 White, 2 Yellow 3 Blue 4 Red
      text: activity.text,
      user_id: activity.user_id,
    });
  });

  encryptAndSend(data, res, req);
};
