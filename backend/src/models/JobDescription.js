import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  rawText: {
    type: String,
    required: true,
  },
  extractedKeywords: [String]
}, { timestamps: true });

export const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);
