// An error we expect and can describe to the client (404, 400, 401...).
// Anything that is NOT an AppError is treated as an unexpected bug.
export default class AppError extends Error {
  constructor(message, statusCode = 500, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // optional machine-readable code, e.g. 'VALIDATION_ERROR'
    this.details = details; // optional extra info, e.g. which form fields failed
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
