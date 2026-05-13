import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Perspectives",
  description:
    "Analyses, notes de position et réflexions sur les sujets que nous connaissons - pour alimenter le débat et éclairer les décisions.",
};

const articles = [
  {
    title: "L'avenir de la desserte inter-îles : scénarios 2030",
    description:
      "Quels modèles économiques et réglementaires pour connecter durablement les archipels polynésiens ? Analyse prospective des scénarios possibles.",
    image: "/images/air-tetiaroa.jpg",
  },
  {
    title: "Drones civils dans le Pacifique",
    description:
      "Opportunités, cadre réglementaire et cas d'usage concrets pour l'intégration des drones dans les opérations insulaires.",
    image: "/images/drone-pf-1.jpg",
  },
  {
    title:
      "EISA : retour d'expérience sur la sécurisation des travaux aéroportuaires",
    description:
      "Après 10 études d'impact réalisées, quels enseignements tirer pour améliorer la méthodologie et renforcer la culture de sécurité ?",
    image: "/images/rgi4.jpg",
  },
  {
    title:
      "Sécurité et sûreté : vers une approche intégrée des risques",
    description:
      "Comment décloisonner la sécurité (safety) et la sûreté (security) pour une gestion des risques plus efficace sur les plateformes aéroportuaires.",
    image: "/images/pbc-aeroport.jpg",
  },
  {
    title: "Vivriers locaux et souveraineté alimentaire",
    description:
      "Structurer les filières locales pour nourrir les territoires insulaires : retour sur le projet TAVIVAT et perspectives de développement.",
    image: "/images/coco.jpg",
  },
];

export default function PerspectivesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden">
        <Image
          src="/images/hero-perspectives.jpg"
          alt="Panorama Pacifique"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy/92" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Perspectives
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
            Analyses, notes de position et réflexions sur les sujets que nous
            connaissons - pour alimenter le débat et éclairer les décisions.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {articles.map((article) => (
              <article
                key={article.title}
                className="group relative flex flex-col md:flex-row overflow-hidden border border-warm-100 rounded-2xl hover:border-gold/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 256px"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="font-display text-xl font-semibold text-navy group-hover:text-gold transition-colors">
                      {article.title}
                    </h2>
                    <span className="shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 rounded-full">
                      À venir
                    </span>
                  </div>
                  <p className="text-warm-500 text-sm leading-relaxed">
                    {article.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-warm-400 text-sm mx-auto max-w-md">
              Ces articles seront publiés progressivement. Restez informé en
              nous suivant sur{" "}
              <a
                href="https://www.linkedin.com/company/pacificblueconsulting/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 underline transition-colors"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
