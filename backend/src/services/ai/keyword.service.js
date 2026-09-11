import { ApiError } from '../../utils/ApiError.js';
import { describeGeminiError, generateJsonWithGemini } from './gemini.service.js';

export const extractKeywordsWithAI = async (text) => {
  try {
    const payload = await generateJsonWithGemini({
      systemInstruction: 'Extract the most important technical and soft skills/keywords from the text. Return a JSON object with key "keywords" (array of strings).',
      prompt: text,
    });

    return payload.keywords || [];
  } catch (error) {
    const geminiError = describeGeminiError(error);
    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};
