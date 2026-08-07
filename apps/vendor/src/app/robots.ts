import type { MetadataRoute } from 'next';

import { INDEXABLE, siteConfig } from '@/lib/seo';

// Private vendor dashboard — crawlers are disallowed outright rather than
// per-path, so no vendor route is disclosed via robots.txt itself. Flip
// `INDEXABLE` in src/lib/seo.ts to open it up.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/auth/', '/api/'] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
