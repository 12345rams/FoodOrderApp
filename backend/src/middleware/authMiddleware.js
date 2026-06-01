import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { fail } from '../utils/responseFormatter.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return fail(res, 'Unauthorized', 401);
    }
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return fail(res, 'Unauthorized', 401);
    }
    req.user = user;
    return next();
  } catch (error) {
    return fail(res, 'Unauthorized', 401);
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return fail(res, 'Forbidden', 403);
    }
    return next();
  };
}

