
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@aetheria/shared'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  allowedDevOrigins: ['192.168.0.183'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
