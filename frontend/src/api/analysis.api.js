import api from './axios';

export const triggerAnalysis = async (resumeId, jobTitle, jobDescriptionText) => {
  const response = await api.post('/analysis/analyze', {
    resumeId,
    jobTitle,
    jobDescriptionText
  });
  return response.data; // Should return the { analysisId }
};

export const getAnalysisResult = async (analysisId) => {
  const response = await api.get(`/analysis/${analysisId}`);
  return response.data;
};
