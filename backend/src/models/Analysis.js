import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobDescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
  },
  atsScore: { type: Number, default: 0 },
  keywordScore: { type: Number, default: 0 },
  grammarScore: { type: Number, default: 0 },
  readabilityScore: { type: Number, default: 0 },
  sectionScore: { type: Number, default: 0 },
  matchedKeywords: [String],
  missingKeywords: [String],
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  areasOfImprovement: [String],
  error: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  }
}, { timestamps: true });

export const Analysis = mongoose.model('Analysis', analysisSchema);
