import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question, un appel d'offres, une idée à explorer — nous sommes à votre écoute. Premier échange sans engagement.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
