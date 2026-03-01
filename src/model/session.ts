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
  last_accessed: { type: Number, required: true, index: true },
  user_agent: String,
  account_id: String,
  game_id: String,
  ip_address: String,
  device_fingerprint: String,
});

// TTL index: MongoDB automatically removes documents 24h after last_accessed
// last_accessed is stored as epoch ms, so we convert to seconds for expireAfterSeconds
// Note: MongoDB TTL works on Date fields, so we use a Date-typed field for TTL
sessionSchema.index(
  { last_accessed: 1 },
  { expireAfterSeconds: 86400 }
);

export default mongoose.model<ISession>('Session', sessionSchema);
