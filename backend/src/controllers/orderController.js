import Business from '../models/Business.js';
import Order from '../models/Order.js';
import { fail, ok } from '../utils/responseFormatter.js';

async function businessIdFor(user) {
  if (user.role === 'admin') return null;
  const business = await Business.findOne({ ownerId: user._id }).lean();
  return business?._id || null;
}

export async function listOrders(req, res, next) {
  try {
    const businessId = await businessIdFor(req.user);
    if (!businessId) {
      return fail(res, 'Business profile not found', 404);
    }

    const orders = await Order.find({ businessId }).sort({ createdAt: -1 });
    return ok(res, orders);
  } catch (error) {
    return next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const businessId = await businessIdFor(req.user);
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, 'Order not found', 404);
    if (businessId && String(order.businessId) !== String(businessId)) {
      return fail(res, 'Forbidden', 403);
    }
    return ok(res, order);
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const businessId = await businessIdFor(req.user);
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, 'Order not found', 404);
    if (businessId && String(order.businessId) !== String(businessId)) {
      return fail(res, 'Forbidden', 403);
    }

    if (req.body.status) {
      order.status = req.body.status;
    }
    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();
    return ok(res, order, 'Order updated');
  } catch (error) {
    return next(error);
  }
}

export async function orderAnalytics(req, res, next) {
  try {
    const businessId = await businessIdFor(req.user);
    if (!businessId) {
      return fail(res, 'Business profile not found', 404);
    }

    const [agg] = await Order.aggregate([
      { $match: { businessId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    return ok(res, agg || { totalOrders: 0, pendingOrders: 0, completedOrders: 0, revenue: 0 });
  } catch (error) {
    return next(error);
  }
}

