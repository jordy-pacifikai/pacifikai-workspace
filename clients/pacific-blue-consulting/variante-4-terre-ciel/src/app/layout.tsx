import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Pacific Blue Consulting — Aviation, Environnement, Territoires insulaires",
  description:
    "Cabinet de conseil independant en aviation civile, environnement et accompagnement strategique pour les territoires insulaires du Pacifique. 60+ missions depuis 2017.",
  openGraph: {
    title: "Pacific Blue Consulting",
    description:
      "Votre boussole dans un monde complexe. Aviation, Environnement, Territoires insulaires du Pacifique.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${ibmPlex.variable}`}>
      <body className="antialiased">
        <SmoothScroll />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
