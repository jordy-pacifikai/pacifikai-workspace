import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Povai Lodge | Chambres d'hotes a Bora Bora",
  description:
    "Vivez l'experience authentique de la Polynesie dans notre lodge intime de 3 chambres a Bora Bora. Bungalows sur pilotis, vue lagon, accueil personnalise.",
  keywords: [
    "Bora Bora",
    "chambres d'hotes",
    "lodge",
    "Polynesie francaise",
    "bungalow",
    "lagon",
    "vacances",
    "hebergement",
  ],
  openGraph: {
    title: "Povai Lodge | Chambres d'hotes a Bora Bora",
    description:
      "Vivez l'experience authentique de la Polynesie dans notre lodge intime de 3 chambres a Bora Bora.",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/images/povai-hero.png",
        width: 1200,
        height: 630,
        alt: "Povai Lodge - Bora Bora",
      },
    ],
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: "Povai Lodge",
      description:
        "Chambres d'hotes de charme a Bora Bora, Polynesie francaise",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bora Bora",
        addressCountry: "PF",
      },
      telephone: "+689 89 53 83 87",
      numberOfRooms: 3,
      starRating: {
        "@type": "Rating",
        ratingValue: "5",
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
