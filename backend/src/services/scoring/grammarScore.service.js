export const calculateGrammarScore = (text) => {
  // A heuristic grammar check placeholder. 
  // In reality, this would call LanguageTool API or a lightweight AI.
  
  let score = 100;
  const errors = [];
  
  // Basic heuristics: sentences should start with capital letters.
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  let lowercaseStarts = 0;
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed && trimmed.charAt(0) !== trimmed.charAt(0).toUpperCase()) {
      lowercaseStarts++;
    }
  });

  if (lowercaseStarts > 0) {
    score -= (lowercaseStarts * 2);
    errors.push(`${lowercaseStarts} sentences start with a lowercase letter.`);
  }

  // Too many exclamation marks (unprofessional)
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 2) {
    score -= 10;
    errors.push('Avoid using exclamation marks in a professional resume.');
  }

  return {
    score: Math.max(0, score),
    errors
  };
};
