import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

// protect: the request must carry a valid access token ("Authorization: Bearer <token>").
// On success the user is attached as req.user for the controllers that follow.
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'NO_TOKEN');
  }

  let payload;
  try {
    payload = verifyAccessToken(header.slice(7));
  } catch (err) {
    // The React app uses TOKEN_EXPIRED as its cue to call /auth/refresh and retry
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    throw new AppError(code === 'TOKEN_EXPIRED' ? 'Token expired' : 'Invalid token', 401, code);
  }

  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || !user.isActive || user.tokenVersion !== payload.tv) {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  req.user = user;
  next();
});

// authorize('admin') or authorize('admin', 'editor'): use AFTER protect.
// 401 = we do not know who you are. 403 = we know, but you are not allowed.
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to do this', 403, 'FORBIDDEN'));
    }
    next();
  };
