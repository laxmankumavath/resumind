import api from './axios';

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumes = async () => {
  const response = await api.get('/resumes');
  return response.data;
};

export const getResumeById = async (id) => {
  const response = await api.get(`/resumes/${id}`);
  return response.data;
};

export const exportPdf = async (id) => {
  const response = await api.get(`/export/pdf/${id}`, {
    responseType: 'blob', // Important for file downloads
  });
  return response.data;
};

export const exportDocx = async (id) => {
  const response = await api.get(`/export/docx/${id}`, {
    responseType: 'blob',
  });
  return response.data;
};
