import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';
import logger from './utils/logger.js';

/**
 * Express App Setup
 * 
 * Why it exists: Configures the Express instance and applies global middlewares.
 * What it does: Sets up security (Helmet, CORS), logging (Morgan), rate limiting, and routes.
 * Why it's separated from server.js: Makes the app exportable for unit testing without starting the server.
 */

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting
app.use('/api', globalLimiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload fallback files in development when Cloudinary is unavailable.
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check for browser/root visits
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Resumind API is running',
    health: '/api/v1/health',
  });
});

// API Routes
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
