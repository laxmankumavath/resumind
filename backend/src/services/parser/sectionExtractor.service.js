export const extractSections = (text) => {
  // A naive implementation using Regex. In a real highly-scalable app, this might use NLP or AI.
  const lowerText = text.toLowerCase();
  
  const extract = (startKeywords, endKeywords) => {
    let startIdx = -1;
    for (const kw of startKeywords) {
      const idx = lowerText.indexOf(kw);
      if (idx !== -1 && (startIdx === -1 || idx < startIdx)) {
        startIdx = idx;
      }
    }
    
    if (startIdx === -1) return '';

    let endIdx = lowerText.length;
    for (const kw of endKeywords) {
      const idx = lowerText.indexOf(kw, startIdx + 10); // +10 to avoid matching itself
      if (idx !== -1 && idx < endIdx) {
        endIdx = idx;
      }
    }

    return text.substring(startIdx, endIdx).trim();
  };

  const commonHeaders = ['experience', 'work history', 'education', 'skills', 'projects', 'summary', 'profile'];
  const toItems = (sectionText) => sectionText
    .split(/\r?\n|\u2022/)
    .map(item => item.trim())
    .filter(Boolean);

  return {
    skills: toItems(extract(['skills', 'technical skills'], commonHeaders.filter(h => h !== 'skills' && h !== 'technical skills'))),
    experience: toItems(extract(['experience', 'work history', 'employment'], commonHeaders.filter(h => !['experience', 'work history', 'employment'].includes(h)))),
    education: toItems(extract(['education', 'academic'], commonHeaders.filter(h => !['education', 'academic'].includes(h)))),
    projects: toItems(extract(['projects', 'personal projects'], commonHeaders.filter(h => !['projects', 'personal projects'].includes(h)))),
    summary: extract(['summary', 'profile', 'objective'], commonHeaders.filter(h => !['summary', 'profile', 'objective'].includes(h)))
  };
};
