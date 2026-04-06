"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import {
  missions,
  domainLabels,
  domainColors,
  geoTerritoryLabels,
  type Domain,
  type GeoTerritory,
} from "@/data/missions";
import { getIcon } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";

const domainIconMap: Record<Domain, string> = {
  aviation: "plane",
  aeroports: "building",
  environnement: "leaf",
  etudes: "chart",
  amo: "compass",
  formation: "users",
  documentation: "document",
  securite: "shield",
  drones: "plane",
  artisanat: "leaf",
};

export default function RealisationsPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const [domainFilter, setDomainFilter] = useState<Domain | "all">("all");
  const [geoFilter, setGeoFilter] = useState<GeoTerritory | "all">("all");

  const filteredMissions = missions.filter((m) => {
    if (domainFilter !== "all" && m.domain !== domainFilter) return false;
    if (geoFilter !== "all" && m.location !== geoFilter) return false;
    return true;
  });

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[128px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-gold/70 text-fluid-xs font-semibold uppercase tracking-[0.3em] mb-4">
            Nos réalisations
          </span>
          <h1 className="font-display text-fluid-4xl font-bold leading-tight">
            Nos réalisations
          </h1>
          <p className="mt-6 text-white/50 text-lg max-w-3xl mx-auto leading-relaxed">
            Plus de 60 missions réalisées en Polynésie française, Nouvelle-Calédonie et dans le Pacifique. Des projets concrets, des résultats mesurables.
          </p>
        </div>
      </section>

      {/* Success Stories placeholder */}
      <section className="py-20 bg-navy-50/50" id="domaine">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              À la une
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy">
              Success Stories
            </h2>
            <p className="mt-3 text-warm text-sm max-w-lg mx-auto">
              Récits détaillés de nos missions les plus emblématiques. Contenu à venir prochainement.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 bg-white border border-navy-100/40 rounded-2xl text-center">
                <div className="w-12 h-12 bg-navy-50 rounded-xl mx-auto mb-4" />
                <p className="text-sm text-warm-400 italic">À venir</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Mission list */}
      <section className="py-24 lg:py-32 bg-white" id="territoire">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label="Toutes nos missions"
              title={`${filteredMissions.length} missions`}
              description="Filtrez par domaine ou par territoire géographique."
            />
          </div>

          {/* Filter bars */}
          <div className="mt-12 space-y-4">
            {/* Domain filter */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-2 block">
                Par domaine
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDomainFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    domainFilter === "all"
                      ? "bg-navy text-white"
                      : "bg-navy-50 text-warm-500 hover:text-navy"
                  }`}
                >
                  Tous ({missions.filter((m) => geoFilter === "all" || m.location === geoFilter).length})
                </button>
                {(Object.keys(domainLabels) as Domain[]).map((domain) => {
                  const count = missions.filter(
                    (m) => m.domain === domain && (geoFilter === "all" || m.location === geoFilter)
                  ).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={domain}
                      onClick={() => setDomainFilter(domain)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        domainFilter === domain
                          ? "bg-navy text-white"
                          : "bg-navy-50 text-warm-500 hover:text-navy"
                      }`}
                    >
                      {domainLabels[domain]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geo filter */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-2 block">
                Par territoire
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGeoFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    geoFilter === "all"
                      ? "bg-gold text-navy"
                      : "bg-gold/10 text-warm-500 hover:text-navy"
                  }`}
                >
                  Tous
                </button>
                {(Object.keys(geoTerritoryLabels) as GeoTerritory[]).map((geo) => {
                  const count = missions.filter(
                    (m) => m.location === geo && (domainFilter === "all" || m.domain === domainFilter)
                  ).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={geo}
                      onClick={() => setGeoFilter(geo)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        geoFilter === geo
                          ? "bg-gold text-navy"
                          : "bg-gold/10 text-warm-500 hover:text-navy"
                      }`}
                    >
                      {geoTerritoryLabels[geo]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mission grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMissions.map((mission) => (
              <article
                key={mission.id}
                className="card-hover group p-6 bg-white border border-navy-100/60 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${domainColors[mission.domain]}`}>
                    {getIcon(domainIconMap[mission.domain], "w-5 h-5")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-warm-400 mb-1">
                      <span className="font-medium">{mission.year}</span>
                      <span className="text-warm-200">·</span>
                      <span className="truncate">{geoTerritoryLabels[mission.location]}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-navy leading-snug line-clamp-2">
                      {mission.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-gold font-medium">
                      {mission.client}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-warm leading-relaxed line-clamp-3">
                  {mission.description}
                </p>
                <div className="mt-3 pt-3 border-t border-navy-100/30">
                  <p className="text-[11px] text-warm-400 leading-relaxed line-clamp-2">
                    <span className="font-semibold text-navy/60">Bénéfice :</span> {mission.benefit}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {filteredMissions.length === 0 && (
            <div className="mt-12 text-center py-16">
              <p className="text-warm-400">Aucune mission ne correspond à ces filtres.</p>
              <button
                onClick={() => { setDomainFilter("all"); setGeoFilter("all"); }}
                className="mt-4 text-sm text-gold font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-fluid-3xl font-bold leading-tight">
            Votre projet pourrait être le prochain.
          </h2>
          <p className="mt-6 text-white/50 text-lg leading-relaxed">
            Discutons de vos enjeux et construisons ensemble.
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
