import { Response, Request } from "express";
import { EncryptionService } from "./encryptionService";
import { TimeService } from "../timeService";

const encryptionService = new EncryptionService();
const sessionStore = {}; // Simple in-memory store to track sessions by IP

const timeService = new TimeService();

export function encryptAndSend(
  data: object,
  res: Response,
  req: Request,
  error_code: number = 0, //TODO create a error code ENUM from EAPI_jpn.gmd in GUI_msg.arc
  error_category: number = 0, //1 seems to retry automatically  2: error 3:would you like to retry question
  error_detail: string = "",
  status: number = 200,

) {
  let session_token = sessionStore[req.ip]; // Use req.ip to uniquely identify the client

  if (!session_token) {
    session_token = crypto.randomUUID().toString();
    sessionStore[req.ip] = session_token; // Store the token in the in-memory session store

    console.log("Generated new session token:", session_token);
  }

  const responseData = {
    ...data,
    error_code: error_code,
    error_category: error_category,
    error_detail: error_detail,
    app_ver_android: "09.03.06",
    app_ver_ios: "09.03.06",
    app_ver: "09.03.06",
    res_ver: 282, //controlls banner version url /download/android/v0282/stdDL/download.list Official Value: 282
    banner_ver: 91, //if set to 0 /api/banner/dllist/get is not called if you increment it to 1 it will be called then not called again untill incremented to 2 (Possible incremental update?) Official Value: 91
    session_id: session_token,
    block_seq: 0, //Possibly need to increment this for cycling encryption. (Client ignores if 0)
    one_day_time: timeService.getOneDayTime(),
    now_time: timeService.getNowTime(),
    relogin_time: timeService.getRelogTime(),
  };
  // console.log("Current Time Japan",timeService.getJapanTime())
  // console.log("Response: \n ############")
  // console.log(responseData)
  const encryptedData = encryptionService.encrypt(JSON.stringify(responseData));
  // console.log("now_time:",responseData.now_time)
  // console.log("relogin_time:",responseData.relogin_time)
  console.log("Response Body:\n", JSON.stringify(responseData, null, "\t"));

  res
    .status(status)
    .header("Content-Type", "application/octet-stream")
    .send(encryptedData);
}

export function decryptAndParse(data: Buffer) {
  const decryptedData = encryptionService.decrypt(data);
  const parsedData = JSON.parse(decryptedData);
  return parsedData;
}
