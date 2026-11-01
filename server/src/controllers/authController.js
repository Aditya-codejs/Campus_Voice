import crypto from 'crypto';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { logActivity } from '../services/auditService.js';

// @desc    Register Student
// @route   POST /api/auth/register-student
// @access  Public
export const registerStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      enrollment_number,
      department,
      course,
      academic_year,
      password,
    } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof enrollment_number !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !enrollment_number.trim() ||
      password.length < 12
    ) {
      return sendError(res, 400, 'Provide your name, email, enrollment number, and a password of at least 12 characters.');
    }

    // Check duplicate email
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEnrollment = enrollment_number.trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return sendError(res, 400, 'An account with this email address already exists.');
    }

    // Check duplicate enrollment
    const existingEnrollment = await User.findOne({ enrollment_number: normalizedEnrollment });
    if (existingEnrollment) {
      return sendError(res, 400, 'A student with this enrollment number is already registered.');
    }

    let deptDoc = null;
    if (typeof department === 'string' && department.trim()) {
      const departmentValue = department.trim();
      const departmentQuery = /^[0-9a-fA-F]{24}$/.test(departmentValue)
        ? { _id: departmentValue, is_active: true }
        : { name: departmentValue, is_active: true };
      deptDoc = await Department.findOne(departmentQuery);
    }

    const student = await User.create({
      name,
      email: normalizedEmail,
      enrollment_number: normalizedEnrollment,
      department: deptDoc?._id || null,
      department_name: deptDoc?.name || (typeof department === 'string' ? department : ''),
      course,
      academic_year,
      password,
      role: 'student',
      status: 'approved',
      email_verified: true,
    });

    // Send welcome email
    sendWelcomeEmail(student).catch(() => {});

    // Log activity
    logActivity({
      user: student,
      action: 'STUDENT_REGISTER',
      entity_type: 'User',
      entity_id: student._id,
      ip_address: req.ip,
    });

    const token = student.getSignedJwtToken();

    return sendSuccess(res, 201, 'Student registered successfully', {
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        enrollment_number: student.enrollment_number,
        department: student.department,
        department_name: student.department_name,
        course: student.course,
        academic_year: student.academic_year,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register Staff
// @route   POST /api/auth/register-staff
// @access  Public
export const registerStaff = async (req, res, next) => {
  try {
    const { name, email, employee_id, department, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof employee_id !== 'string' ||
      typeof department !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !employee_id.trim() ||
      !department.trim() ||
      password.length < 12
    ) {
      return sendError(res, 400, 'Provide your name, email, employee ID, department, and a password of at least 12 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employee_id.trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return sendError(res, 400, 'An account with this official email already exists.');
    }

    const existingEmp = await User.findOne({ employee_id: normalizedEmployeeId });
    if (existingEmp) {
      return sendError(res, 400, 'A staff member with this Employee ID is already registered.');
    }

    const departmentQuery = /^[0-9a-fA-F]{24}$/.test(department)
      ? { _id: department, is_active: true }
      : { name: department.trim(), is_active: true };
    const deptDoc = await Department.findOne(departmentQuery);
    if (!deptDoc) {
      return sendError(res, 400, 'Please select an active department.');
    }

    const staff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      employee_id: normalizedEmployeeId,
      department: deptDoc._id,
      department_name: deptDoc.name,
      password,
      role: 'staff',
      status: 'pending', // Requires admin approval
    });

    sendWelcomeEmail(staff).catch(() => {});

    logActivity({
      user: staff,
      action: 'STAFF_REGISTER_PENDING',
      entity_type: 'User',
      entity_id: staff._id,
      ip_address: req.ip,
    });

    return sendSuccess(
      res,
      201,
      'Staff registration submitted successfully. Your account is currently pending administrator approval.',
      {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return sendError(res, 400, 'Please provide both email and password.');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password credentials.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password credentials.');
    }

    // Role specific status check for staff
    if (user.role === 'staff') {
      if (user.status === 'pending') {
        return sendError(
          res,
          403,
          'Your staff registration is currently pending administrator approval. You will receive an email once approved.'
        );
      }
      if (user.status === 'rejected') {
        return sendError(
          res,
          403,
          'Your staff account registration has been rejected by the administrator. Please contact your college grievance cell.'
        );
      }
    }

    const token = user.getSignedJwtToken();

    logActivity({
      user,
      action: 'USER_LOGIN',
      entity_type: 'User',
      entity_id: user._id,
      ip_address: req.ip,
    });

    return sendSuccess(res, 200, 'Logged in successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        enrollment_number: user.enrollment_number,
        employee_id: user.employee_id,
        department: user.department,
        department_name: user.department_name,
        course: user.course,
        academic_year: user.academic_year,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department', 'name code email');
    if (!user) {
      return sendError(res, 401, 'Account no longer exists.');
    }
    return sendSuccess(res, 200, 'Current profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, course, academic_year } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 401, 'Account no longer exists.');
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return sendError(res, 400, 'Name must be a non-empty string.');
      }
      user.name = name.trim();
    }
    if (phone !== undefined) user.phone = phone;
    if (course && user.role === 'student') user.course = course;
    if (academic_year && user.role === 'student') user.academic_year = academic_year;

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== 'string' ||
      !currentPassword ||
      typeof newPassword !== 'string'
    ) {
      return sendError(res, 400, 'Please provide both current and new password.');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 12) {
      return sendError(res, 400, 'New password must be at least 12 characters long.');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return sendError(res, 401, 'Account no longer exists.');
    }
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendError(res, 400, 'Current password entered is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      return sendSuccess(res, 200, 'If an account exists with this email, a reset link has been dispatched.');
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      // Don't disclose user non-existence for security
      return sendSuccess(res, 200, 'If an account exists with this email, a reset link has been dispatched.');
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.reset_password_token = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.reset_password_expire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    try {
      const emailResult = await sendPasswordResetEmail(user, resetToken);
      if (!emailResult?.success) {
        throw new Error('Password reset email could not be delivered.');
      }
    } catch (error) {
      user.reset_password_token = undefined;
      user.reset_password_expire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(error);
    }

    return sendSuccess(res, 200, 'If an account exists with this email, a reset link has been dispatched.');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const reset_password_token = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      reset_password_token,
      reset_password_expire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid or expired password reset token.');
    }

    if (typeof req.body.password !== 'string' || req.body.password.length < 12) {
      return sendError(res, 400, 'Password must be at least 12 characters long.');
    }

    user.password = req.body.password;
    user.reset_password_token = undefined;
    user.reset_password_expire = undefined;
    await user.save();

    return sendSuccess(res, 200, 'Password has been reset successfully. You can now login with your new password.');
  } catch (error) {
    next(error);
  }
};
