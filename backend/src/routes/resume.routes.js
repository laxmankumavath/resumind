import { Router } from 'express';
import { uploadResume, getResume, deleteResume, listUserResumes } from '../controllers/resume.controller.js';
import { analyzeResume, getAnalysis } from '../controllers/analysis.controller.js';
import { rewriteResume, getRewrite } from '../controllers/rewrite.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);

const useResumeIdParam = (handler) => (req, res, next) => {
  req.body = { ...req.body, resumeId: req.params.id };
  return handler(req, res, next);
};

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/analysis/:id', getAnalysis);
router.get('/rewrite/:rewriteId', getRewrite);
router.post('/:id/analyze', useResumeIdParam(analyzeResume));
router.post('/:id/rewrite', useResumeIdParam(rewriteResume));
router.get('/', listUserResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

export default router;
