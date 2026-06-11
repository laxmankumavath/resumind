import mongoose from 'mongoose';

const rewriteSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  rewrittenSections: {
    type: mongoose.Schema.Types.Mixed, // JSON output of rewritten sections
  },
  targetRole: {
    type: String,
  },
  rewriteType: {
    type: String,
    enum: ['full', 'section'],
    default: 'full',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  metadata: {
    source: {
      type: String,
      enum: ['gemini', 'fallback', 'gemini-intelligent', 'fallback-intelligent'],
    },
    model: String,
    targetRole: String,
    atsImprovementsApplied: [String],
    keywordsAdded: [String],
    estimatedNewATSScore: String,
    estimatedScoreIncrease: String,
    improvementSummary: String,
    warnings: [String],
    completedAt: Date,
  },
  comparison: {
    originalResume: String,
    improvedResume: String,
    improvementsMade: [String],
    keywordsAdded: [String],
    estimatedScoreIncrease: String,
  },
  jobId: String,
  error: String,
}, { timestamps: true });

export const Rewrite = mongoose.model('Rewrite', rewriteSchema);
