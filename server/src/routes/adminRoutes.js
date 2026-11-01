import express from 'express';
import {
  getDashboardStats,
  getStaffRegistrations,
  reviewStaffRegistration,
  getUsers,
  getAuditLogs,
  exportComplaintsCsv,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin', 'superadmin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/staff-registrations', getStaffRegistrations);
router.patch('/staff-registrations/:id', reviewStaffRegistration);
router.get('/users', getUsers);
router.get('/audit-logs', getAuditLogs);
router.get('/export-csv', exportComplaintsCsv);

export default router;

