import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/lib/SmoothScroll";
import StickyCTA from "@/components/StickyCTA";
import SourceTracer from "@/components/SourceTracer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pacific Blue Consulting | Architecte de projets complexes dans le Pacifique",
    template: "%s | Pacific Blue Consulting",
  },
  description:
    "Cabinet de conseil indépendant en Polynésie française. Structuration de projets complexes en transport aérien, sécurité aéroportuaire, infrastructures, environnement et développement territorial dans le Pacifique.",
  keywords: [
    "conseil aviation civile",
    "polynesie francaise",
    "consultant aerien",
    "securite aeroportuaire",
    "transport aerien",
    "EISA",
    "environnement",
    "souverainete alimentaire",
    "Pacific Blue Consulting",
    "Tahiti",
    "Pacifique",
    "aeroport",
    "infrastructure insulaire",
  ],
  authors: [{ name: "Pacific Blue Consulting" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Pacific Blue Consulting",
    title: "Pacific Blue Consulting | Architecte de projets complexes dans le Pacifique",
    description:
      "Cabinet de conseil en Polynésie française. Structuration de projets complexes en transport aérien, sécurité aéroportuaire, environnement et développement territorial.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ConsultingBusiness",
              name: "Pacific Blue Consulting",
              description:
                "Cabinet de conseil en Polynésie française. Structuration de projets complexes en transport aérien, sécurité aéroportuaire, environnement et développement territorial.",
              url: "https://pacificblueconsulting.com",
              telephone: "+689-87-747-284",
              email: "contact@pacificblueconsulting.org",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Punaauia",
                addressRegion: "Tahiti",
                addressCountry: "PF",
              },
              founder: {
                "@type": "Person",
                name: "Pascal BAZER-BACHI",
                jobTitle: "Fondateur - Ancien Directeur de l'Aviation Civile de Polynésie française",
              },
              foundingDate: "2017",
              areaServed: [
                "Polynésie française",
                "Nouvelle-Calédonie",
                "Pacifique Sud",
              ],
              knowsAbout: [
                "Aviation civile",
                "Aéroports",
                "Environnement",
                "Bilan carbone",
                "AMO",
                "Pilotage de projets",
              ],
            }),
          }}
        />
      </head>
      <body className="font-body antialiased">
        <SmoothScroll>
          <Header />
          <main>{children}</main>
          <Footer />
          <StickyCTA />
          <SourceTracer />
        </SmoothScroll>
      </body>
    </html>
  );
}
