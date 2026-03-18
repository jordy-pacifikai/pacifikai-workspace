import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
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
        url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80",
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
        className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
