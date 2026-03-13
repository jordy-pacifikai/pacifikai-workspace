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
  title: "Ve'a — Assistant IA de reservation | Messenger & Instagram",
  description: "Ve'a prend les rendez-vous pour vous sur Messenger, Instagram et WhatsApp. 24/7, IA conversationnelle, Google Calendar. Pour salons, restaurants, cabinets medicaux en Polynesie francaise.",
  keywords: ['reservation', 'IA', 'Messenger', 'Instagram', 'WhatsApp', 'Polynesie', 'chatbot', 'rendez-vous', 'salon', 'restaurant', 'medical'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Ve'a — Ne perdez plus de clients",
    description: "Assistant IA de reservation sur Messenger, Instagram et WhatsApp. 24/7, pour les entreprises de Polynesie francaise.",
    url: 'https://vea.pacifikai.com',
    siteName: "Ve'a by PACIFIK'AI",
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: "Ve'a — Assistant IA de reservation",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ve'a — Assistant IA de reservation",
    description: "Ne perdez plus de clients quand vous ne pouvez pas repondre. Messenger, Instagram & WhatsApp, 24/7.",
    images: ['/icons/og-image.png'],
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
