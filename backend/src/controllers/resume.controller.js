import { Resume } from '../models/Resume.js';
import { uploadToCloudinary } from '../services/storage/storage.service.js';
import { extractTextFromPDF } from '../services/parser/pdfParser.service.js';
import { extractTextFromDOCX } from '../services/parser/docxParser.service.js';
import { cleanText } from '../services/parser/textCleaner.service.js';
import { extractSections } from '../services/parser/sectionExtractor.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import fs from 'fs';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload a file');
  
  try {
    let rawText = '';
    if (req.file.mimetype === 'application/pdf') {
      rawText = await extractTextFromPDF(req.file.path);
    } else {
      rawText = await extractTextFromDOCX(req.file.path);
    }

    const cleanedText = cleanText(rawText);
    const parsedSections = extractSections(cleanedText);
    const fileUrl = await uploadToCloudinary(req.file.path);

    const resume = await Resume.create({
      userId: req.user._id,
      originalFile: fileUrl,
      extractedText: cleanedText,
      parsedSections,
    });

    res.status(201).json(new ApiResponse(201, resume, 'Resume uploaded successfully'));
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');
  res.status(200).json(new ApiResponse(200, resume, 'Resume fetched'));
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');
  res.status(200).json(new ApiResponse(200, null, 'Resume deleted'));
});

export const listUserResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, resumes, 'Resumes fetched'));
});
