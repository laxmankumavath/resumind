import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5003/api/v1';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  try {
    const randomSuffix = Date.now();
    const email = `testuser_${randomSuffix}@example.com`;
    const password = `Password@123`;
    
    console.log(`[1] Registering user: ${email}...`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User', email, password
    });
    console.log('✅ Registered successfully');

    console.log(`[2] Logging in...`);
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email, password
    });
    const accessToken = loginRes.data.data.tokens.accessToken;
    const refreshToken = loginRes.data.data.tokens.refreshToken;
    console.log('✅ Logged in successfully');

    console.log(`[2a] Fetching protected profile...`);
    const profileRes = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (profileRes.data.data.email !== email) {
      throw new Error('Protected profile returned the wrong user');
    }
    console.log('✅ Protected profile route works');

    console.log(`[2b] Refreshing access token...`);
    const refreshRes = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
    const refreshedAccessToken = refreshRes.data.data.tokens.accessToken;
    console.log('✅ Token refresh works');

    console.log(`[3] Uploading resume...`);
    const resumePath = path.resolve('./samples/resume.docx');
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(resumePath));

    const uploadRes = await axios.post(`${BASE_URL}/resumes/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${refreshedAccessToken}`
      }
    });
    const resumeId = uploadRes.data.data._id;
    console.log(`✅ Resume uploaded, ID: ${resumeId}`);

    console.log(`[3a] Uploading PDF resume to verify PDF parsing...`);
    const pdfResumePath = path.resolve('./samples/resume.pdf');
    const pdfFormData = new FormData();
    pdfFormData.append('resume', fs.createReadStream(pdfResumePath));
    const pdfUploadRes = await axios.post(`${BASE_URL}/resumes/upload`, pdfFormData, {
      headers: {
        ...pdfFormData.getHeaders(),
        'Authorization': `Bearer ${refreshedAccessToken}`
      }
    });
    if (!pdfUploadRes.data.data.extractedText?.trim()) {
      throw new Error('PDF upload succeeded but extractedText was empty');
    }
    console.log(`✅ PDF resume parsed, ID: ${pdfUploadRes.data.data._id}`);

    console.log(`[4] Triggering Analysis...`);
    const analyzeRes = await axios.post(`${BASE_URL}/analysis/analyze`, {
      resumeId,
      jobTitle: "Software Engineer",
      jobDescriptionText: "We are looking for a Node.js and MongoDB expert with Express experience."
    }, {
      headers: { 'Authorization': `Bearer ${refreshedAccessToken}` }
    });
    const analysisId = analyzeRes.data.data.analysisId;
    console.log(`✅ Analysis triggered, Analysis ID: ${analysisId}`);

    console.log(`[5] Polling for Analysis Results...`);
    let analysisResult = null;
    for (let i = 0; i < 30; i++) {
      const statusRes = await axios.get(`${BASE_URL}/analysis/${analysisId}`, {
        headers: { 'Authorization': `Bearer ${refreshedAccessToken}` }
      });
      const statusData = statusRes.data;
      if (statusData.data && statusData.data.status === 'completed') {
        analysisResult = statusData.data;
        break;
      } else if (statusData.data && statusData.data.status === 'failed') {
        throw new Error(`Analysis failed: ${statusData.data.error}`);
      }
      await delay(2000);
      console.log('   Waiting for analysis...');
    }
    if (!analysisResult) throw new Error('Analysis timed out');
    console.log(`✅ Analysis completed! Score: ${analysisResult.atsScore}`);
    
    console.log(`[6] Triggering Rewrite...`);
    const rewriteRes = await axios.post(`${BASE_URL}/rewrite/resume`, {
      resumeId,
      targetRole: "Software Engineer"
    }, {
      headers: { 'Authorization': `Bearer ${refreshedAccessToken}` }
    });
    const rewriteId = rewriteRes.data.data.rewriteId;
    console.log(`✅ Rewrite triggered, Rewrite ID: ${rewriteId}`);

    console.log(`[7] Polling for Rewrite Results...`);
    let rewriteResult = null;
    for (let i = 0; i < 30; i++) {
      const statusRes = await axios.get(`${BASE_URL}/rewrite/${rewriteId}`, {
        headers: { 'Authorization': `Bearer ${refreshedAccessToken}` }
      });
      const historyItem = statusRes.data.data;
      if (historyItem && historyItem.status === 'completed') {
        rewriteResult = historyItem;
        break;
      } else if (historyItem && historyItem.status === 'failed') {
        throw new Error(`Rewrite failed: ${historyItem.error}`);
      }
      await delay(2000);
      console.log('   Waiting for rewrite...');
    }
    if (!rewriteResult) throw new Error('Rewrite timed out');
    console.log(`✅ Rewrite completed!`);

    console.log(`[8] Exporting PDF...`);
    const pdfRes = await axios.get(`${BASE_URL}/export/pdf/${resumeId}`, {
      headers: { 'Authorization': `Bearer ${refreshedAccessToken}` },
      responseType: 'arraybuffer'
    });
    if (pdfRes.status !== 200) {
        throw new Error(`PDF Export failed`);
    }
    console.log(`✅ PDF Export successful (status ${pdfRes.status}), size: ${pdfRes.data.length} bytes`);

    console.log(`[9] Exporting DOCX...`);
    const docxRes = await axios.get(`${BASE_URL}/export/docx/${resumeId}`, {
      headers: { 'Authorization': `Bearer ${refreshedAccessToken}` },
      responseType: 'arraybuffer'
    });
    if (docxRes.status !== 200) {
      throw new Error(`DOCX Export failed`);
    }
    console.log(`✅ DOCX Export successful (status ${docxRes.status}), size: ${docxRes.data.length} bytes`);

    console.log(`[10] Logging out...`);
    await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { 'Authorization': `Bearer ${refreshedAccessToken}` }
    });
    console.log('✅ Logout endpoint works');

    console.log(`[11] Verifying protected route rejects missing token...`);
    try {
      await axios.get(`${BASE_URL}/user/profile`);
      throw new Error('Protected route accepted a missing token');
    } catch (error) {
      if (error.response?.status !== 401) throw error;
    }
    console.log('✅ Missing-token protected route rejection works');

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed with API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

run();
