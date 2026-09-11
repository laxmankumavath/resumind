import { ApiError } from '../../utils/ApiError.js';
import { describeGeminiError, generateJsonWithGemini } from './gemini.service.js';

const toStringArray = (value) => {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/\r?\n|;\s+|[\u2022*]\s+/)
    .map(item => item.replace(/^[-*\u2022]\s*/, '').trim())
    .filter(Boolean);
};

export const analyzeAtsWithAI = async (resumeText, jobDescriptionText) => {
  try {
    const payload = await generateJsonWithGemini({
      systemInstruction: 'You are an expert ATS system. Return a JSON object with strictly these keys: strengths (array of strings), weaknesses (array of strings), improvements (array of strings), areasOfImprovement (array of strings). Do not use markdown.',
      prompt: `Job Description: ${jobDescriptionText}\n\nResume: ${resumeText}`,
    });

    return {
      strengths: toStringArray(payload.strengths),
      weaknesses: toStringArray(payload.weaknesses),
      improvements: toStringArray(payload.improvements),
      areasOfImprovement: toStringArray(payload.areasOfImprovement),
    };
  } catch (error) {
    const geminiError = describeGeminiError(error);
    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};
