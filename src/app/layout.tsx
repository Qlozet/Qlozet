import './assets/styles/globals.css';
import React from 'react';
import { poppins } from './assets/fonts';
import { Metadata } from 'next';
import { Providers } from '@/redux/provider';

export const metadata: Metadata = {
  title: 'Qlozet Vendor - Business Management Platform',
  description:
    'Comprehensive business management platform for clothing vendors and retailers',
  keywords: ['vendor', 'ecommerce', 'clothing', 'business management'],
  authors: [{ name: 'Qlozet Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${poppins.variable} font-sans antialiased relative bg-background flex justify-center`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
