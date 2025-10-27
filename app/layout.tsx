// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/ui/navbar";           // ✅ default import (matches file)
import { Footer } from "@/components/ui/footer";
import { Toaster } from "@/components/ui/sonner";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Inner Personas",
  description: "Assessments and insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <Navbar />                                    {/* ✅ use default export */}
          {children}
          <Footer />
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
