import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Campaign CRM — PACIFIK\'AI',
  description: 'Pipeline de prospection B2B — PACIFIK\'AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased bg-[var(--bg)] text-[var(--text)] min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
