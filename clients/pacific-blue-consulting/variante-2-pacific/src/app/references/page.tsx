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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
        <div className="absolute inset-0 gradient-pacific" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="Nos references"
              title="Plus de 60 missions realisees"
              description="Decouvrez une selection de nos interventions en Polynesie francaise, Nouvelle-Caledonie et dans le Pacifique depuis 2017."
              light
            />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-ocean-100/50 sticky top-16 lg:top-16 z-40 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeFilter === "all"
                  ? "bg-ocean text-white shadow-elevation-1"
                  : "bg-ocean-50/50 text-slate hover:text-ocean hover:bg-ocean-50"
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
                      ? "bg-ocean text-white shadow-elevation-1"
                      : "bg-ocean-50/50 text-slate hover:text-ocean hover:bg-ocean-50"
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
            {filteredMissions.map((mission) => {
              const isExpanded = expandedId === mission.id;
              return (
                <div
                  key={mission.id}
                  data-mission-card
                  className="card-hover group border border-ocean-100/50 rounded-3xl overflow-hidden bg-white"
                >
                  {/* Header */}
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-ocean-50 rounded-xl flex items-center justify-center text-teal">
                          {getIcon(domainIconMap[mission.domain], "w-5 h-5")}
                        </div>
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${domainColors[mission.domain]}`}>
                            {domainLabels[mission.domain]}
                          </span>
                          <p className="text-xs text-slate mt-1">
                            {mission.year} &middot; {mission.location}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-slate bg-ocean-50/70 px-3 py-1.5 rounded-lg font-medium">
                        {mission.duration}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-bold text-ocean leading-tight">
                      {mission.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate">
                      {mission.client}
                    </p>
                  </div>

                  {/* Expandable Content */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-out-expo ${
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-7 pb-6">
                      <div className="pt-4 border-t border-ocean-100/30">
                        <p className="text-sm text-slate leading-relaxed mb-5">
                          {mission.description}
                        </p>
                        <div>
                          <h4 className="text-sm font-semibold text-ocean mb-3">
                            Resultats cles
                          </h4>
                          <ul className="space-y-2.5">
                            {mission.results.map((result) => (
                              <li key={result} className="flex items-start gap-2.5 text-sm text-slate">
                                <svg
                                  className="w-4 h-4 text-teal shrink-0 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : mission.id)}
                    className="w-full px-7 py-3.5 border-t border-ocean-100/30 bg-ocean-50/30 text-sm font-medium text-teal hover:text-teal transition-all duration-300 flex items-center justify-center gap-2"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Voir moins" : "Voir le detail"}
                    <svg
                      className={`w-4 h-4 transition-transform duration-500 ease-out-expo ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {filteredMissions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate text-lg">
                Aucune mission dans ce domaine pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-ocean-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <h2 className="font-display text-fluid-4xl font-bold text-ocean text-balance">
              Votre projet pourrait figurer ici
            </h2>
            <p className="mt-5 text-fluid-lg text-slate leading-relaxed">
              Discutons de vos enjeux et construisons ensemble votre prochaine mission.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center px-8 py-4 bg-teal text-ocean font-semibold rounded-xl hover:bg-teal-400 transition-all duration-300 text-sm"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
