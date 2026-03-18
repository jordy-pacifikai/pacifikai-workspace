"use client";

import Link from "next/link";

import { useScrollAnimation, useCountUp } from "@/lib/useScrollAnimation";
import SectionTitle from "@/components/SectionTitle";

/* ===== Data ===== */
const timeline = [
  {
    year: "1990-2016",
    title: "Direction de l'Aviation Civile",
    description:
      "Plus de 25 ans au service de l'Etat, dont les fonctions de Directeur de l'Aviation Civile en Polynesie francaise. Pilotage des politiques de securite aerienne, de surete, de desserte territoriale et d'amenagement aeroportuaire.",
  },
  {
    year: "2017",
    title: "Creation de Pacific Blue Consulting",
    description:
      "Fort de cette experience institutionnelle unique, Pascal Bazer-Bachi fonde son cabinet de conseil independant pour mettre son expertise au service des acteurs publics et prives du Pacifique.",
  },
  {
    year: "2017-2020",
    title: "Premieres missions structurantes",
    description:
      "Etudes de continuite territoriale, accompagnement de compagnies aeriennes, audits d'aerodromes insulaires. Le cabinet construit sa reputation sur la rigueur et la pertinence de ses analyses.",
  },
  {
    year: "2021-2026",
    title: "Diversification et rayonnement regional",
    description:
      "Extension des activites vers l'environnement et la biodiversite, la modelisation economique et la formation. Interventions en Nouvelle-Caledonie et dans le Pacifique Sud. Plus de 60 missions realisees.",
  },
];

const values = [
  {
    title: "Rigueur",
    description:
      "Chaque analyse, chaque recommandation repose sur des donnees fiables, des methodologies eprouvees et une connaissance approfondie des standards internationaux.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Independance",
    description:
      "Cabinet independant, nous n'avons d'autre engagement que celui de la qualite et de l'objectivite de nos recommandations.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    title: "Proximite",
    description:
      "Base a Tahiti, au coeur du Pacifique, nous comprenons les realites du terrain, les contraintes insulaires et les specificites culturelles.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Impact",
    description:
      "Des resultats concrets et quantifiables. Nos recommandations se traduisent en actions et en valeur reelle pour le territoire.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const territories = [
  {
    name: "Polynesie francaise",
    description: "Notre base d'operations. 118 iles, 5 archipels, 48 iles habitees.",
    missions: 40,
    suffix: "+",
  },
  {
    name: "Nouvelle-Caledonie",
    description: "Interventions regulieres sur les problematiques aeroportuaires et environnementales.",
    missions: 12,
    suffix: "+",
  },
  {
    name: "Pacifique Sud",
    description: "Missions ponctuelles dans les Etats insulaires (Fidji, Vanuatu, Samoa).",
    missions: 8,
    suffix: "+",
  },
];

/* ===== Components ===== */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value, 2000, suffix);
  return (
    <div className="text-center p-6 bg-white rounded-2xl border border-ocean-100/50">
      <span ref={ref} className="block font-display text-fluid-3xl font-bold text-teal">
        0{suffix}
      </span>
      <span className="mt-1 block text-fluid-xs text-slate">{label}</span>
    </div>
  );
}

function TerritoryCard({ territory }: { territory: typeof territories[0] }) {
  const ref = useCountUp(territory.missions, 2000, territory.suffix);
  return (
    <div className="card-hover p-8 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl">
      <span ref={ref} className="block font-display text-fluid-4xl font-bold text-teal">
        0{territory.suffix}
      </span>
      <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
        missions
      </span>
      <h3 className="mt-5 font-display text-xl font-bold text-white">
        {territory.name}
      </h3>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">
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
        <div className="absolute inset-0 gradient-pacific" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="A propos"
              title="Un cabinet ne de l'experience du terrain"
              description="Pacific Blue Consulting est le fruit de plus de 30 ans d'expertise dans l'aviation civile et la gestion de projets complexes au coeur du Pacifique."
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
                <div className="aspect-[3/4] bg-gradient-to-br from-ocean-50 to-ocean-100/50 rounded-3xl flex items-center justify-center overflow-hidden relative">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full blur-[60px]" />

                  <div className="text-center p-8 relative z-10">
                    <div className="w-32 h-32 bg-ocean-100 rounded-full mx-auto flex items-center justify-center border-2 border-ocean-200/50">
                      <svg className="w-16 h-16 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-bold text-ocean">
                      Pascal Bazer-Bachi
                    </h3>
                    <p className="mt-1 text-sm text-teal font-medium">
                      Fondateur & Directeur
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      Ancien Directeur de l&apos;Aviation Civile
                      <br />de Polynesie francaise
                    </p>
                    <a
                      href="https://linkedin.com/company/pacificblueconsulting"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm text-teal hover:text-teal transition-colors duration-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-3">
              <div className="gsap-reveal">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal">
                  Le fondateur
                </span>
                <h2 className="mt-3 font-display text-fluid-4xl font-bold text-ocean">
                  Pascal Bazer-Bachi
                </h2>
              </div>

              <div className="gsap-reveal mt-6 space-y-4 text-slate leading-relaxed">
                <p>
                  Ingenieur de formation, Pascal Bazer-Bachi a consacre plus de 25 ans au service de l&apos;Etat dans le domaine de l&apos;aviation civile. Il a occupe des postes de direction au sein de la Direction Generale de l&apos;Aviation Civile (DGAC), dont celui de Directeur de l&apos;Aviation Civile en Polynesie francaise.
                </p>
                <p>
                  A ce titre, il a pilote les politiques de securite et de surete aeriennes, la regulation des compagnies aeriennes, la gestion des infrastructures aeroportuaires et les enjeux de desserte territoriale dans un territoire de 5 millions de km&sup2; comptant 48 iles habitees.
                </p>
                <p>
                  En 2017, il fonde Pacific Blue Consulting pour mettre cette expertise unique au service des acteurs publics et prives du Pacifique. Le cabinet intervient tant sur les questions techniques de l&apos;aviation civile que sur les problematiques environnementales et le pilotage de projets complexes.
                </p>
              </div>

              {/* Mini stats */}
              <div className="gsap-reveal mt-10 grid grid-cols-3 gap-4">
                <Stat value={30} suffix="+ ans" label="Experience" />
                <Stat value={60} suffix="+" label="Missions" />
                <Stat value={3} suffix="" label="Territoires" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32 bg-ocean-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle
              label="Notre parcours"
              title="Une histoire d'expertise et d'engagement"
            />
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-teal/30 via-ocean-200 to-transparent hidden md:block" />

            <div className="space-y-10" data-stagger-parent>
              {timeline.map((item) => (
                <div key={item.year} className="relative flex gap-8" data-stagger-child>
                  {/* Dot */}
                  <div className="hidden md:flex shrink-0 w-16 items-start justify-center pt-1">
                    <div className="w-4 h-4 bg-teal rounded-full border-4 border-ocean-50 z-10 shadow-glow-teal" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-7 bg-white rounded-2xl border border-ocean-100/40 card-hover">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
                      {item.year}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold text-ocean">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate leading-relaxed">
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
                className="card-hover p-8 bg-ocean-50/30 rounded-3xl text-center border border-ocean-100/30"
                data-stagger-child
              >
                <div className="w-14 h-14 bg-teal/8 rounded-2xl flex items-center justify-center text-teal mx-auto">
                  {value.icon}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ocean">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm text-slate leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zones d'intervention */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-pacific" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Zones d'intervention"
              title="Au coeur du Pacifique"
              description="Base a Punaauia, Tahiti, nous intervenons dans l'ensemble du Pacifique francais et au-dela."
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
      <section className="py-24 bg-ocean-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <h2 className="font-display text-fluid-4xl font-bold text-ocean text-balance">
              Envie de travailler ensemble ?
            </h2>
            <p className="mt-5 text-fluid-lg text-slate leading-relaxed">
              Decouvrez comment notre expertise peut servir vos ambitions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-teal text-ocean font-semibold rounded-xl hover:bg-teal-400 transition-all duration-300 text-sm"
              >
                Nous contacter
              </Link>
              <Link
                href="/references"
                className="inline-flex items-center justify-center px-8 py-4 bg-ocean text-white font-semibold rounded-xl hover:bg-ocean-600 transition-all duration-300 text-sm"
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
