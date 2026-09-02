import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

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
    <html lang="en" className="h-full bg-[#fafafa]">
      <body className="min-h-full font-sans antialiased text-zinc-900 bg-[#fafafa]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
