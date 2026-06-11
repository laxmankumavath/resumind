import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(envRoot, '.env') });

if (!process.env.GEMINI_API_KEY && process.env.GOOGLE_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
}

if (process.env.REDIS_URL && (!process.env.REDIS_HOST || !process.env.REDIS_PORT)) {
  try {
    const redisUrl = new URL(process.env.REDIS_URL);
    process.env.REDIS_HOST ||= redisUrl.hostname;
    process.env.REDIS_PORT ||= redisUrl.port || '6379';
    if (redisUrl.password) {
      process.env.REDIS_PASSWORD ||= redisUrl.password;
    }
  } catch (_error) {
    // Validation below will report usable Redis settings.
  }
}

if (process.env.JWT_SECRET) {
  process.env.JWT_ACCESS_SECRET ||= process.env.JWT_SECRET;
  process.env.JWT_REFRESH_SECRET ||= process.env.JWT_SECRET;
}

// Define validation schema for environment variables
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  MONGO_URI: z.string().url(),
  REDIS_URL: z.string().default(''),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().default(''),
  
  JWT_SECRET: z.string().default(''),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  OPENAI_API_KEY: z.string().default(''),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

// Validate the env vars. If invalid, the app will crash at startup.
// This is a fail-fast approach ensuring we don't run without required configs.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
