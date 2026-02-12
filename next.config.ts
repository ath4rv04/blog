import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [ 
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'majestic-pheasant-482.convex.cloud',
        port: '',
      },
    ],
  },
};

export default nextConfig;
