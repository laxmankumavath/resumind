import fs from 'fs';
import mammoth from 'mammoth';
import { ApiError } from '../../utils/ApiError.js';

export const extractTextFromDOCX = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new ApiError(400, 'DOCX file not found on disk');
  }

  const dataBuffer = fs.readFileSync(filePath);
  if (!dataBuffer || dataBuffer.length === 0) {
    throw new ApiError(400, 'Uploaded DOCX file is empty');
  }

  try {
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    const text = result?.value || '';
    if (!text.trim()) {
      throw new ApiError(400, 'DOCX document does not contain readable text.');
    }
    return text;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, `Failed to parse DOCX document: ${error.message}`);
  }
};
