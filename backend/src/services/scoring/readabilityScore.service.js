export const calculateReadabilityScore = (text) => {
  let score = 100;
  const feedback = [];

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200) {
    score -= 30;
    feedback.push('Resume is too short. Try to add more details (aim for 400-600 words).');
  } else if (wordCount > 1000) {
    score -= 20;
    feedback.push('Resume is too long. Try to keep it concise.');
  }

  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const avgWordsPerSentence = wordCount / (sentences.length || 1);
  
  if (avgWordsPerSentence > 25) {
    score -= 15;
    feedback.push('Sentences are too long on average. Use bullet points or shorter sentences.');
  }

  return {
    score: Math.max(0, score),
    feedback
  };
};
