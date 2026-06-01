import { Router } from 'express';
import {
  getOrderById,
  listOrders,
  orderAnalytics,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, allowRoles('business', 'admin'), listOrders);
router.get('/analytics/summary', protect, allowRoles('business', 'admin'), orderAnalytics);
router.get('/:id', protect, allowRoles('business', 'admin'), getOrderById);
router.put('/:id/status', protect, allowRoles('business', 'admin'), updateOrderStatus);

export default router;

