export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode = 500, error = 'Server Error', details = null) => {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details ? { details } : {}),
  });
};

