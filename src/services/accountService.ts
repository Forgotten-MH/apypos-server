import User, { type IUser } from '../model/user.js';

export function generateToken(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}

export async function findUserByCredentials(
  loginId: string,
  secretId: string,
): Promise<IUser | null> {
  return User.findOne({ login_id: loginId, secret_id: secretId });
}

export async function updateMigrationData(
  loginId: string,
  secretId: string,
  migrationData: {
    mst_himitsu_question_id: number;
    himitsu_answer: string;
    migration_pass: string;
    migration_id: string;
  },
): Promise<IUser | null> {
  return User.findOneAndUpdate(
    { login_id: loginId, secret_id: secretId },
    {
      'transfer.mst_himitsu_question_id': migrationData.mst_himitsu_question_id,
      'transfer.himitsu_answer': migrationData.himitsu_answer,
      'transfer.migration_pass': migrationData.migration_pass,
      'transfer.migration_id': migrationData.migration_id,
    },
    { new: true },
  );
}

export async function processMigrationAuth(
  migrationId: string,
  migrationPass: string,
  uuId: string,
  secretId: string,
): Promise<IUser | null> {
  return User.findOneAndUpdate(
    {
      'transfer.migration_id': migrationId,
      'transfer.migration_pass': migrationPass,
    },
    { uu_id: uuId, secret_id: secretId },
    { new: true },
  );
}

export async function createUser(
  uuId: string,
  secretId: string,
  sessionId: string,
): Promise<IUser> {
  const newUser = new User({
    uu_id: uuId,
    secret_id: secretId,
    login_id: generateToken(8),
    user_id: generateToken(24),
    game_id: generateToken(8),
    current_session: sessionId,
    tutorial_step: 110,
  });
  await newUser.save();
  return newUser;
}

export async function loginUser(
  uuId: string,
  secretId: string,
  sessionId: string,
): Promise<{ user: IUser; error?: 'NOT_FOUND' | 'NOT_AUTHENTICATED' }> {
  const doc = await User.findOne({ uu_id: uuId });
  if (!doc) {
    return { user: null as unknown as IUser, error: 'NOT_FOUND' };
  }
  if (doc.secret_id !== secretId) {
    return { user: null as unknown as IUser, error: 'NOT_AUTHENTICATED' };
  }
  const updated = await User.findOneAndUpdate(
    { uu_id: uuId },
    { current_session: sessionId },
    { new: true },
  );
  return { user: updated! };
}
