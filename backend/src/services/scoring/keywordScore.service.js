/**
 * Keyword Score Service
 * 
 * Why it exists: Separates keyword extraction and matching logic from the main ATS scorer.
 * What it does: A heuristic approach (non-AI) to quickly find keyword overlaps.
 */

export const calculateKeywordMatch = (resumeText, jobDescriptionText) => {
  const stopWords = new Set([
    'and', 'are', 'for', 'the', 'with', 'you', 'our', 'your', 'will', 'this', 'that',
    'from', 'have', 'has', 'need', 'needs', 'looking', 'work', 'team', 'role',
    'candidate', 'experience', 'years', 'ability', 'strong', 'good', 'using',
  ]);

  const normalize = (text) => String(text || '').toLowerCase();
  const tokenize = (text) => normalize(text)
    .replace(/[^\w+#.\s-]/g, ' ')
    .split(/\s+/)
    .map(token => token.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(token => token.length > 2 && !stopWords.has(token));

  const technicalPhrases = [
    'node.js', 'node js', 'express.js', 'express', 'mongodb', 'rest api', 'rest apis',
    'javascript', 'typescript', 'react', 'redis', 'bullmq', 'jwt', 'authentication',
    'cloud deployment', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd',
    'production debugging', 'monitoring', 'api', 'apis',
  ];

  const resumeTokens = new Set(tokenize(resumeText));
  const jdTokens = new Set(tokenize(jobDescriptionText));
  const resumeLower = normalize(resumeText);
  const jdLower = normalize(jobDescriptionText);

  let matchCount = 0;
  const matchedKeywords = [];
  const missingKeywords = [];

  jdTokens.forEach(token => {
    if (resumeTokens.has(token)) {
      matchCount++;
      matchedKeywords.push(token);
    } else {
      missingKeywords.push(token);
    }
  });

  technicalPhrases.forEach((phrase) => {
    if (!jdLower.includes(phrase)) return;
    const canonical = phrase
      .replace('node js', 'node.js')
      .replace('express.js', 'express')
      .replace('rest apis', 'rest api');

    if (matchedKeywords.includes(canonical) || missingKeywords.includes(canonical)) return;

    if (resumeLower.includes(phrase) || (canonical !== phrase && resumeLower.includes(canonical))) {
      matchedKeywords.push(canonical);
      matchCount++;
    } else {
      missingKeywords.push(canonical);
    }
  });

  // Score out of 100 based on percentage of JD tokens found in resume
  const totalKeywords = jdTokens.size + technicalPhrases.filter(phrase => jdLower.includes(phrase)).length;
  const score = totalKeywords === 0 ? 0 : Math.min(100, Math.round((matchCount / totalKeywords) * 100));

  return {
    score,
    matchedKeywords: [...new Set(matchedKeywords)],
    missingKeywords: [...new Set(missingKeywords)]
  };
};
