import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* Critical for Capacitor & Static Deployment */
  output: 'export',
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
  outputFileTracingRoot: path.join(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
