import { z } from 'zod';
import AppError from '../utils/AppError.js';

// Usage in a route:
//   router.post('/login', validate(z.object({ body: loginSchema })), login);
//
// The schema describes any of: { body, query, params }. Parts you leave out are not checked.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    // Turn Zod issues into a simple list the client can show next to each field
    const details = result.error.issues.map((issue) => ({
      // drop the leading 'body' / 'query' / 'params' so the path is just the field name
      field: issue.path.slice(1).join('.') || issue.path[0],
      message: issue.message,
    }));
    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
  }

  // Replace raw input with the validated, cleaned data (trimmed, coerced, defaults applied)
  const { body, query, params } = result.data;
  if (body !== undefined) req.body = body;
  if (params !== undefined) req.params = params;
  // Express 5 makes req.query a read-only getter, so we redefine it instead of assigning
  if (query !== undefined) {
    Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true, enumerable: true });
  }
  next();
};
