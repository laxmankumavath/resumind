import fs from 'fs';
import pdfParse from 'pdf-parse';
import zlib from 'zlib';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

const decodePdfHexString = (value) => {
  const hex = value.replace(/\s+/g, '');
  return Buffer.from(hex, 'hex').toString('utf8');
};

const decodePdfLiteralString = (value) => value
  .replace(/\\n/g, '\n')
  .replace(/\\r/g, '\r')
  .replace(/\\t/g, '\t')
  .replace(/\\b/g, '\b')
  .replace(/\\f/g, '\f')
  .replace(/\\([\\()])/g, '$1');

const extractTextOperators = (content) => {
  const text = [];
  const textTokenPattern = /<([0-9a-fA-F\s]+)>\s*Tj|\(([^()]*(?:\\.[^()]*)*)\)\s*Tj|\[(.*?)\]\s*TJ/gs;
  let match;

  while ((match = textTokenPattern.exec(content)) !== null) {
    if (match[1]) {
      text.push(decodePdfHexString(match[1]));
      continue;
    }

    if (match[2]) {
      text.push(decodePdfLiteralString(match[2]));
      continue;
    }

    const arrayTokens = match[3].matchAll(/<([0-9a-fA-F\s]+)>|\(([^()]*(?:\\.[^()]*)*)\)/gs);
    for (const token of arrayTokens) {
      text.push(token[1] ? decodePdfHexString(token[1]) : decodePdfLiteralString(token[2]));
    }
  }

  return text.join('\n');
};

const extractTextWithStreamFallback = (buffer) => {
  const source = buffer.toString('latin1');
  const streamPattern = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const text = [];
  let match;

  while ((match = streamPattern.exec(source)) !== null) {
    const dictionary = match[1];
    const streamBuffer = Buffer.from(match[2], 'latin1');
    let contentBuffer = streamBuffer;

    if (/\/FlateDecode\b/.test(dictionary)) {
      try {
        contentBuffer = zlib.inflateSync(streamBuffer);
      } catch (_e) {
        continue;
      }
    }

    const streamText = extractTextOperators(contentBuffer.toString('latin1')).trim();
    if (streamText) text.push(streamText);
  }

  return text.join('\n').trim();
};

export const extractTextFromPDF = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new ApiError(400, 'PDF file not found on disk');
  }

  const dataBuffer = fs.readFileSync(filePath);
  if (!dataBuffer || dataBuffer.length === 0) {
    throw new ApiError(400, 'Uploaded PDF file is empty');
  }

  try {
    const data = await pdfParse(dataBuffer);
    if (data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch (error) {
    logger.warn(`pdf-parse primary extraction failed: ${error.message}. Attempting fallback stream extraction...`);
  }

  try {
    const fallbackText = extractTextWithStreamFallback(dataBuffer);
    if (fallbackText && fallbackText.trim().length > 0) {
      return fallbackText;
    }
  } catch (fallbackError) {
    logger.warn(`Stream fallback extraction failed: ${fallbackError.message}`);
  }

  throw new ApiError(400, 'Could not extract readable text from PDF document. Please ensure the PDF contains selectable text (not a scanned image) and is not password-protected.');
};
