import type { Metadata, Viewport } from 'next';
import './globals.css';
import { inter, poppins, roboto_mono } from './fonts';
import { Providers } from '@/redux/provider';
import { rootMetadata, siteConfig } from '@/lib/seo';

// Title/description/OG/Twitter/robots all live in src/lib/seo.ts.
// Icons come from the file conventions in this directory: icon.svg,
// apple-icon.png, favicon.ico and opengraph-image.png.
export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${roboto_mono.variable} font-poppins antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
