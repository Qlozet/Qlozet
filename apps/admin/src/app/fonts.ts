// Typography, mirrored from the vendor app so both consoles render in the same
// typeface. Poppins is the UI font; Inter and Roboto Mono are exposed as
// variables. Self-hosted via next/font/local (files in ./fonts) instead of
// next/font/google: the Google fetch happens at BUILD time and intermittently
// fails the Vercel build ("module not found" on the generated font CSS). Local
// files make the build deterministic and offline-safe.
import localFont from 'next/font/local';

export const poppins = localFont({
  src: [
    { path: './fonts/poppins-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/poppins-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

// Variable font — one file covers the 300–500 range used across the app.
export const inter = localFont({
  src: './fonts/inter-var.woff2',
  weight: '300 500',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
});

export const roboto_mono = localFont({
  src: './fonts/roboto-mono-var.woff2',
  weight: '300 700',
  style: 'normal',
  variable: '--font-robotoMono',
  display: 'swap',
});
