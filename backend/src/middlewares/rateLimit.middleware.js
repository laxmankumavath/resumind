import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * 
 * Why it exists: Prevents brute force and Denial of Service (DoS) attacks.
 * What it does: Restricts the number of requests a single IP can make within a time window.
 */

// Global rate limiter applied to all routes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.method === 'OPTIONS', // Never block preflight OPTIONS requests
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Rate limiter specifically for authentication routes (login/register)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after an hour'
  }
});

