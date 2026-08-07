import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: any = {
  // Pin the monorepo root. Without this Next walks up looking for a lockfile
  // and can land outside the repo (e.g. a stray package-lock.json in the home dir).
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
    ],
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },

  // @ts-ignore
  skipTrailingSlashRedirect: true,
  // @ts-ignore
  skipProxyUrlNormalize: true,
  // Force all routes to be dynamic
  // @ts-ignore
  reactStrictMode: false,
};

export default nextConfig;
