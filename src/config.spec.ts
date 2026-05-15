import { describe, it, expect } from 'vitest';
import {
  IP,
  WEB_URL,
  PORT,
  DB_IP,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  API_NOT_AVAILABLE_MAINTENANCE,
  IS_MAINTENANCE,
  RES_URL,
  DEBUG,
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SSL_CA_PATH,
  ENABLE_VALIDATION,
} from './config.js';

describe('config', () => {
  it('exports default values when env vars are not set', () => {
    expect(typeof IP).toBe('string');
    expect(typeof WEB_URL).toBe('string');
    expect(typeof PORT).toBe('number');
    expect(typeof DB_IP).toBe('string');
    expect(typeof DB_PORT).toBe('number');
    expect(typeof DB_NAME).toBe('string');
    expect(typeof DB_USER).toBe('string');
    expect(typeof DB_PASSWORD).toBe('string');
    expect(typeof API_NOT_AVAILABLE_MAINTENANCE).toBe('boolean');
    expect(typeof IS_MAINTENANCE).toBe('number');
    expect(typeof RES_URL).toBe('string');
    expect(typeof DEBUG).toBe('boolean');
    expect(typeof SSL_KEY_PATH).toBe('string');
    expect(typeof SSL_CERT_PATH).toBe('string');
    expect(typeof SSL_CA_PATH).toBe('string');
    expect(typeof ENABLE_VALIDATION).toBe('boolean');
  });

  it('PORT defaults to a valid number', () => {
    expect(PORT).toBeGreaterThan(0);
  });

  it('DB_PORT defaults to 27017', () => {
    expect(DB_PORT).toBe(27017);
  });
});
