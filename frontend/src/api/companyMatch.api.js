import api from './axios';

export const generateCompanyMatch = async (resumeId, payload = {}) => {
  const response = await api.post(`/company-match/${resumeId}`, payload);
  return response.data;
};

export const getCompanyMatch = async (matchId) => {
  const response = await api.get(`/company-match/${matchId}`);
  return response.data;
};

export const getCompanyHistory = async () => {
  const response = await api.get('/company-match/user/history');
  return response.data;
};
