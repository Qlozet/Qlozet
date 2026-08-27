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
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the script below edits <html>'s class before
    // React hydrates, which would otherwise be reported as a mismatch.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${roboto_mono.variable} font-poppins antialiased`}
      >
        {/* Applies the saved theme before first paint. Deferring this to a
            React effect would flash the light palette on every load for a
            user who chose dark. Mirrors the vendor app, and reads the same
            `darkMode` key so the two consoles agree on one origin. */}
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
