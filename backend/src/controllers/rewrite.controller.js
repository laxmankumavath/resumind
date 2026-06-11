import { Resume } from '../models/Resume.js';
import { Rewrite } from '../models/Rewrite.js';
import { Analysis } from '../models/Analysis.js';
import { addRewriteJob } from '../jobs/queueSetup.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { rewriteResumeWithATSAnalysis, rewriteSectionWithAI } from '../services/ai/rewrite.service.js';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const rewriteResume = asyncHandler(async (req, res) => {
  const { resumeId, targetRole, analysisId } = req.body;

  if (!mongoose.isValidObjectId(resumeId)) {
    throw new ApiError(400, 'Valid resumeId is required');
  }

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');
  if (!resume.extractedText?.trim()) {
    throw new ApiError(422, 'Resume does not contain extracted text to rewrite');
  }

  // Prefer an explicit ATS analysis, then fall back to the latest completed one.
  let validAnalysisId = null;
  if (analysisId && mongoose.isValidObjectId(analysisId)) {
    const analysis = await Analysis.findOne({ _id: analysisId, resumeId });
    if (analysis) {
      validAnalysisId = analysisId;
    }
  }
  if (!validAnalysisId) {
    const latestAnalysis = await Analysis.findOne({ resumeId, status: 'completed' }).sort({ createdAt: -1 });
    if (latestAnalysis) {
      validAnalysisId = latestAnalysis._id;
    }
  }

  const rewrite = await Rewrite.create({
    resumeId,
    targetRole: targetRole?.trim(),
    rewriteType: 'full',
    status: 'pending',
  });

  try {
    await addRewriteJob({
      rewriteId: rewrite._id,
      resumeId,
      analysisId: validAnalysisId, // Pass analysis ID to worker
      rewriteType: 'full',
      targetRole: targetRole?.trim()
    });
  } catch (_error) {
    logger.warn(`Rewrite queue unavailable for rewrite=${rewrite._id}. Falling back to inline processing in ${process.env.NODE_ENV || 'development'} mode.`);

    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_INLINE_REWRITE_FALLBACK !== 'true') {
      rewrite.status = 'failed';
      rewrite.error = 'Redis queue is unavailable';
      await rewrite.save();
      throw new ApiError(503, 'Rewrite queue is unavailable. Please start Redis and try again.');
    }

    rewrite.status = 'processing';
    await rewrite.save();

    // Fetch analysis data if available
    let analysisData = null;
    let jobDescription = '';
    if (validAnalysisId) {
      const analysis = await Analysis.findById(validAnalysisId).populate('jobDescriptionId');
      if (analysis) {
        analysisData = analysis;
        if (analysis.jobDescriptionId) {
          jobDescription = analysis.jobDescriptionId.rawText || '';
        }
      }
    }

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

    rewrite.rewrittenSections = result.rewriteResult;
    rewrite.metadata = result.metadata;
    rewrite.comparison = result.comparison;
    rewrite.status = 'completed';
    rewrite.error = undefined;
    await rewrite.save();

    return res.status(200).json(new ApiResponse(
      200,
      {
        rewriteId: rewrite._id,
        status: rewrite.status,
        metadata: rewrite.metadata,
        comparison: rewrite.comparison,
      },
      'Full rewrite completed inline because queue was unavailable'
    ));
  }

  logger.info(`Rewrite job queued. rewrite=${rewrite._id} resume=${resumeId} analysisId=${validAnalysisId} user=${req.user._id}`);
  res.status(202).json(new ApiResponse(202, { rewriteId: rewrite._id }, 'Full rewrite started'));
});

export const rewriteSection = asyncHandler(async (req, res) => {
  const { resumeId, sectionName, text, targetRole } = req.body;

  if (!mongoose.isValidObjectId(resumeId)) {
    throw new ApiError(400, 'Valid resumeId is required');
  }
  if (!sectionName?.trim()) {
    throw new ApiError(400, 'sectionName is required');
  }
  
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');

  // Synchronous for single sections since it's fast
  const result = await rewriteSectionWithAI(text, sectionName.trim(), targetRole?.trim());

  res.status(200).json(new ApiResponse(200, {
    sectionName,
    rewrittenText: result.rewrittenText,
    improvements: result.improvements,
    atsKeywords: result.atsKeywords,
    metadata: result.metadata,
  }, 'Section rewritten'));
});

export const getRewriteHistory = asyncHandler(async (req, res) => {
  // Finds all rewrites for a given resume
  const { resumeId } = req.params;
  
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');

  const history = await Rewrite.find({ resumeId }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, history, 'Rewrite history fetched'));
});

export const getRewrite = asyncHandler(async (req, res) => {
  const { rewriteId } = req.params;

  if (!mongoose.isValidObjectId(rewriteId)) {
    throw new ApiError(400, 'Valid rewriteId is required');
  }

  const rewrite = await Rewrite.findById(rewriteId);
  if (!rewrite) throw new ApiError(404, 'Rewrite not found');

  const resume = await Resume.findOne({ _id: rewrite.resumeId, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');

  res.status(200).json(new ApiResponse(200, rewrite, 'Rewrite fetched'));
});
