import Business from '../models/Business.js';
import Customer from '../models/Customer.js';
import { fail, ok } from '../utils/responseFormatter.js';

async function businessIdFor(user) {
  if (user.role === 'admin') return null;
  const business = await Business.findOne({ ownerId: user._id }).lean();
  return business?._id || null;
}

export async function listCustomers(req, res, next) {
  try {
    const businessId = await businessIdFor(req.user);
    if (req.user.role === 'admin') {
      const customers = await Customer.find().sort({ updatedAt: -1 });
      return ok(res, customers);
    }
    if (!businessId) {
      return fail(res, 'Business profile not found', 404);
    }
    const customers = await Customer.find({ businessId }).sort({ updatedAt: -1 });
    return ok(res, customers);
  } catch (error) {
    return next(error);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const businessId = await businessIdFor(req.user);
    const customer = await Customer.findById(req.params.id);
    if (!customer) return fail(res, 'Customer not found', 404);
    if (businessId && String(customer.businessId) !== String(businessId)) {
      return fail(res, 'Forbidden', 403);
    }
    return ok(res, customer);
  } catch (error) {
    return next(error);
  }
}

