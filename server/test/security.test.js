import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startTestApp, validService } from './helpers/app.js';

let t;
before(async () => {
  t = await startTestApp();
}, { timeout: 180_000 });
after(async () => {
  await t.stop();
});

describe('authentication', () => {
  it('signs in with the right password and returns a token, never the password', async () => {
    const { email, password } = await t.signIn('admin');
    const res = await t.api('POST', '/auth/login', { json: { email, password } });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken.split('.').length === 3, 'a JWT is returned');
    assert.equal(res.body.data.user.email, email);
    assert.equal(res.body.data.user.password, undefined);
    assert.equal(JSON.stringify(res.body).includes('refreshToken'), false, 'the refresh token is not in the body');
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const { email } = await t.signIn('admin');
    const wrongPassword = await t.api('POST', '/auth/login', { json: { email, password: 'not-the-password' } });
    const unknownEmail = await t.api('POST', '/auth/login', { json: { email: 'nobody@example.com', password: 'whatever-123' } });
    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.equal(wrongPassword.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(wrongPassword.body.error.message, unknownEmail.body.error.message, 'the message does not reveal which part was wrong');
  });

  it('rejects malformed login input with field details', async () => {
    const res = await t.api('POST', '/auth/login', { json: { email: 'not-an-email' } });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.some((d) => d.field === 'email'));
    assert.ok(res.body.error.details.some((d) => d.field === 'password'));
  });

  it('keeps the refresh token in an httpOnly cookie that only the auth routes receive', async () => {
    const { email, password } = await t.signIn('admin');
    const res = await t.api('POST', '/auth/login', { json: { email, password } });
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('refreshToken='));
    assert.ok(cookie, 'a refresh cookie is set');
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Path=\/api\/v1\/auth/i);
  });

  it('protects /auth/me: no token, a bad token and a good token', async () => {
    const { token, email } = await t.signIn('editor');
    const none = await t.api('GET', '/auth/me');
    assert.equal(none.status, 401);
    assert.equal(none.body.error.code, 'NO_TOKEN');
    const bad = await t.api('GET', '/auth/me', { token: 'not.a.token' });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error.code, 'INVALID_TOKEN');
    const good = await t.api('GET', '/auth/me', { token });
    assert.equal(good.status, 200);
    assert.equal(good.body.data.user.email, email);
  });

  it('renews a session from the refresh cookie, and refuses a missing one', async () => {
    const { cookie, email } = await t.signIn('admin');
    const renewed = await t.api('POST', '/auth/refresh', { cookie });
    assert.equal(renewed.status, 200);
    assert.ok(renewed.body.data.accessToken);
    assert.equal(renewed.body.data.user.email, email);
    const without = await t.api('POST', '/auth/refresh');
    assert.equal(without.status, 401);
  });

  it('signing out revokes every token the user had', async () => {
    const { token, cookie } = await t.signIn('admin');
    assert.equal((await t.api('GET', '/auth/me', { token })).status, 200);
    assert.equal((await t.api('POST', '/auth/logout', { cookie })).status, 200);
    const afterLogout = await t.api('GET', '/auth/me', { token });
    assert.equal(afterLogout.status, 401, 'the old access token stops working');
    const refreshAgain = await t.api('POST', '/auth/refresh', { cookie });
    assert.equal(refreshAgain.status, 401, 'the old refresh cookie stops working');
  });

  it('a deactivated user cannot use a token they already hold', async () => {
    const { token, user } = await t.signIn('editor');
    await t.models.User.updateOne({ _id: user._id }, { isActive: false });
    assert.equal((await t.api('GET', '/auth/me', { token })).status, 401);
  });

  it('rate limits login attempts from one address (the 11th attempt gets 429)', async () => {
    const ip = '203.0.113.50';
    const attempt = () => t.api('POST', '/auth/login', { json: { email: 'nobody@example.com', password: 'wrong-password' }, ip });
    for (let i = 0; i < 10; i++) assert.equal((await attempt()).status, 401);
    const blocked = await attempt();
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.error.code, 'RATE_LIMITED');
    assert.ok(blocked.headers.get('ratelimit-limit'), 'the limit is announced in a header');
  });
});

describe('authorization', () => {
  const adminAreas = ['services', 'solutions', 'projects', 'testimonials', 'team', 'faqs', 'inquiries', 'quotes', 'stats'];

  it('every admin area refuses a visitor who is not signed in', async () => {
    for (const area of adminAreas) {
      const res = await t.api('GET', `/admin/${area}`);
      assert.equal(res.status, 401, `/admin/${area} is open!`);
    }
  });

  it('the public API never exposes admin-only data: drafts stay hidden', async () => {
    const { token } = await t.signIn('admin');
    const draft = await t.api('POST', '/admin/services', { token, json: validService({ title: 'Secret Draft Service', isPublished: false }) });
    assert.equal(draft.status, 201);
    const publicList = await t.api('GET', '/services');
    assert.equal(publicList.body.data.some((s) => s.title === 'Secret Draft Service'), false);
  });

  it('an editor can create and change content', async () => {
    const { token } = await t.signIn('editor');
    const created = await t.api('POST', '/admin/services', { token, json: validService({ title: 'Editor Service' }) });
    assert.equal(created.status, 201);
    const updated = await t.api('PATCH', `/admin/services/${created.body.data._id}`, { token, json: { summary: 'An updated summary that is long enough.' } });
    assert.equal(updated.status, 200);
  });

  it('an editor cannot delete anything, but an admin can', async () => {
    const admin = await t.signIn('admin');
    const editor = await t.signIn('editor');
    const created = await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'To Be Deleted' }) });
    const id = created.body.data._id;
    const asEditor = await t.api('DELETE', `/admin/services/${id}`, { token: editor.token });
    assert.equal(asEditor.status, 403);
    assert.equal(asEditor.body.error.code, 'FORBIDDEN');
    assert.ok(await t.models.Service.findById(id), 'it is still there');
    const asAdmin = await t.api('DELETE', `/admin/services/${id}`, { token: admin.token });
    assert.equal(asAdmin.status, 200);
    assert.equal(await t.models.Service.findById(id), null);
  });

  it('only an admin may change the site settings', async () => {
    const admin = await t.signIn('admin');
    const editor = await t.signIn('editor');
    const asEditor = await t.api('PATCH', '/admin/settings', { token: editor.token, json: { tagline: 'Hacked' } });
    assert.equal(asEditor.status, 403);
    const asAdmin = await t.api('PATCH', '/admin/settings', { token: admin.token, json: { tagline: 'A new tagline' } });
    assert.equal(asAdmin.status, 200);
    assert.equal(asAdmin.body.data.tagline, 'A new tagline');
  });

  it('only an admin may delete leads', async () => {
    const editor = await t.signIn('editor');
    const inquiry = await t.models.Inquiry.create({ name: 'Visitor', email: 'v@example.com', subject: 'Hello there', message: 'A message that is long enough.' });
    const res = await t.api('DELETE', `/admin/inquiries/${inquiry._id}`, { token: editor.token });
    assert.equal(res.status, 403);
  });
});
