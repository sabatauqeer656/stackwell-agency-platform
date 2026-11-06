import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Tests may only ever talk to a database on THIS computer (or a CI service container), never to the real one.
const LOCAL_MONGO = /^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/;

// A fresh, empty database for one test file.
//   - By default an in-memory MongoDB is started (the first run downloads its binary, later runs reuse it).
//   - Set MONGO_TEST_URI (for example in CI, where a MongoDB container is available) to use that server instead.
async function startDatabase() {
  const dbName = `stackwell_test_${crypto.randomUUID().slice(0, 8)}`;
  let memory;
  let base;
  if (process.env.MONGO_TEST_URI) {
    base = process.env.MONGO_TEST_URI;
    if (!LOCAL_MONGO.test(base)) throw new Error('MONGO_TEST_URI must point at localhost. The tests create and drop a whole database.');
  } else {
    memory = await MongoMemoryServer.create();
    base = memory.getUri();
  }
  const url = new URL(base);
  url.pathname = `/${dbName}`;
  return { uri: url.toString(), memory };
}

let ipCounter = 0;
// Every request gets its own pretend visitor address, so the rate limiters (which count per address) do not
// interfere with each other. Tests of the limiters pass the same address on purpose.
const nextIp = () => `10.${Math.floor(ipCounter / 65025) % 250}.${Math.floor(ipCounter / 255) % 255}.${(ipCounter++ % 255) + 1}`;

export async function startTestApp() {
  const { uri, memory } = await startDatabase();
  await import('./env.js');
  process.env.MONGO_URI = uri; // must be set before the app is imported

  const { default: app } = await import('../../src/app.js');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  app.set('trust proxy', 1); // so the x-forwarded-for header below counts as the visitor's address
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;

  /**
   * One request. Returns { status, body, headers }.
   *   token   - sends "Authorization: Bearer <token>"
   *   json    - the body, as JSON
   *   form    - a FormData body (for uploads)
   *   cookie  - sends a Cookie header (for the refresh token)
   *   ip      - the pretend visitor address (a new one each time by default)
   */
  async function api(method, path, { token, json, form, cookie, ip, headers = {} } = {}) {
    const response = await fetch(baseUrl + path, {
      method,
      headers: {
        'x-forwarded-for': ip ?? nextIp(),
        ...(json !== undefined && { 'content-type': 'application/json' }),
        ...(token && { authorization: `Bearer ${token}` }),
        ...(cookie && { cookie }),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : form,
    });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { status: response.status, body, headers: response.headers };
  }

  const models = {
    User: (await import('../../src/models/User.js')).default,
    Service: (await import('../../src/models/Service.js')).default,
    Solution: (await import('../../src/models/Solution.js')).default,
    Project: (await import('../../src/models/Project.js')).default,
    TeamMember: (await import('../../src/models/TeamMember.js')).default,
    Testimonial: (await import('../../src/models/Testimonial.js')).default,
    Faq: (await import('../../src/models/Faq.js')).default,
    Inquiry: (await import('../../src/models/Inquiry.js')).default,
    QuoteRequest: (await import('../../src/models/QuoteRequest.js')).default,
    SiteSettings: (await import('../../src/models/SiteSettings.js')).default,
  };
  const mail = await import('../../src/services/mail.service.js');

  let userCounter = 0;
  const PASSWORD = 'Test-Password-123';
  // Creates a user directly in the database and signs in through the real login route.
  async function signIn(role = 'admin') {
    const email = `${role}.${++userCounter}.${crypto.randomUUID().slice(0, 6)}@example.com`;
    const user = await models.User.create({ name: `Test ${role}`, email, password: PASSWORD, role });
    const login = await api('POST', '/auth/login', { json: { email, password: PASSWORD } });
    const setCookie = login.headers.getSetCookie().find((cookie) => cookie.startsWith('refreshToken='));
    return {
      user,
      email,
      password: PASSWORD,
      token: login.body.data.accessToken,
      cookie: setCookie?.split(';')[0], // "refreshToken=<value>", ready to send back
    };
  }

  async function stop() {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await memory?.stop();
  }

  return { api, baseUrl, models, mail, signIn, stop, PASSWORD };
}

// Small content used by several tests
export const validService = (overrides = {}) => ({
  title: 'Custom Web Applications',
  summary: 'A short summary that is long enough.',
  description: 'A description that is long enough to pass validation.',
  ...overrides,
});
