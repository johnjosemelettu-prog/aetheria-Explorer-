import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Required for Capacitor mobile deployment */
  // output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
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
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['3000-firebase-aetheria-explorer-1775035905541.cluster-aic6jbiihrhmyrqafasatvzbwe.cloudworkstations.dev'],
};

export default nextConfig;
