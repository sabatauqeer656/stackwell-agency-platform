import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

// A real bcrypt hash of nothing useful. When the email does not exist we still
// run one comparison against it, so a wrong email and a wrong password take the same time.
const DUMMY_HASH = '$2b$12$oyA6IsP2BBB1s84/LYgOfuvgj3MLfm0SX8j7nWfo0DkwUrsAXBBKS';

const issueTokens = (user) => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user),
});

export async function loginUser({ email, password }) {
  // password and tokenVersion are select:false in the schema, so we ask for them explicitly
  const user = await User.findOne({ email }).select('+password +tokenVersion');

  const passwordOk = user ? await user.comparePassword(password) : await bcrypt.compare(password, DUMMY_HASH);

  // One generic message for every failure: never reveal whether the email exists
  if (!user || !passwordOk || !user.isActive) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save(); // password unchanged, so the pre-save hook does not re-hash

  return { user, ...issueTokens(user) };
}

// Trade a valid refresh token for a fresh pair (rotation: the old refresh token is replaced).
export async function refreshSession(refreshToken) {
  const invalid = () => new AppError('Session expired. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
  if (!refreshToken) throw invalid();

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw invalid();
  }

  const user = await User.findById(payload.sub).select('+tokenVersion');
  // tokenVersion mismatch means the user logged out (or was revoked) after this token was issued
  if (!user || !user.isActive || user.tokenVersion !== payload.tv) throw invalid();

  return { user, ...issueTokens(user) };
}

// Logging out bumps tokenVersion, which kills every access and refresh token of this user.
// Never throws: an expired or missing cookie just means there is nothing left to revoke.
export async function logoutUser(refreshToken) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await User.updateOne({ _id: payload.sub, tokenVersion: payload.tv }, { $inc: { tokenVersion: 1 } });
  } catch {
    // invalid or expired token: nothing to revoke
  }
}
