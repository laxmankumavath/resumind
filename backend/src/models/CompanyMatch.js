import mongoose from 'mongoose';

const matchedCompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  matchPercentage: { type: Number, min: 0, max: 100, default: 0 },
  hiringProbability: {
    type: String,
    enum: ['Very High', 'High', 'Medium', 'Low'],
    default: 'Medium',
  },
  requiredSkills: [String],
  missingSkills: [String],
  reasons: [String],
  recommendedActions: [String],
  averagePackage: String,
  companyType: String,
  confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
  skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
  atsCompatibility: { type: Number, min: 0, max: 100, default: 0 },
  remoteFriendly: { type: Boolean, default: false },
}, { _id: false });

const companyMatchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    index: true,
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
  },
  atsScore: { type: Number, min: 0, max: 100, default: 0 },
  targetRole: { type: String, trim: true },
  matchedCompanies: [matchedCompanySchema],
  metadata: {
    source: {
      type: String,
      enum: ['gemini-company-match', 'heuristic-company-match'],
      default: 'heuristic-company-match',
    },
    model: String,
    candidateLevel: String,
    strongestSignals: [String],
    riskSignals: [String],
    categoriesConsidered: [String],
    completedAt: Date,
    warnings: [String],
  },
}, { timestamps: true });

export const CompanyMatch = mongoose.model('CompanyMatch', companyMatchSchema);
