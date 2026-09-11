# ResuMind Backend API 🚀

A production-ready SaaS backend for an AI-powered Resume Analyzer, ATS Scorer, and Resume Rewriter. Built using Node.js, Express, MongoDB, BullMQ, Redis, and Gemini.

## Features

- **Authentication**: JWT-based secure auth with Refresh/Access tokens and role-based access control.
- **Resume Parsing**: Extracts raw text from uploaded PDFs and DOCX files.
- **ATS Scoring**: Analyzes resumes against Job Descriptions using heuristical keyword matching.
- **AI Rewriting**: Asynchronously rewrites resumes using Gemini to improve action verbs and grammar.
- **Background Jobs**: Uses BullMQ and Redis to offload heavy AI API calls and parsing to background workers.
- **Security**: Rate limiting, Helmet, Zod request validation, and comprehensive error handling.
- **Storage**: Uploads resumes to Cloudinary.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Redis Server (Running locally or hosted)
- Cloudinary Account
- Gemini API Key

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` and fill in the required keys:
   - `MONGO_URI`
   - `REDIS_HOST` & `REDIS_PORT`
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)
   - `CLOUDINARY_*` keys

3. **Start Redis Server**
   Ensure your Redis-compatible server is running (default port 6379).

   ```bash
   npm run redis
   ```

   This project was verified locally with Memurai Developer on Windows. You can confirm Redis is available with:

   ```bash
   tools\memurai-portable\tools\memurai-cli.exe -h 127.0.0.1 -p 6379 ping
   ```

   Expected response:

   ```bash
   PONG
   ```

4. **Run the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

5. **Run Background Workers**
   Start the BullMQ workers in a second terminal:

   ```bash
   npm run worker
   ```

   Keep the API server, Redis, and worker process running at the same time for async analysis/rewrite jobs.

## Architecture Details
This project follows **Clean Architecture**:
- **Controllers**: Thin layer handling HTTP requests/responses.
- **Services**: Core business logic and external API integrations (Gemini, Cloudinary).
- **Jobs/Workers**: BullMQ setup for processing intensive tasks asynchronously.
- **Middlewares**: Cross-cutting concerns like Auth, File Uploads, Rate Limiting, Error Handling.
- **Models**: Mongoose schemas representing the data layer.

### Backend Directory Structure

```text
src/
├── app.js
├── server.js
├── config/
│   ├── cloudinary.js
│   ├── db.js
│   ├── env.js
│   └── redis.js
├── controllers/
│   ├── analysis.controller.js
│   ├── auth.controller.js
│   ├── export.controller.js
│   ├── resume.controller.js
│   ├── rewrite.controller.js
│   └── user.controller.js
├── jobs/
│   ├── analysis.worker.js
│   ├── index.js
│   ├── queueSetup.js
│   └── rewrite.worker.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── rateLimit.middleware.js
│   ├── upload.middleware.js
│   └── validate.middleware.js
├── models/
│   ├── Analysis.js
│   ├── JobDescription.js
│   ├── Resume.js
│   ├── Rewrite.js
│   └── User.js
├── prompts/
│   └── ai.prompts.js
├── routes/
│   ├── analysis.routes.js
│   ├── auth.routes.js
│   ├── export.routes.js
│   ├── index.js
│   ├── resume.routes.js
│   ├── rewrite.routes.js
│   └── user.routes.js
├── services/
│   ├── ai/
│   │   ├── ats.service.js
│   │   ├── feedback.service.js
│   │   ├── gemini.service.js
│   │   ├── grammar.service.js
│   │   ├── keyword.service.js
│   │   └── rewrite.service.js
│   ├── export/
│   │   ├── docxExport.service.js
│   │   └── pdfExport.service.js
│   ├── parser/
│   │   ├── docxParser.service.js
│   │   ├── pdfParser.service.js
│   │   ├── sectionExtractor.service.js
│   │   └── textCleaner.service.js
│   ├── scoring/
│   │   ├── atsScore.service.js
│   │   ├── grammarScore.service.js
│   │   ├── keywordScore.service.js
│   │   ├── readabilityScore.service.js
│   │   └── sectionScore.service.js
│   └── storage/
│       └── storage.service.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── constants.js
│   ├── jwt.util.js
│   ├── logger.js
│   └── tokenizer.js
└── validations/
    ├── auth.validation.js
    └── resume.validation.js
```

## API Documentation

*(You can import a Postman collection pointing to `/api/v1/...` for testing.)*

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/resumes/upload` - Upload PDF/DOCX
- `POST /api/v1/analysis/analyze` - Trigger ATS scoring against a Job Description
- `POST /api/v1/analysis/compare-jd` - Run immediate resume/JD comparison
- `GET /api/v1/analysis/:analysisId` - Fetch result of ATS analysis
- `POST /api/v1/rewrite/resume` - Trigger full AI rewrite
- `POST /api/v1/rewrite/section` - Rewrite one resume section
- `GET /api/v1/rewrite/:rewriteId` - Fetch one rewrite result
- `GET /api/v1/rewrite/history/:resumeId` - Fetch rewrite history

Compatibility aliases are also available for older clients:

- `POST /api/v1/resumes/:id/analyze`
- `GET /api/v1/resumes/analysis/:analysisId`
- `POST /api/v1/resumes/:id/rewrite`
- `GET /api/v1/resumes/rewrite/:rewriteId`

## License
MIT
