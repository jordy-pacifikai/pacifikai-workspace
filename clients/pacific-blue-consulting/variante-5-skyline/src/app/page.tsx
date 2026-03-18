"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CountUp } from "@/components/CountUp";
import { expertises, testimonials } from "@/lib/data";
import { useState } from "react";

/* ─── ICONS ─── */
function PlaneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 1 8-1.5 5-5 7.5-9 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  );
}

function RecycleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
      <path d="m14 16-3 3 3 3"/><path d="M8.293 13.596L4.875 7.97l5.166-.524"/>
      <path d="m9.5 5.5 4-7 4 7"/>
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/>
    </svg>
  );
}

const expertiseIcons: Record<string, () => JSX.Element> = {
  "aviation-civile": PlaneIcon,
  "environnement": LeafIcon,
  "amo-maitrise-ouvrage": ClipboardIcon,
  "etudes-strategiques": BarChartIcon,
  "developpement-durable": RecycleIcon,
  "formation-conseil": GraduationIcon,
};

export default function HomePage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 geo-grid pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-electric/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-electric/10 rounded text-electric text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 bg-electric rounded-full" />
              Aviation &middot; Environnement &middot; AMO
            </div>

            <h1
              className="font-display font-bold text-ink leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2.25rem, 4vw, 4rem)" }}
            >
              Votre boussole
              <br />
              dans un monde
              <br />
              <span className="text-electric">complexe</span>
            </h1>

            <p className="text-slate text-lg max-w-lg mb-8 leading-relaxed">
              Conseil strategique en aviation civile et environnement.
              60+ missions realisees en Polynesie francaise et dans le Pacifique
              depuis 2017.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/expertises"
                className="px-6 py-3.5 bg-electric text-white font-semibold rounded hover:bg-blue-700 transition-colors"
              >
                Decouvrir nos expertises
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 border-2 border-ink text-ink font-semibold rounded hover:bg-ink hover:text-white transition-colors"
              >
                Prendre rendez-vous
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[340px] h-[420px] sm:w-[400px] sm:h-[500px]">
              <div className="absolute inset-0 bg-electric/10 clip-corner-cut-lg translate-x-4 translate-y-4" />
              <div className="relative w-full h-full clip-corner-cut-lg overflow-hidden">
                <Image
                  src="/images/pbc-hero.png"
                  alt="Pacific Blue Consulting — Conseil Aviation et Environnement"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 340px, 400px"
                />
              </div>
              <div className="absolute -left-6 bottom-12 bg-white shadow-lg rounded px-4 py-3 border-l-4 border-electric">
                <span className="font-display font-bold text-2xl text-ink block">60+</span>
                <span className="text-slate text-xs">missions realisees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="bg-electric py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 border border-white/10 rotate-45 -translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 right-0 w-60 h-60 border border-white/10 rotate-12 translate-x-20 translate-y-20" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <CountUp end={60} suffix="+" label="Missions realisees" />
          <CountUp end={2017} label="Annee de creation" duration={2.5} />
          <CountUp end={3} label="Domaines d'expertise" />
          <CountUp end={100} suffix="%" label="Clients satisfaits" />
        </div>
      </section>

      {/* ─── EXPERTISES GRID ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="mb-16">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Nos expertises
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
              >
                Des competences a la croisee
                <br />
                de l&apos;aviation et de l&apos;environnement
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertises.map((exp, i) => {
              const IconComp = expertiseIcons[exp.id] || PlaneIcon;
              return (
                <ScrollReveal key={exp.id} delay={i * 0.1}>
                  <div
                    className={`group bg-white border border-gray-100 rounded p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 ${
                      exp.color === "emerald"
                        ? "border-l-emerald"
                        : "border-l-electric"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center mb-4 ${
                        exp.color === "emerald"
                          ? "bg-emerald/10 text-emerald"
                          : "bg-electric/10 text-electric"
                      }`}
                    >
                      <IconComp />
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        exp.color === "emerald"
                          ? "text-emerald"
                          : "text-electric"
                      }`}
                    >
                      {exp.category}
                    </span>
                    <h3 className="font-display font-semibold text-ink text-lg mt-1 mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-slate text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/expertises"
              className="inline-flex items-center gap-2 text-electric font-semibold hover:gap-3 transition-all"
            >
              Voir toutes nos expertises
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TWO PILLARS ─── */}
      <section className="py-24 bg-off-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Nos piliers
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
              >
                Deux expertises, une vision
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded p-8 lg:p-10 border border-gray-100">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 flex-shrink-0 clip-circle overflow-hidden">
                    <Image
                      src="/images/pbc-cockpit.png"
                      alt="Aviation civile"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-electric/10 text-electric text-xs font-semibold rounded uppercase tracking-wider">
                      Aviation
                    </span>
                    <h3 className="font-display font-bold text-ink text-xl mt-2 mb-3">
                      Expertise aeronautique
                    </h3>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    "Reglementation OACI / EASA / DSAC",
                    "Audits de securite aerienne",
                    "Schemas directeurs aeroportuaires",
                    "Certification des aerodromes",
                    "Formation du personnel navigant",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate">
                      <span className="w-1.5 h-1.5 bg-electric rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-emerald-light rounded p-8 lg:p-10 border border-emerald/10">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 flex-shrink-0 clip-circle overflow-hidden">
                    <Image
                      src="/images/pbc-foret.png"
                      alt="Environnement"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald/10 text-emerald text-xs font-semibold rounded uppercase tracking-wider">
                      Environnement
                    </span>
                    <h3 className="font-display font-bold text-ink text-xl mt-2 mb-3">
                      Expertise environnementale
                    </h3>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    "Etudes d'impact environnemental",
                    "Conservation des ecosystemes marins",
                    "Plans de gestion des espaces naturels",
                    "Developpement durable et RSE",
                    "Adaptation au changement climatique",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate">
                      <span className="w-1.5 h-1.5 bg-emerald rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="mb-12">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Temoignages
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
              >
                Ils nous font confiance
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative">
              <div className="bg-off-white rounded p-8 lg:p-12 border-l-4 border-electric max-w-3xl">
                <svg
                  className="text-electric/20 mb-4"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
                <p className="text-ink text-lg leading-relaxed mb-6">
                  {testimonials[testimonialIndex].quote}
                </p>
                <div>
                  <span className="font-display font-semibold text-ink block">
                    {testimonials[testimonialIndex].author}
                  </span>
                  <span className="text-slate text-sm">
                    {testimonials[testimonialIndex].company}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === testimonialIndex ? "bg-electric" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Temoignage ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-ink py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 border border-white/5 rotate-45 translate-x-40 -translate-y-40" />
        <div className="absolute bottom-0 left-0 w-60 h-60 border border-white/5 -rotate-12 -translate-x-20 translate-y-20" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal>
            <h2
              className="font-display font-bold text-white mb-6"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
            >
              Discutons de votre projet
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Chaque mission commence par une conversation. Partagez-nous votre
              besoin, nous vous proposerons une approche sur mesure.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-electric text-white font-semibold rounded hover:bg-blue-700 transition-colors text-lg"
            >
              Prendre rendez-vous
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
