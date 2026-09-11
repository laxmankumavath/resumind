/**
 * Section Extractor Service
 * 
 * Line-anchored parsing of resume sections (Summary, Skills, Experience, Education, Projects, Certifications)
 */

const SECTION_PATTERNS = [
  {
    name: 'summary',
    regex: /^(?:professional\s+summary|summary|profile|professional\s+profile|executive\s+summary|about\s+me|career\s+objective|objective)\b/i,
  },
  {
    name: 'skills',
    regex: /^(?:technical\s+skills|core\s+competencies|skills\s*(?:&|and)\s*abilities|skills|technologies|key\s+skills|tech\s+stack|expertise|competencies)\b/i,
  },
  {
    name: 'experience',
    regex: /^(?:work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history|career\s+history|relevant\s+experience)\b/i,
  },
  {
    name: 'education',
    regex: /^(?:education|academic\s+background|academic\s+history|academic\s+qualifications|educational\s+background|qualifications)\b/i,
  },
  {
    name: 'projects',
    regex: /^(?:projects|personal\s+projects|key\s+projects|selected\s+projects|academic\s+projects)\b/i,
  },
  {
    name: 'certifications',
    regex: /^(?:certifications|certificates|licenses\s*(?:&|and)\s*certifications|certifications\s*(?:&|and)\s*licenses|awards\s*(?:&|and)\s*certifications|achievements)\b/i,
  },
];

const splitToItems = (text) => {
  if (!text) return [];

  return text
    .split(/\r?\n|•/)
    .map((line) => line.replace(/^[-*•\s]+/, '').trim())
    .filter((line) => line.length > 0);
};

const splitSkills = (text) => {
  if (!text) return [];

  return text
    .split(/\r?\n|•|,|;|\|/)
    .map((item) => item.replace(/^[-*•\s]+/, '').trim())
    .filter((item) => item.length > 0 && !SECTION_PATTERNS.some((p) => p.regex.test(item)));
};

export const extractSections = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };
  }

  const lines = text.split('\n');
  const sectionIndices = [];

  // Identify line numbers where section headers appear
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Headers are typically short (< 40 characters) and match a known section pattern
    if (trimmed.length > 0 && trimmed.length <= 45) {
      // Remove trailing colons, dashes, numbers
      const cleanHeader = trimmed.replace(/[:\-#*]+$/g, '').trim();
      for (const section of SECTION_PATTERNS) {
        if (section.regex.test(cleanHeader)) {
          sectionIndices.push({
            name: section.name,
            lineIndex: idx,
            headerText: trimmed,
          });
          break;
        }
      }
    }
  });

  const sectionsContent = {
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  // If no structured headers were found, return the text in summary/skills heuristics
  if (sectionIndices.length === 0) {
    const items = splitToItems(text);
    return {
      summary: text.slice(0, 500).trim(),
      skills: [],
      experience: items.slice(0, 10),
      education: [],
      projects: [],
      certifications: [],
    };
  }

  for (let i = 0; i < sectionIndices.length; i++) {
    const current = sectionIndices[i];
    const next = sectionIndices[i + 1];
    const startLine = current.lineIndex + 1;
    const endLine = next ? next.lineIndex : lines.length;

    const contentLines = lines.slice(startLine, endLine);
    const contentText = contentLines.join('\n').trim();

    if (current.name === 'summary') {
      sectionsContent.summary = contentText;
    } else if (current.name === 'skills') {
      sectionsContent.skills = [...new Set([...sectionsContent.skills, ...splitSkills(contentText)])];
    } else if (current.name === 'experience') {
      sectionsContent.experience = [...sectionsContent.experience, ...splitToItems(contentText)];
    } else if (current.name === 'education') {
      sectionsContent.education = [...sectionsContent.education, ...splitToItems(contentText)];
    } else if (current.name === 'projects') {
      sectionsContent.projects = [...sectionsContent.projects, ...splitToItems(contentText)];
    } else if (current.name === 'certifications') {
      sectionsContent.certifications = [...sectionsContent.certifications, ...splitToItems(contentText)];
    }
  }

  return sectionsContent;
};
