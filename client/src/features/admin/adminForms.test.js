import { describe, expect, it } from 'vitest';
import { optionalUrl, optionalValue, orderRule } from './schemaParts.js';
import { createIconContentSchemas, emptyIconContent, toFormValues as iconToForm, toPayload as iconToPayload } from './iconContentSchema.js';
import { createProjectFormSchema, editProjectFormSchema, emptyProject, toFormValues as projectToForm, toPayload as projectToPayload } from './projectSchema.js';
import { emptyTeamMember, teamFormSchema, toPayload as teamToPayload } from './teamSchema.js';
import { emptyTestimonial, testimonialFormSchema, toFormValues as testimonialToForm, toPayload as testimonialToPayload } from './testimonialSchema.js';
import { emptyFaq, faqFormSchema } from './faqSchema.js';
import { settingsFormSchema, toFormValues as settingsToForm, toPayload as settingsToPayload } from './settingsSchema.js';
import { IMAGE_MAX_BYTES, checkImageFile } from './imageUpload.js';

const paths = (result) => result.error.issues.map((issue) => issue.path.join('.'));

describe('shared pieces', () => {
  it('optionalUrl allows empty, and only real http(s) addresses otherwise', () => {
    expect(optionalUrl.safeParse('').success).toBe(true);
    expect(optionalUrl.safeParse('https://example.com/a.png').success).toBe(true);
    for (const bad of ['javascript:alert(1)', 'example.com', 'ftp://x.com', 'not a url']) expect(optionalUrl.safeParse(bad).success, bad).toBe(false);
  });

  it('optionalValue: when creating an empty field is left out, when editing it is sent as null (= remove it)', () => {
    expect(optionalValue('', false)).toBeUndefined();
    expect(optionalValue('', true)).toBeNull();
    expect(optionalValue('https://x.com', true)).toBe('https://x.com');
  });

  it('order must be a whole number from 0 to 999', () => {
    for (const ok of [0, 1, 999]) expect(orderRule.safeParse(ok).success).toBe(true);
    for (const bad of [-1, 1000, 1.5, Number.NaN]) expect(orderRule.safeParse(bad).success, String(bad)).toBe(false);
  });
});

describe('services and solutions form', () => {
  const schemas = createIconContentSchemas(120);
  const valid = { ...emptyIconContent('Code'), title: 'Web Apps', summary: 'A short summary that is long enough.', description: 'A description that is long enough to pass.' };

  it('lets the web address stay empty when creating, but requires it when editing', () => {
    expect(schemas.create.safeParse(valid).success).toBe(true);
    expect(paths(schemas.edit.safeParse(valid))).toEqual(['slug']);
    expect(schemas.edit.safeParse({ ...valid, slug: 'web-apps' }).success).toBe(true);
  });

  it('refuses addresses that are not lowercase-with-dashes', () => {
    for (const bad of ['Web Apps', 'web--apps', '-web', 'web_apps']) expect(schemas.create.safeParse({ ...valid, slug: bad }).success, bad).toBe(false);
  });

  it('limits the list of points and the length of each point', () => {
    const tooMany = Array.from({ length: 13 }, (_, i) => ({ value: `point ${i}` }));
    expect(schemas.create.safeParse({ ...valid, list: tooMany }).success).toBe(false);
    expect(schemas.create.safeParse({ ...valid, list: [{ value: 'x'.repeat(121) }] }).success).toBe(false);
  });

  it('sends the list under the right name (features or challenges), trimmed and without empty rows', () => {
    const values = { ...valid, list: [{ value: '  First  ' }, { value: '' }, { value: 'Second' }] };
    expect(iconToPayload(values, 'features', { includeEmptySlug: false }).features).toEqual(['First', 'Second']);
    expect(iconToPayload(values, 'challenges', { includeEmptySlug: false }).challenges).toEqual(['First', 'Second']);
  });

  it('leaves an empty address out when creating, but always sends it when editing', () => {
    expect('slug' in iconToPayload(valid, 'features', { includeEmptySlug: false })).toBe(false);
    expect('slug' in iconToPayload(valid, 'features', { includeEmptySlug: true })).toBe(true);
  });

  it('turns a saved record into form values and back', () => {
    const saved = { title: 'T', slug: 's', summary: 'S', description: 'D', icon: 'Code', features: ['a', 'b'], order: 2, isPublished: false };
    const form = iconToForm(saved, 'features');
    expect(form.list).toEqual([{ value: 'a' }, { value: 'b' }]);
    expect(iconToPayload(form, 'features', { includeEmptySlug: true })).toMatchObject({ features: ['a', 'b'], order: 2, isPublished: false });
  });
});

describe('project form', () => {
  const valid = {
    ...emptyProject,
    title: 'Online Banking',
    clientName: 'Acme Bank',
    solution: '64b64b64b64b64b64b64b64b',
    summary: 'A short project summary text.',
    challenge: 'The client needed a faster way to bank.',
    approach: 'We rebuilt the whole flow with tests.',
  };

  it('requires a solution and the long texts', () => {
    expect(createProjectFormSchema.safeParse(valid).success).toBe(true);
    const result = createProjectFormSchema.safeParse({ ...emptyProject, title: 'Ok title' });
    expect(paths(result)).toEqual(expect.arrayContaining(['clientName', 'solution', 'summary', 'challenge', 'approach']));
  });

  it('refuses links that are not http(s) for the live site and the cover', () => {
    expect(createProjectFormSchema.safeParse({ ...valid, liveUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(createProjectFormSchema.safeParse({ ...valid, coverImage: 'https://res.cloudinary.com/x/image/upload/a.png' }).success).toBe(true);
  });

  it('limits the gallery to 10 images', () => {
    expect(createProjectFormSchema.safeParse({ ...valid, images: Array(11).fill('https://x.com/a.png') }).success).toBe(false);
  });

  it('when editing, empty optional fields are sent as null so the server removes them', () => {
    const edit = projectToPayload({ ...valid, slug: 'online-banking', liveUrl: '', coverImage: '', completedAt: '' }, { isEdit: true });
    expect(edit.liveUrl).toBeNull();
    expect(edit.coverImage).toBeNull();
    expect(edit.completedAt).toBeNull();
    const create = projectToPayload({ ...valid, liveUrl: '', coverImage: '', completedAt: '' }, { isEdit: false });
    expect(create.liveUrl).toBeUndefined();
    expect('slug' in create).toBe(false);
    expect(editProjectFormSchema.safeParse({ ...valid, slug: '' }).success).toBe(false);
  });

  it('reads a saved project: the solution comes as an object, the date as a full timestamp', () => {
    const form = projectToForm({ ...valid, solution: { _id: 'abc123abc123abc123abc123', title: 'Fintech' }, completedAt: '2024-05-17T00:00:00.000Z', results: ['Faster'], techStack: ['React'], images: undefined, coverImage: undefined });
    expect(form.solution).toBe('abc123abc123abc123abc123');
    expect(form.completedAt).toBe('2024-05-17');
    expect(form.results).toEqual([{ value: 'Faster' }]);
    expect(form.images).toEqual([]);
    expect(form.coverImage).toBe('');
  });
});

describe('team, testimonial, FAQ and settings forms', () => {
  it('team: needs a name, role and a bio of at least 10 characters', () => {
    expect(teamFormSchema.safeParse({ ...emptyTeamMember, name: 'Ada Lovelace', role: 'Engineer', bio: 'Wrote the first program.' }).success).toBe(true);
    expect(paths(teamFormSchema.safeParse({ ...emptyTeamMember, name: 'Ada', role: 'E', bio: 'short' }))).toEqual(['role', 'bio']);
    expect(teamToPayload({ ...emptyTeamMember, name: 'Ada', role: 'Eng', bio: 'A long enough bio.' }, { isEdit: true }).photo).toBeNull();
  });

  it('testimonial: rating 1 to 5, an optional project, and unlinking sends null', () => {
    const valid = { ...emptyTestimonial, clientName: 'Grace Hopper', clientRole: 'CTO', quote: 'They delivered on time and it was great.' };
    expect(testimonialFormSchema.safeParse(valid).success).toBe(true);
    for (const rating of [0, 6, 2.5]) expect(testimonialFormSchema.safeParse({ ...valid, rating }).success, String(rating)).toBe(false);
    expect(testimonialToPayload({ ...valid, project: '' }, { isEdit: true }).project).toBeNull();
    expect(testimonialToPayload({ ...valid, project: '' }, { isEdit: false }).project).toBeUndefined();
    expect(testimonialToForm({ ...valid, project: { _id: 'p1', title: 'X' }, order: 0, isPublished: true }).project).toBe('p1');
  });

  it('FAQ: needs a question, an answer and a category', () => {
    expect(faqFormSchema.safeParse({ ...emptyFaq, question: 'How much does it cost?', answer: 'It depends on the project.' }).success).toBe(true);
    expect(paths(faqFormSchema.safeParse({ ...emptyFaq, category: '   ' }))).toEqual(expect.arrayContaining(['question', 'answer', 'category']));
  });

  it('settings: a valid email is required, social links may be empty, and values are trimmed when sent', () => {
    const valid = { companyName: 'Acme Labs', tagline: '', email: ' hello@acme.com ', phone: '', address: '', linkedin: '', github: '', twitter: '', instagram: '', footerText: '' };
    expect(settingsFormSchema.parse(valid).email).toBe('hello@acme.com');
    expect(settingsFormSchema.safeParse({ ...valid, email: '' }).success).toBe(false);
    expect(settingsFormSchema.safeParse({ ...valid, linkedin: 'not a link' }).success).toBe(false);
    expect(settingsToPayload({ ...valid, companyName: '  Acme Labs  ' }).companyName).toBe('Acme Labs');
    expect(settingsToForm({ companyName: 'X' }).phone).toBe('');
  });
});

describe('image rules (checkImageFile)', () => {
  const file = (name, type, size = 1000) => ({ name, type, size });

  it('accepts PNG, JPG and WebP within the size limit', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/webp']) expect(checkImageFile(file('a', type))).toBe('');
  });
  it('refuses SVG, GIF and documents, and anything over 5 MB, with a plain-English reason', () => {
    for (const type of ['image/svg+xml', 'image/gif', 'application/pdf', '']) expect(checkImageFile(file('x.file', type))).toMatch(/not allowed/);
    expect(checkImageFile(file('big.png', 'image/png', IMAGE_MAX_BYTES + 1))).toMatch(/5 MB or smaller/);
  });
});
