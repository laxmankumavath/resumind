import fs from 'fs';
import mammoth from 'mammoth';
import { ApiError } from '../../utils/ApiError.js';

export const extractTextFromDOCX = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (_error) {
    throw new ApiError(500, 'Failed to parse DOCX document');
  }
};
