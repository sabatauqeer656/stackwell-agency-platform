import { z } from 'zod';

// Small validation pieces shared by the dashboard forms.

export const ORDER_MESSAGE = 'Enter a whole number from 0 to 999';
export const orderRule = z.number({ error: ORDER_MESSAGE }).int(ORDER_MESSAGE).min(0, ORDER_MESSAGE).max(999, ORDER_MESSAGE);

const URL_MESSAGE = 'Enter a full web address starting with http:// or https://';

const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// An optional web address: empty is fine, anything else must be a real http(s) address
export const optionalUrl = z.string().trim().max(500, 'At most 500 characters').refine((value) => value === '' || isHttpUrl(value), URL_MESSAGE);

// Optional fields in a PATCH: when creating, an empty one is simply left out. When editing, an empty one is sent as
// null, which tells the server to REMOVE it.
export const optionalValue = (value, isEdit) => (value ? value : isEdit ? null : undefined);
