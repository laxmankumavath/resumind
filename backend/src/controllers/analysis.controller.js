import { Resume } from '../models/Resume.js';
import { JobDescription } from '../models/JobDescription.js';
import { Analysis } from '../models/Analysis.js';
import { addAnalysisJob } from '../jobs/queueSetup.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateAtsScore } from '../services/scoring/atsScore.service.js';

export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId, jobDescriptionText, jobTitle } = req.body;
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  
  if (!resume) throw new ApiError(404, 'Resume not found');

  const jobDesc = await JobDescription.create({
    userId: req.user._id,
    title: jobTitle || 'Target Role',
    rawText: jobDescriptionText,
  });

  const analysis = await Analysis.create({
    resumeId,
    jobDescriptionId: jobDesc._id,
    status: 'pending',
  });

  try {
    await addAnalysisJob({
      analysisId: analysis._id,
      resumeId,
      jobDescriptionId: jobDesc._id,
    });
  } catch (_error) {
    const result = generateAtsScore(resume.extractedText, resume.parsedSections, jobDesc.rawText);
    let aiResults = {};
    try {
      const { analyzeAtsWithAI } = await import('../services/ai/ats.service.js');
      aiResults = await analyzeAtsWithAI(resume.extractedText, jobDesc.rawText);
    } catch (_aiError) {
      // ignore, use heuristics
    }
    await Analysis.findByIdAndUpdate(analysis._id, {
      ...result,
      strengths: aiResults.strengths || result.strengths,
      weaknesses: aiResults.weaknesses || result.weaknesses,
      suggestions: aiResults.improvements || result.suggestions,
      areasOfImprovement: aiResults.areasOfImprovement || result.areasOfImprovement || result.suggestions,
      status: 'completed',
    });
  }

  res.status(202).json(new ApiResponse(202, { analysisId: analysis._id }, 'ATS Analysis started'));
});

export const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id).populate('jobDescriptionId');
  if (!analysis) throw new ApiError(404, 'Analysis not found');
  
  // Verify ownership via Resume
  const resume = await Resume.findById(analysis.resumeId);
  if (!resume || resume.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  res.status(200).json(new ApiResponse(200, analysis, 'Analysis fetched'));
});

export const compareWithJD = asyncHandler(async (req, res) => {
  const { resumeId, jobDescriptionText, jobTitle } = req.body;
  
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');

  const jobDesc = await JobDescription.create({
    userId: req.user._id,
    title: jobTitle || 'Target Role',
    rawText: jobDescriptionText,
  });

  const result = generateAtsScore(resume.extractedText, resume.parsedSections, jobDesc.rawText);

  let aiResults = {};
  try {
    const { analyzeAtsWithAI } = await import('../services/ai/ats.service.js');
    aiResults = await analyzeAtsWithAI(resume.extractedText, jobDesc.rawText);
  } catch (_error) {}

  const analysis = await Analysis.create({
    resumeId,
    jobDescriptionId: jobDesc._id,
    ...result,
    strengths: aiResults.strengths || result.strengths,
    weaknesses: aiResults.weaknesses || result.weaknesses,
    suggestions: aiResults.improvements || result.suggestions,
    areasOfImprovement: aiResults.areasOfImprovement || result.areasOfImprovement || result.suggestions,
    status: 'completed',
  });

  res.status(200).json(new ApiResponse(200, analysis, 'Comparison completed'));
});
