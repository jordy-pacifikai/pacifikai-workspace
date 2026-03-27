import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Tarifs Ve'a — Plans de 0 à 49 900 XPF/mois",
  description:
    "4 plans adaptés à votre activité : Gratuit, Essentiel (9 900 XPF), Pro (24 900 XPF) et Entreprise (49 900 XPF). Essai gratuit 14 jours sur tous les plans payants.",
  openGraph: {
    title: "Tarifs Ve'a — Réservation IA à partir de 0 XPF",
    description:
      "Choisissez le plan qui correspond à votre activité. De gratuit à entreprise, avec 14 jours d'essai sur les plans payants.",
    type: 'website',
    url: 'https://vea.pacifikai.com/pricing',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: "Tarifs Ve'a — Plans de réservation IA",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tarifs Ve'a — Plans de 0 à 49 900 XPF/mois",
    description:
      "4 plans de réservation IA : Gratuit, Essentiel, Pro et Entreprise. 14 jours d'essai gratuit.",
    images: ['/icons/og-image.png'],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
