import './helpers/env.js'; // must come first: it sets the environment the application code reads when imported
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Fast tests of small pure functions and validation rules. No database, no server.
const { slugify } = await import('../src/utils/slugify.js');
const { escapeRegex } = await import('../src/utils/escapeRegex.js');
const { toUpdateOps } = await import('../src/utils/updateOps.js');
const { getPagination, buildMeta } = await import('../src/utils/pagination.js');
const { siteImagePublicId } = await import('../src/services/storage.service.js');
const { headerSafe } = await import('../src/services/mail.service.js');
const { escapeHtml, firstNameOf } = await import('../src/services/emailTemplates.js');
const { createServiceSchema, updateServiceSchema } = await import('../src/validators/service.validator.js');
const { createInquirySchema, createQuoteSchema } = await import('../src/validators/lead.validator.js');
const { httpUrl, objectId } = await import('../src/validators/common.validator.js');

describe('slugify', () => {
  it('makes a readable web address', () => {
    assert.equal(slugify('Custom Web Apps & Portals!'), 'custom-web-apps-portals');
    assert.equal(slugify('  Spaces   everywhere  '), 'spaces-everywhere');
    assert.equal(slugify('Crème Brûlée Café'), 'creme-brulee-cafe', 'accents are removed');
  });
  it('never returns leading, trailing or doubled dashes, and is never too long', () => {
    assert.equal(slugify('--Hello--World--'), 'hello-world');
    assert.ok(slugify('a'.repeat(300)).length <= 100);
    assert.equal(slugify('!!!'), '');
  });
});

describe('escapeRegex', () => {
  it('turns search text into a literal pattern, so a visitor cannot inject a regular expression', () => {
    const pattern = new RegExp(escapeRegex('a.b*c(d)'));
    assert.ok(pattern.test('a.b*c(d)'));
    assert.equal(pattern.test('aXbbbc(d)'), false);
  });
});

describe('toUpdateOps', () => {
  it('sets values and removes the fields that are sent as null', () => {
    assert.deepEqual(toUpdateOps({ name: 'Ann', photo: null }), { $set: { name: 'Ann' }, $unset: { photo: 1 } });
  });
  it('leaves out an empty half', () => {
    assert.deepEqual(toUpdateOps({ name: 'Ann' }), { $set: { name: 'Ann' } });
    assert.deepEqual(toUpdateOps({ photo: null }), { $unset: { photo: 1 } });
    assert.deepEqual(toUpdateOps({}), {});
  });
  it('keeps falsy values that are not null', () => {
    assert.deepEqual(toUpdateOps({ order: 0, isPublished: false, notes: '' }), { $set: { order: 0, isPublished: false, notes: '' } });
  });
});

describe('pagination', () => {
  it('turns a page number into how many records to skip', () => {
    assert.deepEqual(getPagination({ page: 3, limit: 10 }), { page: 3, limit: 10, skip: 20 });
    assert.deepEqual(getPagination(), { page: 1, limit: 10, skip: 0 });
  });
  it('describes the whole list, always with at least one page', () => {
    assert.deepEqual(buildMeta({ page: 1, limit: 10 }, 25), { page: 1, limit: 10, total: 25, totalPages: 3 });
    assert.equal(buildMeta({ page: 1, limit: 10 }, 0).totalPages, 1);
  });
});

describe('siteImagePublicId (which uploaded images the server may delete)', () => {
  const base = 'https://res.cloudinary.com/test-cloud/image/upload';
  it('finds the stored id in one of our own addresses, with or without a transformation', () => {
    assert.equal(siteImagePublicId(`${base}/v1700000000/stackwell/site-images/abc-123.png`), 'stackwell/site-images/abc-123');
    assert.equal(siteImagePublicId(`${base}/f_auto,q_auto/v1700000000/stackwell/site-images/abc-123.jpg`), 'stackwell/site-images/abc-123');
  });
  it('refuses everything that is not ours, so the server never deletes a file it does not own', () => {
    assert.equal(siteImagePublicId('https://example.com/stackwell/site-images/abc.png'), null, 'another site');
    assert.equal(siteImagePublicId('https://res.cloudinary.com/someone-else/image/upload/v1/stackwell/site-images/abc.png'), null, 'another Cloudinary account');
    assert.equal(siteImagePublicId(`${base}/v1/other-folder/abc.png`), null, 'another folder');
    assert.equal(siteImagePublicId(`${base}/v1/stackwell/site-images/../../secrets.png`), null, 'a path trick');
    assert.equal(siteImagePublicId(undefined), null);
    assert.equal(siteImagePublicId(''), null);
  });
});

describe('email safety helpers', () => {
  it('headerSafe makes a value one line, so a visitor cannot add email headers', () => {
    assert.equal(headerSafe('Hello\r\nBcc: spy@evil.com'), 'Hello Bcc: spy@evil.com');
    assert.equal(headerSafe(`line${String.fromCharCode(0x2028)}break`), 'line break');
    assert.equal(headerSafe('x'.repeat(500)).length, 150);
  });
  it('escapeHtml turns markup into harmless text', () => {
    assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    assert.equal(escapeHtml(`Tom & Jerry's`), 'Tom &amp; Jerry&#39;s');
  });
  it('firstNameOf only ever returns a plain first name', () => {
    assert.equal(firstNameOf('Amara Hughes'), 'Amara');
    assert.equal(firstNameOf("Jean-Luc O'Brien"), 'Jean-Luc');
    assert.equal(firstNameOf('<b>Evil</b> Person'), 'there', 'anything that is not a name becomes "there"');
    assert.equal(firstNameOf('http://spam.example buy now'), 'there');
    assert.equal(firstNameOf(''), 'there');
  });
});

describe('validation rules', () => {
  const service = { title: 'Web Apps', summary: 'A short summary that is long enough.', description: 'A description that is long enough to pass.' };

  it('accepts a valid service and refuses short text', () => {
    assert.equal(createServiceSchema.safeParse({ body: service }).success, true);
    const bad = createServiceSchema.safeParse({ body: { ...service, title: 'A' } });
    assert.equal(bad.success, false);
    assert.equal(bad.error.issues[0].path.join('.'), 'body.title');
  });
  it('trims text and drops fields the form does not define', () => {
    const parsed = createServiceSchema.parse({ body: { ...service, title: '  Web Apps  ', role: 'admin' } });
    assert.equal(parsed.body.title, 'Web Apps');
    assert.equal('role' in parsed.body, false);
  });
  it('an update must change something', () => {
    const id = '64b64b64b64b64b64b64b64b';
    assert.equal(updateServiceSchema.safeParse({ params: { id }, body: {} }).success, false);
    assert.equal(updateServiceSchema.safeParse({ params: { id }, body: { order: 3 } }).success, true);
  });
  it('web links must be http or https (no javascript: or data: links)', () => {
    assert.equal(httpUrl.safeParse('https://example.com/a.png').success, true);
    assert.equal(httpUrl.safeParse('http://example.com').success, true);
    for (const bad of ['javascript:alert(1)', 'data:text/html;base64,AAAA', 'ftp://example.com', 'not a url']) {
      assert.equal(httpUrl.safeParse(bad).success, false, bad);
    }
  });
  it('ids must be 24 hex characters', () => {
    assert.equal(objectId.safeParse('64b64b64b64b64b64b64b64b').success, true);
    assert.equal(objectId.safeParse('64b64b64b64b64b64b64b64').success, false);
    assert.equal(objectId.safeParse('../../etc/passwd').success, false);
    assert.equal(objectId.safeParse({ $ne: null }).success, false, 'a MongoDB operator object is not an id');
  });
  it('the contact form only accepts the fields it defines', () => {
    const parsed = createInquirySchema.parse({ body: { name: 'Jane Doe', email: ' JANE@Example.COM ', subject: 'Hello', message: 'A message that is long enough.', status: 'replied' } });
    assert.equal(parsed.body.email, 'jane@example.com', 'emails are lower-cased');
    assert.equal('status' in parsed.body, false, 'a visitor cannot choose the status');
  });
  it('the quote form refuses choices that are not on the list', () => {
    const base = { name: 'Jane Doe', email: 'jane@example.com', projectType: 'web-app', budgetRange: '5k-15k', timeline: 'asap', description: 'We need a customer portal with login.' };
    assert.equal(createQuoteSchema.safeParse({ body: base }).success, true);
    for (const field of ['projectType', 'budgetRange', 'timeline']) {
      assert.equal(createQuoteSchema.safeParse({ body: { ...base, [field]: 'made-up' } }).success, false, field);
    }
    assert.equal(createQuoteSchema.safeParse({ body: { ...base, services: ['x'] } }).success, false);
  });
});
