import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, formatFileSize, timeAgo } from './format.js';
import { cn, slugify } from './utils.js';
import { getApiError, isMissing, retryUnlessMissing } from './apiErrors.js';

describe('cn', () => {
  it('joins class names and skips empty values', () => {
    const off = false;
    expect(cn('a', off && 'b', undefined, null, '', 'c')).toBe('a c');
  });
});

describe('slugify', () => {
  it('turns a category name into a clean URL value', () => {
    expect(slugify('Getting Started')).toBe('getting-started');
    expect(slugify('  Pricing & Plans! ')).toBe('pricing-plans');
  });
});

describe('formatFileSize', () => {
  it('uses bytes, kilobytes and megabytes', () => {
    expect(formatFileSize(302)).toBe('302 B');
    expect(formatFileSize(20480)).toBe('20 KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('says "just now" for the last minute', () => {
    expect(timeAgo('2026-06-15T11:59:40Z')).toBe('just now');
  });
  it('counts minutes, hours and days', () => {
    expect(timeAgo('2026-06-15T11:55:00Z')).toBe('5 minutes ago');
    expect(timeAgo('2026-06-15T09:00:00Z')).toBe('3 hours ago');
    expect(timeAgo('2026-06-12T12:00:00Z')).toBe('3 days ago');
    expect(timeAgo('2026-06-14T12:00:00Z')).toBe('yesterday');
  });
  it('falls back to a plain date after a month', () => {
    expect(timeAgo('2026-03-01T12:00:00Z')).toBe(formatDate('2026-03-01T12:00:00Z'));
  });
});

describe('getApiError', () => {
  it('reads the standard error shape the API sends', () => {
    const error = { response: { status: 400, data: { error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: [{ field: 'email', message: 'Enter a valid email' }] } } } };
    expect(getApiError(error)).toEqual({ status: 400, code: 'VALIDATION_ERROR', message: 'Validation failed', details: [{ field: 'email', message: 'Enter a valid email' }] });
  });
  it('explains a network failure in plain words', () => {
    const result = getApiError(new Error('Network Error'));
    expect(result.status).toBe(0);
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toMatch(/could not reach the server/i);
  });
  it('has safe defaults when the server sends something unexpected', () => {
    const result = getApiError({ response: { status: 500, data: '<html>oops</html>' } });
    expect(result.status).toBe(500);
    expect(result.details).toEqual([]);
    expect(result.message).toMatch(/something went wrong/i);
  });
});

describe('retry rules', () => {
  const error = (status) => ({ response: { status } });
  it('treats 404 and 400 as "missing" (asking again will not help)', () => {
    expect(isMissing(error(404))).toBe(true);
    expect(isMissing(error(400))).toBe(true);
    expect(isMissing(error(500))).toBe(false);
    expect(isMissing(undefined)).toBe(false);
  });
  it('retries unexpected failures once, and never a missing page', () => {
    expect(retryUnlessMissing(0, error(500))).toBe(true);
    expect(retryUnlessMissing(1, error(500))).toBe(false);
    expect(retryUnlessMissing(0, error(404))).toBe(false);
  });
});
