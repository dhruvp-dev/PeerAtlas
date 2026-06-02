import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' https://www.clarity.ms https://static.cloudflareinsights.com; connect-src 'self' https://www.clarity.ms https://*.clarity.ms https://static.cloudflareinsights.com; img-src 'self' data: https://www.clarity.ms https://*.clarity.ms https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:" },
        ],
      },
    ];
  },
};

export default nextConfig;
