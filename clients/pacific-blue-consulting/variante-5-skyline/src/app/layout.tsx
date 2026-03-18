import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pacific Blue Consulting | Conseil Aviation & Environnement",
  description:
    "Cabinet de conseil specialise en aviation civile et environnement en Polynesie francaise. 60+ missions realisees depuis 2017.",
  keywords: [
    "conseil aviation",
    "environnement Polynesie",
    "AMO",
    "etudes strategiques",
    "Pacific Blue Consulting",
  ],
  openGraph: {
    title: "Pacific Blue Consulting | Votre boussole dans un monde complexe",
    description:
      "Cabinet de conseil en aviation civile et environnement, Punaauia, Tahiti.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
