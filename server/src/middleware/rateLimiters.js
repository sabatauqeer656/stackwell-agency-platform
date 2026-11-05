import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError.js';

// Slows down password guessing: at most 10 login attempts per IP every 15 minutes.
// The limit is counted in memory, which is fine for one server instance.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true, // sends RateLimit-* headers so clients can see the limit
  legacyHeaders: false,
  handler: (req, res, next) =>
    next(new AppError('Too many login attempts. Please try again in 15 minutes.', 429, 'RATE_LIMITED')),
});
