import type { Metadata } from "next";
import { generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contactez PACIFIK'AI | Agence Digitale & IA à Papeete, Tahiti",
  description:
    "Contactez PACIFIK'AI, agence digitale et IA à Papeete, Tahiti. Devis gratuit sous 24h pour création de site web, chatbot IA, automatisation et marketing digital en Polynésie française.",
  alternates: {
    canonical: "https://pacifikai.com/contact",
  },
  openGraph: {
    title: "Contactez PACIFIK'AI | Agence IA Tahiti",
    description:
      "Devis gratuit sous 24h. Création de site web, chatbot IA, automatisation pour entreprises en Polynésie française.",
    url: "https://pacifikai.com/contact",
    locale: "fr_PF",
    type: "website",
  },
};

const BREADCRUMB_SCHEMA = generateBreadcrumbSchema([
  { name: "Accueil", url: "https://pacifikai.com" },
  { name: "Contact", url: "https://pacifikai.com/contact" },
]);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }}
      />
      {children}
    </>
  );
}
