import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos offres",
  description:
    "Quatre territoires d'intervention au service du Pacifique : transport aérien, infrastructures, environnement et transformation des compétences.",
};

export default function OffresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
