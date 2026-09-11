import { Router } from 'express';
import {
  generateCompanyMatch,
  getCompanyMatch,
  getUserCompanyHistory,
} from '../controllers/companyMatch.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generateCompanyMatchSchema } from '../validations/companyMatch.validation.js';

const router = Router();

router.use(protect);

router.get('/user/history', getUserCompanyHistory);
router.post('/:resumeId', validate(generateCompanyMatchSchema), generateCompanyMatch);
router.get('/:matchId', getCompanyMatch);

export default router;
