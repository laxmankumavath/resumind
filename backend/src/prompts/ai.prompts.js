/**
 * Centralized AI Prompts
 * 
 * Why it exists: Separates prompt engineering from business logic.
 * What it does: Provides well-structured prompts for different AI features (Rewriting, ATS Scoring, Feedback).
 */

export const rewriteResumePrompt = (resumeText) => `
You are an expert Resume Writer and Recruiter.
Analyze the following resume text and provide a highly optimized version.

1. Fix any grammar and spelling mistakes.
2. Enhance bullet points to be action-oriented and results-driven (use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]).
3. Structure the output as valid JSON with these keys: "summary", "experience", "education", "skills", "projects".
4. Ensure the output is strictly JSON without markdown wrappers.

Resume Text:
${resumeText}
`;

export const analyzeAtsPrompt = (resumeText, jobDescriptionText) => `
You are an advanced ATS (Applicant Tracking System) algorithm.
Compare the following resume against the job description.

1. Identify missing critical keywords.
2. Score the match out of 100 based on skills, experience, and requirements.
3. Provide actionable feedback to the candidate.
4. Output MUST be valid JSON with keys: "score" (number), "missingKeywords" (array of strings), "feedback" (array of strings).

Job Description:
${jobDescriptionText}

Resume:
${resumeText}
`;
