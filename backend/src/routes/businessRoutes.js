import { Router } from 'express';
import { createBusiness, getMyBusiness, updateBusiness } from '../controllers/businessController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, allowRoles('business', 'admin'), createBusiness);
router.get('/me', protect, allowRoles('business', 'admin'), getMyBusiness);
router.put('/:id', protect, allowRoles('business', 'admin'), updateBusiness);

export default router;

