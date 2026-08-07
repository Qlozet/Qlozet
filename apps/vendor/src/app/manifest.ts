import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/seo';

// Web app manifest — drives the installed-app name, splash colours and icon on
// Android/desktop. Served at /manifest.webmanifest and linked automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Business Management`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    categories: ['business', 'productivity', 'shopping'],
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        type: 'image/png',
        sizes: '180x180',
        purpose: 'maskable',
      },
    ],
  };
}
