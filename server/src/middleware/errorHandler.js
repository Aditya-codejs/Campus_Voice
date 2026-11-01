import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);

  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, 404, 'Resource not found with provided identifier');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, 400, `A record with this ${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return sendError(res, 400, messages.join('. '));
  }

  // Multer error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File size limit exceeded. Maximum 5 MB per file allowed.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, 400, 'Too many files uploaded. Maximum 5 files allowed.');
    }
    return sendError(res, 400, `Upload error: ${err.message}`);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token');
  }

  return sendError(res, error.statusCode || 500, error.message || 'Internal Server Error');
};

