import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tōroʻa Numera & IA i Tahiti | PACIFIK'AI — Tahua Natirara, Chatbots, Faʻanahora",
  description:
    "PACIFIK'AI, tōroʻa numera i Tahiti, ʻite rahi i te IA. Hāmani tahua natirara, chatbots IA, ʻāpiti, faʻanahora e te tātaraʻa numera nō te mau ʻohipa tumu i Pōrīnetia farāni.",
  alternates: {
    canonical: "https://pacifikai.com/ty",
    languages: {
      fr: "https://pacifikai.com/",
      ty: "https://pacifikai.com/ty",
    },
  },
  openGraph: {
    title: "Tōroʻa Numera & IA i Tahiti | PACIFIK'AI",
    description:
      "PACIFIK'AI, tōroʻa numera i Tahiti, ʻite rahi i te IA. Hāmani tahua natirara, chatbots IA, faʻanahora nō te mau ʻohipa tumu i Pōrīnetia farāni.",
    url: "https://pacifikai.com/ty",
    type: "website",
    locale: "ty_PF",
  },
};

export default function TahitianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div lang="ty">{children}</div>;
}
