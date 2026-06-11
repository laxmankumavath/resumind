# Intelligent Resume Rewrite System - Architecture

## Overview

The redesigned resume rewrite pipeline now leverages comprehensive ATS analysis data to guide AI-powered improvements, resulting in significantly better quality rewrites.

## Data Flow

```
Resume Upload
  ↓
Extract Text & Parse Sections
  ↓
Run ATS Analysis (score, keywords, grammar, readability, sections)
  ↓
User Initiates Rewrite
  ↓
Pass Resume + ATS Analysis Data to Gemini
  ↓
AI generates targeted improvements using:
  - Original resume text
  - ATS scores & metrics
  - Identified strengths & weaknesses
  - Missing keywords
  - Improvement suggestions
  ↓
Save Improved Resume with metadata
  ↓
Return comparison showing improvements
```

## Service Architecture

### rewriteIntelligent.service.js

New service providing intelligent rewrite powered by ATS data.

**Key Function:**
```javascript
rewriteResumeWithAIIntelligent({
  originalResume,           // Full resume text
  atsScore,                 // Overall ATS score (0-100)
  keywordScore,             // Keyword match score (0-100)
  grammarScore,             // Grammar/professionalism (0-100)
  readabilityScore,         // Readability score (0-100)
  sectionScore,             // Section completeness (0-100)
  strengths,                // List of identified strengths
  weaknesses,               // List of identified weaknesses
  missingKeywords,          // Keywords to integrate
  suggestions,              // Improvement suggestions
  matchedKeywords,          // Keywords already present
  targetRole,               // Optional: target job role
  jobDescription            // Optional: job description text
})
```

**Returns:**
```javascript
{
  success: true,
  rewriteResult: {
    professionalSummary: "...",
    experience: [...],
    education: [...],
    skills: [...],
    projects: [...]
  },
  metadata: {
    source: "gemini-intelligent",
    model: "gemini-2.5-flash",
    atsImprovementsApplied: [...],
    keywordsAdded: [...],
    estimatedNewATSScore: "75-85",
    improvementSummary: "..."
  },
  comparison: {
    originalAtsScore: 65,
    originalKeywordScore: 47,
    originalGrammarScore: 96,
    originalReadabilityScore: 70,
    estimatedNewATSScore: "75-85",
    improvementsMade: [...],
    keywordsAdded: [...]
  }
}
```

## Rewrite Worker Updates

**rewrite.worker.js** now:
1. Fetches the associated ATS Analysis document
2. Extracts job description from the analysis
3. Passes all analysis data to intelligent rewrite service
4. Stores improvement metadata in the Rewrite document

## API Changes

### POST /api/v1/resumes/:id/rewrite

**New Optional Parameter:**
```json
{
  "resumeId": "...",
  "targetRole": "Backend Engineer",
  "analysisId": "6a1c1ec0a71987431d8cbd4d"  // NEW: Optional analysis ID
}
```

If `analysisId` is provided and valid, the rewrite will use the associated ATS analysis data to guide improvements.

## AI Prompt Strategy

The new prompt:
1. Presents current ATS scores and performance gaps
2. Highlights identified strengths to preserve
3. Lists weaknesses that must be fixed
4. Provides missing keywords to integrate naturally
5. Includes specific AI suggestions from analysis
6. Guides the AI through an improvement strategy
7. Enforces factual accuracy (no hallucinations)

## Key Improvements Over Previous Approach

| Aspect | Before | After |
|--------|--------|-------|
| Context | Generic rewrite prompt | Full ATS analysis data |
| Keywords | Random selection | Targeted missing keywords |
| Focus | Broad improvements | Specific weakness fixes |
| Output Quality | Generic | Tailored to analysis results |
| Estimated Score | Not provided | Estimated improvement range |
| Transparency | Limited | Detailed improvements applied |

## Fallback Behavior

If ATS analysis is not available:
- Rewrite still proceeds with intelligent system
- Uses score defaults (0) and empty arrays
- Returns generic but improved resume
- Future analysis will show actual improvements

## Database Updates

**Rewrite Model:**
- `metadata.atsImprovementsApplied`: Array of specific improvements made
- `metadata.keywordsAdded`: Keywords added to resume
- `metadata.estimatedNewATSScore`: Predicted new score
- `metadata.improvementSummary`: Summary of changes

**Example Metadata:**
```json
{
  "metadata": {
    "source": "gemini-intelligent",
    "model": "gemini-2.5-flash",
    "targetRole": "Backend Engineer",
    "atsImprovementsApplied": [
      "Improved summary to be more achievement-oriented",
      "Added action verbs to experience bullets",
      "Integrated missing keywords: Redis, BullMQ, system design",
      "Enhanced formatting for ATS parsing",
      "Expanded project descriptions with business impact"
    ],
    "keywordsAdded": ["Redis", "BullMQ", "System Design", "Scalability"],
    "estimatedNewATSScore": "78-88",
    "improvementSummary": "Resume improved using ATS analysis feedback. Expected 13-23 point improvement.",
    "completedAt": "2026-05-31T17:43:17.393Z"
  }
}
```

## Usage Example

### Frontend Initiation
```javascript
// After running analysis
const analysisId = analysisResult._id;
const rewriteId = await rewriteResume({
  resumeId,
  targetRole: "Senior Backend Engineer",
  analysisId  // Pass analysis ID for intelligent rewriting
});

// Poll for result
const rewriteResult = await getRewrite(rewriteId);
console.log(rewriteResult.metadata.atsImprovementsApplied);
console.log(rewriteResult.metadata.estimatedNewATSScore);
```

## Testing

To verify the new system:
1. Upload a resume
2. Run ATS analysis
3. Initiate rewrite with analysisId
4. Check metadata for improvements applied
5. Compare against original for quality improvements
