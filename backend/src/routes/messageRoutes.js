import { Router } from 'express';
import { listMessagesByCustomer, manualReply } from '../controllers/messageController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:customerId', protect, allowRoles('business', 'admin'), listMessagesByCustomer);
router.post('/:customerId/reply', protect, allowRoles('business', 'admin'), manualReply);

export default router;

