import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from '../controllers/productController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, allowRoles('business', 'admin'), createProduct);
router.get('/', protect, allowRoles('business', 'admin'), listProducts);
router.get('/:id', protect, allowRoles('business', 'admin'), getProductById);
router.put('/:id', protect, allowRoles('business', 'admin'), updateProduct);
router.delete('/:id', protect, allowRoles('business', 'admin'), deleteProduct);

export default router;

