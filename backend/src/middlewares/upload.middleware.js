import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

/**
 * File Upload Middleware using Multer
 * 
 * Why it exists: Parses incoming multipart/form-data requests containing files.
 * What it does: Temporarily stores the file in 'uploads/', filters for PDF/DOCX, and limits size.
 */

// Use local storage temporarily before uploading to Cloudinary
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/x-pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ext === '.pdf' || ext === '.docx' || ext === '.doc';

  if (allowedMimes.includes(file.mimetype) || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF and DOCX documents are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});
