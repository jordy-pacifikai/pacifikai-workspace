"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { expertises } from "@/data/expertise";
import { getIcon } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";

const expertiseImages: Record<string, { src: string; alt: string }> = {
  aviation: { src: "/images/istock-1141905690.jpg", alt: "ATR sur piste au coucher de soleil" },
  aeroports: { src: "/images/istock-1321897221.jpg", alt: "Terminal d'aeroport" },
  environnement: { src: "/images/drone-pf-1.jpg", alt: "Vue aerienne du lagon polynesien" },
  etudes: { src: "/images/istock-1690268505.jpg", alt: "Jet d'affaires en vol" },
  amo: { src: "/images/istock-1690923154.jpg", alt: "Avion commercial au gate" },
  formation: { src: "/images/istock-1344939844.jpg", alt: "Concept d'innovation" },
};

export default function ExpertisePage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const [activeSection, setActiveSection] = useState(expertises[0].id);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    expertises.forEach((exp) => {
      const el = document.getElementById(exp.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(exp.id);
          }
        },
        { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/istock-1336613044.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy/82" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="Nos domaines d'expertise"
              title="Des competences au service de vos ambitions"
              description="Fort de plus de 30 ans d'experience dans l'aviation civile et la gestion de projets complexes, Pacific Blue Consulting met a votre disposition une palette d'expertises complementaires."
              light
            />
          </div>
        </div>
      </section>

      {/* Expertise Sections + Sticky Sidebar */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[240px_1fr] gap-12 lg:gap-16">
            {/* Sticky sidebar nav — desktop only */}
            <nav className="hidden lg:block" aria-label="Navigation expertises">
              <div className="sticky top-28 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold mb-4">
                  Domaines
                </p>
                {expertises.map((exp, i) => (
                  <a
                    key={exp.id}
                    href={`#${exp.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeSection === exp.id
                        ? "bg-navy-50 text-navy"
                        : "text-warm-400 hover:text-navy hover:bg-navy-50/50"
                    }`}
                  >
                    <span
                      className={`text-[10px] tabular-nums transition-colors duration-300 ${
                        activeSection === exp.id ? "text-gold" : "text-warm-300"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {exp.shortTitle}
                    {activeSection === exp.id && (
                      <span className="ml-auto w-1.5 h-1.5 bg-gold rounded-full" />
                    )}
                  </a>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="space-y-24 lg:space-y-32">
              {expertises.map((exp, index) => (
                <div
                  key={exp.id}
                  id={exp.id}
                  className="scroll-mt-28"
                >
                  <div className={`grid md:grid-cols-5 gap-10 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                    {/* Main content */}
                    <div className={`md:col-span-3 ${index % 2 !== 0 ? "md:order-2" : ""}`}>
                      <div className="gsap-reveal">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-steel">
                            {getIcon(exp.icon, "w-7 h-7")}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                              Domaine {String(index + 1).padStart(2, "0")}
                            </span>
                            <h2 className="font-display text-fluid-3xl font-bold text-navy leading-tight">
                              {exp.title}
                            </h2>
                          </div>
                        </div>
                      </div>

                      <p className="gsap-reveal text-warm leading-relaxed text-fluid-base">
                        {exp.description}
                      </p>

                      <div className="gsap-reveal mt-8">
                        <h3 className="font-display text-lg font-bold text-navy mb-5">
                          Nos interventions
                        </h3>
                        <ul className="space-y-3">
                          {exp.details.map((detail) => (
                            <li key={detail} className="flex items-start gap-3 text-sm text-warm">
                              <svg
                                className="w-5 h-5 text-gold shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="gsap-reveal mt-8">
                        <Link
                          href="/contact"
                          className="inline-flex items-center text-sm font-medium text-steel hover:text-gold transition-colors duration-300 group"
                        >
                          Discuter de votre projet
                          <svg
                            className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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

                    {/* Side card */}
                    <div className={`md:col-span-2 ${index % 2 !== 0 ? "md:order-1" : ""}`}>
                      <div className="gsap-reveal-scale sticky top-28">
                        {/* Section image */}
                        {expertiseImages[exp.id] && (
                          <div className="mb-5 rounded-2xl overflow-hidden">
                            <Image
                              src={expertiseImages[exp.id].src}
                              alt={expertiseImages[exp.id].alt}
                              width={600}
                              height={400}
                              className="w-full h-48 object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="bg-navy-50/50 border border-navy-100/40 rounded-3xl p-7">
                          <h3 className="font-display text-base font-bold text-navy mb-5">
                            Exemples de missions
                          </h3>
                          <div className="space-y-3">
                            {exp.examples.map((example) => (
                              <div
                                key={example}
                                className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-navy-100/50 transition-all duration-300 hover:border-gold/20 hover:shadow-elevation-1"
                              >
                                <div className="w-8 h-8 bg-gold/8 rounded-lg flex items-center justify-center shrink-0">
                                  <svg
                                    className="w-4 h-4 text-gold"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <p className="text-sm text-navy font-medium leading-snug">
                                  {example}
                                </p>
                              </div>
                            ))}
                          </div>

                          <Link
                            href="/references"
                            className="mt-5 inline-flex items-center text-sm font-medium text-steel hover:text-gold transition-colors duration-300 group"
                          >
                            Voir toutes nos references
                            <svg
                              className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
                    </div>
                  </div>

                  {/* Divider */}
                  {index < expertises.length - 1 && (
                    <div className="mt-24 lg:mt-32">
                      <div className="h-px bg-gradient-to-r from-transparent via-navy-100 to-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/images/istock-1457441464.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-navy/85" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <h2 className="font-display text-fluid-4xl font-bold text-white text-balance">
              Vous avez un projet en tete ?
            </h2>
            <p className="mt-5 text-fluid-lg text-white/50 leading-relaxed">
              Contactez-nous pour discuter de vos enjeux et definir ensemble la
              meilleure approche.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
