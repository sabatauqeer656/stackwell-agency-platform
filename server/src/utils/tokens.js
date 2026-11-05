import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Both tokens carry: sub (user id) and tv (the user's tokenVersion).
// If tokenVersion is bumped in the database (logout), every older token stops working.
// A JWT is signed, NOT encrypted: never put passwords or personal data in it.

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role, tv: user.tokenVersion }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), tv: user.tokenVersion }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_EXPIRES_DAYS}d`,
  });

// These throw if the token is expired, tampered with, or signed with another secret.
export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

// ---- Refresh token cookie ----
export const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true, // JavaScript cannot read it, so an XSS attack cannot steal it
  secure: env.NODE_ENV === 'production', // HTTPS only in production
  // lax is enough while client and API share a site (localhost). In production they are
  // usually on different domains, which needs 'none' (and therefore secure: true).
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1/auth', // the browser only sends it to the auth routes
};

export const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions,
    maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });

export const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, cookieOptions);
