import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import LenisProvider from "@/components/LenisProvider";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Povai Lodge | Chambres d'hotes a Bora Bora",
  description:
    "Decouvrez Povai Lodge, 3 chambres d'hotes d'exception au bord du plus beau lagon du monde a Bora Bora, Polynesie francaise.",
  keywords: [
    "Bora Bora",
    "chambre d'hotes",
    "lodge",
    "Polynesie francaise",
    "lagon",
    "vacances",
    "luxe",
  ],
  openGraph: {
    title: "Povai Lodge | Bora Bora",
    description: "Votre refuge au coeur du lagon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="font-sans bg-sand-50 text-ink antialiased">
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </LenisProvider>
      </body>
    </html>
  );
}
