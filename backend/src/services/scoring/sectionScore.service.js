export const calculateSectionScore = (parsedSections) => {
  let score = 0;
  const missing = [];
  const textLength = (section) => Array.isArray(section) ? section.join(' ').length : (section || '').length;

  if (textLength(parsedSections.experience) > 50) score += 30;
  else missing.push('Experience section missing or too brief');

  if (textLength(parsedSections.education) > 20) score += 20;
  else missing.push('Education section missing');

  if (textLength(parsedSections.skills) > 10) score += 20;
  else missing.push('Skills section missing');

  if (textLength(parsedSections.projects) > 20) score += 20;
  else missing.push('Projects section missing');

  if (textLength(parsedSections.summary) > 10) score += 10;
  else missing.push('Professional summary missing');

  return {
    score,
    missing
  };
};
