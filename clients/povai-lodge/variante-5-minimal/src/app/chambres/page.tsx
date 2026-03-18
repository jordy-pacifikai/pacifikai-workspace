import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chambres — POVAI LODGE",
  description: "Trois fare d'exception face au lagon de Bora Bora.",
};

const chambres = [
  {
    id: "miti",
    nom: "Fare Miti",
    image: "/images/povai-chambre-miti.png",
    description:
      "Directement sur le lagon, Fare Miti offre un panorama absolu sur les eaux turquoise. Terrasse privée, accès direct à l'eau.",
    equipements: ["Lit king", "Terrasse lagon", "Climatisation", "Douche pluie", "Coffre-fort"],
    prix: "25 000",
  },
  {
    id: "mahana",
    nom: "Fare Mahana",
    image: "/images/povai-chambre-mahana.png",
    description:
      "Baignée de soleil, Fare Mahana ouvre sur un jardin tropical luxuriant. Un cocon de lumière et de sérénité.",
    equipements: ["Lit queen", "Jardin tropical", "Climatisation", "Salle de bain ouverte", "Minibar"],
    prix: "20 000",
  },
  {
    id: "moana",
    nom: "Fare Moana",
    image: "/images/povai-chambre-moana.png",
    description:
      "En hauteur, Fare Moana domine le lagon avec une vue dégagée sur le mont Otemanu. Le refuge ultime.",
    equipements: ["Lit king", "Vue Otemanu", "Climatisation", "Baignoire", "Balcon privé"],
    prix: "22 000",
  },
];

export default function ChambresPage() {
  return (
    <>
      {/* Header spacer */}
      <div className="h-24" />

      {chambres.map((chambre, i) => (
        <section key={chambre.id} className="mb-8 md:mb-0">
          {/* Chambre name */}
          <FadeIn className="px-6 md:px-12 pt-16 md:pt-24 pb-6">
            <p className="text-xs uppercase tracking-wider text-muted">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="font-serif font-light text-2xl md:text-4xl tracking-wide mt-2">
              {chambre.nom}
            </h2>
          </FadeIn>

          {/* Full image */}
          <div className="relative w-full h-[70vh] md:h-[90vh]">
            <Image
              src={chambre.image}
              alt={chambre.nom}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>

          {/* Details */}
          <FadeIn className="px-6 md:px-12 py-12 md:py-16 max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-muted leading-relaxed max-w-prose-lg mb-8">
              {chambre.description}
            </p>

            {/* Equipements */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
              {chambre.equipements.map((eq) => (
                <span
                  key={eq}
                  className="text-xs uppercase tracking-wider text-muted"
                >
                  {eq}
                </span>
              ))}
            </div>

            {/* Prix + CTA */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="font-serif text-xl tracking-wide">
                {chambre.prix} <span className="text-sm text-muted">XPF / nuit</span>
              </p>
              <Link
                href={`/reservation?chambre=${chambre.id}`}
                className="link-underline text-sm uppercase tracking-wider"
              >
                Réserver cette chambre
              </Link>
            </div>
          </FadeIn>

          {/* Separator */}
          {i < chambres.length - 1 && (
            <div className="w-12 h-px bg-muted/30 mx-auto my-8" />
          )}
        </section>
      ))}
    </>
  );
}
