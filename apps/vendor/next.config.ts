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

  // @ts-ignore
  skipTrailingSlashRedirect: true,
  // @ts-ignore
  skipMiddlewareUrlNormalize: true,
  // Force all routes to be dynamic
  // @ts-ignore
  reactStrictMode: false,
};

export default nextConfig;
