import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { ClientNavbar } from "@/components/ui/client-navbar";
import { Footer } from "@/components/ui/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leadership Personas Assessment",
  description: "Discover your leadership persona through behavioral reflection statements and identify growth opportunities.",
  keywords: "leadership, assessment, personas, behavioral reflection, leadership development",
  authors: [{ name: "Leadership Personas Assessment" }],
  openGraph: {
    title: "Leadership Personas Assessment",
    description: "Discover your leadership persona through behavioral reflection statements and identify growth opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <SessionProviderWrapper>
          <div className="min-h-screen flex flex-col">
            <ClientNavbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
