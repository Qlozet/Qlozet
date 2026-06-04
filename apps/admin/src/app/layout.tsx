// Qlozet Admin Layout — last deployed 2026-06-04
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/redux/provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Qlozet Admin",
  description: "Qlozet admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
