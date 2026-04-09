import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Cabinet",
  description:
    "Pacific Blue Consulting, cabinet de conseil indépendant fondé en 2017 par Pascal Bazer-Bachi, ancien Directeur de l'Aviation Civile de Polynésie française.",
};

export default function LeCabinetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
