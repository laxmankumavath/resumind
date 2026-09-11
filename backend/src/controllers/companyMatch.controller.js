import mongoose from 'mongoose';
import { Analysis } from '../models/Analysis.js';
import { CompanyMatch } from '../models/CompanyMatch.js';
import { Resume } from '../models/Resume.js';
import { generateCompanyMatchesWithAI } from '../services/ai/companyMatch.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const findLatestCompletedAnalysis = async (resumeId, explicitAnalysisId) => {
  if (explicitAnalysisId && mongoose.isValidObjectId(explicitAnalysisId)) {
    const explicit = await Analysis.findOne({ _id: explicitAnalysisId, resumeId }).populate('jobDescriptionId');
    if (explicit) return explicit;
  }

  return Analysis.findOne({ resumeId, status: 'completed' })
    .sort({ createdAt: -1 })
    .populate('jobDescriptionId');
};

export const generateCompanyMatch = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const {
    analysisId,
    targetRole = '',
    jobDescription = '',
    companyCategories = [],
  } = req.body;

  if (!mongoose.isValidObjectId(resumeId)) {
    throw new ApiError(400, 'Valid resumeId is required');
  }

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');
  if (!resume.extractedText?.trim()) {
    throw new ApiError(422, 'Resume does not contain extracted text for company matching');
  }

  const analysis = await findLatestCompletedAnalysis(resumeId, analysisId);
  const resolvedJobDescription = String(jobDescription || analysis?.jobDescriptionId?.rawText || '').trim();
  const resolvedTargetRole = String(targetRole || analysis?.jobDescriptionId?.title || '').trim();

  const result = await generateCompanyMatchesWithAI({
    resume,
    analysis,
    targetRole: resolvedTargetRole,
    jobDescription: resolvedJobDescription,
    categories: companyCategories,
  });

  const companyMatch = await CompanyMatch.create({
    userId: req.user._id,
    resumeId,
    analysisId: analysis?._id,
    atsScore: result.atsScore,
    targetRole: resolvedTargetRole,
    matchedCompanies: result.matchedCompanies,
    metadata: result.metadata,
  });

  res.status(201).json(new ApiResponse(201, companyMatch, 'Company match generated'));
});

export const getCompanyMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;

  if (!mongoose.isValidObjectId(matchId)) {
    throw new ApiError(400, 'Valid matchId is required');
  }

  const companyMatch = await CompanyMatch.findOne({ _id: matchId, userId: req.user._id })
    .populate('resumeId', 'originalFile createdAt')
    .populate('analysisId', 'atsScore keywordScore createdAt');

  if (!companyMatch) throw new ApiError(404, 'Company match not found');

  res.status(200).json(new ApiResponse(200, companyMatch, 'Company match fetched'));
});

export const getUserCompanyHistory = asyncHandler(async (req, res) => {
  const history = await CompanyMatch.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('resumeId', 'originalFile createdAt')
    .limit(50);

  res.status(200).json(new ApiResponse(200, history, 'Company match history fetched'));
});
