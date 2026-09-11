import { Resume } from '../models/Resume.js';
import { Rewrite } from '../models/Rewrite.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generatePDF } from '../services/export/pdfExport.service.js';
import { generateDOCX } from '../services/export/docxExport.service.js';

const getExportResumeData = async (resumeId) => {
  const latestRewrite = await Rewrite.findOne({
    resumeId,
    status: 'completed',
  }).sort({ updatedAt: -1 });

  if (!latestRewrite) return null;

  if (latestRewrite.comparison?.improvedResume) {
    return {
      ...(latestRewrite.rewrittenSections && typeof latestRewrite.rewrittenSections === 'object' ? latestRewrite.rewrittenSections : {}),
      rewrittenResume: latestRewrite.comparison.improvedResume,
      summary: latestRewrite.rewrittenSections?.summary || latestRewrite.rewrittenSections?.professionalSummary || '',
    };
  }

  if (latestRewrite.rewrittenSections && typeof latestRewrite.rewrittenSections === 'object') {
    const sections = latestRewrite.rewrittenSections;
    return {
      ...sections,
      summary: sections.summary || sections.professionalSummary || '',
    };
  }

  return null;
};

export const exportPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resume = await Resume.findOne({ _id: id, userId: req.user._id });
  
  if (!resume) throw new ApiError(404, 'Resume not found');

  const resumeData = await getExportResumeData(id) || resume.parsedSections;
  const pdfBytes = await generatePDF(resumeData);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume_${id}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

export const exportDOCX = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resume = await Resume.findOne({ _id: id, userId: req.user._id });
  
  if (!resume) throw new ApiError(404, 'Resume not found');

  const resumeData = await getExportResumeData(id) || resume.parsedSections;
  const docxBuffer = await generateDOCX(resumeData);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="resume_${id}.docx"`);
  res.send(docxBuffer);
});
