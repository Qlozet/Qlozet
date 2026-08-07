import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url('Invalid URL format'),
    // Public origin this app is served from. Used for metadataBase, canonical
    // URLs and absolute OG image URLs (src/lib/seo.ts). Optional — falls back
    // to localhost so local builds don't fail.
    NEXT_PUBLIC_SITE_URL: z.string().url('Invalid URL format').optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
