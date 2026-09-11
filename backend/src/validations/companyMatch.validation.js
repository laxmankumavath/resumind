import { z } from 'zod';
import { COMPANY_MATCH_CATEGORIES } from '../services/ai/companyMatch.service.js';

export const generateCompanyMatchSchema = z.object({
  analysisId: z.string().optional(),
  targetRole: z.string().trim().max(120).optional(),
  jobDescription: z.string().trim().max(20000).optional(),
  companyCategories: z.array(z.enum(COMPANY_MATCH_CATEGORIES)).max(10).optional().default([]),
});
