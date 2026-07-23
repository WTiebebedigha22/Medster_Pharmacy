import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase (Local Database)
  supabase: {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // iRECPlus API
  irec: {
    apiUrl: process.env.IREC_API_URL || 'https://api.irec.com/v1',
    apiKey: process.env.IREC_API_KEY || '',
    timeout: parseInt(process.env.IREC_API_TIMEOUT || '60000', 10),
    syncInterval: process.env.IREC_SYNC_INTERVAL || '*/30 * * * *',
    maxRetries: parseInt(process.env.IREC_MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.IREC_RETRY_DELAY || '2000', 10),
  },

  // JWT (Custom Auth)
  jwt: {
    secret: process.env.JWT_SECRET || 'medster-pharmacy-jwt-secret-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Paystack
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:5173/checkout/verify',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  },

  // Cloud Storage (for prescriptions)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

// Validate required config
const requiredVars = [
  { key: 'supabase.url', value: config.supabase.url },
  { key: 'supabase.anonKey', value: config.supabase.anonKey },
  { key: 'irec.apiKey', value: config.irec.apiKey },
  { key: 'paystack.secretKey', value: config.paystack.secretKey },
  { key: 'jwt.secret', value: config.jwt.secret },
];

if (config.nodeEnv === 'production') {
  for (const { key, value } of requiredVars) {
    if (!value || value.includes('placeholder') || value === 'your-key-here') {
      console.warn(`⚠️ Missing required config: ${key}`);
    }
  }
}

export default config;
