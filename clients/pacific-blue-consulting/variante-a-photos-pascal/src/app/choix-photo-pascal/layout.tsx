import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choix photo — Pacific Blue Consulting",
  description: "Page privée — choix de portrait pour la page Le Cabinet.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ChoixPhotoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
