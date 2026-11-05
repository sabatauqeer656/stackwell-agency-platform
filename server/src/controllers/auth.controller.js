import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { loginUser, refreshSession, logoutUser } from '../services/auth.service.js';
import { REFRESH_COOKIE, setRefreshCookie, clearRefreshCookie } from '../utils/tokens.js';

// Controllers stay thin: read the request, call a service, send the response.

// The access token goes in the JSON body (React keeps it in memory).
// The refresh token goes ONLY in the httpOnly cookie, never in the body.
export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { user, accessToken });
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await refreshSession(req.cookies[REFRESH_COOKIE]);
    setRefreshCookie(res, refreshToken); // rotation: a new refresh token replaces the old one
    sendSuccess(res, { user, accessToken });
  } catch (err) {
    clearRefreshCookie(res); // a bad cookie is useless, remove it
    throw err;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.cookies[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  sendSuccess(res, { message: 'Logged out' });
});

// req.user was set by the protect middleware
export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user });
});
