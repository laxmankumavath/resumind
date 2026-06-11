import { Document, Packer, Paragraph, TextRun } from 'docx';
import { ApiError } from '../../utils/ApiError.js';

const buildResumeText = (resumeData = {}) => {
  if (resumeData.rewrittenResume) return String(resumeData.rewrittenResume);

  return [
    resumeData.summary || resumeData.professionalSummary
      ? `Summary\n${resumeData.summary || resumeData.professionalSummary}`
      : '',
    resumeData.skills?.length ? `Skills\n${resumeData.skills.join('\n')}` : '',
    resumeData.experience?.length ? `Experience\n${resumeData.experience.map(item => `- ${item}`).join('\n')}` : '',
    resumeData.projects?.length ? `Projects\n${resumeData.projects.map(item => `- ${item}`).join('\n')}` : '',
    resumeData.education?.length ? `Education\n${resumeData.education.map(item => `- ${item}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
};

const isHeading = (line) => /^[A-Za-z][A-Za-z &/]+$/.test(line.trim()) && line.trim().length <= 40;

export const generateDOCX = async (resumeData) => {
  try {
    const resumeText = buildResumeText(resumeData);
    const paragraphs = String(resumeText || 'Resume content unavailable')
      .split('\n')
      .map((line) => {
        const heading = isHeading(line);

        return new Paragraph({
          spacing: { after: heading ? 120 : 80 },
          children: [
            new TextRun({
              text: line,
              bold: heading,
              size: heading ? 24 : 20,
            }),
          ],
        });
      });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (_error) {
    throw new ApiError(500, 'Failed to generate DOCX');
  }
};
