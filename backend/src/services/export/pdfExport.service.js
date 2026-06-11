import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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

const wrapLine = (line, font, size, maxWidth) => {
  const words = String(line || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      return;
    }

    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines;
};

export const generatePDF = async (resumeData) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 48;
    const pageWidth = 612;
    const pageHeight = 792;
    const maxWidth = pageWidth - (margin * 2);
    const normalSize = 10;
    const headingSize = 12;
    const lineHeight = 15;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addPageIfNeeded = () => {
      if (y > margin) return;
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    };

    const drawTextLine = (text, options = {}) => {
      addPageIfNeeded();
      const isHeading = options.heading;
      page.drawText(text, {
        x: margin,
        y,
        size: isHeading ? headingSize : normalSize,
        font: isHeading ? boldFont : font,
        color: isHeading ? rgb(0.08, 0.12, 0.2) : rgb(0.16, 0.18, 0.22),
      });
      y -= isHeading ? lineHeight + 3 : lineHeight;
    };

    const resumeText = buildResumeText(resumeData);
    String(resumeText || 'Resume content unavailable')
      .split('\n')
      .forEach((rawLine) => {
        const line = rawLine.trimEnd();
        if (!line.trim()) {
          y -= 8;
          return;
        }

        const isHeading = /^[A-Za-z][A-Za-z &/]+$/.test(line.trim()) && line.length <= 40;
        const activeFont = isHeading ? boldFont : font;
        const activeSize = isHeading ? headingSize : normalSize;

        wrapLine(line, activeFont, activeSize, maxWidth).forEach((wrappedLine) => {
          drawTextLine(wrappedLine, { heading: isHeading });
        });
      });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (_error) {
    throw new ApiError(500, 'Failed to generate PDF');
  }
};
