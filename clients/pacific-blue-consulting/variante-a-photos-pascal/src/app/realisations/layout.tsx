import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description:
    "Plus de 60 missions réalisées en Polynésie française, Nouvelle-Calédonie et dans le Pacifique. Des projets concrets, des résultats mesurables.",
};

export default function RealisationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
