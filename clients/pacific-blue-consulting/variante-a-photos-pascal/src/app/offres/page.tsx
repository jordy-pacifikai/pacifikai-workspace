"use client";

import Link from "next/link";
import Image from "next/image";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { territories } from "@/data/territories";

const territoryImages: Record<string, { src: string; alt: string }> = {
  mobilites: { src: "/images/mobilites-cockpit.jpg", alt: "Cockpit vue Bora Bora — transport aérien Polynésie" },
  infrastructures: { src: "/images/rgi1.jpg", alt: "Aéroport RGI — infrastructures aéroportuaires" },
  environnement: { src: "/images/nuku-hiva.jpg", alt: "Nuku Hiva — Marquises" },
  transformation: { src: "/images/transformation-workshop.jpg", alt: "Session de travail et formation" },
};

export default function OffresPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden">
        <Image src="/images/hero-offres.jpg" alt="Bora Bora — lagon turquoise" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-navy/92" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-gold/70 text-fluid-xs font-semibold uppercase tracking-[0.3em] mb-4">
            Nos offres
          </span>
          <h1 className="font-display text-fluid-4xl font-bold leading-tight">
            Nos offres
          </h1>
          <p className="mt-6 text-white/90 text-lg max-w-3xl mx-auto leading-relaxed [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
            Quatre territoires d&apos;intervention, une même promesse : comprendre votre contexte, structurer votre projet, et vous accompagner jusqu&apos;à la mise en œuvre.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-navy-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {territories.map((t) => (
              <a
                key={t.id}
                href={`#${t.anchor}`}
                className="shrink-0 px-4 py-2 text-sm font-medium text-warm-500 hover:text-navy hover:bg-navy-50 rounded-lg transition-colors"
              >
                {t.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Territory sections */}
      {territories.map((territory, i) => {
        const img = territoryImages[territory.id];
        const isEven = i % 2 === 0;

        return (
          <section
            key={territory.id}
            id={territory.anchor}
            className={`py-24 lg:py-32 ${isEven ? "bg-white" : "bg-navy-50/50"} scroll-mt-32`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="gsap-reveal">
                {/* Header */}
                <div className="max-w-3xl">
                  <span className="inline-block text-gold text-fluid-xs font-semibold uppercase tracking-[0.3em] mb-3">
                    {territory.title}
                  </span>
                  <h2 className="font-display text-fluid-3xl font-bold text-navy leading-tight">
                    {territory.subtitle}
                  </h2>
                </div>

                {/* Layout: text + image */}
                <div className={`mt-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start ${!isEven ? "lg:grid-flow-dense" : ""}`}>
                  <div className={!isEven ? "lg:col-start-2" : ""}>
                    {/* Approach */}
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-4">
                      Notre approche
                    </h3>
                    <div className="prose prose-warm prose-sm max-w-none">
                      {territory.approach.split("\n\n").map((para, j) => (
                        <p key={j} className="text-warm leading-relaxed mb-4">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Coverage (only Mobilités has this per CDC) */}
                    {territory.coverage && territory.coverage.length > 0 && (
                      <>
                        <h3 className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-4">
                          Ce que cela couvre
                        </h3>
                        <ul className="space-y-2">
                          {territory.coverage.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-warm">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Focus */}
                    {territory.focus && (
                      <div className="mt-10 p-6 bg-gold/5 border border-gold/10 rounded-2xl">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-3">
                          Focus : {territory.focus.title}
                        </h3>
                        <div className="text-sm text-warm leading-relaxed space-y-3">
                          {territory.focus.text.split("\n\n").map((para, j) => (
                            <p key={j}>{para}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={!isEven ? "lg:col-start-1 lg:row-start-1" : ""}>
                    {/* Image */}
                    {img && (
                      <div className="rounded-2xl overflow-hidden border border-navy-100/40">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={800}
                          height={500}
                          className="w-full h-auto"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Missions */}
                    <div className="mt-8">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-4">
                        Missions clés
                      </h3>
                      <ul className="space-y-2">
                        {territory.missions.map((m) => (
                          <li key={m} className="flex items-start gap-2.5 text-sm text-warm">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-navy/20 rounded-full shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Result (only Mobilités + Transformation per CDC) */}
                    {territory.result && (
                      <div className="mt-8 p-5 bg-navy rounded-xl">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70 mb-2">
                          Résultat pour vous
                        </h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                          {territory.result}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[128px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-fluid-3xl font-bold leading-tight">
            Vous avez un projet dans ce domaine ?
            <br />
            <span className="text-gold">Parlons-en.</span>
          </h2>
          <p className="mt-6 text-white/80 text-lg leading-relaxed">
            Chaque contexte est unique - notre première contribution est de vous aider à le clarifier.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
            >
              Échanger sur votre projet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
