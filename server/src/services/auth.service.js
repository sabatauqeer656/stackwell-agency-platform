import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { signAccessToken } from '../utils/tokens.js';

// A real-looking bcrypt hash of nothing useful. When the email does not exist we still
// run one comparison against it, so a wrong email and a wrong password take the same time.
const DUMMY_HASH = '$2b$12$oyA6IsP2BBB1s84/LYgOfuvgj3MLfm0SX8j7nWfo0DkwUrsAXBBKS';

export async function loginUser({ email, password }) {
  // password is select:false in the schema, so we must ask for it explicitly here
  const user = await User.findOne({ email }).select('+password');

  const passwordOk = user ? await user.comparePassword(password) : await bcrypt.compare(password, DUMMY_HASH);

  // One generic message for every failure: never reveal whether the email exists
  if (!user || !passwordOk || !user.isActive) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save(); // password unchanged, so the pre-save hook does not re-hash

  return { user, accessToken: signAccessToken(user) };
}
