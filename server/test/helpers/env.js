import crypto from 'node:crypto';

// Settings for tests. This file is imported BEFORE any application code, because src/config/env.js reads
// process.env once, when it is first imported, and refuses to start without valid values.
//
// Every value is set here, so the developer's real server/.env can never leak into a test: env.js loads that
// file too, but it does not overwrite variables that already exist. That also means the tests can never reach
// the real database, the real Cloudinary account or a real mail server.
const secret = () => crypto.randomBytes(32).toString('hex');

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '5999', // never used: the tests start the app on a free port of their own
  CLIENT_URL: 'http://localhost:5173',
  JWT_ACCESS_SECRET: secret(),
  JWT_REFRESH_SECRET: secret(),
  // Fake Cloudinary credentials: nothing in the tests may reach Cloudinary (a call would simply fail)
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: '000000000000000',
  CLOUDINARY_API_SECRET: 'test-secret',
  // Empty mail settings: emails are composed into an in-memory outbox instead of being sent
  SMTP_HOST: '',
  SMTP_USER: '',
  SMTP_PASS: '',
  MAIL_FROM: '',
  MAIL_TO: '',
  ADMIN_NAME: '',
  ADMIN_EMAIL: '',
  ADMIN_PASSWORD: '',
});

// Unit tests that never connect to a database still need a syntactically valid address
process.env.MONGO_URI ??= 'mongodb://127.0.0.1:1/unit-tests';
