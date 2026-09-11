import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';
import { describeGeminiError, generateJsonWithGemini } from './gemini.service.js';

const COMPANY_CATALOG = [
  {
    companyName: 'Google',
    companyType: 'FAANG',
    averagePackage: 'INR 28-65 LPA',
    remoteFriendly: true,
    requiredSkills: ['DSA', 'System Design', 'Java', 'Python', 'Distributed Systems', 'Cloud', 'Problem Solving'],
  },
  {
    companyName: 'Microsoft',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 24-55 LPA',
    remoteFriendly: true,
    requiredSkills: ['DSA', 'C#', 'JavaScript', 'Azure', 'System Design', 'APIs', 'Problem Solving'],
  },
  {
    companyName: 'Amazon',
    companyType: 'FAANG',
    averagePackage: 'INR 24-58 LPA',
    remoteFriendly: true,
    requiredSkills: ['DSA', 'Java', 'System Design', 'AWS', 'Scalability', 'Leadership Principles', 'Databases'],
  },
  {
    companyName: 'Adobe',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 22-48 LPA',
    remoteFriendly: true,
    requiredSkills: ['DSA', 'JavaScript', 'React', 'Java', 'APIs', 'System Design', 'Product Engineering'],
  },
  {
    companyName: 'Salesforce',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 20-45 LPA',
    remoteFriendly: true,
    requiredSkills: ['Java', 'JavaScript', 'APIs', 'Cloud', 'Databases', 'System Design', 'CRM'],
  },
  {
    companyName: 'ServiceNow',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 18-42 LPA',
    remoteFriendly: true,
    requiredSkills: ['JavaScript', 'React', 'APIs', 'Cloud', 'Workflow Automation', 'Databases', 'System Design'],
  },
  {
    companyName: 'Zoho',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 8-24 LPA',
    remoteFriendly: false,
    requiredSkills: ['Java', 'JavaScript', 'SQL', 'Problem Solving', 'Web Development', 'Product Thinking'],
  },
  {
    companyName: 'Atlassian',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 28-60 LPA',
    remoteFriendly: true,
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Distributed Systems', 'Cloud', 'System Design', 'Testing'],
  },
  {
    companyName: 'Flipkart',
    companyType: 'Product Based Companies',
    averagePackage: 'INR 18-42 LPA',
    remoteFriendly: true,
    requiredSkills: ['DSA', 'Java', 'Microservices', 'System Design', 'Databases', 'Scalability', 'Cloud'],
  },
  {
    companyName: 'Razorpay',
    companyType: 'FinTech',
    averagePackage: 'INR 16-38 LPA',
    remoteFriendly: true,
    requiredSkills: ['Node.js', 'Java', 'APIs', 'Payments', 'Security', 'Databases', 'System Design'],
  },
  {
    companyName: 'PhonePe',
    companyType: 'FinTech',
    averagePackage: 'INR 18-42 LPA',
    remoteFriendly: false,
    requiredSkills: ['Java', 'Kotlin', 'Microservices', 'Payments', 'Kafka', 'Databases', 'System Design'],
  },
  {
    companyName: 'CRED',
    companyType: 'FinTech',
    averagePackage: 'INR 18-40 LPA',
    remoteFriendly: true,
    requiredSkills: ['React', 'Node.js', 'Mobile Apps', 'APIs', 'Product Engineering', 'Design Systems', 'Testing'],
  },
  {
    companyName: 'OpenAI',
    companyType: 'AI Startups',
    averagePackage: 'Global competitive',
    remoteFriendly: true,
    requiredSkills: ['Python', 'Machine Learning', 'LLMs', 'Distributed Systems', 'Research', 'MLOps', 'Cloud'],
  },
  {
    companyName: 'Sarvam AI',
    companyType: 'AI Startups',
    averagePackage: 'INR 18-45 LPA',
    remoteFriendly: true,
    requiredSkills: ['Python', 'Machine Learning', 'LLMs', 'NLP', 'MLOps', 'Data Engineering', 'Cloud'],
  },
  {
    companyName: 'NVIDIA',
    companyType: 'Semiconductor Companies',
    averagePackage: 'INR 22-55 LPA',
    remoteFriendly: true,
    requiredSkills: ['C++', 'Python', 'CUDA', 'Linux', 'Machine Learning', 'Computer Architecture', 'Systems'],
  },
  {
    companyName: 'Qualcomm',
    companyType: 'Semiconductor Companies',
    averagePackage: 'INR 14-36 LPA',
    remoteFriendly: false,
    requiredSkills: ['C', 'C++', 'Embedded Systems', 'Linux', 'Computer Architecture', 'DSP', 'Testing'],
  },
  {
    companyName: 'Intel',
    companyType: 'Semiconductor Companies',
    averagePackage: 'INR 14-34 LPA',
    remoteFriendly: true,
    requiredSkills: ['C++', 'Python', 'Linux', 'Computer Architecture', 'Verification', 'Performance', 'Systems'],
  },
  {
    companyName: 'TCS',
    companyType: 'Service Based Companies',
    averagePackage: 'INR 3.5-12 LPA',
    remoteFriendly: true,
    requiredSkills: ['Java', 'SQL', 'Communication', 'Web Development', 'Testing', 'Cloud', 'Agile'],
  },
  {
    companyName: 'Infosys',
    companyType: 'Service Based Companies',
    averagePackage: 'INR 3.5-11 LPA',
    remoteFriendly: true,
    requiredSkills: ['Java', 'Python', 'SQL', 'Communication', 'Testing', 'Cloud', 'Agile'],
  },
  {
    companyName: 'Accenture',
    companyType: 'Service Based Companies',
    averagePackage: 'INR 4-16 LPA',
    remoteFriendly: true,
    requiredSkills: ['Java', 'JavaScript', 'Cloud', 'SQL', 'Communication', 'Agile', 'APIs'],
  },
  {
    companyName: 'Thoughtworks',
    companyType: 'Service Based Companies',
    averagePackage: 'INR 10-28 LPA',
    remoteFriendly: true,
    requiredSkills: ['Java', 'JavaScript', 'React', 'Testing', 'Agile', 'Clean Code', 'Cloud'],
  },
  {
    companyName: 'BYJU\'S',
    companyType: 'EdTech',
    averagePackage: 'INR 6-20 LPA',
    remoteFriendly: false,
    requiredSkills: ['React', 'Node.js', 'Mobile Apps', 'Analytics', 'APIs', 'Product Engineering', 'SQL'],
  },
  {
    companyName: 'Unacademy',
    companyType: 'EdTech',
    averagePackage: 'INR 8-24 LPA',
    remoteFriendly: true,
    requiredSkills: ['React', 'Node.js', 'Video Streaming', 'APIs', 'Databases', 'Product Engineering', 'Cloud'],
  },
  {
    companyName: 'L&T Technology Services',
    companyType: 'Core Engineering Companies',
    averagePackage: 'INR 4-16 LPA',
    remoteFriendly: false,
    requiredSkills: ['C++', 'Embedded Systems', 'CAD', 'IoT', 'Testing', 'Documentation', 'Systems'],
  },
  {
    companyName: 'Tata Elxsi',
    companyType: 'Core Engineering Companies',
    averagePackage: 'INR 5-18 LPA',
    remoteFriendly: false,
    requiredSkills: ['Embedded Systems', 'C++', 'Automotive', 'IoT', 'Testing', 'Linux', 'Systems'],
  },
  {
    companyName: 'Zepto',
    companyType: 'Startups',
    averagePackage: 'INR 18-35 LPA',
    remoteFriendly: false,
    requiredSkills: ['Python', 'Node.js', 'React', 'System Design', 'Databases', 'Scalability', 'APIs'],
  },
];

const normalizeText = (value) => String(value || '').toLowerCase();

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const normalizeSkill = (value) => normalizeText(value)
  .replace(/[^a-z0-9+#. ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const dedupe = (items) => [...new Set((items || [])
  .flatMap(item => Array.isArray(item) ? item : [item])
  .map(item => String(item || '').trim())
  .filter(Boolean))];

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(toArray);
  if (typeof value === 'object') return Object.values(value).flatMap(toArray);
  return String(value)
    .split(/\r?\n|,|;|\||[\u2022*]\s+/)
    .map(item => item.replace(/^[-*\u2022]\s*/, '').trim())
    .filter(Boolean);
};

const extractResumeSignals = ({ resume, analysis, targetRole, jobDescription }) => {
  const parsedSections = resume.parsedSections || {};
  const skillCandidates = [
    ...toArray(parsedSections.skills),
    ...toArray(analysis?.matchedKeywords),
    ...toArray(analysis?.missingKeywords),
    ...(String(resume.extractedText || '').match(/\b(react|node\.?js|java|python|c\+\+|c#|sql|mongodb|aws|azure|gcp|docker|kubernetes|machine learning|llm|nlp|data engineering|system design|dsa|apis?|testing|linux|embedded|cloud|microservices|typescript|javascript)\b/gi) || []),
  ];

  const projects = toArray(parsedSections.projects);
  const experience = toArray(parsedSections.experience);
  const education = toArray(parsedSections.education);
  const resumeText = normalizeText([
    resume.extractedText,
    targetRole,
    jobDescription,
    projects.join(' '),
    experience.join(' '),
    education.join(' '),
  ].join(' '));

  return {
    skills: dedupe(skillCandidates),
    projects,
    experience,
    education,
    resumeText,
    strengths: dedupe(analysis?.strengths),
    weaknesses: dedupe(analysis?.weaknesses),
    missingKeywords: dedupe(analysis?.missingKeywords),
    suggestions: dedupe(analysis?.suggestions),
  };
};

const hasSkill = (resumeText, normalizedSkills, skill) => {
  const normalized = normalizeSkill(skill);
  if (!normalized) return false;
  return normalizedSkills.has(normalized) || resumeText.includes(normalized);
};

const inferCandidateLevel = ({ experience, projects, resumeText }) => {
  const joined = normalizeText([...experience, ...projects].join(' '));
  if (/\b(lead|architect|senior|manager|principal|staff|5\+|6\+|7\+|8\+)\b/.test(joined)) return 'Senior';
  if (/\b(2\+|3\+|4\+|internship|associate|developer|engineer)\b/.test(joined)) return 'Mid-level';
  if (experience.length >= 2 || projects.length >= 3 || /\b(intern|internship|freelance)\b/.test(resumeText)) return 'Entry-level';
  return 'Fresher';
};

const probabilityFromScore = (score) => {
  if (score >= 88) return 'Very High';
  if (score >= 76) return 'High';
  if (score >= 58) return 'Medium';
  return 'Low';
};

const buildReasons = ({ company, matchedSkills, missingSkills, signals, atsScore, targetRole }) => {
  const reasons = [];
  if (matchedSkills.length) {
    reasons.push(`Matches ${matchedSkills.slice(0, 4).join(', ')} expectations for ${company.companyName}.`);
  }
  if (atsScore >= 80) {
    reasons.push(`Strong ATS score supports recruiter screening for ${targetRole || company.companyType} roles.`);
  } else if (atsScore >= 60) {
    reasons.push('Moderate ATS score is workable but needs tighter keyword alignment.');
  } else {
    reasons.push('Current ATS score may limit shortlist chances without resume improvements.');
  }
  if (signals.projects.length) {
    reasons.push('Project evidence improves fit beyond keyword matching.');
  }
  if (missingSkills.length) {
    reasons.push(`Main gap: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  return reasons.slice(0, 4);
};

const buildRecommendedActions = ({ company, missingSkills, signals }) => {
  const actions = missingSkills.slice(0, 4).map(skill => `Add truthful evidence for ${skill} through projects, bullets, or certifications.`);
  if (signals.weaknesses.length) actions.push(signals.weaknesses[0]);
  if (company.companyType === 'FAANG' && !missingSkills.some(skill => /dsa/i.test(skill))) {
    actions.push('Add DSA and system design proof points for high-bar product interviews.');
  }
  if (!actions.length) actions.push('Keep tailoring the summary and skills section to each job description before applying.');
  return dedupe(actions).slice(0, 5);
};

const scoreCompany = ({ company, signals, atsScore, targetRole }) => {
  const normalizedSkills = new Set(signals.skills.map(normalizeSkill));
  const matchedSkills = company.requiredSkills.filter(skill => hasSkill(signals.resumeText, normalizedSkills, skill));
  const missingSkills = company.requiredSkills.filter(skill => !hasSkill(signals.resumeText, normalizedSkills, skill));
  const skillsMatch = clampScore((matchedSkills.length / Math.max(1, company.requiredSkills.length)) * 100);
  const projectSignal = Math.min(12, signals.projects.length * 3);
  const experienceSignal = Math.min(12, signals.experience.length * 3);
  const roleSignal = targetRole && signals.resumeText.includes(normalizeSkill(targetRole).split(' ')[0]) ? 6 : 0;
  const riskPenalty = Math.min(12, signals.weaknesses.length * 2 + signals.missingKeywords.length);
  const matchPercentage = clampScore((skillsMatch * 0.55) + (atsScore * 0.25) + projectSignal + experienceSignal + roleSignal - riskPenalty);
  const confidenceScore = clampScore(58 + (signals.skills.length * 2) + (signals.projects.length * 3) + (signals.experience.length * 3) + (atsScore >= 70 ? 8 : 0));

  return {
    companyName: company.companyName,
    matchPercentage,
    hiringProbability: probabilityFromScore(matchPercentage),
    requiredSkills: company.requiredSkills,
    missingSkills,
    reasons: buildReasons({ company, matchedSkills, missingSkills, signals, atsScore, targetRole }),
    recommendedActions: buildRecommendedActions({ company, missingSkills, signals }),
    averagePackage: company.averagePackage,
    companyType: company.companyType,
    confidenceScore,
    skillsMatch,
    atsCompatibility: clampScore((atsScore * 0.75) + (skillsMatch * 0.25)),
    remoteFriendly: company.remoteFriendly,
  };
};

const normalizeCompany = (company, fallback = {}) => ({
  companyName: String(company?.companyName || fallback.companyName || '').trim(),
  matchPercentage: clampScore(company?.matchPercentage ?? fallback.matchPercentage),
  hiringProbability: ['Very High', 'High', 'Medium', 'Low'].includes(company?.hiringProbability)
    ? company.hiringProbability
    : probabilityFromScore(company?.matchPercentage ?? fallback.matchPercentage),
  requiredSkills: dedupe(company?.requiredSkills || fallback.requiredSkills),
  missingSkills: dedupe(company?.missingSkills || fallback.missingSkills),
  reasons: dedupe(company?.reasons || fallback.reasons).slice(0, 5),
  recommendedActions: dedupe(company?.recommendedActions || fallback.recommendedActions).slice(0, 6),
  averagePackage: String(company?.averagePackage || fallback.averagePackage || 'Not available'),
  companyType: String(company?.companyType || fallback.companyType || 'Product Based Companies'),
  confidenceScore: clampScore(company?.confidenceScore ?? fallback.confidenceScore),
  skillsMatch: clampScore(company?.skillsMatch ?? fallback.skillsMatch),
  atsCompatibility: clampScore(company?.atsCompatibility ?? fallback.atsCompatibility),
  remoteFriendly: Boolean(company?.remoteFriendly ?? fallback.remoteFriendly),
});

const buildHeuristicMatches = ({ resume, analysis, targetRole, jobDescription, categories }) => {
  const atsScore = clampScore(analysis?.atsScore);
  const signals = extractResumeSignals({ resume, analysis, targetRole, jobDescription });
  const categorySet = new Set((categories || []).filter(Boolean));
  const catalog = categorySet.size
    ? COMPANY_CATALOG.filter(company => categorySet.has(company.companyType))
    : COMPANY_CATALOG;
  const ranked = catalog
    .map(company => scoreCompany({ company, signals, atsScore, targetRole }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage || b.confidenceScore - a.confidenceScore)
    .slice(0, 20);

  return {
    atsScore,
    signals,
    candidateLevel: inferCandidateLevel(signals),
    matchedCompanies: ranked,
  };
};

const buildCompanyMatchPrompt = ({ resume, analysis, targetRole, jobDescription, heuristic }) => [
  'You are a senior recruiter, ATS expert, and hiring probability analyst.',
  '',
  'Task:',
  'Refine the ranked company recommendations using the resume, ATS report, target role, and optional job description.',
  '',
  'Rules:',
  '- Do not invent companies outside the provided candidate shortlist.',
  '- Keep recommendations realistic for the candidate evidence.',
  '- Do not claim actual interview selection certainty. Estimate shortlist probability only.',
  '- Preserve the schema exactly and return only valid JSON.',
  '- Missing skills must be skills the company expects but the resume does not clearly prove.',
  '',
  'Candidate context:',
  JSON.stringify({
    targetRole,
    candidateLevel: heuristic.candidateLevel,
    resumeText: String(resume.extractedText || '').slice(0, 12000),
    parsedSections: resume.parsedSections || {},
    atsScore: heuristic.atsScore,
    keywordScore: analysis?.keywordScore || 0,
    grammarScore: analysis?.grammarScore || 0,
    readabilityScore: analysis?.readabilityScore || 0,
    sectionScore: analysis?.sectionScore || 0,
    strengths: heuristic.signals.strengths,
    weaknesses: heuristic.signals.weaknesses,
    missingKeywords: heuristic.signals.missingKeywords,
    suggestions: heuristic.signals.suggestions,
    jobDescription,
  }, null, 2),
  '',
  'Pre-ranked shortlist from deterministic scoring:',
  JSON.stringify(heuristic.matchedCompanies, null, 2),
  '',
  'Return ONLY JSON with this exact shape:',
  '{',
  '  "candidateLevel": "Fresher | Entry-level | Mid-level | Senior",',
  '  "strongestSignals": ["signal"],',
  '  "riskSignals": ["risk"],',
  '  "matchedCompanies": [',
  '    {',
  '      "companyName": "Company from shortlist only",',
  '      "matchPercentage": 0,',
  '      "hiringProbability": "Very High | High | Medium | Low",',
  '      "requiredSkills": ["skill"],',
  '      "missingSkills": ["skill"],',
  '      "reasons": ["why selected or why not yet ideal"],',
  '      "recommendedActions": ["specific improvement"],',
  '      "averagePackage": "range",',
  '      "companyType": "category",',
  '      "confidenceScore": 0,',
  '      "skillsMatch": 0,',
  '      "atsCompatibility": 0,',
  '      "remoteFriendly": false',
  '    }',
  '  ]',
  '}',
].join('\n');

export const generateCompanyMatchesWithAI = async ({
  resume,
  analysis,
  targetRole = '',
  jobDescription = '',
  categories = [],
}) => {
  const heuristic = buildHeuristicMatches({ resume, analysis, targetRole, jobDescription, categories });

  try {
    const payload = await generateJsonWithGemini({
      systemInstruction: 'You return only valid JSON for ATS-aware company match recommendations.',
      prompt: buildCompanyMatchPrompt({ resume, analysis, targetRole, jobDescription, heuristic }),
      temperature: 0.2,
      maxOutputTokens: 7000,
    });

    const byName = new Map(heuristic.matchedCompanies.map(company => [company.companyName.toLowerCase(), company]));
    const refined = Array.isArray(payload?.matchedCompanies) ? payload.matchedCompanies : [];
    const matchedCompanies = (refined.length ? refined : heuristic.matchedCompanies)
      .map(company => normalizeCompany(company, byName.get(String(company?.companyName || '').toLowerCase())))
      .filter(company => company.companyName)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 20);

    return {
      atsScore: heuristic.atsScore,
      targetRole,
      matchedCompanies,
      metadata: {
        source: 'gemini-company-match',
        model: env.GEMINI_MODEL,
        candidateLevel: payload?.candidateLevel || heuristic.candidateLevel,
        strongestSignals: dedupe(payload?.strongestSignals || heuristic.signals.strengths).slice(0, 6),
        riskSignals: dedupe(payload?.riskSignals || heuristic.signals.weaknesses).slice(0, 6),
        categoriesConsidered: categories.length ? categories : dedupe(COMPANY_CATALOG.map(company => company.companyType)),
        completedAt: new Date(),
        warnings: [],
      },
    };
  } catch (error) {
    const geminiError = describeGeminiError(error);
    logger.warn(`Company match Gemini refinement failed. status=${geminiError.statusCode} message=${geminiError.message}`);

    return {
      atsScore: heuristic.atsScore,
      targetRole,
      matchedCompanies: heuristic.matchedCompanies,
      metadata: {
        source: 'heuristic-company-match',
        model: env.GEMINI_MODEL,
        candidateLevel: heuristic.candidateLevel,
        strongestSignals: heuristic.signals.strengths.slice(0, 6),
        riskSignals: heuristic.signals.weaknesses.slice(0, 6),
        categoriesConsidered: categories.length ? categories : dedupe(COMPANY_CATALOG.map(company => company.companyType)),
        completedAt: new Date(),
        warnings: [geminiError.message],
      },
    };
  }
};

export const COMPANY_MATCH_CATEGORIES = dedupe(COMPANY_CATALOG.map(company => company.companyType));
