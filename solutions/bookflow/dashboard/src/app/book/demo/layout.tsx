import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Démo Ve'a — Testez la réservation en ligne",
  description:
    "Essayez le flux de réservation Ve'a en conditions réelles. Découvrez comment vos clients prendront rendez-vous en quelques clics.",
  openGraph: {
    title: "Démo Ve'a — Testez la réservation IA",
    description:
      "Testez le booking flow Ve'a : sélection du service, choix du créneau et confirmation instantanée.",
    type: 'website',
    url: 'https://vea.pacifikai.com/book/demo',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: "Démo Ve'a — Réservation en ligne",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Démo Ve'a — Testez la réservation en ligne",
    description:
      "Découvrez le booking flow Ve'a : réservation IA en quelques clics.",
    images: ['/icons/og-image.png'],
  },
};

export default function BookDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
