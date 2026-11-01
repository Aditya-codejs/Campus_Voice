import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/auth.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, access token missing');
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }

    // If staff, verify account has been approved by admin
    if (user.role === 'staff' && user.status !== 'approved') {
      return sendError(
        res,
        403,
        user.status === 'pending'
          ? 'Your staff account is pending administrator approval'
          : 'Your staff account registration has been rejected'
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 401, 'Not authorized, token invalid or expired');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role (${req.user?.role || 'Guest'}) is not authorized to access this resource`
      );
    }
    next();
  };
};
