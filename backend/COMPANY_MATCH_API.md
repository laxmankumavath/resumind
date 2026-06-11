# Company Match & Hiring Probability Predictor

Base URL: `/api/v1/company-match`

All endpoints require `Authorization: Bearer <accessToken>`.

## Generate Company Match

`POST /api/v1/company-match/:resumeId`

Creates and stores an ATS-aware company recommendation report for the authenticated user's resume.

Request body:

```json
{
  "analysisId": "optional completed ATS analysis id",
  "targetRole": "Frontend Developer",
  "jobDescription": "Optional target job description text",
  "companyCategories": ["FAANG", "Product Based Companies", "AI Startups"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "match id",
    "userId": "user id",
    "resumeId": "resume id",
    "analysisId": "analysis id",
    "atsScore": 82,
    "targetRole": "Frontend Developer",
    "matchedCompanies": [
      {
        "companyName": "Adobe",
        "matchPercentage": 84,
        "hiringProbability": "High",
        "requiredSkills": ["DSA", "JavaScript", "React"],
        "missingSkills": ["System Design"],
        "reasons": ["Why this company is a fit"],
        "recommendedActions": ["What to improve next"],
        "averagePackage": "INR 22-48 LPA",
        "companyType": "Product Based Companies",
        "confidenceScore": 88,
        "skillsMatch": 79,
        "atsCompatibility": 81,
        "remoteFriendly": true
      }
    ],
    "metadata": {
      "source": "gemini-company-match",
      "model": "gemini model",
      "candidateLevel": "Entry-level",
      "strongestSignals": [],
      "riskSignals": [],
      "categoriesConsidered": [],
      "warnings": []
    }
  }
}
```

## Get Company Match

`GET /api/v1/company-match/:matchId`

Returns one stored company match report owned by the authenticated user.

## Get User History

`GET /api/v1/company-match/user/history`

Returns the latest 50 company match reports for the authenticated user.

## Notes

The service first computes a deterministic match against a curated company hiring-expectation catalog, then asks Gemini to refine explanations and probabilities. If Gemini is unavailable, the deterministic result is still returned and stored with `metadata.source = "heuristic-company-match"`.
