import { z } from 'zod';

const MAX_LIMIT = 50;

// Reusable query schema: ?page=2&limit=10. Wrong values fall back or are rejected.
// z.coerce turns the query-string text '2' into the number 2.
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(10),
});

// Converts page + limit into what MongoDB needs: skip N documents, take `limit`.
export const getPagination = ({ page = 1, limit = 10 } = {}) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});

// The `meta` block sent next to the list: { page, limit, total, totalPages }
export const buildMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
