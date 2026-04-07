import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/webp'], // Definitively resolve AVIF decoding errors on iOS (err=-39)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Removed experimental.appDir as it's no longer a valid experimental key
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
