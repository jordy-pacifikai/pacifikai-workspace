"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/routing";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import {
  missions,
  domainColors,
  type Domain,
  type GeoTerritory,
} from "@/data/missions";
import { getIcon } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";

type ViewMode = "grid" | "list" | "timeline";
type SortMode = "year-desc" | "year-asc" | "client" | "domain";

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

const ALL_DOMAINS: Domain[] = [
  "aviation",
  "aeroports",
  "environnement",
  "etudes",
  "amo",
  "formation",
  "documentation",
  "securite",
  "drones",
  "artisanat",
];

const ALL_GEOS: GeoTerritory[] = [
  "Polynesie francaise",
  "Nouvelle-Caledonie",
  "Pacifique Sud",
  "Wallis et Futuna",
];

/* ---- View icons ---- */
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? "text-navy" : "text-warm-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
    </svg>
  );
}
function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? "text-navy" : "text-warm-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? "text-navy" : "text-warm-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M5 5h4M15 9h4M7 13h4M13 17h6" />
    </svg>
  );
}

export default function RealisationsPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const t = useTranslations("realisations");
  const tDomain = useTranslations("realisations.domains");
  const tGeo = useTranslations("realisations.geo");
  const tFilters = useTranslations("realisations.filters");
  const [domainFilter, setDomainFilter] = useState<Domain | "all">("all");
  const [geoFilter, setGeoFilter] = useState<GeoTerritory | "all">("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortMode>("year-desc");

  const messages = useMessages() as { realisations?: { missionsData?: Record<string, { title?: string; description?: string; benefit?: string; client?: string }> } };
  const md = messages.realisations?.missionsData;

  const localizedMissions = useMemo(() => missions.map((m) => ({
    ...m,
    title: md?.[m.id]?.title ?? m.title,
    description: md?.[m.id]?.description ?? m.description,
    benefit: md?.[m.id]?.benefit ?? m.benefit,
    client: md?.[m.id]?.client ?? m.client,
  })), [md]);

  const filteredMissions = useMemo(() => {
    const filtered = localizedMissions.filter((m) => {
      if (domainFilter !== "all" && m.domain !== domainFilter) return false;
      if (geoFilter !== "all" && m.location !== geoFilter) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "year-desc": return b.year.localeCompare(a.year);
        case "year-asc": return a.year.localeCompare(b.year);
        case "client": return a.client.localeCompare(b.client);
        case "domain": return a.domain.localeCompare(b.domain);
        default: return 0;
      }
    });
    return sorted;
  }, [localizedMissions, domainFilter, geoFilter, sort]);

  const missionsByYear = useMemo(() => {
    const groups: Record<string, typeof filteredMissions> = {};
    filteredMissions.forEach((m) => {
      const year = m.year.split("-")[0];
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) =>
      sort === "year-asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
  }, [filteredMissions, sort]);

  const missionCountLabel = (count: number) =>
    count > 1 ? tFilters("missionsOther", { count }) : tFilters("missionsOne", { count });

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden">
        <Image src="/images/hero-realisations.jpg" alt={t("hero.imageAlt")} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-navy/92" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-gold/70 text-fluid-xs font-semibold uppercase tracking-[0.3em] mb-4">
            {t("hero.kicker")}
          </span>
          <h1 className="font-display text-fluid-4xl font-bold leading-tight">
            {t("hero.headline")}
          </h1>
          <p className="mt-6 text-white/90 text-lg max-w-3xl mx-auto leading-relaxed [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
            {t("hero.intro")}
          </p>
          {/* Quick stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { value: String(missions.length), label: t("hero.statsMissions") },
              { value: "28", label: t("hero.statsClients") },
              { value: String(ALL_GEOS.length), label: t("hero.statsTerritories") },
              { value: t("hero.statsYearsValue"), label: t("hero.statsYears") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-display font-bold text-gold [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">{stat.value}</div>
                <div className="text-xs text-white/80 mt-1 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories placeholder */}
      <section className="py-20 bg-navy-50/50" id="domaine">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              {t("successStories.kicker")}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy">
              {t("successStories.title")}
            </h2>
            <p className="mt-3 text-warm text-sm max-w-lg mx-auto">
              {t("successStories.description")}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 bg-white border border-navy-100/40 rounded-2xl text-center">
                <div className="w-12 h-12 bg-navy-50 rounded-xl mx-auto mb-4" />
                <p className="text-sm text-warm-400 italic">{t("successStories.comingSoon")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Views + Mission list */}
      <section className="py-24 lg:py-32 bg-white" id="territoire">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label={tFilters("label")}
              title={missionCountLabel(filteredMissions.length)}
              description={tFilters("description")}
            />
          </div>

          {/* Filter bars */}
          <div className="mt-12 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-2 block">
                {tFilters("byDomain")}
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
                  {tFilters("all")} ({missions.filter((m) => geoFilter === "all" || m.location === geoFilter).length})
                </button>
                {ALL_DOMAINS.map((domain) => {
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
                      {tDomain(domain)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-2 block">
                {tFilters("byTerritory")}
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
                  {tFilters("all")}
                </button>
                {ALL_GEOS.map((geo) => {
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
                      {tGeo(geo)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* View toggle + Sort */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-navy-100/30 pt-6">
            <div className="flex items-center gap-1 bg-navy-50/60 p-1 rounded-lg">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                title={tFilters("viewGrid")}
                aria-label={tFilters("viewGrid")}
              >
                <GridIcon active={view === "grid"} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-md transition-all ${view === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                title={tFilters("viewList")}
                aria-label={tFilters("viewList")}
              >
                <ListIcon active={view === "list"} />
              </button>
              <button
                onClick={() => setView("timeline")}
                className={`p-2 rounded-md transition-all ${view === "timeline" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                title={tFilters("viewTimeline")}
                aria-label={tFilters("viewTimeline")}
              >
                <TimelineIcon active={view === "timeline"} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-warm-400">{tFilters("sortBy")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="text-sm bg-white border border-navy-100/40 rounded-lg px-3 py-1.5 text-navy font-medium focus:outline-none focus:ring-2 focus:ring-gold/30"
                aria-label={tFilters("sortBy")}
              >
                <option value="year-desc">{tFilters("sortRecent")}</option>
                <option value="year-asc">{tFilters("sortOldest")}</option>
                <option value="client">{tFilters("sortClient")}</option>
                <option value="domain">{tFilters("sortDomain")}</option>
              </select>
            </div>
          </div>

          {/* ===== GRID VIEW ===== */}
          {view === "grid" && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        <span className="truncate">{tGeo(mission.location)}</span>
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
                      <span className="font-semibold text-navy/60">{tFilters("benefit")}</span> {mission.benefit}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ===== LIST VIEW ===== */}
          {view === "list" && (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-navy-100/40">
                    <th className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-400 w-16">{tFilters("headerYear")}</th>
                    <th className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-400">{tFilters("headerMission")}</th>
                    <th className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-400 hidden md:table-cell">{tFilters("headerClient")}</th>
                    <th className="py-3 pr-4 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-400 hidden lg:table-cell">{tFilters("headerDomain")}</th>
                    <th className="py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-warm-400 hidden lg:table-cell">{tFilters("headerTerritory")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMissions.map((mission) => (
                    <tr key={mission.id} className="group border-b border-navy-100/20 hover:bg-navy-50/30 transition-colors">
                      <td className="py-3 pr-4 text-sm font-medium text-navy/60 whitespace-nowrap">{mission.year}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${domainColors[mission.domain]}`}>
                            {getIcon(domainIconMap[mission.domain], "w-3.5 h-3.5")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-navy leading-snug truncate max-w-md">{mission.title}</p>
                            <p className="text-[11px] text-warm-400 mt-0.5 truncate max-w-md md:hidden">{mission.client}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gold font-medium hidden md:table-cell whitespace-nowrap">{mission.client}</td>
                      <td className="py-3 pr-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${domainColors[mission.domain]}`}>
                          {tDomain(mission.domain)}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-warm-400 hidden lg:table-cell whitespace-nowrap">{tGeo(mission.location)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== TIMELINE VIEW ===== */}
          {view === "timeline" && (
            <div className="mt-8 relative">
              <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-navy-100/40" />

              {missionsByYear.map(([year, yearMissions]) => (
                <div key={year} className="relative mb-12 last:mb-0">
                  <div className="relative flex items-center mb-6">
                    <div className="relative z-10 flex items-center justify-center w-9 h-9 md:w-16 md:h-9 rounded-full bg-navy text-white text-sm font-bold shadow-lg">
                      {year}
                    </div>
                    <div className="ml-4 h-px flex-1 bg-gradient-to-r from-navy-100/40 to-transparent" />
                    <span className="ml-3 text-[11px] text-warm-400 font-medium">
                      {missionCountLabel(yearMissions.length)}
                    </span>
                  </div>

                  <div className="ml-12 md:ml-20 space-y-3">
                    {yearMissions.map((mission) => (
                      <div
                        key={mission.id}
                        className="group relative p-4 bg-white border border-navy-100/40 rounded-xl hover:border-navy-200 hover:shadow-sm transition-all"
                      >
                        <div className="absolute -left-[2.15rem] md:-left-[3.15rem] top-5 w-2.5 h-2.5 rounded-full bg-gold border-2 border-white shadow-sm" />

                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${domainColors[mission.domain]}`}>
                            {getIcon(domainIconMap[mission.domain], "w-4 h-4")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <h3 className="text-sm font-bold text-navy">{mission.title}</h3>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${domainColors[mission.domain]}`}>
                                {tDomain(mission.domain)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px]">
                              <span className="text-gold font-medium">{mission.client}</span>
                              <span className="text-warm-200">·</span>
                              <span className="text-warm-400">{tGeo(mission.location)}</span>
                            </div>
                            <p className="mt-2 text-sm text-warm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                              {mission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredMissions.length === 0 && (
            <div className="mt-12 text-center py-16">
              <p className="text-warm-400">{tFilters("noResults")}</p>
              <button
                onClick={() => { setDomainFilter("all"); setGeoFilter("all"); }}
                className="mt-4 text-sm text-gold font-medium hover:underline"
              >
                {tFilters("reset")}
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
            {t("cta.title")}
          </h2>
          <p className="mt-6 text-white/50 text-lg leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
