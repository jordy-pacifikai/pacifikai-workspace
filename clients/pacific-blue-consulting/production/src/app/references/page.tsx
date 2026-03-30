"use client";

import { useState, useRef, useEffect } from "react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { missions, domainLabels, domainColors, type Domain } from "@/data/missions";
import { getIcon } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";

const domainIconMap: Record<Domain, string> = {
  aviation: "plane",
  aeroports: "building",
  environnement: "leaf",
  etudes: "chart",
  amo: "compass",
  formation: "users",
};

export default function ReferencesPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const [activeFilter, setActiveFilter] = useState<Domain | "all">("all");
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredMissions =
    activeFilter === "all"
      ? missions
      : missions.filter((m) => m.domain === activeFilter);

  const domains = Object.keys(domainLabels) as Domain[];

  // Animate filter change
  useEffect(() => {
    if (!gridRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-mission-card]");
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(16px)";
      setTimeout(() => {
        card.style.transition = "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 50 + i * 60);
    });
  }, [activeFilter]);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="Nos references"
              title="Des missions concretes depuis 2017"
              description="Selection d'interventions realisees en Polynesie francaise, Nouvelle-Caledonie et dans le Pacifique."
              light
            />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-navy-100/50 sticky top-16 lg:top-16 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeFilter === "all"
                  ? "bg-navy text-white shadow-elevation-1"
                  : "bg-navy-50/50 text-warm hover:text-navy hover:bg-navy-50"
              }`}
            >
              Tous ({missions.length})
            </button>
            {domains.map((domain) => {
              const count = missions.filter((m) => m.domain === domain).length;
              if (count === 0) return null;
              return (
                <button
                  key={domain}
                  onClick={() => setActiveFilter(domain)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === domain
                      ? "bg-navy text-white shadow-elevation-1"
                      : "bg-navy-50/50 text-warm hover:text-navy hover:bg-navy-50"
                  }`}
                >
                  {getIcon(domainIconMap[domain], "w-4 h-4")}
                  <span className="hidden sm:inline">{domainLabels[domain]}</span>
                  <span className="sm:hidden">{domainLabels[domain].split(" ")[0]}</span>
                  <span className="text-xs opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMissions.map((mission) => (
              <div
                key={mission.id}
                data-mission-card
                className="card-hover group border border-navy-100/50 rounded-3xl overflow-hidden bg-white"
              >
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-steel">
                        {getIcon(domainIconMap[mission.domain], "w-5 h-5")}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${domainColors[mission.domain]}`}>
                          {domainLabels[mission.domain]}
                        </span>
                        <p className="text-xs text-warm mt-1">
                          {mission.year} &middot; {mission.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-navy leading-tight">
                    {mission.title}
                  </h3>
                  <p className="mt-2 text-sm text-warm font-medium">
                    {mission.client}
                  </p>
                  <p className="mt-3 text-sm text-warm/80 leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredMissions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-warm text-lg">
                Aucune mission dans ce domaine pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <h2 className="font-display text-fluid-4xl font-bold text-navy text-balance">
              Votre projet pourrait figurer ici
            </h2>
            <p className="mt-5 text-fluid-lg text-warm leading-relaxed">
              Discutons de vos enjeux et construisons ensemble votre prochaine mission.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
