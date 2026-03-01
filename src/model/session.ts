import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  key: string;
  session_token: string;
  created_at: number;
  last_accessed: number;
  user_agent?: string;
  account_id?: string;
  game_id?: string;
  ip_address?: string;
  device_fingerprint?: string;
}

const sessionSchema = new Schema<ISession>({
  key: { type: String, required: true, unique: true, index: true },
  session_token: { type: String, required: true },
  created_at: { type: Number, required: true },
  last_accessed: { type: Number, required: true },
  user_agent: String,
  account_id: String,
  game_id: String,
  ip_address: String,
  device_fingerprint: String,
});

// Index for session lookup/cleanup queries (app handles expiry manually in encryptionHelpers.ts)
// Note: MongoDB TTL indexes only work on Date fields; last_accessed is epoch ms (Number),
// so we use a plain index here rather than a TTL index.
sessionSchema.index({ last_accessed: 1 });

export default mongoose.model<ISession>('Session', sessionSchema);
