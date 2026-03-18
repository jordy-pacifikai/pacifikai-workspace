"use client";

import Link from "next/link";
import { useScrollAnimation, useCountUp, useCardSpotlight, useParallax } from "@/lib/useScrollAnimation";
import { expertises } from "@/data/expertise";
import { getIcon } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";
import HeroTextReveal from "@/components/HeroTextReveal";

/* ===== Data ===== */
const stats = [
  { value: 60, suffix: "+", label: "Missions realisees" },
  { value: 8, suffix: "", label: "Ans d'experience" },
  { value: 3, suffix: "", label: "Territoires" },
  { value: 100, suffix: "%", label: "Independant" },
];

const whyUs = [
  {
    title: "Expertise locale unique",
    description:
      "Connaissance approfondie du Pacifique, de ses enjeux insulaires et de ses specificites reglementaires.",
    icon: "compass",
  },
  {
    title: "Rigueur institutionnelle",
    description:
      "Ancien Directeur de l'Aviation Civile, garant de standards professionnels irreprochables.",
    icon: "shield",
  },
  {
    title: "Approche sur mesure",
    description:
      "Chaque mission est unique. Methodologies adaptees aux enjeux specifiques de votre projet.",
    icon: "puzzle",
  },
  {
    title: "Impact mesurable",
    description:
      "Resultats concrets et quantifiables. Recommandations traduites en actions et en valeur.",
    icon: "chart",
  },
];

const testimonials = [
  {
    quote: "L'expertise de Pacific Blue Consulting a ete determinante pour la reussite de notre schema directeur aeroportuaire. Une rigueur et une connaissance du terrain exemplaires.",
    name: "Direction des Transports",
    role: "Gouvernement de la Polynesie francaise",
  },
  {
    quote: "Un accompagnement sur mesure qui nous a permis de structurer notre demarche de decarbonation avec des objectifs clairs et atteignables.",
    name: "Direction Generale",
    role: "Compagnie aerienne regionale",
  },
];

/* ===== Components ===== */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value, 2200, suffix);

  return (
    <div className="text-center group">
      <span
        ref={ref}
        className="block font-display text-fluid-4xl font-bold text-gold transition-transform duration-300 group-hover:scale-105"
      >
        0{suffix}
      </span>
      <span className="mt-2 block text-fluid-xs text-white/50 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function WhyUsIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    compass: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
      </svg>
    ),
    shield: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    puzzle: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    chart: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  };
  return icons[name] || icons.compass;
}

/* ===== Page ===== */
export default function Home() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const bentoRef = useCardSpotlight<HTMLDivElement>();
  const parallaxRef = useParallax<HTMLDivElement>(0.15);

  return (
    <div ref={sectionRef}>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh" />

        {/* Grain overlay */}
        <div className="absolute inset-0 grain-overlay" />

        {/* Animated grid pattern */}
        <div ref={parallaxRef} className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(oklch(1 0 0 / 0.3) 1px, transparent 1px),
                linear-gradient(90deg, oklch(1 0 0 / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Radial glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[128px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] bg-steel/5 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-navy-800/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="gsap-reveal">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-full text-white/70 text-fluid-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse-soft" />
                Cabinet de conseil independant
              </span>
            </div>

            {/* Headline */}
            <div className="mt-8">
              <HeroTextReveal
                text="Votre boussole dans un monde complexe"
                highlightWord="complexe"
                className="font-display text-fluid-5xl font-bold text-white leading-[1.05] tracking-tight"
                delay={0.5}
              />
            </div>

            {/* Subheadline */}
            <p className="gsap-reveal mt-8 text-fluid-lg text-white/50 leading-relaxed max-w-2xl">
              Expertise en aviation civile, environnement et pilotage de projets
              complexes. Plus de 60 missions realisees dans le Pacifique depuis 2017.
            </p>

            {/* CTAs */}
            <div className="gsap-reveal mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="magnetic-btn inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm group"
              >
                Prendre rendez-vous
                <svg
                  className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/expertise"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/15 text-white font-medium rounded-xl hover:bg-white/[0.06] hover:border-white/25 transition-all duration-300 text-sm backdrop-blur-sm"
              >
                Decouvrir nos expertises
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 scroll-indicator">
          <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-medium">
            Decouvrir
          </span>
          <div className="w-5 h-9 border border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full scroll-indicator-dot" />
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR / STATS ===== */}
      <section className="relative bg-navy-700 py-16 lg:py-20 overflow-hidden">
        {/* Subtle top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
            data-stagger-parent
          >
            {stats.map((stat) => (
              <div key={stat.label} data-stagger-child>
                <StatCounter {...stat} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </section>

      {/* ===== BENTO EXPERTISE GRID ===== */}
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Nos domaines"
              title="Une expertise multisectorielle au service du Pacifique"
              description="De l'aviation civile a l'environnement, nous mobilisons des competences transversales pour repondre aux defis les plus complexes."
            />
          </div>

          {/* Bento Grid */}
          <div ref={bentoRef} className="mt-16 lg:mt-20 bento-grid" data-stagger-parent>
            {expertises.map((exp, i) => {
              // First item = hero cell, third = wide, last = tall
              const sizeClass =
                i === 0
                  ? "bento-hero"
                  : i === 2
                  ? "bento-wide"
                  : i === 5
                  ? "bento-tall"
                  : "";

              return (
                <Link
                  key={exp.id}
                  href={`/expertise#${exp.id}`}
                  className={`${sizeClass} card-hover card-spotlight shimmer-border group relative p-8 bg-white border border-navy-100/60 rounded-3xl overflow-hidden`}
                  data-stagger-child
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center text-steel group-hover:bg-gold/10 group-hover:text-gold transition-all duration-300">
                      {getIcon(exp.icon, "w-6 h-6")}
                    </div>

                    <h3 className="mt-5 font-display text-fluid-xl font-bold text-navy group-hover:text-navy transition-colors">
                      {exp.shortTitle}
                    </h3>

                    <p className="mt-3 text-sm text-warm leading-relaxed line-clamp-3 lg:line-clamp-none">
                      {exp.description}
                    </p>

                    {/* Mini list for hero cell */}
                    {i === 0 && (
                      <ul className="mt-5 space-y-2 hidden lg:block">
                        {exp.details.slice(0, 3).map((detail) => (
                          <li key={detail} className="flex items-center gap-2 text-sm text-warm/70">
                            <span className="w-1 h-1 bg-gold rounded-full shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}

                    <span className="mt-5 inline-flex items-center text-sm font-medium text-steel group-hover:text-gold transition-all duration-300">
                      En savoir plus
                      <svg
                        className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="py-24 lg:py-32 bg-navy-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left */}
            <div>
              <div className="gsap-reveal">
                <SectionTitle
                  label="Pourquoi nous"
                  title="Un partenaire de confiance pour vos projets strategiques"
                  align="left"
                />
              </div>
              <p className="gsap-reveal mt-6 text-warm leading-relaxed">
                Fonde par Pascal Bazer-Bachi, ancien Directeur de l&apos;Aviation
                Civile de Polynesie francaise, Pacific Blue Consulting allie une
                expertise technique de premier plan a une connaissance intime du
                territoire et de ses acteurs.
              </p>
              <div className="gsap-reveal mt-8">
                <Link
                  href="/a-propos"
                  className="inline-flex items-center px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300 text-sm group"
                >
                  Decouvrir le cabinet
                  <svg
                    className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right — cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-stagger-parent>
              {whyUs.map((item) => (
                <div
                  key={item.title}
                  className="card-hover p-6 bg-white rounded-2xl border border-navy-100/60"
                  data-stagger-child
                >
                  <div className="w-11 h-11 bg-gold/8 rounded-xl flex items-center justify-center text-gold">
                    <WhyUsIcon name={item.icon} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-warm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/3 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Temoignages"
              title="La confiance de nos partenaires"
            />
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-8" data-stagger-parent>
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="card-hover p-8 lg:p-10 bg-navy-50/40 border border-navy-100/40 rounded-3xl relative"
                data-stagger-child
              >
                {/* Quote mark */}
                <svg
                  className="absolute top-6 right-8 w-12 h-12 text-gold/10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>

                <blockquote className="relative z-10">
                  <p className="text-fluid-base text-navy/80 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-steel">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">{t.name}</p>
                      <p className="text-xs text-warm">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 grain-overlay" />

        {/* Gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <span className="inline-block text-gold/70 text-fluid-xs font-semibold uppercase tracking-[0.3em] mb-4">
              Passons a l&apos;action
            </span>
            <h2 className="font-display text-fluid-4xl font-bold text-white leading-tight text-balance">
              Un projet ? Une question ?
              <br />
              <span className="text-gold">Parlons-en.</span>
            </h2>
            <p className="mt-6 text-fluid-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
              Que vous soyez une institution publique, une compagnie aerienne ou
              un acteur prive, nous sommes a votre ecoute.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="magnetic-btn inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
              >
                Prendre rendez-vous
              </Link>
              <Link
                href="/references"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/15 text-white font-medium rounded-xl hover:bg-white/[0.06] hover:border-white/25 transition-all duration-300 text-sm backdrop-blur-sm"
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
