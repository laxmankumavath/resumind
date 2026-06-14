import api from './axios';

export const triggerFullRewrite = async (resumeId, targetRole) => {
  const response = await api.post('/rewrite/resume', {
    resumeId,
    targetRole
  });
  return response.data; // { rewriteId }
};

export const triggerSectionRewrite = async (resumeId, sectionName, text) => {
  const response = await api.post('/rewrite/section', {
    resumeId,
    sectionName,
    text
  });
  return response.data;
};

export const getRewriteHistory = async (resumeId) => {
  const response = await api.get(`/rewrite/history/${resumeId}`);
  return response.data;
};
