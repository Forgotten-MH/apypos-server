import * as crypto from 'crypto';

export function generateUniqueId(): string {
  return crypto.randomUUID();
}
