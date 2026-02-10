import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['r2.cloudflarestorage.com'], // Ganti dengan domain R2 Anda
    formats: ['image/webp', 'image/avif'],
  },
  // Hapus batasan ukuran body untuk upload
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

export default nextConfig;