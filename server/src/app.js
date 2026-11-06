import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

// Hosts like Render put a proxy in front of the app. Trusting ONE proxy makes req.ip the visitor's real address
// (the rate limiters depend on it) and lets secure cookies work behind HTTPS.
if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

// Security headers. The default policy only allows our own files; images may also come from Cloudinary (uploaded photos).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { 'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'] },
    },
  })
);

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

// In production this one server also serves the built React site (client/dist), so the website and the API
// share one address: no cross-site cookies, no CORS trouble, one deploy.
const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (env.NODE_ENV === 'production' && existsSync(clientDist)) {
  // Files in /assets have a content hash in their name, so browsers may keep them for a year.
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  // Any other page address belongs to React Router: send the app and let it show the right page.
  // Not /api (those stay JSON) and not addresses that look like a file (a missing .js should be a real 404).
  app.get(/^\/(?!api(\/|$))(?!.*\.\w+$).*/, (req, res) => {
    res.set('Cache-Control', 'no-cache').sendFile(path.join(clientDist, 'index.html'));
  });
}

// Must stay LAST: unmatched routes -> 404, then every error -> one JSON reply
app.use(notFound);
app.use(errorHandler);

export default app;
