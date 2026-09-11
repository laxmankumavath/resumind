import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const normalizeModelName = (model) => String(model || env.GEMINI_MODEL).replace(/^models\//, '');

const stripJsonFence = (text) => String(text || '')
  .trim()
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const describeGeminiError = (error) => {
  const status = error?.statusCode || error?.status;
  const code = error?.code || error?.details?.code;
  const rawMessage = error?.message || 'Unknown Gemini API error';

  if (status === 400) {
    return { statusCode: 502, message: `Gemini request was invalid: ${rawMessage}` };
  }

  if (status === 401 || status === 403) {
    return { statusCode: 502, message: 'Gemini authentication failed. Check GEMINI_API_KEY.' };
  }

  if (status === 404 || code === 'NOT_FOUND') {
    return { statusCode: 502, message: `Gemini model is unavailable: ${env.GEMINI_MODEL}` };
  }

  if (status === 429) {
    return { statusCode: 503, message: 'Gemini rate limit or quota reached. Please retry shortly.' };
  }

  if ([500, 502, 503, 504].includes(status)) {
    return { statusCode: 503, message: `Gemini service unavailable: ${rawMessage}` };
  }

  return { statusCode: 502, message: `Gemini generation failed: ${rawMessage}` };
};

export const generateJsonWithGemini = async ({
  prompt,
  systemInstruction,
  temperature = 0.3,
  maxOutputTokens = 8192,
  timeoutMs = 25000,
}) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(503, 'Gemini API key is missing. Set GEMINI_API_KEY in .env.');
  }

  const model = normalizeModelName(env.GEMINI_MODEL);
  const url = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemInstruction || 'Return only valid JSON.' }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature,
      maxOutputTokens,
    },
  });

  let response;
  let lastNetworkError;
  const maxRetries = Number(process.env.GEMINI_MAX_RETRIES || 3);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === maxRetries) {
        break;
      }

      logger.warn(`Gemini retryable response. status=${response.status} attempt=${attempt + 1}/${maxRetries}`);
    } catch (error) {
      lastNetworkError = error;
      if (attempt === maxRetries) throw error;
      logger.warn(`Gemini network retry. attempt=${attempt + 1}/${maxRetries} message=${error.message}`);
    }

    await delay(1000 * Math.pow(2, attempt));
  }

  if (!response && lastNetworkError) {
    throw lastNetworkError;
  }

  logger.info(`Gemini response received. status=${response.status} model=${env.GEMINI_MODEL}`);

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    const providerError = details?.error || {};
    const error = new Error(providerError.message || `Gemini API returned ${response.status}`);
    error.status = response.status;
    error.code = providerError.status || providerError.code;
    error.details = providerError;
    throw error;
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map(part => part.text)
    .filter(Boolean)
    .join('');

  if (!text) {
    const finishReason = payload?.candidates?.[0]?.finishReason;
    throw new ApiError(502, `Gemini returned an empty response${finishReason ? ` (${finishReason})` : ''}`);
  }

  if (process.env.DEBUG_AI_RESPONSES === 'true') {
    logger.info(`Gemini JSON text preview: ${text.slice(0, 500)}`);
  }

  const cleanedJson = stripJsonFence(text);

  try {
    const parsed = JSON.parse(cleanedJson);
    logger.info(`Gemini JSON parsed. keys=${Object.keys(parsed || {}).join(',')}`);
    return parsed;
  } catch (_error) {
    // Attempt extract first { ... } or [ ... ] block
    const objectMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]);
        logger.info(`Gemini JSON extracted via object regex. keys=${Object.keys(parsed || {}).join(',')}`);
        return parsed;
      } catch (_e) {}
    }

    const arrayMatch = cleanedJson.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        logger.info('Gemini JSON extracted via array regex');
        return parsed;
      } catch (_e) {}
    }

    logger.error(`Gemini raw response could not be parsed as JSON: ${text.slice(0, 300)}`);
    throw new ApiError(502, 'Gemini returned invalid JSON');
  }
};
