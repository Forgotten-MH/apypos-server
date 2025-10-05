import { Request, Response } from "express";
import { IP, API_NOT_AVAILABLE_MAINTENANCE, PORT, WEB_URL } from "../../config";

export const getVersionData = (req: Request, res: Response) => {
  const versionNumber = req.params[0];
  const http = PORT === 443 ? "https" : "http";
  let version = {};
  switch (versionNumber) {
    case "01.00.00":
      console.log(versionNumber);
      version = {
        res: `${http}://${IP}/res`,
        api: `${http}://${IP}/api`,
        web: `${WEB_URL}`,
        maintenance_bucket: `${http}://${IP}/`,
        maintenance_env: "maintenance_env",
      };
      break;

    case "09.03.06":
      version = {
        res: `${http}://${IP}/res`,
        api: `${http}://${IP}/api`,
        web: `${WEB_URL}`,
        maintenance_bucket: `${http}://${IP}/`,
        maintenance_env: "maintenance_env",
      };
      if (API_NOT_AVAILABLE_MAINTENANCE) {
        const newMaintenanceFields = {
          new_maintenance_bucket: `${http}://${IP}/`,
          new_maintenance_env: "maintenance_env",
        };
        version = { ...newMaintenanceFields, ...version };
      }
      break;

    default:
      // Fallback or log unexpected version

      break;
  }

  res.status(200).header("Content-Type", "application/json").send(version);
};
