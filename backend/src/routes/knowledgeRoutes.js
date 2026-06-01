import { Router } from 'express';
import { createKnowledge, deleteKnowledge, listKnowledge, updateKnowledge } from '../controllers/knowledgeController.js';
import { allowRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, allowRoles('business', 'admin'), listKnowledge);
router.post('/', protect, allowRoles('business', 'admin'), createKnowledge);
router.put('/:id', protect, allowRoles('business', 'admin'), updateKnowledge);
router.delete('/:id', protect, allowRoles('business', 'admin'), deleteKnowledge);

export default router;

