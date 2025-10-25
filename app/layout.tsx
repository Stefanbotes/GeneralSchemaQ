// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'General Schema',
  description: '…',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"           // puts "dark" or "light" on <html>
          defaultTheme="light"        // or "system"
          enableSystem
          disableTransitionOnChange   // avoids janky color transitions on theme toggle
          storageKey="gs-theme"       // optional: custom localStorage key
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

