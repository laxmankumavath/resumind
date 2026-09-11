import { ApiError } from '../../utils/ApiError.js';
import { describeGeminiError, generateJsonWithGemini } from './gemini.service.js';

export const generateRecruiterFeedback = async (resumeText) => {
  try {
    const payload = await generateJsonWithGemini({
      systemInstruction: 'You are a Senior Technical Recruiter. Provide constructive, brief feedback on this resume. Return a JSON object with key "feedback" (array of strings).',
      prompt: resumeText,
    });

    return payload.feedback || [];
  } catch (error) {
    const geminiError = describeGeminiError(error);
    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};
