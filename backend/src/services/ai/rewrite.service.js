import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import { extractSections } from '../parser/sectionExtractor.service.js';
import { describeGeminiError, generateJsonWithGemini } from './gemini.service.js';

const EXPECTED_KEYS = ['professionalSummary', 'experience', 'education', 'skills', 'projects', 'rewrittenResume'];

const normalizeValue = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(normalizeValue);
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return [value.text];
    if (typeof value.content === 'string') return [value.content];
    return Object.values(value).flatMap(normalizeValue);
  }
  return [String(value).trim()];
};

const toArray = (value) => {
  return normalizeValue(value)
    .flatMap(item => String(item)
      .split(/\r?\n|[\u2022*]\s+|;\s+/)
      .map(item => item.replace(/^[-*\u2022]\s*/, '').trim())
    )
    .filter(Boolean);
};

const splitSkills = (items) => normalizeValue(items)
  .flatMap(item => String(item).split(/,|;|\||\r?\n/))
  .map(item => item.replace(/^skills:?/i, '').trim())
  .filter(Boolean);

const stripSectionHeader = (value) => String(value || '')
  .replace(/^(summary|profile|objective|experience|projects?|education|skills|work history)\b:?/i, '')
  .trim();

const dedupe = (items) => [...new Set(toArray(items).map(item => item.trim()).filter(Boolean))];

const clampScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const normalizeRewriteInput = (rewriteInput = {}) => {
  const suggestions = dedupe(rewriteInput.suggestions);
  const weaknesses = dedupe(rewriteInput.weaknesses);
  const missingKeywords = dedupe(rewriteInput.missingKeywords);
  const areasOfImprovement = dedupe(rewriteInput.areasOfImprovement);

  return {
    originalResume: String(rewriteInput.originalResume || rewriteInput.resumeText || '').trim(),
    atsScore: clampScore(rewriteInput.atsScore),
    keywordScore: clampScore(rewriteInput.keywordScore),
    grammarScore: clampScore(rewriteInput.grammarScore),
    readabilityScore: clampScore(rewriteInput.readabilityScore),
    sectionScore: clampScore(rewriteInput.sectionScore),
    strengths: dedupe(rewriteInput.strengths),
    weaknesses,
    missingKeywords,
    suggestions,
    areasOfImprovement: areasOfImprovement.length
      ? areasOfImprovement
      : dedupe([...weaknesses, ...suggestions]).slice(0, 10),
    jobDescription: String(rewriteInput.jobDescription || '').trim(),
    targetRole: String(rewriteInput.targetRole || '').trim(),
    matchedKeywords: dedupe(rewriteInput.matchedKeywords),
  };
};

const scoreLine = (label, value) => `${label}: ${clampScore(value)}/100`;

const formatList = (items, fallback = 'None provided') => {
  const normalized = dedupe(items);
  return normalized.length ? normalized.map(item => `- ${item}`).join('\n') : `- ${fallback}`;
};

const buildPerformanceGaps = ({ atsScore, keywordScore, grammarScore, readabilityScore, sectionScore }) => {
  const gaps = [];
  if (atsScore < 75) gaps.push(`Overall ATS score needs improvement (${atsScore}/100).`);
  if (keywordScore < 75) gaps.push(`Keyword alignment is weak (${keywordScore}/100).`);
  if (grammarScore < 90) gaps.push(`Grammar and professional polish need improvement (${grammarScore}/100).`);
  if (readabilityScore < 80) gaps.push(`Readability and scanability need improvement (${readabilityScore}/100).`);
  if (sectionScore && sectionScore < 90) gaps.push(`Resume sections are missing, thin, or weak (${sectionScore}/100).`);
  return gaps;
};

const estimateScoreRange = ({ atsScore, keywordScore, grammarScore, readabilityScore, missingKeywords, weaknesses }) => {
  const base = clampScore(atsScore);
  let likelyIncrease = 8;

  if (keywordScore < 50) likelyIncrease += 8;
  else if (keywordScore < 75) likelyIncrease += 5;
  if (grammarScore < 85) likelyIncrease += 3;
  if (readabilityScore < 75) likelyIncrease += 4;
  likelyIncrease += Math.min(6, Math.ceil(dedupe(missingKeywords).length / 3));
  likelyIncrease += Math.min(4, dedupe(weaknesses).length);

  const low = Math.min(100, base + Math.max(6, likelyIncrease - 5));
  const high = Math.min(100, base + likelyIncrease + 5);
  return `${low}-${Math.max(low, high)}`;
};

const estimateScoreIncrease = (estimatedNewATSScore, originalScore) => {
  const matches = String(estimatedNewATSScore || '').match(/\d+/g)?.map(Number) || [];
  if (matches.length >= 2) {
    return `${Math.max(0, matches[0] - originalScore)}-${Math.max(0, matches[1] - originalScore)} points`;
  }
  if (matches.length === 1) {
    return `${Math.max(0, matches[0] - originalScore)} points`;
  }
  return 'Estimated after rewrite';
};

const composeRewrittenResume = ({
  professionalSummary,
  skills,
  experience,
  projects,
  education,
}) => [
  professionalSummary ? `Professional Summary\n${professionalSummary}` : '',
  skills?.length ? `Skills\n${skills.join('\n')}` : '',
  experience?.length ? `Experience\n${experience.map(item => `- ${item}`).join('\n')}` : '',
  projects?.length ? `Projects\n${projects.map(item => `- ${item}`).join('\n')}` : '',
  education?.length ? `Education\n${education.map(item => `- ${item}`).join('\n')}` : '',
].filter(Boolean).join('\n\n');

const normalizeAtsRewritePayload = (payload, rewriteInput) => {
  const professionalSummary = String(payload?.professionalSummary || payload?.summary || '').trim();
  const skills = splitSkills(payload?.skills);
  const experience = toArray(payload?.experience);
  const projects = toArray(payload?.projects);
  const education = toArray(payload?.education);
  const atsImprovementsApplied = dedupe(payload?.atsImprovementsApplied || payload?.improvements || payload?.improvementsMade);
  const keywordsAdded = dedupe(payload?.keywordsAdded || payload?.atsKeywords || payload?.keywords);
  const estimatedNewATSScore = String(
    payload?.estimatedNewATSScore || estimateScoreRange(rewriteInput)
  ).trim();
  const rewrittenResume = String(payload?.rewrittenResume || '').trim() || composeRewrittenResume({
    professionalSummary,
    skills,
    experience,
    projects,
    education,
  });

  return {
    professionalSummary,
    summary: professionalSummary,
    skills,
    experience,
    projects,
    education,
    atsImprovementsApplied,
    keywordsAdded,
    estimatedNewATSScore,
    rewrittenResume,
  };
};

const normalizeLegacyRewriteSections = (payload) => ({
  summary: typeof payload?.summary === 'string' ? payload.summary.trim() : '',
  experience: toArray(payload?.experience),
  education: toArray(payload?.education),
  skills: splitSkills(toArray(payload?.skills)),
  projects: toArray(payload?.projects),
  improvements: toArray(payload?.improvements),
  atsKeywords: splitSkills(toArray(payload?.atsKeywords || payload?.keywords)),
});

const ensureUsableRewrite = (sections) => {
  const hasCoreContent = EXPECTED_KEYS.some((key) => {
    const value = sections[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  if (!hasCoreContent) {
    throw new ApiError(502, 'AI rewrite returned an empty resume payload');
  }
};

export const buildAtsOptimizedRewritePrompt = (rewriteInput) => {
  const input = normalizeRewriteInput(rewriteInput);
  const performanceGaps = buildPerformanceGaps(input);
  const estimatedRange = estimateScoreRange(input);

  return [
    'You are a senior AI resume writer, ATS optimization specialist, recruiter, and prompt engineer.',
    '',
    'Primary objective:',
    'Rewrite the resume using the original resume plus the ATS analysis results. Do not rewrite blindly. Every improvement must address the provided scores, weaknesses, suggestions, missing keywords, or areas of improvement.',
    '',
    'Hard rules:',
    '- Do not hallucinate fake experience, fake companies, fake dates, fake achievements, fake certifications, fake degrees, or fake projects.',
    '- Do not add metrics unless a metric or clear measurable result already exists in the original resume.',
    '- You may improve wording, structure, clarity, impact, readability, section ordering, ATS compatibility, and keyword alignment.',
    '- Integrate missing keywords only where they are truthful based on the original resume and target job description.',
    '- Preserve the candidate identity, career level, technologies, employers, education, and project facts from the original resume.',
    '',
    'Rewrite process you must follow internally:',
    '1. Analyze the original resume section by section.',
    '2. Analyze the ATS results and score breakdown.',
    '3. Identify missing keywords, weak bullet points, weak summary, weak projects, weak skills, and weak experience content.',
    '4. Improve every section using the ATS feedback.',
    '5. Naturally insert truthful missing keywords.',
    '6. Improve formatting, readability, and recruiter scanability.',
    '7. Convert weak statements into concise, achievement-oriented bullet points.',
    '8. Produce a recruiter-friendly and ATS-friendly resume.',
    '',
    'Rewrite input:',
    JSON.stringify({
      originalResume: input.originalResume,
      atsScore: input.atsScore,
      keywordScore: input.keywordScore,
      grammarScore: input.grammarScore,
      readabilityScore: input.readabilityScore,
      sectionScore: input.sectionScore,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      missingKeywords: input.missingKeywords,
      suggestions: input.suggestions,
      areasOfImprovement: input.areasOfImprovement,
      targetRole: input.targetRole,
      jobDescription: input.jobDescription,
      matchedKeywords: input.matchedKeywords,
    }, null, 2),
    '',
    'Score context:',
    `- ${scoreLine('ATS Score', input.atsScore)}`,
    `- ${scoreLine('Keyword Score', input.keywordScore)}`,
    `- ${scoreLine('Grammar Score', input.grammarScore)}`,
    `- ${scoreLine('Readability Score', input.readabilityScore)}`,
    input.sectionScore ? `- ${scoreLine('Section Score', input.sectionScore)}` : '',
    '',
    'Performance gaps to fix:',
    formatList(performanceGaps, 'No major score gaps identified. Still improve precision, impact, and ATS scanability.'),
    '',
    'Strengths to preserve:',
    formatList(input.strengths),
    '',
    'Weaknesses to fix:',
    formatList(input.weaknesses),
    '',
    'Missing keywords to consider:',
    formatList(input.missingKeywords.slice(0, 25)),
    '',
    'ATS suggestions:',
    formatList(input.suggestions),
    '',
    'Areas of improvement:',
    formatList(input.areasOfImprovement),
    '',
    `Expected estimated score range if the rewrite succeeds: ${estimatedRange}`,
    '',
    'Return ONLY valid JSON with exactly this shape:',
    '{',
    '  "professionalSummary": "2-3 sentence ATS-optimized professional summary",',
    '  "skills": ["Skill category: relevant skills"],',
    '  "experience": ["Achievement-oriented bullet point preserving original facts"],',
    '  "projects": ["Project Name: concise ATS-friendly description preserving original facts"],',
    '  "education": ["Education item preserving original facts"],',
    '  "atsImprovementsApplied": ["Specific improvement made"],',
    '  "keywordsAdded": ["Only keywords actually added to the rewritten resume"],',
    '  "estimatedNewATSScore": "number or range such as 78-88",',
    '  "rewrittenResume": "Full rewritten resume as plain text with ATS-friendly headings"',
    '}',
  ].filter(Boolean).join('\n');
};

const buildFullRewritePrompt = ({ resumeText, targetRole, parsedSections }) => {
  const roleLine = targetRole
    ? `Target role: ${targetRole}`
    : 'Target role: infer the strongest role from the resume.';

  return [
    'You are an expert resume writer, recruiter, and ATS optimization specialist.',
    roleLine,
    'Rewrite the resume into stronger, ATS-friendly content while preserving facts from the original resume.',
    'Use action verbs, concise recruiter-friendly language, and relevant role keywords.',
    'Return strictly valid JSON with these keys: summary (string), experience (array), education (array), skills (array), projects (array), improvements (array), atsKeywords (array).',
    'Do not include markdown, comments, or invented employers, dates, degrees, achievements, projects, or metrics.',
    '',
    `Parsed sections: ${JSON.stringify(parsedSections || {})}`,
    '',
    `Resume text:\n${resumeText}`,
  ].join('\n');
};

const buildSectionPrompt = ({ sectionName, text, targetRole }) => [
  'You are an expert resume writer and ATS optimization specialist.',
  targetRole ? `Target role: ${targetRole}` : '',
  `Rewrite only this resume section: ${sectionName}.`,
  'Preserve facts, improve clarity, action verbs, ATS keywords, and recruiter readability.',
  'Return strictly valid JSON with keys: rewrittenText (string), improvements (array), atsKeywords (array).',
  '',
  text,
].filter(Boolean).join('\n');

const shouldUseFallback = (error) => {
  if (process.env.DISABLE_AI_FALLBACK === 'true') return false;
  if (env.NODE_ENV !== 'production') return true;
  return process.env.ENABLE_AI_FALLBACK === 'true' && [429, 500, 502, 503, 504].includes(error?.status || error?.statusCode);
};

const inferSummary = ({ skills, targetRole }) => {
  const role = targetRole || 'software professional';
  const keywordText = skills.slice(0, 6).join(', ');
  return `Results-driven ${role} with hands-on experience in ${keywordText || 'building reliable solutions'}, focused on scalable delivery, clear collaboration, and measurable business outcomes.`;
};

const enhanceBullet = (item, fallbackPrefix) => {
  const cleaned = String(item)
    .replace(/^(experience|projects?|education|work history|skills)\b:?/i, '')
    .trim();

  if (!cleaned) return '';
  if (/^(built|developed|created|implemented|designed|delivered|led|managed|optimized|improved|automated|analyzed|engineered|launched|maintained|integrated)\b/i.test(cleaned)) {
    return cleaned;
  }

  return `${fallbackPrefix} ${cleaned.replace(/^[.-]\s*/, '')}`;
};

const fallbackAtsRewrite = (rewriteInput) => {
  const input = normalizeRewriteInput(rewriteInput);
  const sections = extractSections(input.originalResume);
  const skills = splitSkills(sections.skills);
  const experience = toArray(sections.experience)
    .map(item => enhanceBullet(item, 'Delivered'))
    .filter(Boolean);
  const projects = toArray(sections.projects)
    .map(item => enhanceBullet(item, 'Built'))
    .filter(Boolean);
  const education = toArray(sections.education)
    .map(item => item.replace(/^education:?/i, '').trim())
    .filter(Boolean);
  const professionalSummary = sections.summary
    ? enhanceBullet(stripSectionHeader(sections.summary), `Results-driven ${input.targetRole || 'professional'} with`).replace(/^Delivered\s+/i, '')
    : inferSummary({ skills, targetRole: input.targetRole });
  const estimatedNewATSScore = estimateScoreRange(input);
  const result = {
    professionalSummary,
    skills,
    experience,
    projects,
    education,
    atsImprovementsApplied: [
      'Reorganized extracted resume content into ATS-friendly sections.',
      'Converted available experience and project statements into action-oriented language.',
      'Preserved original resume facts while improving recruiter readability.',
      ...input.areasOfImprovement.slice(0, 3).map(item => `Addressed improvement area: ${item}`),
    ],
    keywordsAdded: [],
    estimatedNewATSScore,
    rewrittenResume: '',
  };
  result.rewrittenResume = composeRewrittenResume(result);
  result.summary = result.professionalSummary;
  return result;
};

const buildComparison = ({ originalResume, improvedResume, improvementsMade, keywordsAdded, atsScore, estimatedNewATSScore }) => ({
  originalResume,
  improvedResume,
  improvementsMade,
  keywordsAdded,
  estimatedScoreIncrease: estimateScoreIncrease(estimatedNewATSScore, atsScore),
});

export const rewriteResumeWithATSAnalysis = async (rewriteInput) => {
  const input = normalizeRewriteInput(rewriteInput);

  if (!input.originalResume) {
    throw new ApiError(400, 'Original resume text is required for rewrite');
  }

  const prompt = buildAtsOptimizedRewritePrompt(input);

  try {
    logger.info(`ATS-guided rewrite started. atsScore=${input.atsScore} keywordScore=${input.keywordScore} model=${env.GEMINI_MODEL}`);

    const payload = await generateJsonWithGemini({
      systemInstruction: 'You return only valid JSON for ATS-guided professional resume rewriting. Preserve facts and do not invent candidate details.',
      prompt,
      temperature: 0.25,
      maxOutputTokens: 5000,
    });

    const rewriteResult = normalizeAtsRewritePayload(payload, input);
    ensureUsableRewrite(rewriteResult);

    const comparison = buildComparison({
      originalResume: input.originalResume,
      improvedResume: rewriteResult.rewrittenResume,
      improvementsMade: rewriteResult.atsImprovementsApplied,
      keywordsAdded: rewriteResult.keywordsAdded,
      atsScore: input.atsScore,
      estimatedNewATSScore: rewriteResult.estimatedNewATSScore,
    });

    return {
      success: true,
      rewriteResult,
      sections: {
        summary: rewriteResult.professionalSummary,
        experience: rewriteResult.experience,
        education: rewriteResult.education,
        skills: rewriteResult.skills,
        projects: rewriteResult.projects,
        improvements: rewriteResult.atsImprovementsApplied,
        atsKeywords: rewriteResult.keywordsAdded,
      },
      metadata: {
        source: 'gemini-intelligent',
        model: env.GEMINI_MODEL,
        targetRole: input.targetRole,
        atsImprovementsApplied: rewriteResult.atsImprovementsApplied,
        keywordsAdded: rewriteResult.keywordsAdded,
        estimatedNewATSScore: rewriteResult.estimatedNewATSScore,
        estimatedScoreIncrease: comparison.estimatedScoreIncrease,
        improvementSummary: `Applied ${rewriteResult.atsImprovementsApplied.length} ATS-focused improvements using scores, weaknesses, suggestions, missing keywords, and areas of improvement.`,
        warnings: [],
        completedAt: new Date(),
      },
      comparison,
    };
  } catch (error) {
    const geminiError = describeGeminiError(error);
    logger.error(`ATS-guided rewrite failed. status=${error?.status || error?.statusCode || 'unknown'} code=${error?.code || 'unknown'} message=${geminiError.message}`);

    if (shouldUseFallback(error)) {
      const rewriteResult = fallbackAtsRewrite(input);
      const comparison = buildComparison({
        originalResume: input.originalResume,
        improvedResume: rewriteResult.rewrittenResume,
        improvementsMade: rewriteResult.atsImprovementsApplied,
        keywordsAdded: rewriteResult.keywordsAdded,
        atsScore: input.atsScore,
        estimatedNewATSScore: rewriteResult.estimatedNewATSScore,
      });

      return {
        success: true,
        rewriteResult,
        sections: {
          summary: rewriteResult.professionalSummary,
          experience: rewriteResult.experience,
          education: rewriteResult.education,
          skills: rewriteResult.skills,
          projects: rewriteResult.projects,
          improvements: rewriteResult.atsImprovementsApplied,
          atsKeywords: rewriteResult.keywordsAdded,
        },
        metadata: {
          source: 'fallback-intelligent',
          model: env.GEMINI_MODEL,
          targetRole: input.targetRole,
          atsImprovementsApplied: rewriteResult.atsImprovementsApplied,
          keywordsAdded: rewriteResult.keywordsAdded,
          estimatedNewATSScore: rewriteResult.estimatedNewATSScore,
          estimatedScoreIncrease: comparison.estimatedScoreIncrease,
          improvementSummary: 'Used local ATS-aware fallback because Gemini was unavailable.',
          warnings: [geminiError.message],
          completedAt: new Date(),
        },
        comparison,
      };
    }

    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};

export const rewriteResumeWithAIIntelligent = rewriteResumeWithATSAnalysis;

export const rewriteResumeWithAI = async (
  resumeText,
  rewriteMode = 'full',
  targetRole = '',
  options = {}
) => {
  if (!resumeText || !String(resumeText).trim()) {
    throw new ApiError(400, 'Resume text is required for rewrite');
  }

  if (options?.atsAnalysis || options?.rewriteInput) {
    return rewriteResumeWithATSAnalysis({
      ...(options.rewriteInput || options.atsAnalysis || {}),
      originalResume: resumeText,
      targetRole,
    });
  }

  const parsedSections = options.parsedSections || extractSections(resumeText);
  const prompt = buildFullRewritePrompt({ resumeText, targetRole, parsedSections, rewriteMode });

  try {
    logger.info(`Gemini rewrite request started. mode=${rewriteMode} model=${env.GEMINI_MODEL} targetRole=${targetRole || 'none'}`);

    const payload = await generateJsonWithGemini({
      systemInstruction: 'You return only valid JSON for professional ATS resume rewriting.',
      prompt,
      temperature: 0.3,
    });

    const sections = normalizeLegacyRewriteSections(payload);
    ensureUsableRewrite({
      professionalSummary: sections.summary,
      experience: sections.experience,
      education: sections.education,
      skills: sections.skills,
      projects: sections.projects,
    });

    return {
      sections,
      metadata: {
        source: 'gemini',
        model: env.GEMINI_MODEL,
        targetRole,
        warnings: [],
      },
    };
  } catch (error) {
    const geminiError = describeGeminiError(error);
    logger.error(`Gemini rewrite failed. status=${error?.status || error?.statusCode || 'unknown'} code=${error?.code || 'unknown'} message=${geminiError.message}`);

    if (shouldUseFallback(error)) {
      const rewriteResult = fallbackAtsRewrite({
        originalResume: resumeText,
        targetRole,
        atsScore: 0,
        keywordScore: 0,
        grammarScore: 0,
        readabilityScore: 0,
        strengths: [],
        weaknesses: [],
        missingKeywords: [],
        suggestions: [],
        areasOfImprovement: [],
      });
      return {
        sections: {
          summary: rewriteResult.professionalSummary,
          experience: rewriteResult.experience,
          education: rewriteResult.education,
          skills: rewriteResult.skills,
          projects: rewriteResult.projects,
          improvements: rewriteResult.atsImprovementsApplied,
          atsKeywords: rewriteResult.keywordsAdded,
        },
        metadata: {
          source: 'fallback',
          model: env.GEMINI_MODEL,
          targetRole,
          warnings: [geminiError.message],
        },
      };
    }

    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};

export const rewriteSectionWithAI = async (text, sectionName, targetRole = '') => {
  if (!text || !String(text).trim()) {
    throw new ApiError(400, 'Section text is required for rewrite');
  }

  try {
    const payload = await generateJsonWithGemini({
      systemInstruction: 'You return only valid JSON for professional ATS resume section rewriting.',
      prompt: buildSectionPrompt({ sectionName, text, targetRole }),
      temperature: 0.3,
    });

    const rewrittenText = String(payload.rewrittenText || '').trim();
    if (!rewrittenText) throw new ApiError(502, 'Gemini returned an empty section rewrite');

    return {
      rewrittenText,
      metadata: {
        source: 'gemini',
        model: env.GEMINI_MODEL,
        targetRole,
        warnings: [],
      },
      improvements: toArray(payload.improvements),
      atsKeywords: splitSkills(toArray(payload.atsKeywords)),
    };
  } catch (error) {
    const geminiError = describeGeminiError(error);
    logger.error(`Gemini section rewrite failed. status=${error?.status || error?.statusCode || 'unknown'} code=${error?.code || 'unknown'} message=${geminiError.message}`);

    if (shouldUseFallback(error)) {
      return {
        rewrittenText: enhanceBullet(text, 'Delivered'),
        metadata: {
          source: 'fallback',
          model: env.GEMINI_MODEL,
          targetRole,
          warnings: [geminiError.message],
        },
        improvements: ['Improved action-oriented wording using local fallback because Gemini was unavailable.'],
        atsKeywords: targetRole ? targetRole.split(/\s+/).filter(Boolean) : [],
      };
    }

    throw new ApiError(geminiError.statusCode, geminiError.message);
  }
};
