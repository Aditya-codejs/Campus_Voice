import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  updateComplaintPriority,
  reopenComplaint,
  submitFeedback,
  trackComplaintPublic,
} from '../controllers/complaintController.js';
import { addComment } from '../controllers/commentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public tracking
router.get('/track/:code', trackComplaintPublic);

// Protected routes
router.use(protect);

router
  .route('/')
  .get(getComplaints)
  .post(authorize('student'), upload.array('attachments', 5), createComplaint);

router.route('/:id').get(getComplaintById);

router.patch('/:id/status', authorize('staff', 'admin', 'superadmin'), updateComplaintStatus);
router.patch('/:id/assign', authorize('admin', 'superadmin'), assignComplaint);
router.patch('/:id/priority', authorize('admin', 'superadmin'), updateComplaintPriority);

router.post('/:id/comments', addComment);
router.post('/:id/reopen', authorize('student'), reopenComplaint);
router.post('/:id/feedback', authorize('student'), submitFeedback);

export default router;

