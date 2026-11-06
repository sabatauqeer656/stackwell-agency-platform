import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startTestApp, validService } from './helpers/app.js';

let t;
let admin;
before(async () => {
  t = await startTestApp();
  admin = await t.signIn('admin');
}, { timeout: 180_000 });
after(async () => {
  await t.stop();
});

// The test helper puts /api/v1 in front of every path; "/../.." walks back up to the site root
const root = (path) => `/../..${path}`;

describe('sitemap.xml and robots.txt', () => {
  it('lists the fixed pages and every published service, but never a draft', async () => {
    const live = await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Sitemap Live Service' }) });
    const draft = await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Sitemap Draft Service', isPublished: false }) });
    assert.equal(live.status, 201);
    assert.equal(draft.status, 201);

    const res = await t.api('GET', root('/sitemap.xml'));
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /application\/xml/);
    assert.match(res.body, /<loc>http:\/\/localhost:\d+\/<\/loc>/, 'home page');
    assert.match(res.body, /\/contact<\/loc>/);
    assert.ok(res.body.includes('/services/sitemap-live-service</loc>'), 'published service is listed');
    assert.ok(!res.body.includes('sitemap-draft-service'), 'draft service is hidden');
  });

  it('robots.txt blocks the dashboard and points to the sitemap', async () => {
    const res = await t.api('GET', root('/robots.txt'));
    assert.equal(res.status, 200);
    assert.match(res.body, /Disallow: \/admin/);
    assert.match(res.body, /Disallow: \/api\//);
    assert.match(res.body, /Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
  });
});
