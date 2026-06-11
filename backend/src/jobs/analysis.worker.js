import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { Analysis } from '../models/Analysis.js';
import { Resume } from '../models/Resume.js';
import { JobDescription } from '../models/JobDescription.js';
import { generateAtsScore } from '../services/scoring/atsScore.service.js';
import { analyzeAtsWithAI } from '../services/ai/ats.service.js';
import logger from '../utils/logger.js';

/**
 * Analysis Worker
 * 
 * Why it exists: Processes ATS scoring asynchronously.
 * What it does: Pulls jobs from the AnalysisQueue, runs the scoring algorithm, and updates the database.
 */

let analysisWorker;

export const startAnalysisWorker = () => {
  if (analysisWorker) return analysisWorker;

  analysisWorker = new Worker('AnalysisQueue', async job => {
  const { analysisId, resumeId, jobDescriptionId } = job.data;
  
  try {
    logger.info(`Starting analysis for job ${job.id}`);
    
    // Update status to processing
    await Analysis.findByIdAndUpdate(analysisId, { status: 'processing' });
    
    // Fetch data
    const resume = await Resume.findById(resumeId);
    const jobDesc = await JobDescription.findById(jobDescriptionId);
    
    if (!resume || !jobDesc) throw new Error('Resume or Job Description not found');
    
    // Run heuristic scoring service
    const results = generateAtsScore(resume.extractedText, resume.parsedSections, jobDesc.rawText);
    
    // Call AI to get better, tailored suggestions
    let aiResults = {};
    try {
      aiResults = await analyzeAtsWithAI(resume.extractedText, jobDesc.rawText);
    } catch (aiError) {
      logger.warn(`AI Analysis failed, falling back to heuristics: ${aiError.message}`);
    }
    
    // Update DB with merged results
    await Analysis.findByIdAndUpdate(analysisId, {
      ...results,
      strengths: aiResults.strengths || results.strengths,
      weaknesses: aiResults.weaknesses || results.weaknesses,
      suggestions: aiResults.improvements || results.suggestions,
      areasOfImprovement: aiResults.areasOfImprovement || results.areasOfImprovement || results.suggestions,
      status: 'completed',
      error: undefined,
    });
    
    logger.info(`Completed analysis for job ${job.id}`);
    
  } catch (error) {
    logger.error(`Analysis Worker Error: ${error.message}`);
    logger.error(error.stack);
    await Analysis.findByIdAndUpdate(analysisId, { status: 'failed', error: error.message });
    throw error; // Let BullMQ handle retries if configured
  }
  }, { 
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }), maxRetriesPerRequest: null } 
  });

  analysisWorker.on('completed', (job) => {
    logger.info(`Analysis job ${job.id} completed`);
  });

  analysisWorker.on('failed', (job, err) => {
    logger.error(`${job?.id} has failed with ${err.message}`);
  });

  return analysisWorker;
};
