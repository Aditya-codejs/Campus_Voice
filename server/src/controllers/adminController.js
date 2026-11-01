import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { AuditLog } from '../models/AuditLog.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sendStaffStatusEmail } from '../services/emailService.js';
import { logActivity } from '../services/auditService.js';
import { escapeCsvCell } from '../utils/csv.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get Comprehensive Analytics & Dashboard Metrics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const submittedCount = await Complaint.countDocuments({ status: 'submitted' });
    const inProgressCount = await Complaint.countDocuments({
      status: { $in: ['assigned', 'in_progress', 'under_review', 'reopened'] },
    });
    const resolvedCount = await Complaint.countDocuments({ status: { $in: ['resolved', 'closed'] } });
    const rejectedCount = await Complaint.countDocuments({ status: 'rejected' });
    const overdueCount = await Complaint.countDocuments({
      status: { $nin: ['resolved', 'closed', 'rejected'] },
      due_date: { $lt: new Date() },
    });

    const pendingStaffCount = await User.countDocuments({ role: 'staff', status: 'pending' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'staff', status: 'approved' });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      {
        $unwind: {
          path: '$categoryDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ['$categoryDoc.name', 'Uncategorized'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Department breakdown
    const departmentStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptDoc',
        },
      },
      {
        $unwind: {
          path: '$deptDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ['$deptDoc.name', 'General'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Status distribution
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Average satisfaction rating
    const ratingAggregate = await Complaint.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRated: { $sum: 1 } } },
    ]);

    const avgRating = ratingAggregate[0]?.avgRating ? Number(ratingAggregate[0].avgRating.toFixed(1)) : 0;
    const totalRated = ratingAggregate[0]?.totalRated || 0;

    return sendSuccess(res, 200, 'Dashboard statistics retrieved', {
      metrics: {
        totalComplaints,
        submittedCount,
        inProgressCount,
        resolvedCount,
        rejectedCount,
        overdueCount,
        pendingStaffCount,
        totalStudents,
        totalStaff,
        avgRating,
        totalRated,
      },
      categoryStats,
      departmentStats,
      statusStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Staff Registrations
// @route   GET /api/admin/staff-registrations
// @access  Private (Admin)
export const getStaffRegistrations = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const query = { role: 'staff' };
    if (status !== 'all') {
      query.status = status;
    }

    const staffList = await User.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Staff registrations retrieved', { staffList });
  } catch (error) {
    next(error);
  }
};

// @desc    Review Staff Registration (Approve or Reject)
// @route   PATCH /api/admin/staff-registrations/:id
// @access  Private (Admin)
export const reviewStaffRegistration = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 400, 'Status must be either approved or rejected.');
    }

    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') {
      return sendError(res, 404, 'Staff member record not found.');
    }

    staff.status = status;
    await staff.save();

    // Send email alert
    sendStaffStatusEmail(staff, status, reason).catch(() => {});

    logActivity({
      user: req.user,
      action: status === 'approved' ? 'STAFF_APPROVED' : 'STAFF_REJECTED',
      entity_type: 'User',
      entity_id: staff._id,
      details: { staffEmail: staff.email, reason },
      ip_address: req.ip,
    });

    return sendSuccess(res, 200, `Staff account has been ${status}.`, { staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (
      typeof role === 'string' &&
      role !== 'all' &&
      !['student', 'staff', 'admin', 'superadmin'].includes(role)
    ) {
      return sendError(res, 400, 'Invalid user role filter.');
    }
    if (typeof search === 'string' && search.length > 100) {
      return sendError(res, 400, 'Search must be 100 characters or fewer.');
    }
    if (typeof role === 'string' && role !== 'all') query.role = role;
    if (typeof search === 'string' && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { enrollment_number: { $regex: safeSearch, $options: 'i' } },
        { employee_id: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 15));
    const skip = (pageNumber - 1) * pageSize;
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      users,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 25));
    const skip = (pageNumber - 1) * pageSize;
    const total = await AuditLog.countDocuments();

    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return sendSuccess(res, 200, 'Audit logs retrieved', {
      logs,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Complaints to CSV
// @route   GET /api/admin/export-csv
// @access  Private (Admin)
export const exportComplaintsCsv = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'name email enrollment_number')
      .populate('department', 'name')
      .populate('category', 'name')
      .populate('assigned_to', 'name')
      .sort({ createdAt: -1 });

    const headers = [
      'Complaint Code',
      'Title',
      'Category',
      'Department',
      'Status',
      'Priority',
      'Student Name',
      'Student Email',
      'Assigned Staff',
      'Location',
      'Due Date',
      'Created At',
      'Resolved At',
      'Rating',
    ];

    const rows = complaints.map((c) => [
      c.complaint_code,
      c.title,
      c.category?.name,
      c.department?.name,
      c.status,
      c.priority,
      c.is_anonymous ? 'Anonymous' : c.student?.name,
      c.is_anonymous ? 'Protected' : c.student?.email,
      c.assigned_to?.name || 'Unassigned',
      c.location,
      c.due_date ? new Date(c.due_date).toISOString() : '',
      new Date(c.createdAt).toISOString(),
      c.resolved_at ? new Date(c.resolved_at).toISOString() : '',
      c.rating,
    ].map(escapeCsvCell));

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=complaints-export-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
