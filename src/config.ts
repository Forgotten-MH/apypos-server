import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const IP = process.env.IP || "127.0.0.1";
export const WEB_URL = process.env.WEB_URL || `http://127.0.0.1/web`
export const PORT = parseInt(process.env.PORT, 10) || 80;
export const DB_IP = process.env.DB_IP || "127.0.0.1";
export const DB_PORT = parseInt(process.env.DB_PORT, 10) || 27017;
export const DB_NAME = process.env.DB_NAME || "apypos";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "example";
export const API_NOT_AVAILABLE_MAINTENANCE = Boolean(process.env.API_NOT_AVAILABLE_MAINTENANCE) || false;
export const IS_MAINTENANCE = process.env.IS_MAINTENANCE === "true" ? 1 : 0;
