import { Router } from 'express';
import { rewriteResume, rewriteSection, getRewriteHistory, getRewrite } from '../controllers/rewrite.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/resume', rewriteResume);
router.post('/section', rewriteSection);
router.get('/history/:resumeId', getRewriteHistory);
router.get('/:rewriteId', getRewrite);

export default router;
