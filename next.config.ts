import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['estrous-undeferentially-maci.ngrok-free.dev'],
  images: {
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cf.shopee.com.br',
      },
    ],
  },
};

export default nextConfig;
