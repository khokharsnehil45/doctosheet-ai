import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider, themeScript } from '@/lib/ThemeContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://doctosheet.ai'),
  title: 'DocToSheet AI - Turn Bank Statements, Invoices & PDFs into Clean Spreadsheets',
  description:
    'Production-grade AI micro-SaaS to extract and structure bank statements, invoices, receipts, and legal leases into clean CSV and Excel downloads in seconds.',
  keywords: [
    'bank statement to csv',
    'convert invoice to excel',
    'pdf to sheet converter',
    'ocr bank statement',
    'extract table from pdf',
    'financial document ai extractor',
    'lease abstract spreadsheet',
  ],
  authors: [{ name: 'DocToSheet Team' }],
  openGraph: {
    title: 'DocToSheet AI - Instant Document to CSV & Excel Generator',
    description:
      'Extract unstructured bank statements, invoices, and PDFs into clean tabular spreadsheets in 1 click.',
    url: 'https://doctosheet.ai',
    siteName: 'DocToSheet AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocToSheet AI - Instant Document to Excel & CSV Generator',
    description:
      'Convert financial PDFs, bank statements, and invoices into structured spreadsheets with AI OCR.',
  },
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
