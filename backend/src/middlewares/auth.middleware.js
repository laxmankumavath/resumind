import { verifyAccessToken } from '../utils/jwt.util.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication Middleware
 * 
 * Why it exists: Protects private routes from unauthorized access.
 * What it does: Extracts the JWT from the Authorization header, verifies it, and attaches the user document to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route. Missing token.');
    }
    
    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (_err) {
      throw new ApiError(401, 'Not authorized to access this route. Invalid token.');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Authorization Middleware
 * 
 * Why it exists: Restricts certain routes to specific roles (e.g., admin).
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role ${req.user.role} is not authorized to access this route`));
    }
    next();
  };
};
