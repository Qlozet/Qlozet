// Self-hosted via next/font/local (files alongside this index) instead of
// next/font/google: the Google fetch happens at BUILD time and intermittently
// fails the Vercel build ("module not found" on the generated font CSS). Local
// files make the build deterministic and offline-safe. Same CSS variables +
// weights as before, so nothing else changes.
import localFont from 'next/font/local';

// Variable font — one file covers the whole weight range.
export const dmsans = localFont({
  src: './dm-sans-var.woff2',
  weight: '300 700',
  style: 'normal',
  variable: '--font-dmsans',
  display: 'swap',
});

export const poppins = localFont({
  src: [
    { path: './poppins-400.woff2', weight: '400', style: 'normal' },
    { path: './poppins-500.woff2', weight: '500', style: 'normal' },
    { path: './poppins-600.woff2', weight: '600', style: 'normal' },
    { path: './poppins-700.woff2', weight: '700', style: 'normal' },
    { path: './poppins-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

export const roboto_mono = localFont({
  src: './roboto-mono-var.woff2',
  weight: '300 700',
  style: 'normal',
  variable: '--font-robotoMono',
  display: 'swap',
});

export const inter = localFont({
  src: './inter-var.woff2',
  weight: '300 500',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
});
