import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the monorepo root. Without this Next walks up looking for a lockfile
  // and can land outside the repo (e.g. a stray package-lock.json in the home dir).
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
};

export default nextConfig;
