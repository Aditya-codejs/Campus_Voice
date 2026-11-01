import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getCategories);

// Admin-only management
router.use(protect, authorize('admin', 'superadmin'));
router.route('/').post(createCategory);
router.route('/:id').put(updateCategory).delete(deleteCategory);

export default router;

