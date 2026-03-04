import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Ve'a — Assistant IA de reservation | WhatsApp & Messenger",
  description: "Ve'a prend les rendez-vous pour vous sur WhatsApp et Messenger. 24/7, IA conversationnelle, Google Calendar. Pour salons, restaurants, cabinets medicaux en Polynesie francaise.",
  keywords: ['reservation', 'IA', 'WhatsApp', 'Messenger', 'Polynesie', 'chatbot', 'rendez-vous', 'salon', 'restaurant', 'medical'],
  openGraph: {
    title: "Ve'a — Ne perdez plus de clients",
    description: "Assistant IA de reservation sur WhatsApp et Messenger. 24/7, pour les entreprises de Polynesie francaise.",
    url: 'https://vea.pacifikai.com',
    siteName: "Ve'a by PACIFIK'AI",
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ve'a — Assistant IA de reservation",
    description: "Ne perdez plus de clients quand vous ne pouvez pas repondre. WhatsApp & Messenger, 24/7.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-950 text-gray-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
