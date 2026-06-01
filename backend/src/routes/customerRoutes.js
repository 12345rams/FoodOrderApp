import { Router } from 'express';
import { getCustomerById, listCustomers } from '../controllers/customerController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, allowRoles('business', 'admin'), listCustomers);
router.get('/:id', protect, allowRoles('business', 'admin'), getCustomerById);

export default router;

