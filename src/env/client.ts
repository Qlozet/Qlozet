import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url('Invalid URL format'),
    NEXT_PUBLIC_USE_SHADCN_BUTTON: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_SEARCH: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_MODAL: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_INPUT: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_SELECT: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_CHECKBOX: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_CARD: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_TABS: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_TABLE: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default(false),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_USE_SHADCN_BUTTON: process.env.NEXT_PUBLIC_USE_SHADCN_BUTTON,
    NEXT_PUBLIC_USE_SHADCN_SEARCH: process.env.NEXT_PUBLIC_USE_SHADCN_SEARCH,
    NEXT_PUBLIC_USE_SHADCN_MODAL: process.env.NEXT_PUBLIC_USE_SHADCN_MODAL,
    NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY:
      process.env.NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY,
    NEXT_PUBLIC_USE_SHADCN_INPUT: process.env.NEXT_PUBLIC_USE_SHADCN_INPUT,
    NEXT_PUBLIC_USE_SHADCN_SELECT: process.env.NEXT_PUBLIC_USE_SHADCN_SELECT,
    NEXT_PUBLIC_USE_SHADCN_CHECKBOX:
      process.env.NEXT_PUBLIC_USE_SHADCN_CHECKBOX,
    NEXT_PUBLIC_USE_SHADCN_CARD: process.env.NEXT_PUBLIC_USE_SHADCN_CARD,
    NEXT_PUBLIC_USE_SHADCN_TABS: process.env.NEXT_PUBLIC_USE_SHADCN_TABS,
    NEXT_PUBLIC_USE_SHADCN_TABLE: process.env.NEXT_PUBLIC_USE_SHADCN_TABLE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
