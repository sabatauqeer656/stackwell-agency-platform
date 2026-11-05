import AppError from '../utils/AppError.js';
import { env } from '../config/env.js';

// Runs when no route matched the request.
export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Express recognises an error handler by its 4 arguments - keep all four.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON body (thrown by express.json())
  if (err.type === 'entity.parse.failed') {
    err = new AppError('Invalid JSON in request body', 400);
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    console.error(err); // unexpected bug: log the full error for developers
  }

  // Never leak internals of unexpected errors in production.
  const message =
    isOperational || env.NODE_ENV !== 'production'
      ? err.message
      : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.code && { code: err.code }),
      ...(err.details && { details: err.details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
