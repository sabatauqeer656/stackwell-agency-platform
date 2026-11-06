import { describe, expect, it } from 'vitest';
import { companyField, emailField, nameField, phoneField } from './fields.js';
import { contactDefaults, contactSchema } from '../inquiries/inquirySchema.js';
import { ALLOWED_EXTENSIONS, MAX_FILES, MAX_FILE_BYTES, checkFiles } from '../quotes/attachmentRules.js';
import { isSlug, labelOf, projectTypes } from '../quotes/quoteOptions.js';

const issues = (result) => result.error.issues.map((issue) => issue.message);

describe('shared form fields', () => {
  it('trims names and refuses ones that are too short', () => {
    expect(nameField.parse('  Jane Doe  ')).toBe('Jane Doe');
    expect(issues(nameField.safeParse('J'))).toEqual(['Please enter your name']);
  });

  it('accepts an email with stray spaces (it is trimmed first) and refuses a bad one', () => {
    expect(emailField.parse('  jane@example.com ')).toBe('jane@example.com');
    expect(emailField.safeParse('').success).toBe(false);
    expect(issues(emailField.safeParse('not-an-email'))).toEqual(['Enter a valid email address']);
  });

  it('turns an empty optional box into "absent", which is what the server expects', () => {
    expect(phoneField.parse('')).toBeUndefined();
    expect(companyField.parse('   ')).toBeUndefined();
    expect(phoneField.parse('+1 555 010 0199')).toBe('+1 555 010 0199');
    expect(phoneField.safeParse('call me').success).toBe(false);
  });
});

describe('contact form rules', () => {
  const valid = { ...contactDefaults, name: 'Jane Doe', email: 'jane@example.com', subject: 'A question', message: 'I would like to know more about your services.' };

  it('accepts a complete message and drops empty optional fields', () => {
    const parsed = contactSchema.parse(valid);
    expect(parsed.phone).toBeUndefined();
    expect(parsed.company).toBeUndefined();
    expect(parsed.website).toBeUndefined();
  });

  it('refuses short subjects and messages, naming each problem', () => {
    const result = contactSchema.safeParse({ ...valid, subject: 'Hi', message: 'Too short' });
    expect(result.success).toBe(false);
    expect(result.error.issues.map((issue) => issue.path[0]).sort()).toEqual(['message', 'subject']);
  });

  it('keeps the hidden honeypot value so the server can recognise a bot', () => {
    expect(contactSchema.parse({ ...valid, website: 'http://spam.example' }).website).toBe('http://spam.example');
  });
});

describe('attachment rules (checkFiles)', () => {
  const file = (name, size = 1000) => ({ name, size });

  it('keeps allowed files', () => {
    const { accepted, problems } = checkFiles([], [file('brief.pdf'), file('logo.PNG')]);
    expect(accepted).toHaveLength(2);
    expect(problems).toEqual([]);
  });

  it('refuses unknown types, empty files and oversized files, each with a reason', () => {
    const { accepted, problems } = checkFiles([], [file('virus.exe'), file('empty.pdf', 0), file('huge.pdf', MAX_FILE_BYTES + 1)]);
    expect(accepted).toHaveLength(0);
    expect(problems).toHaveLength(3);
    expect(problems[0]).toMatch(/not an allowed file type/);
    expect(problems[1]).toMatch(/empty/);
    expect(problems[2]).toMatch(/5 MB or smaller/);
  });

  it('keeps the good files of a batch even when others in it are refused', () => {
    const { accepted, problems } = checkFiles([], [file('a.pdf'), file('bad.exe'), file('b.docx')]);
    expect(accepted.map((f) => f.name)).toEqual(['a.pdf', 'b.docx']);
    expect(problems).toHaveLength(1);
  });

  it('refuses a duplicate and anything beyond the maximum number of files', () => {
    const current = [file('a.pdf')];
    expect(checkFiles(current, [file('a.pdf')]).problems[0]).toMatch(/already attached/);
    const full = Array.from({ length: MAX_FILES }, (_, i) => file(`f${i}.pdf`));
    expect(checkFiles(full, [file('extra.pdf')]).problems[0]).toMatch(/up to 3 files/);
  });

  it('only allows the extensions the server allows', () => {
    expect(ALLOWED_EXTENSIONS).toEqual(['.pdf', '.png', '.jpg', '.jpeg', '.docx']);
  });
});

describe('quote options', () => {
  it('finds a label for a value, or an empty string', () => {
    expect(labelOf(projectTypes, 'web-app')).toBe('Web application');
    expect(labelOf(projectTypes, 'nope')).toBe('');
  });
  it('only accepts safe, well-formed slugs from the address bar', () => {
    expect(isSlug('mobile-app-development')).toBe(true);
    for (const bad of ['', 'Has Spaces', '../etc/passwd', 'UPPER', '-leading', 'a'.repeat(101), undefined, 42]) {
      expect(isSlug(bad)).toBe(false);
    }
  });
});
