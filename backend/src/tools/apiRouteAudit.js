import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5003/api/v1';
const sampleDocx = path.resolve(process.cwd(), 'samples', 'resume.docx');
const samplePdf = path.resolve(process.cwd(), 'samples', 'resume.pdf');

const randomEmail = `test+${Date.now()}@example.com`;
const password = 'Test1234!';

const client = axios.create({ baseURL: BASE_URL, timeout: 60000 });

const log = (label, data) => {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
};

const register = async () => {
  const response = await client.post('/auth/register', {
    name: 'Resumind Test',
    email: randomEmail,
    password,
  });
  log('POST /auth/register', { status: response.status, data: response.data });
  return response.data.data;
};

const login = async () => {
  const response = await client.post('/auth/login', {
    email: randomEmail,
    password,
  });
  log('POST /auth/login', { status: response.status, data: response.data });
  return response.data.data;
};

const uploadResume = async (filePath) => {
  const form = new FormData();
  form.append('resume', fs.createReadStream(filePath));
  const headers = {
    ...form.getHeaders(),
    authorization: client.defaults.headers.common.Authorization,
  };
  console.log('Upload headers:', headers);
  const response = await client.post('/resumes/upload', form, { headers });
  log(`POST /resumes/upload (${path.basename(filePath)})`, { status: response.status, data: response.data });
  return response.data.data;
};

const analyzeResume = async (resumeId) => {
  const response = await client.post(`/resumes/${resumeId}/analyze`, {
    jobDescriptionText: 'We need a backend developer with Node.js, Express, MongoDB, Redis, BullMQ, REST API, authentication, and AI integration experience.',
    jobTitle: 'Backend Developer',
  });
  log('POST /resumes/:id/analyze', { status: response.status, data: response.data });
  return response.data.data.analysisId;
};

const getAnalysis = async (analysisId) => {
  const response = await client.get(`/resumes/analysis/${analysisId}`);
  log('GET /resumes/analysis/:analysisId', { status: response.status, data: response.data });
  return response.data.data;
};

const rewriteResume = async (resumeId) => {
  const response = await client.post(`/resumes/${resumeId}/rewrite`, {
    targetRole: 'Backend Engineer',
  });
  log('POST /resumes/:id/rewrite', { status: response.status, data: response.data });
  return response.data.data.rewriteId;
};

const getRewrite = async (rewriteId) => {
  const response = await client.get(`/resumes/rewrite/${rewriteId}`);
  log('GET /resumes/rewrite/:rewriteId', { status: response.status, data: response.data });
  return response.data.data;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const poll = async (fn, label, maxAttempts = 20, interval = 2000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await fn();
    if (result.status === 'completed' || result.status === 'failed') {
      log(`${label} (final)`, result);
      return result;
    }
    console.log(`${label}: waiting for completion... attempt ${attempt}/${maxAttempts}`);
    await delay(interval);
  }
  throw new Error(`${label} did not complete within timeout`);
};

const main = async () => {
  try {
    await register();
    const loginData = await login();
    client.defaults.headers.common.Authorization = `Bearer ${loginData.tokens.accessToken}`;

    const resumeDocx = await uploadResume(sampleDocx);
    await uploadResume(samplePdf);

    const resumeId = resumeDocx._id || resumeDocx.data?._id || resumeDocx._id;
    if (!resumeId) throw new Error('Resume upload did not return _id');

    const analysisId = await analyzeResume(resumeId);
    const analysisResult = await poll(() => getAnalysis(analysisId), 'Analysis polling');

    const rewriteId = await rewriteResume(resumeId);
    const rewriteResult = await poll(() => getRewrite(rewriteId), 'Rewrite polling');

    log('Final Results', {
      resumeId,
      analysisId,
      rewriteId,
      analysisResult,
      rewriteResult,
    });
  } catch (error) {
    console.error('API route audit failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

main();
