"use client";

export default function PerspectivesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="pt-32 pb-16 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Perspectives
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Analyses, notes de position et réflexions sur les sujets que nous
            connaissons - pour alimenter le débat et éclairer les décisions.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {[
              {
                title: "L'avenir de la desserte inter-îles : scénarios 2030",
                description:
                  "Quels modèles économiques et réglementaires pour connecter durablement les archipels polynésiens ? Analyse prospective des scénarios possibles.",
              },
              {
                title: "Drones civils dans le Pacifique",
                description:
                  "Opportunités, cadre réglementaire et cas d'usage concrets pour l'intégration des drones dans les opérations insulaires.",
              },
              {
                title:
                  "EISA : retour d'expérience sur la sécurisation des travaux aéroportuaires",
                description:
                  "Après 10 études d'impact réalisées, quels enseignements tirer pour améliorer la méthodologie et renforcer la culture de sécurité ?",
              },
              {
                title:
                  "Sécurité et sûreté : vers une approche intégrée des risques",
                description:
                  "Comment décloisonner la sécurité (safety) et la sûreté (security) pour une gestion des risques plus efficace sur les plateformes aéroportuaires.",
              },
              {
                title: "Vivriers locaux et souveraineté alimentaire",
                description:
                  "Structurer les filières locales pour nourrir les territoires insulaires : retour sur le projet TAVIVAT et perspectives de développement.",
              },
            ].map((article) => (
              <article
                key={article.title}
                className="group relative p-8 border border-warm-100 rounded-2xl hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-navy mb-3 group-hover:text-gold transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-warm-500 text-sm leading-relaxed">
                      {article.description}
                    </p>
                  </div>
                  <span className="shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 rounded-full">
                    À venir
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-warm-400 text-sm">
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
    </main>
  );
}
