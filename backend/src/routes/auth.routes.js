import { Router } from 'express';
import { registerUser, loginUser, logoutUser, refreshToken } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validation.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', protect, logoutUser);

export default router;
