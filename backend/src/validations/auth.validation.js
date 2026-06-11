import { z } from 'zod';

/**
 * Authentication Validations
 * 
 * Why it exists: Validates the request body for register and login endpoints.
 * What it does: Ensures email is valid, password is strong enough, before hitting the database.
 */

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
