import dotenv from 'dotenv';

dotenv.config();

/** Normalize origin for CORS (must include protocol, no trailing slash). */
export function normalizeOrigin(url) {
  if (!url || typeof url !== 'string') return null;
  let origin = url.trim().replace(/\/+$/, '');
  if (!origin) return null;
  if (!/^https?:\/\//i.test(origin)) {
    origin = `https://${origin}`;
  }
  return origin;
}

/** CLIENT_URL may be comma-separated: https://app.netlify.app,https://preview.netlify.app */
export function parseClientOrigins(raw) {
  const fallback = 'http://localhost:5173';
  const source = raw || fallback;
  const origins = source
    .split(',')
    .map((part) => normalizeOrigin(part))
    .filter(Boolean);
  return origins.length ? origins : [normalizeOrigin(fallback)];
}

const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

if (process.env.NODE_ENV === 'production') {
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-intelligence',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  // Set REDIS_ENABLED=true only when Redis is running (BullMQ background jobs)
  redisEnabled: process.env.REDIS_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@resumeintel.com',
  },
  clientOrigins: parseClientOrigins(process.env.CLIENT_URL),
  clientUrl: parseClientOrigins(process.env.CLIENT_URL)[0],
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};
