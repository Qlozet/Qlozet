import { DM_Sans, Inter, Poppins, Roboto_Mono } from 'next/font/google';

export const dmsans = DM_Sans({
  weight: ['300', '400', '700'],
  style: 'normal',
  subsets: ['latin-ext', 'latin'],
  variable: '--font-dmsans',
});

export const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin-ext', 'latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const roboto_mono = Roboto_Mono({
  weight: ['300', '400', '500', '600', '700'],
  style: 'normal',
  subsets: ['latin-ext', 'latin'],
  variable: '--font-robotoMono',
});

export const inter = Inter({
  weight: ['300', '400', '500'],
  style: 'normal',
  subsets: ['latin-ext', 'latin'],
  variable: '--font-inter',
});
