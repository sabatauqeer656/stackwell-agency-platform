// Allowed values for lead fields. Shared by the Mongoose models and the Zod validators,
// so the two can never disagree.

export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

export const QUOTE_STATUSES = ['new', 'reviewing', 'proposal-sent', 'won', 'lost'];

export const PROJECT_TYPES = ['web-app', 'mobile-app', 'ecommerce', 'ui-ux', 'api-backend', 'maintenance', 'other'];

export const BUDGET_RANGES = ['under-5k', '5k-15k', '15k-50k', '50k-100k', 'over-100k', 'not-sure'];

export const TIMELINES = ['asap', '1-3-months', '3-6-months', '6-plus-months', 'flexible'];
