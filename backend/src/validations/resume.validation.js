import { z } from 'zod';

/**
 * Resume Analysis Validations
 * 
 * Why it exists: Validates the request body for resume-related endpoints (like triggering analysis).
 */

export const analyzeResumeSchema = z.object({
  resumeId: z.string().min(1, 'Resume id is required'),
  jobDescriptionText: z.string().min(50, 'Job description must be at least 50 characters long'),
  jobTitle: z.string().min(2, 'Job title is required').optional(),
  companyName: z.string().optional(),
});
