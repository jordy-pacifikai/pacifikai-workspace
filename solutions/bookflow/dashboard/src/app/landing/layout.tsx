import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ve'a — Chatbot IA de Réservation par WhatsApp | Polynésie française",
  description:
    "Automatisez vos réservations par WhatsApp, Messenger et Instagram. Solution IA conçue pour les entreprises en Polynésie française. 14 jours d'essai gratuit.",
  openGraph: {
    title: "Ve'a — Réservation automatisée par WhatsApp",
    description:
      "Le chatbot IA qui gère vos rendez-vous 24/7 par WhatsApp. Pour salons, restaurants, cabinets médicaux en Polynésie.",
    type: 'website',
    url: 'https://vea.pacifikai.com',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: "Ve'a — Chatbot IA de Réservation",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ve'a — Chatbot IA de Réservation par WhatsApp",
    description:
      "Automatisez vos réservations par WhatsApp, Messenger et Instagram. 14 jours d'essai gratuit.",
    images: ['/icons/og-image.png'],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
