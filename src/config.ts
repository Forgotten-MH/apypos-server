import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ quiet: true });

export const IP = process.env.IP || '0.0.0.0';
export const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1/web';
export const PORT = parseInt(process.env.PORT || '80', 10);
export const DB_IP = process.env.DB_IP || '127.0.0.1';
export const DB_PORT = parseInt(process.env.DB_PORT || '27017', 10);
export const DB_NAME = process.env.DB_NAME || 'apypos';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'example';
export const API_NOT_AVAILABLE_MAINTENANCE = process.env.API_NOT_AVAILABLE_MAINTENANCE === 'true';
export const IS_MAINTENANCE = process.env.IS_MAINTENANCE === 'true' ? 1 : 0;
export const RES_URL = process.env.RES_URL || 'http://127.0.0.1/';
export const DEBUG = process.env.DEBUG === 'true';
export const SSL_KEY_PATH = process.env.SSL_KEY_PATH || '';
export const SSL_CERT_PATH = process.env.SSL_CERT_PATH || '';
export const SSL_CA_PATH = process.env.SSL_CA_PATH || '';
