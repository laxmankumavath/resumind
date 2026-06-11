import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { Rewrite } from '../models/Rewrite.js';
import mongoose from 'mongoose';

const main = async () => {
  await connectDB();
  const userCount = await User.countDocuments();
  const resumeCount = await Resume.countDocuments();
  const analysisCount = await Analysis.countDocuments();
  const rewriteCount = await Rewrite.countDocuments();
  const latestUser = await User.findOne().sort({ createdAt: -1 }).lean();
  const latestResume = await Resume.findOne().sort({ createdAt: -1 }).lean();
  const latestAnalysis = await Analysis.findOne().sort({ createdAt: -1 }).lean();
  const latestRewrite = await Rewrite.findOne().sort({ createdAt: -1 }).lean();

  console.log(JSON.stringify({ userCount, resumeCount, analysisCount, rewriteCount, latestUser, latestResume, latestAnalysis, latestRewrite }, null, 2));
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
