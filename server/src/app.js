import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security headers
app.use(helmet());

// Only our React app may call this API from a browser.
// credentials: true lets the browser send cookies (needed for the refresh token later).
app.use(
  cors({
    origin: new URL(env.CLIENT_URL).origin, // strips any trailing slash/path
    credentials: true,
  })
);

// Request logging: concise in development, standard Apache-style in production
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Parse JSON request bodies into req.body
app.use(express.json());

// Reads cookies into req.cookies (the refresh token lives in one)
app.use(cookieParser());

// Health check: lets us (and later, hosting platforms) confirm the API is alive
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// All feature routes live under /api/v1
app.use('/api/v1', routes);

// Must stay LAST: unmatched routes -> 404, then every error -> one JSON reply
app.use(notFound);
app.use(errorHandler);

export default app;
