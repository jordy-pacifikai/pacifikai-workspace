"use client";

import Link from "next/link";

import { useScrollAnimation, useCountUp } from "@/lib/useScrollAnimation";
import SectionTitle from "@/components/SectionTitle";

/* ===== Data ===== */
const timeline = [
  {
    year: "2017",
    title: "Fondation de Pacific Blue Consulting",
    description:
      "Creation du cabinet de conseil independant en Polynesie francaise pour accompagner les acteurs publics et prives de l'aeronautique et des services aeroportuaires.",
  },
  {
    year: "2017-2020",
    title: "Premieres missions structurantes",
    description:
      "Accompagnement de Tahiti Nui Helicopters (2017-2018). Certification d'Islands Airline et debut de la modernisation d'Air Loyaute (2019). Appui a la candidature Vinci Airports et participation a la creation d'Air Bora Bora (2020).",
  },
  {
    year: "2021-2023",
    title: "Deploiement multi-territorial",
    description:
      "Schemas d'amenagement des aeroports de Moorea et Huahine pour la DAC-PF. Etude de classification internationale de l'aeroport de Lifou. Formations CNAM et creation d'un centre Part-147.",
  },
  {
    year: "2024",
    title: "Transition ecologique et innovation",
    description:
      "Bilan carbone de la DAC-PF et feuille de route de decarbonation. Modele economique pour aeroports marins innovants avec Terciel.",
  },
  {
    year: "2025",
    title: "Rayonnement Pacifique Sud",
    description:
      "Etude de faisabilite d'une liaison aerienne regionale Tahiti - Iles Cook - Tonga - Samoa - Fidji. Plus de 60 missions realisees depuis la creation du cabinet.",
  },
];

const values = [
  {
    title: "Sur mesure",
    description:
      "Des solutions adaptees aux besoins specifiques de chaque acteur, prive ou public.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
  {
    title: "Innovation",
    description:
      "Un engagement envers l'excellence et l'innovation au service des partenaires du cabinet.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Performance",
    description:
      "Certification ISO 9001, 14001, 45001 et accompagnement dans les demarches techniques.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Responsabilite",
    description:
      "Bilans carbone, feuilles de route de decarbonation et certification biodiversite.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const territories = [
  {
    name: "Polynesie francaise",
    description: "Base du cabinet depuis 2017.",
  },
  {
    name: "Nouvelle-Caledonie",
    description: "Air Loyaute, aeroport de Lifou, Province des Iles Loyaute.",
  },
  {
    name: "Pacifique Sud",
    description: "Etude de liaison aerienne Iles Cook, Tonga, Samoa, Fidji.",
  },
];

/* ===== Components ===== */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value, 2000, suffix);
  return (
    <div className="text-center p-6 bg-white rounded-2xl border border-navy-100/50">
      <span ref={ref} className="block font-display text-fluid-3xl font-bold text-gold">
        0{suffix}
      </span>
      <span className="mt-1 block text-fluid-xs text-warm">{label}</span>
    </div>
  );
}

function TerritoryCard({ territory }: { territory: typeof territories[0] }) {
  return (
    <div className="card-hover p-8 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl">
      <h3 className="font-display text-xl font-bold text-white">
        {territory.name}
      </h3>
      <p className="mt-3 text-sm text-white/50 leading-relaxed">
        {territory.description}
      </p>
    </div>
  );
}

/* ===== Pacific SVG Map ===== */
function PacificMap() {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-auto" aria-label="Zone d'intervention Pacifique">
      {/* Ocean background */}
      <rect width="800" height="500" fill="oklch(0.22 0.06 250)" rx="16" />

      {/* Grid lines */}
      {[100, 200, 300, 400].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="oklch(1 0 0 / 0.03)" strokeWidth="1" />
      ))}
      {[200, 400, 600].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="oklch(1 0 0 / 0.03)" strokeWidth="1" />
      ))}

      {/* Land masses (simplified) */}
      {/* Australia */}
      <ellipse cx="120" cy="350" rx="80" ry="60" fill="oklch(0.30 0.04 250)" opacity="0.4" />
      {/* New Zealand */}
      <ellipse cx="250" cy="400" rx="15" ry="35" fill="oklch(0.30 0.04 250)" opacity="0.4" transform="rotate(-15 250 400)" />

      {/* Territory points with pulse */}
      {/* Polynesie francaise */}
      <circle cx="580" cy="250" r="20" fill="oklch(0.72 0.12 85 / 0.15)" className="animate-pulse-soft" />
      <circle cx="580" cy="250" r="8" fill="oklch(0.72 0.12 85)" />
      <circle cx="580" cy="250" r="4" fill="oklch(0.25 0.05 250)" />

      {/* Nouvelle-Caledonie */}
      <circle cx="300" cy="300" r="14" fill="oklch(0.55 0.12 245 / 0.15)" className="animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <circle cx="300" cy="300" r="6" fill="oklch(0.55 0.12 245)" />
      <circle cx="300" cy="300" r="3" fill="oklch(0.25 0.05 250)" />

      {/* Pacifique Sud */}
      <circle cx="380" cy="340" r="10" fill="oklch(1 0 0 / 0.1)" className="animate-pulse-soft" style={{ animationDelay: "2s" }} />
      <circle cx="380" cy="340" r="4" fill="oklch(1 0 0 / 0.5)" />

      {/* Connection lines */}
      <line x1="300" y1="300" x2="580" y2="250" stroke="oklch(0.72 0.12 85 / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="300" y1="300" x2="380" y2="340" stroke="oklch(1 0 0 / 0.1)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Labels */}
      <text x="580" y="220" textAnchor="middle" fill="oklch(1 0 0 / 0.7)" fontSize="11" fontWeight="600">Polynesie francaise</text>
      <text x="300" y="280" textAnchor="middle" fill="oklch(1 0 0 / 0.5)" fontSize="10">Nouvelle-Caledonie</text>
      <text x="380" y="368" textAnchor="middle" fill="oklch(1 0 0 / 0.4)" fontSize="9">Pacifique Sud</text>
    </svg>
  );
}

/* ===== Page ===== */
export default function AProposPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="A propos"
              title="Un cabinet ne de l'experience du terrain"
              description="Cabinet de conseil independant present en Polynesie francaise depuis 2017."
              light
            />
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Photo */}
            <div className="lg:col-span-2">
              <div className="gsap-reveal-scale">
                <div className="aspect-[3/4] bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-3xl flex items-center justify-center overflow-hidden relative">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[60px]" />

                  <div className="relative z-10 w-full h-full">
                    <img
                      src="/images/pbc-consulting.jpg"
                      alt="Pascal Bazer-Bachi, fondateur de Pacific Blue Consulting"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy/90 to-transparent">
                    <h3 className="font-display text-2xl font-bold text-white">
                      Pascal Bazer-Bachi
                    </h3>
                    <p className="mt-1 text-sm text-gold font-medium">
                      Fondateur
                    </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-3">
              <div className="gsap-reveal">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                  Le fondateur
                </span>
                <h2 className="mt-3 font-display text-fluid-4xl font-bold text-navy">
                  Pascal Bazer-Bachi
                </h2>
              </div>

              <div className="gsap-reveal mt-6 space-y-4 text-warm leading-relaxed">
                <p>
                  Depuis 2017, Pacific Blue Consulting accompagne des acteurs de l&apos;aeronautique et des services aeroportuaires en Polynesie francaise, Nouvelle-Caledonie et dans le Pacifique.
                </p>
                <p>
                  Le cabinet intervient dans le conseil en strategie, l&apos;environnement, le pilotage de projets et l&apos;assistance a maitrise d&apos;ouvrage. Il accompagne egalement les organisations dans leurs demarches de certification (ISO 9001, 14001, 45001) et les dossiers ICPE.
                </p>
              </div>

              {/* Mini stats */}
              <div className="gsap-reveal mt-10 grid grid-cols-3 gap-4">
                <Stat value={60} suffix="+" label="Missions realisees" />
                <Stat value={6} suffix="" label="Domaines d'expertise" />
                <Stat value={3} suffix="" label="Territoires" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle
              label="Notre parcours"
              title="Une histoire d'expertise et d'engagement"
            />
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-navy-200 to-transparent hidden md:block" />

            <div className="space-y-10" data-stagger-parent>
              {timeline.map((item) => (
                <div key={item.year} className="relative flex gap-8" data-stagger-child>
                  {/* Dot */}
                  <div className="hidden md:flex shrink-0 w-16 items-start justify-center pt-1">
                    <div className="w-4 h-4 bg-gold rounded-full border-4 border-navy-50 z-10 shadow-glow-gold" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-7 bg-white rounded-2xl border border-navy-100/40 card-hover">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                      {item.year}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-warm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Nos valeurs"
              title="Les principes qui guident notre action"
            />
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-stagger-parent>
            {values.map((value) => (
              <div
                key={value.title}
                className="card-hover p-8 bg-navy-50/30 rounded-3xl text-center border border-navy-100/30"
                data-stagger-child
              >
                <div className="w-14 h-14 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mx-auto">
                  {value.icon}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-navy">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm text-warm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zones d'intervention */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Zones d'intervention"
              title="Au coeur du Pacifique"
              description="Present en Polynesie francaise depuis 2017, nous intervenons dans l'ensemble du Pacifique francais et au-dela."
              light
            />
          </div>

          {/* Interactive map */}
          <div className="gsap-reveal-scale mt-12 rounded-3xl overflow-hidden border border-white/[0.06]">
            <PacificMap />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5" data-stagger-parent>
            {territories.map((territory) => (
              <div key={territory.name} data-stagger-child>
                <TerritoryCard territory={territory} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <h2 className="font-display text-fluid-4xl font-bold text-navy text-balance">
              Envie de travailler ensemble ?
            </h2>
            <p className="mt-5 text-fluid-lg text-warm leading-relaxed">
              Decouvrez comment notre expertise peut servir vos ambitions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
              >
                Nous contacter
              </Link>
              <Link
                href="/references"
                className="inline-flex items-center justify-center px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300 text-sm"
              >
                Voir nos references
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
