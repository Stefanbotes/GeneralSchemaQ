// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
// If you use next-themes + shadcn:
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'General Schema',
  description: '…',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* If you don't use next-themes, you can put className="dark" on <html> manually */}
      <body className="bg-background text-foreground antialiased">
        {/* If using next-themes, wrap children so .dark class is applied to html */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
