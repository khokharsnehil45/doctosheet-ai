import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider, themeScript } from '@/lib/ThemeContext';

export const metadata: Metadata = {
  title: 'DocToSheet AI - Turn Unstructured Documents into Clean Spreadsheets',
  description:
    'Production-ready AI micro-SaaS to extract and structure bank statements, invoices, and legal lease agreements into clean CSV and Excel spreadsheets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans antialiased text-zinc-900 bg-[#fafafa] dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
