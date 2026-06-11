import { Router } from 'express';
import { exportPDF, exportDOCX } from '../controllers/export.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/pdf/:id', exportPDF);
router.get('/docx/:id', exportDOCX);

export default router;
