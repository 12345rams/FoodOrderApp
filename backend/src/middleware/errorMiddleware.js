import { fail } from '../utils/responseFormatter.js';

export function notFound(req, res) {
  return fail(res, 'Route not found', 404);
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  return fail(res, message, status, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}

