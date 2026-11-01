import { ComplaintComment } from '../models/ComplaintComment.js';
import { Complaint } from '../models/Complaint.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';
import { canAccessComplaint } from '../utils/complaintAccess.js';

// @desc    Add Comment / Note to Complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { message, is_internal } = req.body;
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email')
      .populate('category', 'is_sensitive');

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    if (typeof message !== 'string' || !message.trim()) {
      return sendError(res, 400, 'Comment text cannot be empty.');
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return sendError(res, 403, 'You are not authorized to comment on this complaint.');
    }

    // Only staff/admin can make internal notes
    const canMakeInternal = req.user.role === 'staff' || req.user.role === 'admin' || req.user.role === 'superadmin';
    const finalIsInternal = canMakeInternal ? Boolean(is_internal) : false;

    const comment = await ComplaintComment.create({
      complaint: complaint._id,
      user: req.user._id,
      user_name:
        complaint.is_anonymous && req.user.role === 'student'
          ? 'Anonymous Student'
          : req.user.name,
      user_role: req.user.role,
      message: message.trim(),
      is_internal: finalIsInternal,
    });

    // Notify the other party if not an internal note
    if (!finalIsInternal) {
      if (req.user.role === 'student') {
        // Notify assigned staff if exists
        if (complaint.assigned_to) {
          await createNotification({
            recipientId: complaint.assigned_to,
            title: `New Message on ${complaint.complaint_code}`,
            message: `${complaint.is_anonymous ? 'An anonymous student' : req.user.name} added a comment to complaint [${complaint.complaint_code}].`,
            type: 'comment',
            complaintId: complaint._id,
          });
        }
      } else {
        // Staff/Admin replied publicly -> notify student
        if (complaint.student) {
          await createNotification({
            recipientId: complaint.student._id,
            title: `Official Update on ${complaint.complaint_code}`,
            message: `${req.user.name} posted an update on your complaint.`,
            type: 'comment',
            complaintId: complaint._id,
          });
        }
      }
    }

    return sendSuccess(res, 201, 'Comment added successfully', { comment });
  } catch (error) {
    next(error);
  }
};
