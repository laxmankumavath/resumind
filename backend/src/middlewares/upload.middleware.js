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
  const allowedTypes = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF and DOCX are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});
