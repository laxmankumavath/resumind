import { calculateKeywordMatch } from './keywordScore.service.js';
import { calculateGrammarScore } from './grammarScore.service.js';
import { calculateReadabilityScore } from './readabilityScore.service.js';
import { calculateSectionScore } from './sectionScore.service.js';

export const generateAtsScore = (resumeText, parsedSections, jobDescriptionText) => {
  if (!resumeText?.trim()) {
    return {
      atsScore: 0,
      keywordScore: 0,
      grammarScore: 0,
      readabilityScore: 0,
      sectionScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      strengths: [],
      weaknesses: ['Resume text could not be extracted.'],
      suggestions: ['Upload a readable PDF or DOCX resume with selectable text.'],
      areasOfImprovement: ['Resume text extraction']
    };
  }
  
  const keywordResult = calculateKeywordMatch(resumeText, jobDescriptionText);
  const grammarResult = calculateGrammarScore(resumeText);
  const readabilityResult = calculateReadabilityScore(resumeText);
  const sectionResult = calculateSectionScore(parsedSections || {});

  // Weighted Average
  const overallScore = Math.round(
    (keywordResult.score * 0.4) + 
    (sectionResult.score * 0.3) + 
    (grammarResult.score * 0.15) + 
    (readabilityResult.score * 0.15)
  );

  const strengths = [];
  const weaknesses = [];

  if (keywordResult.score >= 70) strengths.push('Strong keyword match with job description.');
  if (sectionResult.score === 100) strengths.push('All essential resume sections are present.');
  if (grammarResult.score >= 90) strengths.push('Resume has clean grammar and professional formatting signals.');

  if (keywordResult.score < 50) weaknesses.push('Missing critical keywords from job description.');
  if (sectionResult.missing.length > 0) weaknesses.push('Some important resume sections are missing or too brief.');
  
  const suggestions = [
    ...grammarResult.errors,
    ...readabilityResult.feedback,
    ...sectionResult.missing.map(m => `Add or expand: ${m}`),
    ...(keywordResult.missingKeywords.length > 0
      ? [`Consider adding these missing keywords where truthful: ${keywordResult.missingKeywords.slice(0, 8).join(', ')}`]
      : []),
  ].filter(Boolean);

  const areasOfImprovement = [
    keywordResult.score < 70 ? 'Keyword alignment with the target job description' : '',
    grammarResult.score < 90 ? 'Grammar, spelling, and professional polish' : '',
    readabilityResult.score < 80 ? 'Readability, sentence length, and scanability' : '',
    sectionResult.score < 100 ? 'Completeness and depth of core resume sections' : '',
    keywordResult.missingKeywords.length > 0 ? 'Natural integration of truthful missing keywords' : '',
  ].filter(Boolean);

  return {
    atsScore: overallScore,
    keywordScore: keywordResult.score,
    grammarScore: grammarResult.score,
    readabilityScore: readabilityResult.score,
    sectionScore: sectionResult.score,
    matchedKeywords: keywordResult.matchedKeywords,
    missingKeywords: keywordResult.missingKeywords,
    strengths,
    weaknesses,
    suggestions,
    areasOfImprovement
  };
};
