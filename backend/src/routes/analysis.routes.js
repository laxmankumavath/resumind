import { Router } from 'express';
import { analyzeResume, getAnalysis, compareWithJD } from '../controllers/analysis.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { analyzeResumeSchema } from '../validations/resume.validation.js';

const router = Router();

router.use(protect);

router.post('/analyze', validate(analyzeResumeSchema), analyzeResume);
router.post('/compare-jd', validate(analyzeResumeSchema), compareWithJD);
router.get('/:id', getAnalysis);

export default router;
