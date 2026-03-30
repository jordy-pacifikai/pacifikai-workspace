import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Blog | PACIFIK'AI — Automatisation IA en Polynésie",
  description:
    "Cas concrets d'entreprises qui transforment leurs opérations avec l'intelligence artificielle. Insights, tendances et focus Polynésie.",
  openGraph: {
    title: "Blog | PACIFIK'AI — Automatisation IA en Polynésie",
    description:
      "Découvrez comment les entreprises leaders utilisent l'IA pour transformer leurs opérations.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
