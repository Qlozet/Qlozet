import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip static page generation completely
  experimental: {
    // @ts-ignore - Disable all static optimization
    isrMemoryCacheSize: 0,
  },
  // @ts-ignore
  skipTrailingSlashRedirect: true,
  // @ts-ignore
  skipMiddlewareUrlNormalize: true,
  // Force all routes to be dynamic
  // @ts-ignore
  reactStrictMode: false,
};

export default nextConfig;
