import { Complaint } from '../models/Complaint.js';
import { ComplaintAttachment } from '../models/ComplaintAttachment.js';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory.js';
import { ComplaintComment } from '../models/ComplaintComment.js';
import { Category } from '../models/Category.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { generateComplaintCode } from '../utils/generateComplaintCode.js';
import { calculateSlaDueDate } from '../utils/calculateSla.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import {
  sendComplaintCreatedEmail,
  sendComplaintAssignedEmail,
  sendComplaintStatusEmail,
} from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/auditService.js';
import { canAccessComplaint } from '../utils/complaintAccess.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to mask anonymous student info
const maskStudentIfAnonymous = (complaint, currentUserId, currentUserRole) => {
  const plain = complaint.toObject ? complaint.toObject() : { ...complaint };
  if (plain.is_anonymous) {
    const isOwner = String(plain.student?._id || plain.student) === String(currentUserId);
    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'superadmin';

    // Mask for staff or public viewers
    if (!isOwner && !isAdmin) {
      plain.student = {
        _id: null,
        name: 'Anonymous Student',
        email: 'Protected',
        enrollment_number: 'Protected',
      };
    }
  }
  return plain;
};

// @desc    Create Complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category_id,
      department_id,
      priority,
      location,
      incident_date,
      is_anonymous,
    } = req.body;

    if (!title || !description || !category_id || !department_id) {
      return sendError(res, 400, 'Title, description, category, and department are required.');
    }

    // Verify category and department
    const categoryDoc = await Category.findById(category_id);
    if (!categoryDoc) {
      return sendError(res, 404, 'Category not found.');
    }

    const deptDoc = await Department.findById(department_id);
    if (!deptDoc) {
      return sendError(res, 404, 'Department not found.');
    }

    // Determine final priority (sensitive categories like harassment default to high/critical)
    let finalPriority = priority || categoryDoc.default_priority || 'medium';
    if (categoryDoc.is_sensitive && ['low', 'medium'].includes(finalPriority)) {
      finalPriority = 'high';
    }

    const complaint_code = await generateComplaintCode();
    const due_date = calculateSlaDueDate(finalPriority);

    const complaint = await Complaint.create({
      complaint_code,
      student: req.user._id,
      is_anonymous: Boolean(is_anonymous === 'true' || is_anonymous === true),
      title,
      description,
      category: categoryDoc._id,
      department: deptDoc._id,
      priority: finalPriority,
      status: 'submitted',
      location: location || '',
      incident_date: incident_date ? new Date(incident_date) : new Date(),
      due_date,
    });

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map((file) => ({
        complaint: complaint._id,
        uploaded_by: req.user._id,
        file_url: file.path.includes('cloudinary')
          ? file.path
          : `/uploads/${file.filename}`,
        file_name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
      }));
      await ComplaintAttachment.insertMany(attachments);
    }

    // Initial status history
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      old_status: null,
      new_status: 'submitted',
      changed_by: req.user._id,
      changed_by_name: req.user.name,
      note: 'Complaint registered by student',
    });

    // Send confirmation email
    sendComplaintCreatedEmail(req.user.email, req.user.name, complaint).catch(() => {});

    // Notify Admins
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        title: 'New Grievance Submitted',
        message: `New complaint [${complaint.complaint_code}] in ${deptDoc.name}: "${complaint.title}"`,
        type: 'general',
        complaintId: complaint._id,
      });
    }

    logActivity({
      user: req.user,
      action: 'COMPLAINT_CREATED',
      entity_type: 'Complaint',
      entity_id: complaint._id,
      details: { complaint_code, priority: finalPriority },
      ip_address: req.ip,
    });

    return sendSuccess(res, 201, 'Complaint submitted successfully', {
      complaint: {
        id: complaint._id,
        complaint_code: complaint.complaint_code,
        status: complaint.status,
        due_date: complaint.due_date,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Complaints (Filtered by role and criteria)
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      department,
      category,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    const validStatuses = [
      'submitted',
      'under_review',
      'assigned',
      'in_progress',
      'need_more_info',
      'escalated',
      'resolved',
      'closed',
      'reopened',
      'rejected',
    ];
    if (typeof status === 'string' && status && !validStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid complaint status filter.');
    }
    if (
      typeof priority === 'string' &&
      priority &&
      !['low', 'medium', 'high', 'critical'].includes(priority)
    ) {
      return sendError(res, 400, 'Invalid priority filter.');
    }
    if (typeof search === 'string' && search.length > 100) {
      return sendError(res, 400, 'Search must be 100 characters or fewer.');
    }

    // Role-based restrictions
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'staff') {
      const sensitiveCategoryIds = await Category.find({ is_sensitive: true }).distinct('_id');
      query.$or = [
        { assigned_to: req.user._id },
        {
          department: req.user.department,
          category: { $nin: sensitiveCategoryIds },
        },
      ];
    }

    // Filters
    if (typeof status === 'string' && status) query.status = status;
    if (typeof priority === 'string' && priority) query.priority = priority;
    if (typeof department === 'string' && department) {
      if (!/^[0-9a-fA-F]{24}$/.test(department)) {
        return sendError(res, 400, 'Invalid department filter.');
      }
      query.department = department;
    }
    if (typeof category === 'string' && category) {
      if (!/^[0-9a-fA-F]{24}$/.test(category)) {
        return sendError(res, 400, 'Invalid category filter.');
      }
      query.category = category;
    }

    // Search query
    if (typeof search === 'string' && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: safeSearch, $options: 'i' } },
          { description: { $regex: safeSearch, $options: 'i' } },
          { complaint_code: { $regex: safeSearch, $options: 'i' } },
          { location: { $regex: safeSearch, $options: 'i' } },
        ],
      });
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('student', 'name email enrollment_number course academic_year')
      .populate('category', 'name is_sensitive')
      .populate('department', 'name code')
      .populate('assigned_to', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Mask anonymous info
    const sanitizedComplaints = complaints.map((c) =>
      maskStudentIfAnonymous(c, req.user._id, req.user.role)
    );

    return sendSuccess(res, 200, 'Complaints retrieved successfully', {
      complaints: sanitizedComplaints,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Complaint Detail
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email enrollment_number course academic_year')
      .populate('category', 'name is_sensitive')
      .populate('department', 'name code email')
      .populate('assigned_to', 'name email employee_id');

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    // Role check: Student can only see their own complaint
    if (!canAccessComplaint(complaint, req.user)) {
      return sendError(res, 403, 'Unauthorized access to this complaint.');
    }

    // Fetch attachments
    const hideUploader = complaint.is_anonymous && req.user.role === 'staff';
    const attachmentsQuery = ComplaintAttachment.find({ complaint: complaint._id });
    const attachments = hideUploader
      ? await attachmentsQuery
      : await attachmentsQuery.populate('uploaded_by', 'name role');

    // Fetch timeline history
    const timeline = await ComplaintStatusHistory.find({ complaint: complaint._id })
      .sort({ createdAt: 1 })
      .populate('changed_by', 'name role');
    if (complaint.is_anonymous && req.user.role === 'staff') {
      timeline.forEach((entry) => {
        if (entry.changed_by?.role === 'student') {
          entry.changed_by_name = 'Anonymous Student';
          entry.changed_by = undefined;
        }
      });
    }

    // Fetch comments (if student, exclude internal notes!)
    const commentQuery = { complaint: complaint._id };
    if (req.user.role === 'student') {
      commentQuery.is_internal = false;
    }

    const comments = await ComplaintComment.find(commentQuery).sort({ createdAt: 1 });
    if (complaint.is_anonymous && req.user.role === 'staff') {
      comments.forEach((comment) => {
        if (comment.user_role === 'student') {
          comment.user_name = 'Anonymous Student';
        }
      });
    }

    const sanitized = maskStudentIfAnonymous(complaint, req.user._id, req.user.role);

    return sendSuccess(res, 200, 'Complaint details retrieved', {
      complaint: sanitized,
      attachments,
      timeline,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Complaint Status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff & Admin)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, rejection_reason, resolution_summary } = req.body;
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email')
      .populate('category', 'is_sensitive');

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return sendError(res, 403, 'You are not authorized to update this complaint.');
    }

    const validStatuses = [
      'submitted',
      'under_review',
      'assigned',
      'in_progress',
      'need_more_info',
      'escalated',
      'resolved',
      'closed',
      'reopened',
      'rejected',
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid complaint status.');
    }

    const oldStatus = complaint.status;

    // Validation for specific statuses
    if (status === 'rejected' && !rejection_reason) {
      return sendError(res, 400, 'A reason must be provided when rejecting a complaint.');
    }
    if (status === 'resolved' && !resolution_summary) {
      return sendError(res, 400, 'A resolution summary must be provided when marking resolved.');
    }

    complaint.status = status;
    if (rejection_reason) complaint.rejection_reason = rejection_reason;
    if (resolution_summary) {
      complaint.resolution_summary = resolution_summary;
      complaint.resolved_at = new Date();
    }
    if (status === 'closed') {
      complaint.closed_at = new Date();
    }
    if (status === 'escalated') {
      complaint.escalated_at = new Date();
    }

    await complaint.save();

    // Create history entry
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      old_status: oldStatus,
      new_status: status,
      changed_by: req.user._id,
      changed_by_name: req.user.name,
      note: note || rejection_reason || resolution_summary || `Status transitioned to ${status}`,
    });

    // Notify student
    if (complaint.student && complaint.student.email) {
      sendComplaintStatusEmail(
        complaint.student.email,
        complaint.student.name,
        complaint,
        note || rejection_reason || resolution_summary
      ).catch(() => {});

      await createNotification({
        recipientId: complaint.student._id,
        title: `Complaint Status: ${status.replace('_', ' ').toUpperCase()}`,
        message: `Your complaint [${complaint.complaint_code}] is now ${status.replace('_', ' ')}.`,
        type: 'status_change',
        complaintId: complaint._id,
      });
    }

    logActivity({
      user: req.user,
      action: 'STATUS_UPDATE',
      entity_type: 'Complaint',
      entity_id: complaint._id,
      details: { oldStatus, newStatus: status, note },
      ip_address: req.ip,
    });

    return sendSuccess(res, 200, `Complaint status updated to ${status}`, { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign Complaint (to Department or Staff)
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin)
export const assignComplaint = async (req, res, next) => {
  try {
    const { department_id, staff_id, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    if (department_id) {
      const dept = await Department.findOne({ _id: department_id, is_active: true });
      if (!dept) return sendError(res, 404, 'Department not found.');
      complaint.department = dept._id;
    }

    let assignedStaff = null;
    if (staff_id) {
      assignedStaff = await User.findOne({
        _id: staff_id,
        role: 'staff',
        status: 'approved',
        department: complaint.department,
      });
      if (!assignedStaff) {
        return sendError(res, 400, 'Select an approved staff member from the complaint department.');
      }
      complaint.assigned_to = assignedStaff._id;
    } else if (Object.prototype.hasOwnProperty.call(req.body, 'staff_id')) {
      complaint.assigned_to = null;
    }

    // Auto update status if currently submitted or under_review
    const oldStatus = complaint.status;
    if (['submitted', 'under_review'].includes(complaint.status)) {
      complaint.status = 'assigned';
    }

    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      old_status: oldStatus,
      new_status: complaint.status,
      changed_by: req.user._id,
      changed_by_name: req.user.name,
      note: note || `Assigned to ${assignedStaff ? assignedStaff.name : 'Department'}`,
    });

    if (assignedStaff) {
      sendComplaintAssignedEmail(assignedStaff.email, assignedStaff.name, complaint).catch(() => {});
      await createNotification({
        recipientId: assignedStaff._id,
        title: 'New Complaint Assignment',
        message: `Complaint [${complaint.complaint_code}] has been assigned to you.`,
        type: 'assignment',
        complaintId: complaint._id,
      });
    }

    return sendSuccess(res, 200, 'Complaint assigned successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Complaint Priority
// @route   PATCH /api/complaints/:id/priority
// @access  Private (Admin)
export const updateComplaintPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return sendError(res, 400, 'Invalid priority level.');
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 404, 'Complaint not found.');

    complaint.priority = priority;
    complaint.due_date = calculateSlaDueDate(priority);
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      old_status: complaint.status,
      new_status: complaint.status,
      changed_by: req.user._id,
      changed_by_name: req.user.name,
      note: `Priority changed to ${priority.toUpperCase()} (SLA recalculated)`,
    });

    return sendSuccess(res, 200, `Priority updated to ${priority}`, { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen Complaint
// @route   POST /api/complaints/:id/reopen
// @access  Private (Student)
export const reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return sendError(res, 404, 'Complaint not found.');

    // Only owner can reopen
    if (String(complaint.student) !== String(req.user._id)) {
      return sendError(res, 403, 'You can only reopen your own complaints.');
    }

    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return sendError(res, 400, 'Only resolved or closed complaints can be reopened.');
    }

    // 7-day rule check
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (
      !complaint.resolved_at ||
      Date.now() - new Date(complaint.resolved_at).getTime() > sevenDaysMs
    ) {
      return sendError(res, 400, 'Complaint cannot be reopened after 7 days from resolution.');
    }

    const oldStatus = complaint.status;
    complaint.status = 'reopened';
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      old_status: oldStatus,
      new_status: 'reopened',
      changed_by: req.user._id,
      changed_by_name: req.user.name,
      note: reason || 'Student requested reopening due to unresolved issue',
    });

    return sendSuccess(res, 200, 'Complaint reopened successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate Resolution & Submit Feedback
// @route   POST /api/complaints/:id/feedback
// @access  Private (Student)
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return sendError(res, 404, 'Complaint not found.');

    if (String(complaint.student) !== String(req.user._id)) {
      return sendError(res, 403, 'You can only rate your own complaints.');
    }

    if (!['resolved', 'closed'].includes(complaint.status)) {
      return sendError(res, 400, 'Feedback can only be submitted after resolution.');
    }
    if (
      complaint.resolved_at &&
      Date.now() - new Date(complaint.resolved_at).getTime() > 7 * 24 * 60 * 60 * 1000
    ) {
      return sendError(res, 400, 'Feedback can only be submitted within 7 days of resolution.');
    }

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return sendError(res, 400, 'Rating must be an integer between 1 and 5.');
    }
    if (complaint.rating !== null && complaint.rating !== undefined) {
      return sendError(res, 400, 'Feedback has already been submitted for this complaint.');
    }

    complaint.rating = Number(rating);
    if (feedback) complaint.feedback = feedback;
    complaint.status = 'closed';
    complaint.closed_at = new Date();
    await complaint.save();

    return sendSuccess(res, 200, 'Thank you! Your feedback has been recorded.', { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Public Track Complaint by Code
// @route   GET /api/complaints/track/:code
// @access  Public
export const trackComplaintPublic = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ complaint_code: req.params.code.toUpperCase() })
      .populate('category', 'name')
      .populate('department', 'name code')
      .select('-student -resolution_proof');

    if (!complaint) {
      return sendError(res, 404, 'No complaint found matching this tracking code.');
    }

    const timeline = await ComplaintStatusHistory.find({ complaint: complaint._id })
      .select('new_status old_status note createdAt changed_by_name changed_by')
      .sort({ createdAt: 1 });
    await ComplaintStatusHistory.populate(timeline, { path: 'changed_by', select: 'role' });
    if (complaint.is_anonymous) {
      timeline.forEach((entry) => {
        if (entry.changed_by?.role === 'student') {
          entry.changed_by_name = 'Anonymous Student';
        }
      });
    }

    return sendSuccess(res, 200, 'Tracking information retrieved', {
      complaint: {
        complaint_code: complaint.complaint_code,
        title: complaint.title,
        status: complaint.status,
        priority: complaint.priority,
        department: complaint.department?.name,
        category: complaint.category?.name,
        created_at: complaint.createdAt,
        due_date: complaint.due_date,
        resolved_at: complaint.resolved_at,
        resolution_summary: complaint.resolution_summary,
      },
      timeline,
    });
  } catch (error) {
    next(error);
  }
};
