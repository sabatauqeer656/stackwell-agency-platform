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

const inquiry = (overrides = {}) => ({ name: 'Jane Visitor', email: 'jane@example.com', subject: 'A question', message: 'I would like to know more about your services.', ...overrides });
const quote = (overrides = {}) => ({
  name: 'Jane Visitor',
  email: 'jane@example.com',
  projectType: 'web-app',
  budgetRange: '15k-50k',
  timeline: 'flexible',
  description: 'We need a customer portal with login and invoices.',
  ...overrides,
});
// The emails are composed and kept in an in-memory outbox (no mail server is configured in tests).
// They are sent "fire and forget" after the response, so wait briefly for them.
const waitForMail = async (predicate) => {
  for (let i = 0; i < 40; i++) {
    const found = t.mail.getOutbox().filter(predicate);
    if (found.length > 0) return found;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return [];
};
const pdf = (bytes = 'not really a pdf') => new Blob([bytes], { type: 'application/pdf' });
const quoteForm = (body, files = []) => {
  const form = new FormData();
  form.append('data', typeof body === 'string' ? body : JSON.stringify(body));
  for (const { blob, name } of files) form.append('attachments', blob, name);
  return form;
};

describe('contact form (inquiries)', () => {
  it('saves a message as "new", ignores fields a visitor must not set, and thanks them', async () => {
    const res = await t.api('POST', '/inquiries', { json: inquiry({ status: 'replied', notes: 'sneaky' }) });
    assert.equal(res.status, 201);
    assert.match(res.body.data.message, /Thank you/);
    const saved = await t.models.Inquiry.findOne({ email: 'jane@example.com' }).lean();
    assert.equal(saved.status, 'new');
    assert.equal(saved.notes, undefined);
  });

  it('refuses bad input with the fields that are wrong', async () => {
    const res = await t.api('POST', '/inquiries', { json: inquiry({ email: 'nope', message: 'short', phone: 'abc' }) });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.error.details.map((d) => d.field).sort(), ['email', 'message', 'phone']);
  });

  it('pretends to succeed for a bot that fills the hidden field, and saves nothing', async () => {
    const before = await t.models.Inquiry.countDocuments();
    const res = await t.api('POST', '/inquiries', { json: inquiry({ website: 'http://spam.example' }) });
    assert.equal(res.status, 201, 'the bot is told it worked');
    assert.equal(await t.models.Inquiry.countDocuments(), before, 'but nothing was stored');
  });

  it('rate limits one address (the 6th message in an hour gets 429)', async () => {
    const ip = '198.51.100.7';
    for (let i = 0; i < 5; i++) assert.equal((await t.api('POST', '/inquiries', { json: inquiry(), ip })).status, 201);
    const blocked = await t.api('POST', '/inquiries', { json: inquiry(), ip });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.error.code, 'RATE_LIMITED');
  });

  it('emails the team and the visitor, and never puts visitor-written HTML or line breaks into an email', async () => {
    // Emails from earlier tests can still arrive (they are sent after the response), so this test finds ITS OWN two
    // emails by a unique marker in the message and a unique visitor address.
    const marker = `marker-${Date.now()}`;
    const visitor = `mallory.${Date.now()}@example.com`;
    await t.api('POST', '/inquiries', {
      json: inquiry({
        name: 'Mallory\nBcc: spy@evil.com',
        email: visitor,
        subject: 'Hello\r\nBcc: spy@evil.com',
        message: `<script>alert(1)</script> Please call me back, thank you. ${marker}`,
      }),
    });
    const [teamMail] = await waitForMail((mail) => String(mail.text).includes(marker));
    const [confirmation] = await waitForMail((mail) => JSON.stringify(mail.to).includes(visitor));
    assert.ok(teamMail, 'the team is told about the message');
    assert.ok(confirmation, 'the visitor gets a confirmation');

    for (const mail of [teamMail, confirmation]) {
      assert.equal(/[\r\n]/.test(mail.subject), false, 'a subject is one line (no header injection)');
      assert.equal(JSON.stringify(mail.to).includes('spy@evil.com'), false, 'no hidden recipient was added');
      assert.equal(String(mail.html).includes('<script>'), false, 'visitor-written HTML is never put into an email as HTML');
    }
    assert.ok(String(teamMail.html).includes('&lt;script&gt;'), 'the team sees the message as harmless text');
    assert.equal(String(confirmation.html).includes(marker), false, 'the confirmation never repeats what the visitor wrote');
  });
});

describe('managing inquiries', () => {
  it('lists with search and a status filter, and changes status and notes', async () => {
    await t.models.Inquiry.create([
      { name: 'Alice Search', email: 'alice@example.com', subject: 'Pricing question', message: 'How much does a website cost?' },
      { name: 'Bob Other', email: 'bob@example.com', subject: 'Something else', message: 'A completely different message.', status: 'replied' },
    ]);
    const search = await t.api('GET', '/admin/inquiries?search=alice', { token: admin.token });
    assert.deepEqual(search.body.data.map((i) => i.name), ['Alice Search']);
    const replied = await t.api('GET', '/admin/inquiries?status=replied', { token: admin.token });
    assert.ok(replied.body.data.every((i) => i.status === 'replied'));
    const id = search.body.data[0]._id;
    const updated = await t.api('PATCH', `/admin/inquiries/${id}`, { token: admin.token, json: { status: 'read', notes: 'Called them back' } });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.status, 'read');
    assert.equal(updated.body.data.notes, 'Called them back');
    const cleared = await t.api('PATCH', `/admin/inquiries/${id}`, { token: admin.token, json: { notes: '' } });
    assert.equal(cleared.body.data.notes, '');
  });

  it('refuses a status that does not exist', async () => {
    const one = await t.models.Inquiry.findOne();
    const res = await t.api('PATCH', `/admin/inquiries/${one._id}`, { token: admin.token, json: { status: 'deleted' } });
    assert.equal(res.status, 400);
  });

  it('shows the dashboard numbers', async () => {
    const res = await t.api('GET', '/admin/stats', { token: admin.token });
    assert.equal(res.status, 200);
    const { leads, recent, content } = res.body.data;
    assert.equal(leads.inquiries.total, await t.models.Inquiry.countDocuments());
    assert.equal(leads.inquiries.byStatus.new, await t.models.Inquiry.countDocuments({ status: 'new' }));
    assert.ok(recent.inquiries.length <= 5);
    assert.equal(typeof content.services.published, 'number');
  });
});

describe('quote requests', () => {
  it('saves a request as "new" with the chosen services, and shows their titles to the team', async () => {
    const service = (await t.api('POST', '/admin/services', { token: admin.token, json: validService({ title: 'Quote Service' }) })).body.data;
    const res = await t.api('POST', '/quotes', { json: quote({ services: [service._id], status: 'won' }) });
    assert.equal(res.status, 201);
    const saved = await t.models.QuoteRequest.findOne({ email: 'jane@example.com' }).lean();
    assert.equal(saved.status, 'new', 'a visitor cannot set the status');
    const detail = await t.api('GET', `/admin/quotes/${saved._id}`, { token: admin.token });
    assert.equal(detail.body.data.services[0].title, 'Quote Service');
  });

  it('refuses unknown choices and malformed service ids', async () => {
    const wrongType = await t.api('POST', '/quotes', { json: quote({ projectType: 'time-machine' }) });
    assert.equal(wrongType.status, 400);
    assert.ok(wrongType.body.error.details.some((d) => d.field === 'projectType'));
    const badId = await t.api('POST', '/quotes', { json: quote({ services: ['abc'] }) });
    assert.equal(badId.status, 400);
  });

  it('updates the pipeline status and refuses a status that does not exist', async () => {
    const saved = await t.models.QuoteRequest.findOne();
    const ok = await t.api('PATCH', `/admin/quotes/${saved._id}`, { token: admin.token, json: { status: 'proposal-sent' } });
    assert.equal(ok.body.data.status, 'proposal-sent');
    assert.equal((await t.api('PATCH', `/admin/quotes/${saved._id}`, { token: admin.token, json: { status: 'maybe' } })).status, 400);
  });

  it('does not leak the storage ids of attachments', async () => {
    const created = await t.models.QuoteRequest.create({
      ...quote(),
      attachments: [{ publicId: 'stackwell/quote-attachments/secret-id', resourceType: 'image', format: 'pdf', originalName: 'brief.pdf', mimeType: 'application/pdf', size: 100 }],
    });
    const res = await t.api('GET', `/admin/quotes/${created._id}`, { token: admin.token });
    assert.deepEqual(Object.keys(res.body.data.attachments[0]).sort(), ['mimeType', 'originalName', 'size']);
    assert.equal(JSON.stringify(res.body).includes('secret-id'), false);
  });

  it('only gives signed download links to signed-in staff', async () => {
    const created = await t.models.QuoteRequest.create({
      ...quote(),
      attachments: [{ publicId: 'stackwell/quote-attachments/abc', resourceType: 'image', format: 'pdf', originalName: 'brief.pdf', mimeType: 'application/pdf', size: 100 }],
    });
    assert.equal((await t.api('GET', `/admin/quotes/${created._id}/attachments/0/download`)).status, 401);
    const ok = await t.api('GET', `/admin/quotes/${created._id}/attachments/0/download`, { token: admin.token });
    assert.equal(ok.status, 200);
    assert.match(ok.body.data.url, /signature=/);
    assert.match(ok.body.data.url, /expires_at=/);
    assert.equal(ok.body.data.originalName, 'brief.pdf');
  });
});

describe('quote attachments are checked before anything is stored', () => {
  const stored = () => t.models.QuoteRequest.countDocuments();

  it('refuses a file that only pretends to be a PDF (its content is checked, not its name)', async () => {
    const count = await stored();
    const res = await t.api('POST', '/quotes', { form: quoteForm(quote(), [{ blob: pdf('MZ this is really a program'), name: 'brief.pdf' }]) });
    assert.equal(res.status, 415);
    assert.equal(res.body.error.code, 'FILE_TYPE_NOT_ALLOWED');
    assert.equal(await stored(), count, 'nothing was saved');
  });

  it('refuses file types that are not on the list', async () => {
    const res = await t.api('POST', '/quotes', { form: quoteForm(quote(), [{ blob: new Blob(['x']), name: 'program.exe' }]) });
    assert.equal(res.status, 415);
  });

  it('refuses more than three files', async () => {
    const files = [1, 2, 3, 4].map((n) => ({ blob: pdf(), name: `f${n}.pdf` }));
    const res = await t.api('POST', '/quotes', { form: quoteForm(quote(), files) });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'TOO_MANY_FILES');
  });

  it('refuses a file over 5 MB', async () => {
    const big = new Blob([Buffer.alloc(5 * 1024 * 1024 + 1024)], { type: 'application/pdf' });
    const res = await t.api('POST', '/quotes', { form: quoteForm(quote(), [{ blob: big, name: 'big.pdf' }]) });
    assert.equal(res.status, 413);
    assert.equal(res.body.error.code, 'FILE_TOO_LARGE');
  });

  it('refuses form data that is not valid JSON', async () => {
    const res = await t.api('POST', '/quotes', { form: quoteForm('{ this is not json') });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INVALID_FORM_DATA');
  });

  it('still validates the form fields when files are attached', async () => {
    const res = await t.api('POST', '/quotes', { form: quoteForm(quote({ email: 'nope' }), [{ blob: pdf(), name: 'a.pdf' }]) });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.details.some((d) => d.field === 'email'));
  });
});

describe('website image uploads', () => {
  const imageForm = (bytes, name, type = 'image/png') => {
    const form = new FormData();
    if (bytes) form.append('image', new Blob([bytes], { type }), name);
    return form;
  };

  it('needs a signed-in team member', async () => {
    const res = await t.api('POST', '/admin/uploads/images', { form: imageForm('x', 'a.png') });
    assert.equal(res.status, 401);
  });

  it('refuses a missing file, an empty file, wrong types and oversized files', async () => {
    const editor = await t.signIn('editor'); // editors may upload too
    const upload = (form) => t.api('POST', '/admin/uploads/images', { token: editor.token, form });
    assert.equal((await upload(imageForm(null))).body.error.code, 'NO_FILE');
    assert.equal((await upload(imageForm(Buffer.alloc(0), 'empty.png'))).body.error.code, 'FILE_EMPTY');
    const fake = await upload(imageForm('this is text, not an image', 'photo.png'));
    assert.equal(fake.status, 415, 'a text file renamed to .png');
    const svg = await upload(imageForm('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'x.svg', 'image/svg+xml'));
    assert.equal(svg.status, 415, 'SVG can hide scripts');
    const big = await upload(imageForm(Buffer.alloc(5 * 1024 * 1024 + 1024), 'big.png'));
    assert.equal(big.status, 413);
  });
});
