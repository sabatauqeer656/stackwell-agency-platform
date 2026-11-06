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

// A well-formed id (24 hex characters) that no document has
const MISSING_ID = '64b64b64b64b64b64b64b64b';

const project = (solutionId, overrides = {}) => ({
  title: 'Online Banking App',
  clientName: 'Acme Bank',
  solution: solutionId,
  summary: 'A short project summary text.',
  challenge: 'The client needed a faster and safer way to bank.',
  approach: 'We rebuilt the whole flow with a modern stack.',
  ...overrides,
});
const solution = (overrides = {}) => ({
  title: 'Fintech',
  summary: 'Software for banks and payments.',
  description: 'A description of the fintech industry that is long enough.',
  ...overrides,
});

describe('services', () => {
  it('creates a service with a web address made from its title, and keeps addresses unique', async () => {
    const first = await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Mobile App Development' }) });
    assert.equal(first.status, 201);
    assert.equal(first.body.data.slug, 'mobile-app-development');
    assert.equal(first.body.data.isPublished, true, 'published unless said otherwise');
    const second = await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Mobile App Development' }) });
    assert.equal(second.body.data.slug, 'mobile-app-development-2');
  });

  it('refuses invalid input with a list of field problems', async () => {
    const res = await t.api('POST', '/admin/services', { token: admin.token, json: { title: 'A', summary: 'short', description: 'short' } });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    const fields = res.body.error.details.map((d) => d.field);
    assert.deepEqual(fields.sort(), ['description', 'summary', 'title']);
  });

  it('refuses a malformed id before it reaches the database', async () => {
    const res = await t.api('GET', '/admin/services/not-an-id', { token: admin.token });
    assert.equal(res.status, 400);
  });

  it('hides drafts from the public until they are published', async () => {
    const created = await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Hidden Draft', isPublished: false }) });
    const { _id, slug } = created.body.data;
    assert.equal((await t.api('GET', `/services/${slug}`)).status, 404, 'a draft looks like it does not exist');
    assert.equal((await t.api('GET', `/admin/services/${_id}`, { token: admin.token })).status, 200, 'the team can still open it');
    await t.api('PATCH', `/admin/services/${_id}`, { token: admin.token, json: { isPublished: true } });
    assert.equal((await t.api('GET', `/services/${slug}`)).status, 200);
  });

  it('keeps the address when the title is edited, and re-checks a typed address for uniqueness', async () => {
    const a = (await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Address Test One' }) })).body.data;
    const b = (await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Address Test Two' }) })).body.data;
    const renamed = await t.api('PATCH', `/admin/services/${a._id}`, { token: admin.token, json: { title: 'A Completely New Title' } });
    assert.equal(renamed.body.data.slug, a.slug, 'public links do not break when a typo is fixed');
    const clash = await t.api('PATCH', `/admin/services/${b._id}`, { token: admin.token, json: { slug: a.slug } });
    assert.equal(clash.body.data.slug, `${a.slug}-2`);
  });

  it('refuses an update that changes nothing', async () => {
    const a = (await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Empty Update' }) })).body.data;
    const res = await t.api('PATCH', `/admin/services/${a._id}`, { token: admin.token, json: {} });
    assert.equal(res.status, 400);
  });

  it('lists with search, a published filter and pagination details', async () => {
    for (let i = 1; i <= 3; i++) await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: `Paged Service ${i}`, order: i }) });
    const page = await t.api('GET', '/admin/services?search=paged&limit=2&page=2', { token: admin.token });
    assert.equal(page.status, 200);
    assert.equal(page.body.data.length, 1);
    assert.deepEqual(page.body.meta, { page: 2, limit: 2, total: 3, totalPages: 2 });
    const drafts = await t.api('GET', '/admin/services?published=false', { token: admin.token });
    assert.ok(drafts.body.data.every((s) => s.isPublished === false));
  });

  it('deletes a service, after which it is gone', async () => {
    const a = (await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Short Lived' }) })).body.data;
    assert.equal((await t.api('DELETE', `/admin/services/${a._id}`, { token: admin.token })).status, 200);
    const again = await t.api('GET', `/admin/services/${a._id}`, { token: admin.token });
    assert.equal(again.status, 404);
    assert.equal(again.body.error.code, 'NOT_FOUND');
  });
});

describe('solutions and projects', () => {
  it('shows a project with its solution filled in, and refuses a solution that does not exist', async () => {
    const sol = (await t.api('POST', '/admin/solutions', { token: admin.token, json: solution() })).body.data;
    const created = await t.api('POST', '/admin/projects', { token: admin.token, json: project(sol._id) });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.solution.title, 'Fintech');
    assert.equal(created.body.data.solution.slug, 'fintech');
    const ghost = await t.api('POST', '/admin/projects', { token: admin.token, json: project(MISSING_ID) });
    assert.equal(ghost.status, 400);
    assert.equal(ghost.body.error.code, 'INVALID_REFERENCE');
  });

  it('does not delete a solution that projects still use', async () => {
    const sol = (await t.api('POST', '/admin/solutions', { token: admin.token, json: solution({ title: 'Healthcare' }) })).body.data;
    const proj = (await t.api('POST', '/admin/projects', { token: admin.token, json: project(sol._id, { title: 'Patient Portal' }) })).body.data;
    const blocked = await t.api('DELETE', `/admin/solutions/${sol._id}`, { token: admin.token });
    assert.equal(blocked.status, 409);
    assert.equal(blocked.body.error.code, 'IN_USE');
    assert.match(blocked.body.error.message, /1 project/);
    await t.api('DELETE', `/admin/projects/${proj._id}`, { token: admin.token });
    assert.equal((await t.api('DELETE', `/admin/solutions/${sol._id}`, { token: admin.token })).status, 200);
  });

  it('removes an optional field when it is sent as null, and only accepts web links', async () => {
    const sol = (await t.api('POST', '/admin/solutions', { token: admin.token, json: solution({ title: 'Retail' }) })).body.data;
    const proj = (await t.api('POST', '/admin/projects', { token: admin.token, json: project(sol._id, { title: 'Shop Platform', liveUrl: 'https://example.com', coverImage: 'https://example.com/cover.png' }) })).body.data;
    const cleared = await t.api('PATCH', `/admin/projects/${proj._id}`, { token: admin.token, json: { liveUrl: null } });
    assert.equal(cleared.status, 200);
    const inDb = await t.models.Project.findById(proj._id).lean();
    assert.equal('liveUrl' in inDb, false, 'removed from the document, not stored as null');
    assert.equal(inDb.coverImage, 'https://example.com/cover.png', 'other fields are untouched');
    const unsafe = await t.api('PATCH', `/admin/projects/${proj._id}`, { token: admin.token, json: { liveUrl: 'javascript:alert(1)' } });
    assert.equal(unsafe.status, 400);
  });

  it('filters the public project list by industry', async () => {
    const one = (await t.api('POST', '/admin/solutions', { token: admin.token, json: solution({ title: 'Logistics' }) })).body.data;
    const two = (await t.api('POST', '/admin/solutions', { token: admin.token, json: solution({ title: 'Education' }) })).body.data;
    await t.api('POST', '/admin/projects', { token: admin.token, json: project(one._id, { title: 'Fleet Tracker' }) });
    await t.api('POST', '/admin/projects', { token: admin.token, json: project(two._id, { title: 'Classroom App' }) });
    const res = await t.api('GET', `/projects?industry=${one.slug}`);
    assert.deepEqual(res.body.data.map((p) => p.title), ['Fleet Tracker']);
    const unknown = await t.api('GET', '/projects?industry=no-such-industry');
    assert.equal(unknown.status, 200);
    assert.deepEqual(unknown.body.data, []);
  });
});

describe('team, testimonials and FAQs', () => {
  it('stores a team member and clears an optional link', async () => {
    const created = await t.api('POST', '/admin/team', { token: admin.token, json: { name: 'Ada Lovelace', role: 'Engineer', bio: 'Wrote the first program.', linkedin: 'https://example.com/ada' } });
    assert.equal(created.status, 201);
    const cleared = await t.api('PATCH', `/admin/team/${created.body.data._id}`, { token: admin.token, json: { linkedin: null } });
    assert.equal(cleared.status, 200);
    assert.equal('linkedin' in (await t.models.TeamMember.findById(created.body.data._id).lean()), false);
    const unsafe = await t.api('PATCH', `/admin/team/${created.body.data._id}`, { token: admin.token, json: { photo: 'data:text/html;base64,AAAA' } });
    assert.equal(unsafe.status, 400);
  });

  it('links a testimonial to a project, shows the project, and can unlink it', async () => {
    const sol = (await t.api('POST', '/admin/solutions', { token: admin.token, json: solution({ title: 'Media' }) })).body.data;
    const proj = (await t.api('POST', '/admin/projects', { token: admin.token, json: project(sol._id, { title: 'Streaming Site' }) })).body.data;
    const created = await t.api('POST', '/admin/testimonials', { token: admin.token, json: { clientName: 'Grace Hopper', clientRole: 'CTO', quote: 'They delivered on time and the quality was excellent.', rating: 4, project: proj._id } });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.project.title, 'Streaming Site');
    const unlinked = await t.api('PATCH', `/admin/testimonials/${created.body.data._id}`, { token: admin.token, json: { project: null } });
    assert.equal(unlinked.status, 200);
    assert.equal(unlinked.body.data.project, undefined);
    const ghost = await t.api('POST', '/admin/testimonials', { token: admin.token, json: { clientName: 'Nobody', clientRole: 'CEO', quote: 'A quote that is long enough.', project: MISSING_ID } });
    assert.equal(ghost.status, 400);
    assert.equal(ghost.body.error.code, 'INVALID_REFERENCE');
  });

  it('only accepts ratings from 1 to 5', async () => {
    for (const rating of [0, 6, 2.5]) {
      const res = await t.api('POST', '/admin/testimonials', { token: admin.token, json: { clientName: 'Bad Rating', clientRole: 'CEO', quote: 'A quote that is long enough.', rating } });
      assert.equal(res.status, 400, `rating ${rating} should be refused`);
    }
  });

  it('groups the public FAQ list by category and can filter by it', async () => {
    await t.api('POST', '/admin/faqs', { token: admin.token, json: { question: 'How much does it cost?', answer: 'It depends on the project.', category: 'Pricing' } });
    await t.api('POST', '/admin/faqs', { token: admin.token, json: { question: 'How long does it take?', answer: 'Usually a few weeks.', category: 'Process' } });
    await t.api('POST', '/admin/faqs', { token: admin.token, json: { question: 'A hidden draft question?', answer: 'This is a draft answer.', category: 'Pricing', isPublished: false } });
    const all = await t.api('GET', '/faqs');
    assert.equal(all.body.data.some((f) => f.question.startsWith('A hidden draft')), false);
    const pricing = await t.api('GET', '/faqs?category=Pricing');
    assert.deepEqual(pricing.body.data.map((f) => f.question), ['How much does it cost?']);
  });
});

describe('site settings', () => {
  it('serves defaults to the public without exposing internal fields', async () => {
    const res = await t.api('GET', '/settings');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.companyName, 'Stackwell');
    assert.equal('key' in res.body.data, false);
  });

  it('lets an admin change them, allows an empty social link, and refuses bad values', async () => {
    const ok = await t.api('PATCH', '/admin/settings', { token: admin.token, json: { companyName: 'Acme Labs', instagram: '' } });
    assert.equal(ok.status, 200);
    assert.equal((await t.api('GET', '/settings')).body.data.companyName, 'Acme Labs');
    assert.equal((await t.api('PATCH', '/admin/settings', { token: admin.token, json: { email: 'not-an-email' } })).status, 400);
    assert.equal((await t.api('PATCH', '/admin/settings', { token: admin.token, json: { linkedin: 'javascript:alert(1)' } })).status, 400);
    assert.equal(await t.models.SiteSettings.countDocuments(), 1, 'there is only ever one settings document');
  });
});
