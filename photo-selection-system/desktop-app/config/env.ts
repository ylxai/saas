// config/env.ts
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Interface untuk konfigurasi aplikasi
export interface AppConfig {
  databaseUrl: string;
  cloudflareR2: {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    accountId: string;
    publicUrl: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

// Fungsi untuk mendapatkan konfigurasi
export function getAppConfig(): AppConfig {
  // Validasi variabel lingkungan
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const cloudflareR2 = {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    publicUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL,
  };

  // Validasi konfigurasi R2
  if (!cloudflareR2.accessKeyId) {
    throw new Error('CLOUDFLARE_R2_ACCESS_KEY_ID is not defined in environment variables');
  }
  if (!cloudflareR2.secretAccessKey) {
    throw new Error('CLOUDFLARE_R2_SECRET_ACCESS_KEY is not defined in environment variables');
  }
  if (!cloudflareR2.bucketName) {
    throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not defined in environment variables');
  }
  if (!cloudflareR2.accountId) {
    throw new Error('CLOUDFLARE_R2_ACCOUNT_ID is not defined in environment variables');
  }
  if (!cloudflareR2.publicUrl) {
    throw new Error('NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL is not defined in environment variables');
  }

  return {
    databaseUrl,
    cloudflareR2,
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
  };
}

// Fungsi untuk memvalidasi konfigurasi
export function validateConfig(config: AppConfig): boolean {
  try {
    // Validasi URL database
    new URL(config.databaseUrl);
    
    // Validasi konfigurasi R2
    new URL(`https://${config.cloudflareR2.publicUrl}`);
    
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
}

// Dapatkan konfigurasi aplikasi
export const appConfig = getAppConfig();

// Validasi konfigurasi saat startup
if (!validateConfig(appConfig)) {
  throw new Error('Application configuration is invalid');
}