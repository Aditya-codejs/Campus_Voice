import { Category } from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ is_active: true })
      .populate('default_department', 'name code')
      .sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved', { categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, default_department, default_priority, is_sensitive } = req.body;
    if (!name) return sendError(res, 400, 'Category name is required.');

    const category = await Category.create({
      name,
      description,
      default_department: default_department || null,
      default_priority: default_priority || 'medium',
      is_sensitive: Boolean(is_sensitive),
    });
    return sendSuccess(res, 201, 'Category created successfully', { category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'Category updated successfully', { category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );
    if (!category) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'Category deactivated successfully');
  } catch (error) {
    next(error);
  }
};

