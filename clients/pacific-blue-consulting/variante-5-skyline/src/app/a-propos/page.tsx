"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { timeline, valeurs } from "@/lib/data";

function GridIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

const valeurIcons: Record<string, () => JSX.Element> = {
  grid: GridIcon,
  shield: ShieldIcon,
  map: MapIcon,
  zap: ZapIcon,
};

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-off-white relative overflow-hidden">
        <div className="absolute inset-0 geo-grid pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-electric font-semibold text-sm uppercase tracking-wider">
            A propos
          </span>
          <h1
            className="font-display font-bold text-ink mt-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            L&apos;expertise au service
            <br />
            du <span className="text-electric">Pacifique</span>
          </h1>
        </div>
      </section>

      {/* Pascal section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Photo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="w-64 h-64 lg:w-80 lg:h-80 clip-circle overflow-hidden">
                    <Image
                      src="/images/pbc-consulting.png"
                      alt="Pascal Bazer-Bachi, fondateur de Pacific Blue Consulting"
                      width={320}
                      height={320}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Geometric accent */}
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 border-2 border-electric rounded" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                  Fondateur
                </span>
                <h2 className="font-display font-bold text-ink text-2xl lg:text-3xl mt-2 mb-6">
                  Pascal Bazer-Bachi
                </h2>
                <div className="space-y-4 text-slate leading-relaxed">
                  <p>
                    Fort de plus de 30 ans d&apos;experience dans l&apos;aviation civile,
                    dont une carriere de Directeur de l&apos;Aviation Civile en Polynesie
                    francaise, Pascal a fonde Pacific Blue Consulting en 2017.
                  </p>
                  <p>
                    Sa connaissance approfondie des enjeux aeronautiques et
                    environnementaux du Pacifique insulaire lui permet de proposer un
                    conseil strategique de haute valeur, alliant vision internationale et
                    ancrage local.
                  </p>
                  <p>
                    Depuis sa creation, le cabinet a realise plus de 60 missions dans
                    l&apos;ensemble de la Polynesie francaise et dans le Pacifique Sud,
                    couvrant aussi bien la reglementation aerienne que la protection de
                    la biodiversite.
                  </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  {[
                    { value: "30+", label: "ans d'experience" },
                    { value: "60+", label: "missions" },
                    { value: "3", label: "domaines" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <span className="font-display font-bold text-electric text-2xl block">
                        {stat.value}
                      </span>
                      <span className="text-slate text-xs">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-off-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="mb-16">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Parcours
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Notre trajectoire
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 lg:left-6 top-0 bottom-0 w-0.5 bg-electric/20" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <ScrollReveal key={item.year} delay={i * 0.1}>
                  <div className="relative pl-12 lg:pl-16">
                    {/* Dot */}
                    <div className="absolute left-2.5 lg:left-4.5 top-1 w-3 h-3 bg-electric rounded-full border-2 border-white" />
                    <span className="font-display font-bold text-electric text-lg">
                      {item.year}
                    </span>
                    <h3 className="font-display font-semibold text-ink text-base mt-1">
                      {item.title}
                    </h3>
                    <p className="text-slate text-sm mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Valeurs
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Ce qui nous guide
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {valeurs.map((v, i) => {
              const IconComp = valeurIcons[v.icon] || GridIcon;
              const isAlternate = i % 2 === 1;

              return (
                <ScrollReveal key={v.title} delay={i * 0.1}>
                  <div
                    className={`p-8 rounded border ${
                      isAlternate
                        ? "bg-off-white border-gray-100"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="w-12 h-12 bg-electric/10 text-electric rounded flex items-center justify-center mb-4">
                      <IconComp />
                    </div>
                    <h3 className="font-display font-bold text-ink text-lg mb-2">
                      {v.title}
                    </h3>
                    <p className="text-slate text-sm leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zone intervention */}
      <section className="py-24 bg-off-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Zone d&apos;intervention
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Le Pacifique, notre terrain
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded p-8 lg:p-12 border border-gray-100">
              {/* Simplified map as geometric representation */}
              <div className="relative w-full aspect-[2/1] bg-electric/5 rounded overflow-hidden">
                {/* Stylized geometric Pacific map */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-2xl">
                    {/* Grid lines */}
                    <div className="absolute inset-0 geo-grid opacity-50" />

                    {/* Islands as dots */}
                    {[
                      { x: "50%", y: "45%", label: "Tahiti", size: "w-4 h-4" },
                      { x: "55%", y: "40%", label: "Moorea", size: "w-2.5 h-2.5" },
                      { x: "65%", y: "30%", label: "Marquises", size: "w-3 h-3" },
                      { x: "40%", y: "50%", label: "Bora Bora", size: "w-2.5 h-2.5" },
                      { x: "70%", y: "55%", label: "Tuamotu", size: "w-3 h-3" },
                      { x: "30%", y: "65%", label: "Australes", size: "w-2.5 h-2.5" },
                      { x: "20%", y: "45%", label: "Fidji", size: "w-2 h-2" },
                    ].map((island) => (
                      <div
                        key={island.label}
                        className="absolute flex flex-col items-center gap-1"
                        style={{
                          left: island.x,
                          top: island.y,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className={`${island.size} bg-electric rounded-full`}
                        />
                        <span className="text-[10px] font-semibold text-ink whitespace-nowrap">
                          {island.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  "Iles de la Societe",
                  "Tuamotu-Gambier",
                  "Marquises",
                  "Australes",
                ].map((zone) => (
                  <div key={zone} className="px-4 py-3 bg-off-white rounded">
                    <span className="text-sm font-medium text-ink">{zone}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
