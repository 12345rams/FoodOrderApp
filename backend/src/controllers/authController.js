import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { fail, ok } from '../utils/responseFormatter.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return fail(res, 'name, email, password are required');
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return fail(res, 'Email already registered');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role === 'admin' ? 'admin' : 'business'
    });

    const token = signToken(user);
    return ok(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'Registered', 201);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return fail(res, 'Invalid credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return fail(res, 'Invalid credentials', 401);
    }

    const token = signToken(user);
    return ok(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'Login success');
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return ok(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
}

