import { Request, Response } from "express";
import path from 'path';

const huntersWebUrl = "https://localhost/" //this is the hunters.mh-xr.jp

export const getWebContent = (req: Request, res: Response) => {
  
const filePath = path.join(__dirname, '..',  '..', 'public',"web-res", 'web-content.html');
  res.sendFile(filePath);

};
export const getNoticeIndexOld = (req: Request, res: Response) => {
  const filePath = path.join(__dirname, '..',  '..','public',"web-res", 'notice-index-old.html');
  res.sendFile(filePath);

};

export const getNoticeIndex = (req: Request, res: Response)=>{
  res.redirect(huntersWebUrl+'#/info/top/3/0'); 
}

export const getScheduleIndex = (req: Request, res: Response)=>{
  res.redirect(huntersWebUrl+'#/schedule/top'); 
}
export const getScheduleIndexOld = (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '..',  '..','public',"web-res", 'schedule-index-old.html');
  res.sendFile(filePath);

};

export const getFirstDL = (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '..',  '..','public',"web-res", 'first-dl.html');
  res.sendFile(filePath);

};