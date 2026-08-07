// Typography, mirrored from the vendor app (apps/vendor/src/app/assets/fonts)
// so both consoles render in the same typeface. Poppins is the UI font; Inter
// and Roboto Mono are exposed as variables for the same reason vendor does.
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';

export const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin-ext', 'latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const inter = Inter({
  weight: ['300', '400', '500'],
  style: 'normal',
  subsets: ['latin-ext', 'latin'],
  variable: '--font-inter',
});

export const roboto_mono = Roboto_Mono({
  weight: ['300', '400', '500', '600', '700'],
  style: 'normal',
  subsets: ['latin-ext', 'latin'],
  variable: '--font-robotoMono',
});
