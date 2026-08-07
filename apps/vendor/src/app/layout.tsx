import './assets/styles/globals.css';
import React from 'react';
import { inter, poppins, roboto_mono } from './assets/fonts';
import { Metadata, Viewport } from 'next';
import { Providers } from '@/redux/provider';
import { rootMetadata, siteConfig } from '@/lib/seo';

// Title/description/OG/Twitter/robots all live in src/lib/seo.ts.
// Icons come from the file conventions in this directory: icon.svg,
// apple-icon.png, favicon.ico and opengraph-image.png.
export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColor },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${roboto_mono.variable} font-poppins antialiased relative bg-background flex justify-center`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('darkMode') === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
