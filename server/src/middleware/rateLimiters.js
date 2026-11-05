import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError.js';

// Counted per IP, in memory (fine for one server instance). Over the limit -> 429.
// Each limiter keeps its own counter, so a busy contact form never blocks logins.
const createLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true, // sends RateLimit-* headers so clients can see the limit
    legacyHeaders: false,
    handler: (req, res, next) => next(new AppError(message, 429, 'RATE_LIMITED')),
  });

// Slows down password guessing
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

// Public forms: a real visitor sends one or two messages, a bot sends hundreds
export const inquiryLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many messages sent. Please try again later.',
});

export const quoteLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many quote requests sent. Please try again later.',
});
