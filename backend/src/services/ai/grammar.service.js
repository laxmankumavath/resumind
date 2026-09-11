import { ApiError } from '../../utils/ApiError.js';
import { describeGeminiError, generateJsonWithGemini } from './gemini.service.js';

export const fixGrammarWithAI = async (text) => {
  try {
    const payload = await generateJsonWithGemini({
      systemInstruction: 'Fix all grammar and spelling errors in the provided text. Return a JSON object with key "fixedText" (string).',
      prompt: text,
    });

    return payload.fixedText || text;
  } catch (error) {
    const geminiError = describeGeminiError(error);
    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};
