import { Department } from '../models/Department.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ is_active: true })
      .populate('head_user', 'name email')
      .sort({ name: 1 });
    return sendSuccess(res, 200, 'Departments retrieved', { departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, email, description, head_user } = req.body;
    if (!name) return sendError(res, 400, 'Department name is required.');

    const department = await Department.create({
      name,
      code,
      email,
      description,
      head_user: head_user || null,
    });
    return sendSuccess(res, 201, 'Department created successfully', { department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) return sendError(res, 404, 'Department not found.');
    return sendSuccess(res, 200, 'Department updated successfully', { department });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );
    if (!department) return sendError(res, 404, 'Department not found.');
    return sendSuccess(res, 200, 'Department deactivated successfully');
  } catch (error) {
    next(error);
  }
};

