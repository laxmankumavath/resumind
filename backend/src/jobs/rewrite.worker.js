import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { Rewrite } from '../models/Rewrite.js';
import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { rewriteResumeWithATSAnalysis } from '../services/ai/rewrite.service.js';
import logger from '../utils/logger.js';

/**
 * Rewrite Worker - Now uses ATS Analysis data for intelligent rewriting
 * 
 * Why it exists: Offloads the slow Gemini API calls to a background process.
 * What it does: Fetches ATS analysis results and uses them to guide resume rewriting.
 */

let rewriteWorker;

export const startRewriteWorker = () => {
  if (rewriteWorker) return rewriteWorker;

  rewriteWorker = new Worker('RewriteQueue', async job => {
  const { rewriteId, resumeId, analysisId, targetRole } = job.data;
  
  try {
    logger.info(`Starting intelligent rewrite for job ${job.id} using ATS analysis`);
    
    // Update status
    await Rewrite.findByIdAndUpdate(rewriteId, { status: 'processing', jobId: job.id });
    
    // Fetch resume
    const resume = await Resume.findById(resumeId);
    if (!resume) throw new Error('Resume not found');
    
    // Fetch ATS analysis if available
    let analysisData = null;
    let jobDescription = '';
    if (analysisId) {
      const analysis = await Analysis.findById(analysisId).populate('jobDescriptionId');
      if (analysis) {
        analysisData = analysis;
        if (analysis.jobDescriptionId) {
          jobDescription = analysis.jobDescriptionId.rawText || '';
        }
      }
    }
    
    // Use intelligent rewrite with ATS data
    const rewriteInput = {
      originalResume: resume.extractedText,
      atsScore: analysisData?.atsScore || 0,
      keywordScore: analysisData?.keywordScore || 0,
      grammarScore: analysisData?.grammarScore || 0,
      readabilityScore: analysisData?.readabilityScore || 0,
      sectionScore: analysisData?.sectionScore || 0,
      strengths: analysisData?.strengths || [],
      weaknesses: analysisData?.weaknesses || [],
      missingKeywords: analysisData?.missingKeywords || [],
      suggestions: analysisData?.suggestions || [],
      areasOfImprovement: analysisData?.areasOfImprovement || analysisData?.suggestions || [],
      matchedKeywords: analysisData?.matchedKeywords || [],
      targetRole: targetRole?.trim(),
      jobDescription,
    };

    const result = await rewriteResumeWithATSAnalysis(rewriteInput);
    
    // Save to DB
    await Rewrite.findByIdAndUpdate(rewriteId, {
      rewrittenSections: result.rewriteResult,
      metadata: result.metadata,
      comparison: result.comparison,
      status: 'completed',
      error: undefined,
    });
    
    logger.info(`Completed intelligent rewrite for job ${job.id}. estimatedNewATSScore=${result.metadata.estimatedNewATSScore}`);
    
  } catch (error) {
    logger.error(`Rewrite Worker Error: ${error.message}`);
    logger.error(error.stack);
    await Rewrite.findByIdAndUpdate(rewriteId, { 
      status: 'failed',
      error: error.message
    });
    throw error;
  }
  }, { 
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, maxRetriesPerRequest: null },
    concurrency: 5
  });

  rewriteWorker.on('completed', (job) => {
    logger.info(`Rewrite job ${job.id} completed`);
  });

  rewriteWorker.on('failed', (job, err) => {
    logger.error(`Rewrite ${job?.id} failed: ${err.message}`);
  });

  return rewriteWorker;
};
