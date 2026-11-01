import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getDepartments);

// Admin-only management
router.use(protect, authorize('admin', 'superadmin'));
router.route('/').post(createDepartment);
router.route('/:id').put(updateDepartment).delete(deleteDepartment);

export default router;

