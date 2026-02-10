// lib/config.ts
export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  // Ably (Real-time communication)
  ably: {
    token: process.env.ABLY_TOKEN || '',
    apiKey: process.env.ABLY_API_KEY || '',
  },
  
  // Upstash Redis
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },
  
  // QStash (Message queuing)
  qstash: {
    url: process.env.QSTASH_URL || '',
    token: process.env.QSTASH_TOKEN || '',
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
  },
  
  // Cloudflare R2
  r2: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    publicUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '',
  },
  
  // Application
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

// Fungsi untuk memvalidasi konfigurasi
export function validateConfig() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_ACCOUNT_ID',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
}