import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import UIProvider from "@/providers/UIProvider";
import { Suspense } from "react";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Centralized Medical Solutions | Advanced Equipment Management",
  description: "Multi-tenant hospital equipment management SaaS platform built for healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-[#0A1628]">
        <QueryProvider>
          <Suspense fallback={null}>
            <UIProvider>
              {children}
            </UIProvider>
          </Suspense>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
