import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import resumeRoutes from './resume.routes.js';
import analysisRoutes from './analysis.routes.js';
import rewriteRoutes from './rewrite.routes.js';
import exportRoutes from './export.routes.js';
import companyMatchRoutes from './companyMatch.routes.js';

const router = Router();

router.get('/', (req, res) => res.status(200).json({
  success: true,
  message: 'API v1 is running',
  health: '/api/v1/health',
}));

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/resumes', resumeRoutes);
router.use('/analysis', analysisRoutes);
router.use('/rewrite', rewriteRoutes);
router.use('/export', exportRoutes);
router.use('/company-match', companyMatchRoutes);

// Health check endpoint
router.get('/health', (req, res) => res.status(200).json({ success: true, message: 'API is running' }));

export default router;
