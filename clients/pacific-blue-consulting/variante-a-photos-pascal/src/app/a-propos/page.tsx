"use client";

import Link from "next/link";
import Image from "next/image";

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
      "Conformite et certification Air Loyaute (CTA, Part-145, Part-CAMO). Desserte inter-iles Marquises avec Tahiti Air Charter. Gestion pieces Twin-Otter pour la DAC-PF. Formations CNAM et creation d'un centre Part-147 avec Air Formation.",
  },
  {
    year: "2024-2025",
    title: "Transition ecologique et innovation",
    description:
      "Schemas d'amenagement des aeroports de Moorea et Huahine. Bilan carbone de la DAC-PF et feuille de route de decarbonation. Nouvelle generation de RCO SSLIA, manuels AFIS et maintenance. Aeroports marins innovants avec Terciel.",
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
    title: "Expertise aeronautique",
    description:
      "Plus de 30 missions realisees dans le secteur aerien : compagnies, aeroports, conformite EASA.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    title: "Structuration complete",
    description:
      "De la creation d'entites a la certification, mise en conformite et operations.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
  {
    title: "Partenariats long terme",
    description:
      "Relations multi-ans avec Air Loyaute, CNAM, DIREN, DAC-Pf, demontrant confiance et impact.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: "Accompagnement de croissance",
    description:
      "Business plans, strategie commerciale, gestion de projets complexes, AMO integrale.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "RSE et environnement",
    description:
      "Certification biodiversite, bilan carbone, feuille de route decarbonation.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Formation et competences",
    description:
      "Part-147, management, compliance, tutoring individualise et transfert de savoir-faire.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
  {
    title: "Technologie et innovation",
    description:
      "Drones/UAV, modelisation, outils decisionnels, aeroports marins innovants.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
];

const territories = [
  {
    name: "Polynesie francaise",
    description: "Siege du cabinet depuis 2017. Compagnies aeriennes, DAC-Pf, DIREN, CNAM, artisanat, agriculture.",
  },
  {
    name: "Nouvelle-Caledonie",
    description: "Air Loyaute, aeroport de Lifou, Province des Iles Loyaute (convention pluriannuelle ports et aeroports).",
  },
  {
    name: "Wallis et Futuna",
    description: "Mise en place du Dispositif de Service Public aerien, continuite territoriale.",
  },
  {
    name: "Pacifique Sud",
    description: "Liaison aerienne regionale Iles Cook, Tonga, Samoa, Fidji.",
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

      {/* Wallis et Futuna */}
      <circle cx="340" cy="270" r="12" fill="oklch(0.55 0.12 245 / 0.12)" className="animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      <circle cx="340" cy="270" r="5" fill="oklch(0.55 0.12 245 / 0.8)" />
      <circle cx="340" cy="270" r="2.5" fill="oklch(0.25 0.05 250)" />

      {/* Pacifique Sud */}
      <circle cx="380" cy="340" r="10" fill="oklch(1 0 0 / 0.1)" className="animate-pulse-soft" style={{ animationDelay: "2s" }} />
      <circle cx="380" cy="340" r="4" fill="oklch(1 0 0 / 0.5)" />

      {/* (Europe removed — no documented missions) */}

      {/* Connection lines */}
      <line x1="300" y1="300" x2="580" y2="250" stroke="oklch(0.72 0.12 85 / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="300" y1="300" x2="340" y2="270" stroke="oklch(0.55 0.12 245 / 0.15)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="300" y1="300" x2="380" y2="340" stroke="oklch(1 0 0 / 0.1)" strokeWidth="1" strokeDasharray="4 4" />
      {/* Europe connection line removed */}

      {/* Labels */}
      <text x="580" y="220" textAnchor="middle" fill="oklch(1 0 0 / 0.7)" fontSize="11" fontWeight="600">Polynesie francaise</text>
      <text x="300" y="280" textAnchor="middle" fill="oklch(1 0 0 / 0.5)" fontSize="10">Nouvelle-Caledonie</text>
      <text x="340" y="256" textAnchor="middle" fill="oklch(1 0 0 / 0.45)" fontSize="9">Wallis et Futuna</text>
      <text x="380" y="368" textAnchor="middle" fill="oklch(1 0 0 / 0.4)" fontSize="9">Pacifique Sud</text>
      {/* Europe label removed */}
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
        <Image
          src="/images/istock-1287424844.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 overlay-hero" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="A propos"
              title="Un cabinet ne de l'experience du terrain"
              description="Cabinet de conseil independant qui accompagne les acteurs publics et prives dans leurs projets de transformation, d'investissement et de structuration, en particulier dans les secteurs du transport, des infrastructures, de l'energie, de l'environnement et des services publics."
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
                      src="/images/pascal-fondateur.jpg"
                      alt="Pascal Bazer-Bachi, fondateur"
                      className="w-full h-full object-cover object-top"
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
                  Fondateur et president de Pacific Blue Consulting, Pascal Bazer-Bachi met au service de ses clients plus de trente annees d&apos;experience de direction et de pilotage de systemes complexes dans l&apos;aviation civile, les systemes satellitaires, les aeroports et les politiques publiques, en Europe et dans le Pacifique.
                </p>
                <p>
                  Il a occupe des fonctions de haut niveau dans l&apos;administration et au sein d&apos;operateurs techniques, avant de creer plusieurs structures de conseil et d&apos;ingenierie, ce qui lui donne une connaissance fine des contraintes des institutions, des entreprises et des porteurs de projets.
                </p>
                <p>
                  <strong className="text-navy">Chevalier de l&apos;Ordre National du Merite</strong>, il s&apos;est vu reconnaitre son engagement au service de l&apos;interet general et de la modernisation des organisations publiques et privees.
                </p>
                <p>
                  Forme au management, a la gestion des risques industriels et au coaching professionnel, il privilegie une approche profondement humaine des organisations, combinant exigence de rigueur, ecoute des parties prenantes et capacite a transformer des contraintes reglementaires en leviers de structuration et de performance durable.
                </p>
                <p>
                  Coach professionnel et executive coach accredite, il accompagne dirigeants, cadres et porteurs de projets pour les aider a clarifier leurs enjeux, structurer leurs decisions et incarner les transformations.
                </p>
              </div>

              {/* Mini stats */}
              <div className="gsap-reveal mt-10 grid grid-cols-3 gap-4">
                <Stat value={60} suffix="+" label="Missions realisees" />
                <Stat value={8} suffix="" label="Domaines d'expertise" />
                <Stat value={4} suffix="" label="Territoires" />
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
              title="Nos axes de differenciation"
            />
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" data-stagger-parent>
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

      {/* Symbolique du logo */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label="Notre identite"
              title="Le coquillage, symbole de Pacific Blue"
            />
          </div>

          <div className="gsap-reveal space-y-6 text-warm leading-relaxed">
            <p>
              L&apos;identite visuelle de Pacific Blue Consulting nait d&apos;un coquillage stylise dont la spirale s&apos;ouvre et s&apos;agrandit a mesure qu&apos;elle se deploie. Cette spirale suggere qu&apos;aucun projet ne repart jamais de zero : l&apos;on repasse par des themes familiers — surete, continuite de service, modeles economiques, gouvernance — mais a chaque tour, le regard est plus ample, l&apos;experience plus riche et la capacite a faire des choix structurants plus affirmee.
            </p>
            <p>
              Ce coquillage est aussi un hommage a la Polynesie et au grand ocean Pacifique, ou il est a la fois objet du quotidien, symbole des lagons et trace sensible du lien entre terre et mer. Il fait echo au <em className="text-navy font-medium">pu</em>, la conque que l&apos;on souffle pour signaler sa presence, annoncer un evenement ou souhaiter la bienvenue aux navigateurs qui approchent — comme un appel clair et bienveillant dans l&apos;immensite.
            </p>
            <p>
              Cette image exprime la vocation de PBC : accueillir, guider et securiser les trajectoires de ses clients dans un environnement complexe, tout en respectant profondement les territoires et les populations.
            </p>
          </div>
        </div>
      </section>

      {/* Ecosysteme de partenaires */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label="Notre ecosysteme"
              title="Un reseau d'experts mobilisables"
            />
          </div>

          <div className="gsap-reveal space-y-6 text-warm leading-relaxed">
            <p>
              Pacific Blue Consulting intervient comme interlocuteur unique et responsable de la qualite des missions, tout en s&apos;appuyant, lorsque necessaire, sur un ecosysteme d&apos;experts et de structures partenaires, mobilises en fonction des besoins specifiques de chaque projet.
            </p>
            <p>
              Au fil de plus de soixante missions conduites depuis 2017, le cabinet a developpe des cooperations de confiance avec des bureaux d&apos;etudes techniques, des laboratoires d&apos;essais, des specialistes de la formation, de l&apos;environnement, des systemes d&apos;information et du financement de projets, en Polynesie francaise, en Nouvelle-Caledonie et en France metropolitaine.
            </p>
            <p>
              Cet ecosysteme permet de proposer, sous la banniere PBC, des interventions integrees combinant strategie, modelisation economique, mise en conformite reglementaire, ingenierie operationnelle et appui a la mise en oeuvre, tout en preservant l&apos;independance des analyses et la transparence vis-a-vis des clients.
            </p>
          </div>
        </div>
      </section>

      {/* Zones d'intervention */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <Image
          src="/images/drone-pf-2.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 overlay-cta" />
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

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-stagger-parent>
            {territories.map((territory) => (
              <div key={territory.name} data-stagger-child>
                <TerritoryCard territory={territory} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact territorial */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle
              label="Notre impact"
              title="Impact territorial"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-stagger-parent>
            <div className="card-hover p-8 bg-white rounded-3xl border border-navy-100/30" data-stagger-child>
              <div className="w-12 h-12 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-navy">Continuite aerienne territoriale</h3>
              <p className="mt-3 text-sm text-warm leading-relaxed">Structuration desserte inter-iles (Marquises, Wallis &amp; Futuna, atolls).</p>
            </div>
            <div className="card-hover p-8 bg-white rounded-3xl border border-navy-100/30" data-stagger-child>
              <div className="w-12 h-12 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-navy">Developpement economique</h3>
              <p className="mt-3 text-sm text-warm leading-relaxed">Creation compagnies aeriennes, filieres artisanales, plateformes aeroportuaires.</p>
            </div>
            <div className="card-hover p-8 bg-white rounded-3xl border border-navy-100/30" data-stagger-child>
              <div className="w-12 h-12 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-navy">Capacite institutionnelle</h3>
              <p className="mt-3 text-sm text-warm leading-relaxed">Accompagnement DAC-Pf, DIREN, collectivites dans gouvernance sectorielle.</p>
            </div>
            <div className="card-hover p-8 bg-white rounded-3xl border border-navy-100/30" data-stagger-child>
              <div className="w-12 h-12 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-navy">Emploi et competences</h3>
              <p className="mt-3 text-sm text-warm leading-relaxed">Formations certifiees, creation postes management et technique, insertion professionnelle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que PBC apporte a vos equipes */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label="Accompagnement"
              title="Ce que PBC apporte a vos equipes"
            />
          </div>

          <div className="gsap-reveal space-y-6 text-warm leading-relaxed">
            <p>
              Pascal Bazer-Bachi concoit le conseil comme un levier de montee en competences des equipes : formateur agree, concepteur et animateur de programmes en gestion de projet, conduite du changement, culture manageriale et accompagnement entrepreneurial, il intervient autant sur les contenus que sur les pratiques de travail.
            </p>
            <p>
              Coach professionnel et executive coach accredite, il accompagne dirigeants, cadres et porteurs de projets pour les aider a clarifier leurs enjeux, structurer leurs decisions et incarner les transformations, qu&apos;il s&apos;agisse de politiques publiques, de projets territoriaux, d&apos;infrastructures ou d&apos;initiatives economiques locales.
            </p>
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

            {/* Legal */}
            <p className="mt-16 text-[11px] text-warm/50">
              Pacific Blue Consulting — SAS au capital de 200 000 FCFP — PK 17,900 Cote Mer, Punaauia, Polynesie francaise — N° Tahiti G28823
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
