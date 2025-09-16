import React from "react";
import { poppins } from "./assets/fonts";
import "./assets/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "@/redux/provider";

export const metadata: Metadata = {
  title: "Qlozet Vendor - Business Management Platform",
  description: "Comprehensive business management platform for clothing vendors and retailers",
  keywords: ["vendor", "ecommerce", "clothing", "business management"],
  authors: [{ name: "Qlozet Team" }],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${poppins.variable} bg-gray-100`}>
      <body className="font-sans antialiased relative bg-background flex justify-center">
        <Providers>
          {children}
        </Providers>
      </body>
    </html >
  );
}
