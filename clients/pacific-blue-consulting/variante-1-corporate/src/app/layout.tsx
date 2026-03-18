import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/lib/SmoothScroll";
import StickyCTA from "@/components/StickyCTA";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pacific Blue Consulting | Conseil Aviation, Environnement & Projets Complexes",
    template: "%s | Pacific Blue Consulting",
  },
  description:
    "Cabinet de conseil independant specialise en aviation civile, environnement et pilotage de projets complexes en Polynesie francaise et dans le Pacifique. 60+ missions depuis 2017.",
  keywords: [
    "conseil aviation civile",
    "polynesie francaise",
    "consultant aerien",
    "bilan carbone aviation",
    "AMO aeroportuaire",
    "Pacific Blue Consulting",
    "Tahiti",
    "Pacifique",
    "environnement",
    "aeroport",
  ],
  authors: [{ name: "Pacific Blue Consulting" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Pacific Blue Consulting",
    title: "Pacific Blue Consulting | Votre boussole dans un monde complexe",
    description:
      "Cabinet de conseil independant : aviation civile, environnement, pilotage de projets. 60+ missions en Polynesie francaise et dans le Pacifique.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${dmSerif.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ConsultingBusiness",
              name: "Pacific Blue Consulting",
              description:
                "Cabinet de conseil independant specialise en aviation civile, environnement et pilotage de projets dans le Pacifique.",
              url: "https://pacificblueconsulting.com",
              telephone: "+689-87-747-284",
              email: "pacificblueconsulting@zoho.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Punaauia",
                addressRegion: "Tahiti",
                addressCountry: "PF",
              },
              founder: {
                "@type": "Person",
                name: "Pascal BAZER-BACHI",
                jobTitle: "Fondateur - Ancien Directeur de l'Aviation Civile de Polynesie francaise",
              },
              foundingDate: "2017",
              areaServed: [
                "Polynesie francaise",
                "Nouvelle-Caledonie",
                "Pacifique Sud",
              ],
              knowsAbout: [
                "Aviation civile",
                "Aeroports",
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
        </SmoothScroll>
      </body>
    </html>
  );
}
