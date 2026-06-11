import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';
import { env } from '../config/env.js';
import { extractTextFromDOCX } from '../services/parser/docxParser.service.js';
import { cleanText } from '../services/parser/textCleaner.service.js';
import { extractSections } from '../services/parser/sectionExtractor.service.js';
import { generateAtsScore } from '../services/scoring/atsScore.service.js';
import { generateJsonWithGemini } from '../services/ai/gemini.service.js';
import { rewriteResumeWithAI } from '../services/ai/rewrite.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');

const mask = (value) => {
  if (!value) return 'missing';
  const text = String(value);
  if (text.length <= 8) return '<set>';
  return `${text.slice(0, 4)}...${text.slice(-4)} (${text.length})`;
};

const log = (label, data) => {
  console.log(JSON.stringify({ check: label, ...data }, null, 2));
};

const testRedis = async () => {
  const client = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      reconnectStrategy: false,
    },
  });

  try {
    await client.connect();
    const pong = await client.ping();
    log('redis', { ok: pong === 'PONG', response: pong, host: env.REDIS_HOST, port: env.REDIS_PORT });
  } finally {
    await client.disconnect().catch(() => {});
  }
};

const testGemini = async () => {
  const response = await generateJsonWithGemini({
    systemInstruction: 'Return only valid JSON.',
    prompt: 'Return {"ok":true,"message":"gemini reachable"}',
    maxOutputTokens: 256,
  });

  log('gemini', {
    ok: response?.ok === true,
    model: env.GEMINI_MODEL,
    response,
  });
};

const testOpenAI = async () => {
  if (!env.OPENAI_API_KEY) {
    log('openai', { ok: false, skipped: true, reason: 'OPENAI_API_KEY is not configured; app currently uses Gemini.' });
    return;
  }

  if (!env.OPENAI_API_KEY.startsWith('sk-')) {
    log('openai', {
      ok: false,
      skipped: true,
      reason: 'OPENAI_API_KEY does not look like an OpenAI key. The app currently uses Gemini for AI generation.',
    });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    });

    const payload = await response.json().catch(() => ({}));
    log('openai', {
      ok: response.ok,
      status: response.status,
      modelCount: Array.isArray(payload.data) ? payload.data.length : 0,
      error: payload.error?.message,
    });
  } catch (error) {
    log('openai', { ok: false, error: error.message });
  }
};

const testParserAndScoring = async () => {
  const samplePath = path.join(backendRoot, 'samples', 'resume.docx');
  const rawText = await extractTextFromDOCX(samplePath);
  const text = cleanText(rawText);
  const sections = extractSections(text);
  const score = generateAtsScore(
    text,
    sections,
    'Node.js Express MongoDB REST API JavaScript authentication cloud deployment production debugging'
  );

  log('parser-scoring', {
    ok: text.length > 0 && score.atsScore > 0,
    extractedLength: text.length,
    sectionKeysWithContent: Object.entries(sections)
      .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
      .map(([key]) => key),
    atsScore: score.atsScore,
    keywordScore: score.keywordScore,
    suggestionsCount: score.suggestions.length,
    firstSuggestions: score.suggestions.slice(0, 3),
  });

  return { text, sections };
};

const testRewrite = async (text, sections) => {
  const result = await rewriteResumeWithAI(text, 'full', 'Software Engineer', { parsedSections: sections });
  log('rewrite', {
    ok: Boolean(result.sections?.summary || result.sections?.experience?.length),
    source: result.metadata?.source,
    summaryPresent: Boolean(result.sections?.summary),
    experienceItems: result.sections?.experience?.length || 0,
    improvementsCount: result.sections?.improvements?.length || 0,
    warnings: result.metadata?.warnings || [],
  });
};

const run = async () => {
  log('env', {
    nodeEnv: env.NODE_ENV,
    mongoUri: mask(env.MONGO_URI),
    redisUrl: env.REDIS_URL ? mask(env.REDIS_URL) : 'not set',
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    jwtAccessSecret: mask(env.JWT_ACCESS_SECRET),
    jwtRefreshSecret: mask(env.JWT_REFRESH_SECRET),
    geminiApiKey: mask(env.GEMINI_API_KEY),
    openaiApiKey: mask(env.OPENAI_API_KEY),
  });

  await testRedis();
  await testOpenAI();
  await testGemini();
  const { text, sections } = await testParserAndScoring();
  await testRewrite(text, sections);
};

run().catch((error) => {
  console.error(JSON.stringify({
    check: 'failed',
    ok: false,
    message: error.message,
    stack: error.stack,
  }, null, 2));
  process.exit(1);
});
