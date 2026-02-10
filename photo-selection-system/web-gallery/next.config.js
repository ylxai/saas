/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    domains: ['pub-33bf4b9a72a84cc9bac1aa41c2d8f138.r2.dev'], // Ganti dengan domain R2 Anda
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

module.exports = nextConfig;