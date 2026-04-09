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
      "Création du cabinet de conseil indépendant en Polynésie française pour accompagner les acteurs publics et privés de l'aéronautique et des services aéroportuaires.",
  },
  {
    year: "2017-2020",
    title: "Premières missions structurantes",
    description:
      "Accompagnement de Tahiti Nui Helicopters (2017-2018). Certification d'Islands Airline et début de la modernisation d'Air Loyauté (2019). Appui à la candidature Vinci Airports et participation à la création d'Air Bora Bora (2020).",
  },
  {
    year: "2021-2023",
    title: "Déploiement multi-territorial",
    description:
      "Conformité et certification Air Loyauté (CTA, Part-145, Part-CAMO). Desserte inter-îles Marquises avec Tahiti Air Charter. Formations CNAM et création d'un centre Part-147 avec Air Formation. Certification biodiversité DIREN.",
  },
  {
    year: "2024-2025",
    title: "Transition écologique et innovation",
    description:
      "Schémas d'aménagement des aéroports de Moorea et Huahine. Bilan carbone de la DAC-PF et feuille de route de décarbonation. 10 EISA réalisées. Aéroports marins innovants avec Terciel. Projet TAVIVAT (souveraineté alimentaire).",
  },
  {
    year: "2025",
    title: "Rayonnement Pacifique Sud",
    description:
      "Étude de faisabilité d'une liaison aérienne régionale Tahiti - Îles Cook - Tonga - Samoa - Fidji. Plus de 60 missions réalisées depuis la création du cabinet.",
  },
];

const ecosysteme = [
  {
    name: "Ironetik",
    description: "Laboratoire d'essai et expertise technique",
  },
  {
    name: "Terciel",
    description: "Aéroports bleus entièrement flottants - Prix « Or Bleu » 2023",
  },
  {
    name: "Islands Services and Solutions",
    description: "Gestion de projets d'infrastructures publiques",
  },
];

const zonesIntervention = [
  {
    name: "Polynésie française",
    description: "Siège du cabinet depuis 2017. Compagnies aériennes, DAC-Pf, DIREN, CNAM, artisanat, agriculture.",
  },
  {
    name: "Nouvelle-Calédonie",
    description: "Air Loyauté, aéroport de Lifou, Province des Îles Loyauté (convention pluriannuelle ports et aéroports).",
  },
  {
    name: "Wallis et Futuna",
    description: "Mise en place du Dispositif de Service Public aérien, continuité territoriale.",
  },
  {
    name: "Pacifique Sud",
    description: "Liaison aérienne régionale Îles Cook, Tonga, Samoa, Fidji.",
  },
];

/* ===== Components ===== */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value, 2000, suffix);
  return (
    <div className="text-center p-6 bg-white rounded-2xl border border-navy-100/50">
      <span ref={ref} className="block font-display text-fluid-3xl font-bold text-gold">0{suffix}</span>
      <span className="mt-1 block text-fluid-xs text-warm">{label}</span>
    </div>
  );
}

function PacificMap() {
  return (
    <svg viewBox="0 0 900 520" className="w-full h-auto" aria-label="Zone d'intervention Pacifique">
      <defs>
        <radialGradient id="ocean" cx="60%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.24 0.07 250)" />
          <stop offset="100%" stopColor="oklch(0.18 0.05 250)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ocean */}
      <rect width="900" height="520" fill="url(#ocean)" rx="16" />

      {/* Latitude/longitude grid */}
      {[130, 260, 390].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="900" y2={y} stroke="oklch(1 0 0 / 0.04)" strokeWidth="0.5" />
      ))}
      {[180, 360, 540, 720].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="520" stroke="oklch(1 0 0 / 0.04)" strokeWidth="0.5" />
      ))}
      {/* Equateur */}
      <line x1="0" y1="130" x2="900" y2="130" stroke="oklch(1 0 0 / 0.06)" strokeWidth="0.5" strokeDasharray="8 4" />
      <text x="12" y="125" fill="oklch(1 0 0 / 0.15)" fontSize="7">Equateur</text>
      {/* Tropique du Capricorne */}
      <line x1="0" y1="310" x2="900" y2="310" stroke="oklch(1 0 0 / 0.06)" strokeWidth="0.5" strokeDasharray="8 4" />
      <text x="12" y="305" fill="oklch(1 0 0 / 0.15)" fontSize="7">Tropique du Capricorne</text>

      {/* Australia — simplified shape */}
      <path d="M70,310 Q90,280 130,275 Q160,270 180,290 Q195,310 190,340 Q185,370 160,390 Q130,405 100,395 Q75,380 65,355 Q60,335 70,310Z" fill="oklch(0.30 0.04 250)" opacity="0.35" />
      <text x="125" y="345" textAnchor="middle" fill="oklch(1 0 0 / 0.12)" fontSize="10" fontWeight="500">Australie</text>

      {/* New Zealand */}
      <path d="M270,385 Q275,370 280,365 Q285,375 283,390 Q280,400 270,405 Z" fill="oklch(0.30 0.04 250)" opacity="0.35" />
      <path d="M278,405 Q282,395 286,400 Q284,415 278,420 Z" fill="oklch(0.30 0.04 250)" opacity="0.35" />
      <text x="295" y="410" fill="oklch(1 0 0 / 0.12)" fontSize="7">NZ</text>

      {/* Papua New Guinea */}
      <path d="M150,200 Q170,190 190,195 Q195,205 185,215 Q170,220 155,215 Z" fill="oklch(0.30 0.04 250)" opacity="0.3" />

      {/* Fiji */}
      <circle cx="370" cy="280" r="4" fill="oklch(0.30 0.04 250)" opacity="0.3" />
      <text x="380" y="278" fill="oklch(1 0 0 / 0.15)" fontSize="7">Fidji</text>

      {/* Samoa */}
      <circle cx="430" cy="230" r="3" fill="oklch(0.30 0.04 250)" opacity="0.25" />
      <text x="440" y="228" fill="oklch(1 0 0 / 0.12)" fontSize="7">Samoa</text>

      {/* Tonga */}
      <circle cx="395" cy="310" r="2.5" fill="oklch(0.30 0.04 250)" opacity="0.25" />
      <text x="405" y="313" fill="oklch(1 0 0 / 0.12)" fontSize="7">Tonga</text>

      {/* Connection lines from PF hub */}
      <line x1="640" y1="280" x2="340" y2="310" stroke="oklch(0.72 0.12 85 / 0.2)" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="640" y1="280" x2="370" y2="255" stroke="oklch(0.55 0.12 245 / 0.12)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1="340" y1="310" x2="370" y2="255" stroke="oklch(0.55 0.12 245 / 0.1)" strokeWidth="0.8" strokeDasharray="4 4" />

      {/* Wallis et Futuna */}
      <circle cx="370" cy="255" r="14" fill="oklch(0.55 0.12 245 / 0.1)" className="animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      <circle cx="370" cy="255" r="5" fill="oklch(0.55 0.12 245 / 0.7)" />
      <circle cx="370" cy="255" r="2.5" fill="oklch(0.22 0.05 250)" />
      <text x="370" y="242" textAnchor="middle" fill="oklch(1 0 0 / 0.5)" fontSize="9" fontWeight="500">Wallis &amp; Futuna</text>

      {/* Nouvelle-Caledonie */}
      <path d="M325,305 Q335,295 350,300 Q358,305 355,315 Q348,322 335,320 Q325,315 325,305Z" fill="oklch(0.55 0.12 245 / 0.4)" />
      <circle cx="340" cy="310" r="18" fill="oklch(0.55 0.12 245 / 0.1)" className="animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <circle cx="340" cy="310" r="7" fill="oklch(0.55 0.12 245)" />
      <circle cx="340" cy="310" r="3.5" fill="oklch(0.22 0.05 250)" />
      <text x="340" y="340" textAnchor="middle" fill="oklch(1 0 0 / 0.6)" fontSize="10" fontWeight="500">Nouvelle-Calédonie</text>
      <text x="340" y="352" textAnchor="middle" fill="oklch(1 0 0 / 0.3)" fontSize="7">Nouméa</text>

      {/* Polynesie francaise (hub principal) */}
      <circle cx="620" cy="260" r="2" fill="oklch(0.72 0.12 85 / 0.4)" />
      <text x="635" y="258" fill="oklch(1 0 0 / 0.25)" fontSize="6">Marquises</text>
      <circle cx="660" cy="290" r="1.5" fill="oklch(0.72 0.12 85 / 0.3)" />
      <text x="672" y="293" fill="oklch(1 0 0 / 0.2)" fontSize="6">Tuamotu</text>
      <circle cx="610" cy="300" r="2" fill="oklch(0.72 0.12 85 / 0.4)" />
      <text x="590" y="310" fill="oklch(1 0 0 / 0.25)" fontSize="6">Bora Bora</text>

      {/* Main PF point — Tahiti */}
      <circle cx="640" cy="280" r="28" fill="oklch(0.72 0.12 85 / 0.12)" className="animate-pulse-soft" />
      <circle cx="640" cy="280" r="16" fill="oklch(0.72 0.12 85 / 0.15)" className="animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
      <circle cx="640" cy="280" r="10" fill="oklch(0.72 0.12 85)" filter="url(#glow)" />
      <circle cx="640" cy="280" r="5" fill="oklch(0.22 0.05 250)" />

      {/* PF label */}
      <text x="640" y="255" textAnchor="middle" fill="oklch(0.85 0.10 85)" fontSize="13" fontWeight="700">Polynésie française</text>
      <text x="640" y="318" textAnchor="middle" fill="oklch(1 0 0 / 0.4)" fontSize="8">Tahiti — Papeete (siège)</text>

      {/* Broader Pacific zone — dashed border */}
      <ellipse cx="500" cy="290" rx="250" ry="120" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="1" strokeDasharray="4 8" />
      <text x="500" y="425" textAnchor="middle" fill="oklch(1 0 0 / 0.12)" fontSize="8" letterSpacing="0.15em">ZONE D&apos;INTERVENTION PACIFIQUE</text>

      {/* Mission count badges */}
      <rect x="592" y="325" width="96" height="22" rx="11" fill="oklch(0.72 0.12 85 / 0.2)" />
      <text x="640" y="339" textAnchor="middle" fill="oklch(0.85 0.10 85)" fontSize="9" fontWeight="600">60+ missions</text>

      <rect x="296" y="356" width="88" height="20" rx="10" fill="oklch(0.55 0.12 245 / 0.2)" />
      <text x="340" y="369" textAnchor="middle" fill="oklch(0.65 0.10 245)" fontSize="8" fontWeight="600">15+ missions</text>
    </svg>
  );
}

/* ===== Page ===== */
export default function LeCabinetPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/images/hero-cabinet.jpg" alt="Bora Bora — coucher de soleil" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 overlay-hero" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="Le Cabinet"
              title="Un cabinet né de l'expérience du terrain"
              light
            />
          </div>
        </div>
      </section>

      {/* ===== MANIFESTE PBC (NOUVEAU) ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal space-y-6 text-warm leading-[1.85] text-base" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <p>
              Dans un territoire où chaque île est un monde, où la réglementation européenne rencontre les réalités du Pacifique, où un aérodrome de 200 passagers par semaine doit répondre aux mêmes exigences qu&apos;un hub international - il faut des gens qui savent construire.
            </p>
            <p>
              Pacific Blue Consulting est né de cette conviction : les territoires insulaires méritent la même rigueur, la même ambition et la même qualité de conseil que les grandes métropoles, mais avec une compréhension intime de ce qui les rend uniques.
            </p>
            <p>
              Depuis 2017, nous créons des compagnies aériennes, nous certifions des aéroports, nous sécurisons des travaux sur des plateformes en exploitation, nous accompagnons la transition écologique, nous formons des managers, nous structurons des filières alimentaires et artisanales. Parce que la souveraineté d&apos;un territoire se construit sur tous ces plans à la fois.
            </p>
            <p>
              Notre méthode n&apos;a rien de mystérieux : comprendre avant de recommander, écouter avant de structurer, et ne jamais livrer un document sans s&apos;assurer qu&apos;il pourra être mis en œuvre par ceux qui en ont la charge.
            </p>
            <p>
              Aucun de nos projets ne repart jamais de zéro. Comme la spirale du coquillage qui nous sert d&apos;emblème, chaque mission s&apos;appuie sur les précédentes - et à chaque tour, le regard est plus ample, l&apos;expérience plus riche, la capacité à faire des choix structurants plus affirmée.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PORTRAIT PASCAL (REMPLACÉ) ===== */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <div className="gsap-reveal-scale">
                <div className="bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-2xl overflow-hidden relative shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[60px]" />
                  <div className="relative z-10">
                    <Image
                      src="/images/pascal-fondateur.jpg"
                      alt="Pascal Bazer-Bachi, fondateur"
                      width={2052}
                      height={1540}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy/90 to-transparent">
                      <h3 className="font-display text-lg font-bold text-white">Pascal Bazer-Bachi</h3>
                      <p className="mt-0.5 text-xs text-gold font-medium">Fondateur</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="gsap-reveal">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Le fondateur</span>
                <h2 className="mt-3 font-display text-fluid-4xl font-bold text-navy">Pascal Bazer-Bachi</h2>
              </div>

              <div className="gsap-reveal mt-6 space-y-4 text-warm leading-relaxed">
                <p>
                  Trente années dans l&apos;aviation civile, les systèmes satellitaires, la régulation aérienne et le pilotage de projets d&apos;infrastructure - en Europe et dans le Pacifique. Un parcours qui passe par le Centre National d&apos;Études Spatiales, la Direction Générale de l&apos;Aviation Civile, la tutelle du troisième aéroport parisien, la mise en service opérationnelle du système européen de navigation par satellite EGNOS, et la direction de l&apos;Aviation Civile de Polynésie française - où il a supervisé un réseau de 43 aéroports et assuré l&apos;interface avec la Transportation Security Administration américaine.
                </p>
                <p>
                  De ce parcours, Pascal a tiré une conviction : les projets les plus complexes aboutissent quand on combine la rigueur des systèmes avec l&apos;attention aux personnes qui les font vivre. C&apos;est pourquoi il est à la fois ingénieur de l&apos;aviation civile et coach professionnel accrédité, concepteur de business plans et animateur de codéveloppement, auditeur EASA et formateur en conduite du changement.
                </p>
                <p>
                  Titulaire d&apos;une qualification EASA Form-4 et formé à la gestion des risques industriels (Mastère MIDE), il est aujourd&apos;hui l&apos;un des rares experts du Pacifique à combiner une expérience de direction au sein de l&apos;autorité de surveillance et une pratique opérationnelle du conseil en sécurité et sûreté aéroportuaires. Il a réalisé 10 études d&apos;impact sur la sécurité aéroportuaire (EISA) depuis 2024.
                </p>
                <p>
                  <strong className="text-navy">Chevalier de l&apos;Ordre National du Mérite</strong>, il a créé Pacific Blue Consulting en 2017. Depuis, il a également cofondé Terciel (aéroports marins flottants, prix Innovation « Or Bleu » 2023), Ironetik (laboratoire d&apos;essai et expertise technique) et Islands Services and Solutions (gestion de projets d&apos;infrastructures publiques).
                </p>
                <p>
                  Télépilote qualifié, il réalise lui-même les missions d&apos;imagerie aérienne professionnelle pour ses clients - parce que comprendre un territoire, c&apos;est aussi le voir d&apos;en haut.
                </p>
              </div>

              {/* Citation */}
              <div className="gsap-reveal mt-8 p-6 bg-gold/5 border-l-4 border-gold rounded-r-xl">
                <blockquote className="text-navy italic leading-relaxed">
                  « Je conçois le conseil comme un levier de montée en compétences. Mon objectif n&apos;est pas que mes clients aient besoin de moi indéfiniment - c&apos;est qu&apos;ils soient mieux armés après mon passage qu&apos;avant. Mais curieusement, c&apos;est souvent ce qui fait qu&apos;ils reviennent. »
                </blockquote>
              </div>

              <div className="gsap-reveal mt-10 grid grid-cols-3 gap-4">
                <Stat value={60} suffix="+" label="Missions réalisées" />
                <Stat value={8} suffix="" label="Années d'activité" />
                <Stat value={4} suffix="" label="Territoires" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEME (REMPLACÉ) ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label="Notre écosystème"
              title="Un interlocuteur unique, un réseau d'experts mobilisables"
            />
          </div>

          <div className="gsap-reveal space-y-4 text-warm leading-relaxed mb-12">
            <p>
              Pacific Blue Consulting est votre interlocuteur unique et le garant de la qualité de chaque mission. Mais certains projets exigent des compétences complémentaires : c&apos;est pourquoi nous nous appuyons sur un écosystème de confiance, forgé au fil de plus de 60 missions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-stagger-parent>
            {ecosysteme.map((structure) => (
              <div
                key={structure.name}
                className="card-hover p-8 bg-navy-50/30 rounded-3xl border border-navy-100/30 text-center"
                data-stagger-child
              >
                <div className="w-14 h-14 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{structure.name}</h3>
                <p className="mt-2 text-sm text-warm leading-relaxed">{structure.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline (CONSERVÉ) */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle label="Notre parcours" title="Une histoire d'expertise et d'engagement" />
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-navy-200 to-transparent hidden md:block" />
            <div className="space-y-10" data-stagger-parent>
              {timeline.map((item) => (
                <div key={item.year} className="relative flex gap-8" data-stagger-child>
                  <div className="hidden md:flex shrink-0 w-16 items-start justify-center pt-1">
                    <div className="w-4 h-4 bg-gold rounded-full border-4 border-navy-50 z-10 shadow-glow-gold" />
                  </div>
                  <div className="flex-1 p-7 bg-white rounded-2xl border border-navy-100/40 card-hover">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{item.year}</span>
                    <h3 className="mt-2 font-display text-xl font-bold text-navy">{item.title}</h3>
                    <p className="mt-3 text-sm text-warm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coquillage (CONSERVÉ) */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle label="Notre identité" title="Le coquillage, symbole de Pacific Blue" />
          </div>
          <div className="gsap-reveal space-y-6 text-warm leading-relaxed">
            <p>
              L&apos;identité visuelle de Pacific Blue Consulting naît d&apos;un coquillage stylisé dont la spirale s&apos;ouvre et s&apos;agrandit à mesure qu&apos;elle se déploie. Cette spirale suggère qu&apos;aucun projet ne repart jamais de zéro : l&apos;on repasse par des thèmes familiers — sûreté, continuité de service, modèles économiques, gouvernance — mais à chaque tour, le regard est plus ample, l&apos;expérience plus riche et la capacité à faire des choix structurants plus affirmée.
            </p>
            <p>
              Ce coquillage est aussi un hommage à la Polynésie et au grand océan Pacifique, où il est à la fois objet du quotidien, symbole des lagons et trace sensible du lien entre terre et mer. Il fait écho au <em className="text-navy font-medium">pu</em>, la conque que l&apos;on souffle pour signaler sa présence, annoncer un événement ou souhaiter la bienvenue aux navigateurs qui approchent — comme un appel clair et bienveillant dans l&apos;immensité.
            </p>
            <p>
              Cette image exprime la vocation de PBC : accueillir, guider et sécuriser les trajectoires de ses clients dans un environnement complexe, tout en respectant profondément les territoires et les populations.
            </p>
          </div>
        </div>
      </section>

      {/* Zones d'intervention (CONSERVÉ) */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <Image src="/images/aratika-village.jpg" alt="Aratika — village vu du ciel" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 overlay-cta" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Zones d'intervention"
              title="Au cœur du Pacifique"
              description="Présent en Polynésie française depuis 2017, nous intervenons dans l'ensemble du Pacifique français et au-delà."
              light
            />
          </div>
          <div className="gsap-reveal-scale mt-12 rounded-3xl overflow-hidden border border-white/[0.06]">
            <PacificMap />
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-stagger-parent>
            {zonesIntervention.map((territory) => (
              <div key={territory.name} className="card-hover p-8 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl" data-stagger-child>
                <h3 className="font-display text-xl font-bold text-white">{territory.name}</h3>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">{territory.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact territorial (CONSERVÉ) */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle label="Notre impact" title="Impact territorial" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-stagger-parent>
            {[
              { title: "Continuité aérienne territoriale", desc: "Structuration desserte inter-îles (Marquises, Wallis & Futuna, atolls).", icon: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" },
              { title: "Développement économique", desc: "Création compagnies aériennes, filières artisanales, plateformes aéroportuaires.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              { title: "Capacité institutionnelle", desc: "Accompagnement DAC-Pf, DIREN, collectivités dans gouvernance sectorielle.", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" },
              { title: "Emploi et compétences", desc: "Formations certifiées, création postes management et technique, insertion professionnelle.", icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" },
            ].map((item) => (
              <div key={item.title} className="card-hover p-8 bg-white rounded-3xl border border-navy-100/30" data-stagger-child>
                <div className="w-12 h-12 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm text-warm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce que PBC apporte à vos équipes (CONSERVÉ per CDC) */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label="Accompagnement"
              title="Ce que PBC apporte à vos équipes"
            />
          </div>

          <div className="gsap-reveal space-y-6 text-warm leading-relaxed">
            <p>
              Pascal Bazer-Bachi conçoit le conseil comme un levier de montée en compétences des équipes : formateur agréé, concepteur et animateur de programmes en gestion de projet, conduite du changement, culture managériale et accompagnement entrepreneurial, il intervient autant sur les contenus que sur les pratiques de travail.
            </p>
            <p>
              Coach professionnel et executive coach accrédité, il accompagne dirigeants, cadres et porteurs de projets pour les aider à clarifier leurs enjeux, structurer leurs décisions et incarner les transformations, qu&apos;il s&apos;agisse de politiques publiques, de projets territoriaux, d&apos;infrastructures ou d&apos;initiatives économiques locales.
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
              Découvrez comment notre expertise peut servir vos ambitions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm">
                Nous contacter
              </Link>
              <Link href="/realisations" className="inline-flex items-center justify-center px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300 text-sm">
                Voir nos réalisations
              </Link>
            </div>
            <p className="mt-16 text-[11px] text-warm/50">
              Pacific Blue Consulting — SAS au capital de 200 000 FCFP — PK 17,900 Côte Mer, Punaauia, Polynésie française — N° Tahiti G28823
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
