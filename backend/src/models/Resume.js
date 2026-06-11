import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalFile: {
    type: String, // URL from Cloudinary or S3
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
  parsedSections: {
    skills: [String],
    experience: [String],
    education: [String],
    projects: [String],
    summary: String,
  }
}, { timestamps: true });

export const Resume = mongoose.model('Resume', resumeSchema);
