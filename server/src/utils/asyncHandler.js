// Wraps an async route handler so a rejected promise is passed to next(err),
// which sends it to the global error handler.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
