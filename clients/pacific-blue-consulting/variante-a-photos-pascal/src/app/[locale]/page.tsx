"use client";

import Image from "next/image";
import { useTranslations, useMessages } from "next-intl";
import { Link } from "@/i18n/routing";
import { useScrollAnimation, useCountUp, useCardSpotlight, useParallax } from "@/lib/useScrollAnimation";
import { clients, partners, type ClientCategory } from "@/data/clients";
import SectionTitle from "@/components/SectionTitle";
import HeroTextReveal from "@/components/HeroTextReveal";

/* ===== Data ===== */
const territoryColors: Record<string, string> = {
  mobilites: "bg-steel-50 text-steel-600",
  infrastructures: "bg-navy-50 text-navy-400",
  environnement: "bg-emerald-50 text-emerald-700",
  transformation: "bg-gold-50 text-gold-600",
};

// Logos qui paraissent trop petits dans la grille standard et meritent une taille augmentee
const LARGER_LOGOS = new Set<string>([
  "Moeroa Tahitian Heritage",
  "TASC",
  "TAC",
  "Province des Îles Loyauté",
  "Commune de Hiva Oa",
  "DAC-Pf",
  "Gouvernement PF",
  "IAS",
  "Air Bora Bora",
  "Aéroport de Tahiti",
  "Service de l'Artisanat Traditionnel",
  "Pacific Sud Survey (PSS)",
  "Delta Polynesia",
  "L2L Prévention",
  "Milanamos",
  "To70",
  "Tamau Conseil",
  "Etik Polynésie",
  "PenUAS",
  "BIM Pearl",
  "Birds Conseil",
  "Magis",
  "CGX Aero",
  "Ironetik",
  "ISS",
  "TPB",
  "FHC",
  "Auna Conseil",
  "PACIFIK'AI",
]);

const TERRITORY_IDS = ["mobilites", "infrastructures", "environnement", "transformation"] as const;
type TerritoryId = (typeof TERRITORY_IDS)[number];

const territoryImages: Record<TerritoryId, string> = {
  mobilites: "/images/mobilites-cockpit.jpg",
  infrastructures: "/images/rgi1.jpg",
  environnement: "/images/nuku-hiva.jpg",
  transformation: "/images/transformation-workshop.jpg",
};

const MISSION_KEYS = ["tnh", "pil", "eisa", "tavivat", "diren", "pacificline"] as const;
type MissionKey = (typeof MISSION_KEYS)[number];

const missionMeta: Record<MissionKey, {
  territory: "mobilites" | "infrastructures" | "environnement" | "transformation";
  client: string;
  dates: string;
  image: string;
}> = {
  tnh: { territory: "mobilites", client: "Tahiti Nui Helicopters", dates: "2017-2018", image: "/images/tnh-helicopter-flight.jpg" },
  pil: { territory: "infrastructures", client: "Province des Îles Loyauté", dates: "2024-2029", image: "/images/aratika.jpg" },
  eisa: { territory: "mobilites", client: "DAC-Pf / Etik Pf", dates: "2024-2025", image: "/images/rgi1.jpg" },
  tavivat: { territory: "environnement", client: "TAVIVAT", dates: "2025-2030", image: "/images/taro.jpg" },
  diren: { territory: "environnement", client: "DIREN", dates: "2021-2023", image: "/images/nuku-hiva.jpg" },
  pacificline: { territory: "mobilites", client: "Pacific Blue Consulting", dates: "2025", image: "/images/rgi3.jpg" },
};

const WHY_US_KEYS = ["tailored", "innovation", "performance", "certification"] as const;
const WHY_US_ICONS: Record<(typeof WHY_US_KEYS)[number], string> = {
  tailored: "puzzle",
  innovation: "chart",
  performance: "compass",
  certification: "shield",
};

/* ===== Components ===== */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useCountUp(value, 2200, suffix);
  return (
    <div className="text-center group">
      <span ref={ref} className="block font-display text-fluid-4xl font-bold text-gold transition-transform duration-300 group-hover:scale-105">
        0{suffix}
      </span>
      <span className="mt-2 block text-fluid-xs text-white/50 uppercase tracking-wider">{label}</span>
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
  const t = useTranslations("homepage");
  const tClients = useTranslations("homepage.clients");
  const messages = useMessages() as { clients?: { hover?: Record<string, string>; partnerSpecialty?: Record<string, string> } };
  const tClientHover = messages.clients?.hover;
  const tPartnerSpec = messages.clients?.partnerSpecialty;

  const stats = [
    { value: 8, suffix: "", label: t("stats.years") },
    { value: 4, suffix: "", label: t("stats.territories") },
    { value: 60, suffix: "+", label: t("stats.missions") },
    { value: 100, suffix: "%", label: t("stats.independent") },
  ];

  const getClientHover = (name: string): string | undefined =>
    tClientHover?.[name];

  const getPartnerSpecialty = (name: string): string | undefined =>
    tPartnerSpec?.[name];

  return (
    <div ref={sectionRef}>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image src="/images/hero-accueil.jpg" alt={t("hero.imageAlt")} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 overlay-hero" />
        <div className="absolute inset-0 grain-overlay" />
        <div ref={parallaxRef} className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(oklch(1 0 0 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.3) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[128px] animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-navy-800/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="max-w-4xl">
            <div className="gsap-reveal">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-full text-white/70 text-fluid-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse-soft" />
                {t("hero.badge")}
              </span>
            </div>

            <div className="mt-8">
              <HeroTextReveal
                text={t("hero.headline")}
                highlightWord={t("hero.highlight")}
                className="font-display text-fluid-5xl font-bold text-white leading-[1.05] tracking-tight"
                delay={0.5}
              />
            </div>

            <p className="gsap-reveal mt-8 text-fluid-lg text-white/50 leading-relaxed max-w-2xl">
              {t("hero.intro")}
            </p>

            <div className="gsap-reveal mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/realisations"
                className="magnetic-btn inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm group"
              >
                {t("hero.ctaPrimary")}
                <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/15 text-white font-medium rounded-xl hover:bg-white/[0.06] hover:border-white/25 transition-all duration-300 text-sm backdrop-blur-sm"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 scroll-indicator">
          <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-medium">{t("hero.scrollHint")}</span>
          <div className="w-5 h-9 border border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full scroll-indicator-dot" />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative bg-navy-700 py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12" data-stagger-parent>
            {stats.map((stat) => (
              <div key={stat.label} data-stagger-child>
                <StatCounter {...stat} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </section>

      {/* ===== 4 TERRITOIRES ===== */}
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label={t("territories.label")}
              title={t("territories.title")}
              description={t("territories.description")}
            />
          </div>

          <div ref={bentoRef} className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6" data-stagger-parent>
            {TERRITORY_IDS.map((id) => (
              <Link
                key={id}
                href={`/offres#${id}`}
                className="card-hover card-spotlight group relative overflow-hidden rounded-3xl border border-navy-100/60 bg-white"
                data-stagger-child
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={territoryImages[id]}
                    alt={t(`territoriesData.${id}.title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <h3 className="font-display text-xl font-bold text-white">{t(`territoriesData.${id}.title`)}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-gold mb-2">{t(`territoriesData.${id}.subtitle`)}</p>
                  <p className="text-sm text-warm leading-relaxed">{t(`territoriesData.${id}.description`)}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-steel group-hover:text-gold transition-all duration-300">
                    {t("territories.learnMore")}
                    <svg className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MISSIONS EMBLEMATIQUES ===== */}
      <section className="py-24 lg:py-32 bg-navy-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label={t("missions.label")}
              title={t("missions.title")}
              description={t("missions.description")}
            />
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger-parent>
            {MISSION_KEYS.map((key) => {
              const meta = missionMeta[key];
              return (
                <article
                  key={key}
                  className="card-hover group bg-white rounded-2xl border border-navy-100/60 overflow-hidden"
                  data-stagger-child
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={meta.image}
                      alt={t(`missionsEmblematiques.${key}.title`)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${territoryColors[meta.territory] || "bg-navy-50 text-navy-400"}`}>
                      {t(`missionsEmblematiques.${key}.territoryLabel`)}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-warm-400 mb-2">
                      <span>{meta.client}</span>
                      <span className="text-warm-200">·</span>
                      <span>{meta.dates}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-navy leading-snug">
                      {t(`missionsEmblematiques.${key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-warm leading-relaxed line-clamp-3">
                      {t(`missionsEmblematiques.${key}.description`)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="gsap-reveal">
                <SectionTitle label={t("whyUs.label")} title={t("whyUs.title")} align="left" />
              </div>
              <p className="gsap-reveal mt-6 text-warm leading-relaxed">
                {t("whyUs.intro")}
              </p>
              <div className="gsap-reveal mt-8 rounded-2xl overflow-hidden border border-navy-100/40">
                <Image src="/images/pbc-in-airport.jpg" alt="Pacific Blue Consulting" width={800} height={450} className="w-full h-auto" loading="lazy" />
              </div>
              <div className="gsap-reveal mt-8">
                <Link href="/le-cabinet" className="inline-flex items-center px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300 text-sm group">
                  {t("whyUs.ctaDiscoverCabinet")}
                  <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-stagger-parent>
              {WHY_US_KEYS.map((key) => (
                <div key={key} className="card-hover p-6 bg-white rounded-2xl border border-navy-100/60" data-stagger-child>
                  <div className="w-11 h-11 bg-gold/8 rounded-xl flex items-center justify-center text-gold">
                    <WhyUsIcon name={WHY_US_ICONS[key]} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy leading-tight">{t(`whyUs.cards.${key}.title`)}</h3>
                  <p className="mt-2 text-sm text-warm leading-relaxed">{t(`whyUs.cards.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CLIENTS ===== */}
      <section className="py-24 lg:py-32 bg-navy-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/3 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle label={t("clients.label")} title={t("clients.title")} />
          </div>

          <div className="mt-16 space-y-12">
            {(["institutionnels", "compagnies", "grands-groupes", "formation", "autres"] as ClientCategory[]).map((category) => {
              const categoryClients = clients.filter((c) => c.category === category);
              if (categoryClients.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-warm-400 mb-5 flex items-center gap-3">
                    <span>{tClients(`categories.${category}`)}</span>
                    <span className="flex-1 h-px bg-navy-100/40" />
                    <span className="text-warm-300 font-normal normal-case tracking-normal text-[10px]">{categoryClients.length}</span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {categoryClients.map((client) => {
                      const hoverLabel = client.hoverLabel || getClientHover(client.name) || client.name;
                      return (
                        <div
                          key={client.name}
                          className="relative flex flex-col items-center justify-center p-3 bg-white border border-navy-100/40 rounded-xl aspect-[3/2] overflow-hidden transition-all duration-300 cursor-default [&:hover_.logo-overlay]:opacity-100"
                        >
                          {client.logo ? (
                            <>
                              <Image
                                src={client.logo}
                                alt={client.name}
                                width={120}
                                height={48}
                                className={`${LARGER_LOGOS.has(client.name) ? "max-h-[88px] max-w-[95%]" : "max-h-[64px] max-w-[88%]"} w-auto h-auto object-contain`}
                                loading="lazy"
                              />
                              <div className="logo-overlay absolute inset-0 bg-[rgba(30,35,50,0.85)] flex items-center justify-center opacity-0 transition-opacity duration-300 rounded-xl z-10">
                                <span className="text-[11px] font-semibold text-white text-center leading-tight px-2">
                                  {hoverLabel}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-navy/70 text-center leading-tight">
                              {client.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PARTENAIRES ===== */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label={t("partners.label")}
              title={t("partners.title")}
              description={t("partners.description")}
            />
          </div>

          <div className="mt-16 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3" data-stagger-parent>
            {partners.map((partner) => {
              const isPacifikai = partner.name === "PACIFIK'AI";
              const specialty = getPartnerSpecialty(partner.name) || partner.specialty;
              const hoverLabel = partner.hoverLabel || `${partner.name}${specialty ? ` — ${specialty}` : ""}`;
              return (
              <div
                key={partner.name}
                className={`relative flex flex-col items-center justify-center p-4 bg-navy-50/40 border border-navy-100/40 rounded-xl aspect-[3/2] ${isPacifikai ? "overflow-visible" : "overflow-hidden"} transition-all duration-300 cursor-default [&:hover_.logo-overlay]:opacity-100`}
                data-stagger-child
              >
                {partner.logo ? (
                  <>
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={120}
                      height={48}
                      className={`${isPacifikai ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120px] max-w-none z-10" : LARGER_LOGOS.has(partner.name) ? "h-[88px] w-auto" : "h-10 w-auto"} object-contain`}
                      loading="lazy"
                    />
                    <div className="logo-overlay absolute inset-0 bg-[rgba(30,35,50,0.85)] flex items-center justify-center opacity-0 transition-opacity duration-300 rounded-xl z-10 px-2">
                      <span className="text-[11px] font-semibold text-white text-center leading-tight">
                        {hoverLabel}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-medium text-navy/70 text-center leading-tight">
                    {partner.name}
                  </span>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <Image src="/images/img-e8221.jpg" alt={t("finalCta.imageAlt")} fill className="object-cover" sizes="100vw" loading="lazy" />
        <div className="absolute inset-0 overlay-cta" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <span className="inline-block text-gold/70 text-fluid-xs font-semibold uppercase tracking-[0.3em] mb-4">
              {t("finalCta.kicker")}
            </span>
            <h2 className="font-display text-fluid-4xl font-bold text-white leading-tight text-balance">
              {t("finalCta.headline")}
              <br />
              <span className="text-gold">{t("finalCta.headlineHighlight")}</span>
            </h2>
            <p className="mt-6 text-fluid-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
              {t("finalCta.subtext")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="magnetic-btn inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm"
              >
                {t("finalCta.ctaPrimary")}
              </Link>
              <Link
                href="/realisations"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/15 text-white font-medium rounded-xl hover:bg-white/[0.06] hover:border-white/25 transition-all duration-300 text-sm backdrop-blur-sm"
              >
                {t("finalCta.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
