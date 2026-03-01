import { Request, Response } from 'express';
import {
  IP,
  API_NOT_AVAILABLE_MAINTENANCE,
  PORT,
  WEB_URL,
  RES_URL,
} from '../../config';
import { createLogger } from '../../middleware/logger';
const log = createLogger('version');

export const getVersionData = (req: Request, res: Response) => {
  const versionNumber = req.params[0];
  const http = PORT === 443 ? 'https' : 'http';
  const portSuffix = PORT === 80 || PORT === 443 ? '' : `:${PORT}`;
  let version = {};
  switch (versionNumber) {
    case '01.00.00':
      log.debug(versionNumber);
      version = {
        res: `${RES_URL}res`,
        api: `${http}://${IP}${portSuffix}/api`,
        web: `${WEB_URL}`,
        maintenance_bucket: `${http}://${IP}${portSuffix}/`,
        maintenance_env: 'maintenance_env',
      };
      break;

    case '09.03.06':
      version = {
        res: `${RES_URL}res`,
        api: `${http}://${IP}${portSuffix}/api`,
        web: `${WEB_URL}`,
        maintenance_bucket: `${http}://${IP}${portSuffix}/`,
        maintenance_env: 'maintenance_env',
      };
      if (API_NOT_AVAILABLE_MAINTENANCE) {
        const newMaintenanceFields = {
          new_maintenance_bucket: `${http}://${IP}${portSuffix}/`,
          new_maintenance_env: 'maintenance_env',
        };
        version = { ...newMaintenanceFields, ...version };
      }
      break;

    default:
      // Fallback or log unexpected version

      break;
  }

  res.status(200).header('Content-Type', 'application/json').send(version);
};
