import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // CORS and security headers for Threekit integration
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
      {
        // matching all routes for Threekit resources
        source: "/(.*)",
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://preview.threekit.com https://*.threekit.com https://admin.threekit.com; connect-src 'self' https://preview.threekit.com https://*.threekit.com https://admin.threekit.com wss://*.threekit.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:; frame-src 'self' https://preview.threekit.com https://*.threekit.com; worker-src 'self' blob:; media-src 'self' blob: data:;"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          }
        ]
      }
    ];
  },
  
  // Configure domains for external resources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'preview.threekit.com',
      },
      {
        protocol: 'https',
        hostname: 'admin.threekit.com',
      },
      {
        protocol: 'https',
        hostname: '*.threekit.com',
      },
    ],
  },
  
  // Proxy rewrites for Threekit API calls to handle CORS
  async rewrites() {
    return [
      {
        source: '/api/threekit/:path*',
        destination: 'https://preview.threekit.com/:path*',
      },
    ];
  },
};

export default nextConfig;