import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

const chambres = [
  {
    nom: "Fare Miti",
    image: "/images/povai-chambre-miti.png",
    description: "Face au lagon, le silence de l'eau.",
    prix: "25 000 XPF / nuit",
  },
  {
    nom: "Fare Mahana",
    image: "/images/povai-chambre-mahana.png",
    description: "Baignée de lumière, ouverte sur le jardin tropical.",
    prix: "20 000 XPF / nuit",
  },
  {
    nom: "Fare Moana",
    image: "/images/povai-chambre-moana.png",
    description: "Entre ciel et mer, un refuge de quiétude.",
    prix: "22 000 XPF / nuit",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero — text only, white space */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1
          className="font-serif font-light tracking-widest uppercase text-center"
          style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
        >
          Povai Lodge
        </h1>
        <p className="text-muted text-sm tracking-wider uppercase mt-4">
          Bora Bora
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 scroll-indicator">
          <svg
            width="20"
            height="30"
            viewBox="0 0 20 30"
            fill="none"
            className="text-muted"
          >
            <rect
              x="1"
              y="1"
              width="18"
              height="28"
              rx="9"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="10" cy="10" r="2" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Full-bleed image */}
      <section className="w-full h-[80vh] relative">
        <Image
          src="/images/povai-hero.png"
          alt="Vue panoramique du lagon de Bora Bora depuis Povai Lodge"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </section>

      {/* Statement */}
      <FadeIn>
        <section className="py-32 md:py-40 px-6 flex items-center justify-center">
          <p className="font-serif italic font-light text-2xl md:text-3xl lg:text-4xl text-center max-w-prose leading-relaxed">
            Trois chambres d&apos;exception au bord du plus beau lagon du monde.
          </p>
        </section>
      </FadeIn>

      {/* Chambres */}
      <section className="px-6 md:px-12 pb-32">
        {chambres.map((chambre, i) => (
          <FadeIn
            key={chambre.nom}
            delay={i * 100}
            className="mb-24 md:mb-32 last:mb-0"
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="font-serif font-light text-3xl md:text-5xl tracking-wide mb-8">
                {chambre.nom}
              </h2>
              <div className="relative w-full h-[50vh] md:h-[60vh]">
                <Image
                  src={chambre.image}
                  alt={chambre.nom}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 90vw"
                />
              </div>
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p className="text-muted text-base">{chambre.description}</p>
                <p className="font-serif text-lg tracking-wide">
                  {chambre.prix}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* CTA */}
      <FadeIn>
        <section className="py-24 md:py-32 flex items-center justify-center">
          <Link
            href="/reservation"
            className="link-underline font-serif text-xl md:text-2xl tracking-wide"
          >
            Réserver
          </Link>
        </section>
      </FadeIn>
    </>
  );
}
