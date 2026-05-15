"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useScrollAnimation, useCountUp } from "@/lib/useScrollAnimation";
import SectionTitle from "@/components/SectionTitle";

// Photo finale Pascal — choix final mail 2026-05-09 : chemise blanche couleur, cadre rond
function PortraitCarousel({ alt, label, founderLabel }: { alt: string; label: string; founderLabel: string }) {
  return (
    <div className="space-y-5">
      <div className="relative w-full aspect-square">
        <div className="absolute -inset-4 bg-gold/15 rounded-full blur-2xl" />
        <div className="absolute -inset-2 bg-gold/30 rounded-full blur-md" />
        <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-gold/40 shadow-2xl shadow-navy/30">
          <Image
            src="/images/pascal-portraits/blanche.png"
            alt={alt}
            fill
            sizes="(max-width: 1024px) 80vw, 360px"
            className="object-cover object-top"
            priority
          />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-navy text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-lg whitespace-nowrap">
          {label} · <span className="text-gold">{founderLabel}</span>
        </div>
      </div>
    </div>
  );
}

const TIMELINE_KEYS = ["2017", "2017-2020", "2021-2023", "2024-2025", "2025"] as const;
const ECO_KEYS = ["ironetik", "terciel", "iss"] as const;
const ZONE_KEYS = ["pf", "nc", "wf", "ps"] as const;
const IMPACT_KEYS = ["continuity", "economic", "institutional", "employment"] as const;
const IMPACT_ICONS: Record<(typeof IMPACT_KEYS)[number], string> = {
  continuity: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
  economic: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  institutional: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  employment: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342",
};

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
  const t = useTranslations("cabinet.map");
  return (
    <svg viewBox="0 0 900 520" className="w-full h-auto" aria-label={t("ariaLabel")}>
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

      <rect width="900" height="520" fill="url(#ocean)" rx="16" />

      {[130, 260, 390].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="900" y2={y} stroke="oklch(1 0 0 / 0.04)" strokeWidth="0.5" />
      ))}
      {[180, 360, 540, 720].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="520" stroke="oklch(1 0 0 / 0.04)" strokeWidth="0.5" />
      ))}
      <line x1="0" y1="130" x2="900" y2="130" stroke="oklch(1 0 0 / 0.06)" strokeWidth="0.5" strokeDasharray="8 4" />
      <text x="12" y="125" fill="oklch(1 0 0 / 0.15)" fontSize="7">{t("equator")}</text>
      <line x1="0" y1="310" x2="900" y2="310" stroke="oklch(1 0 0 / 0.06)" strokeWidth="0.5" strokeDasharray="8 4" />
      <text x="12" y="305" fill="oklch(1 0 0 / 0.15)" fontSize="7">{t("capricorn")}</text>

      <path d="M70,310 Q90,280 130,275 Q160,270 180,290 Q195,310 190,340 Q185,370 160,390 Q130,405 100,395 Q75,380 65,355 Q60,335 70,310Z" fill="oklch(0.30 0.04 250)" opacity="0.35" />
      <text x="125" y="345" textAnchor="middle" fill="oklch(1 0 0 / 0.12)" fontSize="10" fontWeight="500">{t("australia")}</text>

      <path d="M270,385 Q275,370 280,365 Q285,375 283,390 Q280,400 270,405 Z" fill="oklch(0.30 0.04 250)" opacity="0.35" />
      <path d="M278,405 Q282,395 286,400 Q284,415 278,420 Z" fill="oklch(0.30 0.04 250)" opacity="0.35" />
      <text x="295" y="410" fill="oklch(1 0 0 / 0.12)" fontSize="7">{t("nz")}</text>

      <path d="M150,200 Q170,190 190,195 Q195,205 185,215 Q170,220 155,215 Z" fill="oklch(0.30 0.04 250)" opacity="0.3" />

      <circle cx="370" cy="280" r="4" fill="oklch(0.30 0.04 250)" opacity="0.3" />
      <text x="380" y="278" fill="oklch(1 0 0 / 0.15)" fontSize="7">{t("fiji")}</text>

      <circle cx="430" cy="230" r="3" fill="oklch(0.30 0.04 250)" opacity="0.25" />
      <text x="440" y="228" fill="oklch(1 0 0 / 0.12)" fontSize="7">{t("samoa")}</text>

      <circle cx="395" cy="310" r="2.5" fill="oklch(0.30 0.04 250)" opacity="0.25" />
      <text x="405" y="313" fill="oklch(1 0 0 / 0.12)" fontSize="7">{t("tonga")}</text>

      <line x1="640" y1="280" x2="340" y2="310" stroke="oklch(0.72 0.12 85 / 0.2)" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="640" y1="280" x2="370" y2="255" stroke="oklch(0.55 0.12 245 / 0.12)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1="340" y1="310" x2="370" y2="255" stroke="oklch(0.55 0.12 245 / 0.1)" strokeWidth="0.8" strokeDasharray="4 4" />

      <circle cx="370" cy="255" r="14" fill="oklch(0.55 0.12 245 / 0.1)" className="animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      <circle cx="370" cy="255" r="5" fill="oklch(0.55 0.12 245 / 0.7)" />
      <circle cx="370" cy="255" r="2.5" fill="oklch(0.22 0.05 250)" />
      <text x="370" y="242" textAnchor="middle" fill="oklch(1 0 0 / 0.5)" fontSize="9" fontWeight="500">{t("wallisFutuna")}</text>

      <path d="M325,305 Q335,295 350,300 Q358,305 355,315 Q348,322 335,320 Q325,315 325,305Z" fill="oklch(0.55 0.12 245 / 0.4)" />
      <circle cx="340" cy="310" r="18" fill="oklch(0.55 0.12 245 / 0.1)" className="animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <circle cx="340" cy="310" r="7" fill="oklch(0.55 0.12 245)" />
      <circle cx="340" cy="310" r="3.5" fill="oklch(0.22 0.05 250)" />
      <text x="340" y="340" textAnchor="middle" fill="oklch(1 0 0 / 0.6)" fontSize="10" fontWeight="500">{t("newCaledonia")}</text>
      <text x="340" y="352" textAnchor="middle" fill="oklch(1 0 0 / 0.3)" fontSize="7">{t("noumea")}</text>

      <circle cx="620" cy="260" r="2" fill="oklch(0.72 0.12 85 / 0.4)" />
      <text x="635" y="258" fill="oklch(1 0 0 / 0.25)" fontSize="6">{t("marquesas")}</text>
      <circle cx="660" cy="290" r="1.5" fill="oklch(0.72 0.12 85 / 0.3)" />
      <text x="672" y="293" fill="oklch(1 0 0 / 0.2)" fontSize="6">{t("tuamotu")}</text>
      <circle cx="610" cy="300" r="2" fill="oklch(0.72 0.12 85 / 0.4)" />
      <text x="590" y="310" fill="oklch(1 0 0 / 0.25)" fontSize="6">{t("boraBora")}</text>

      <circle cx="640" cy="280" r="28" fill="oklch(0.72 0.12 85 / 0.12)" className="animate-pulse-soft" />
      <circle cx="640" cy="280" r="16" fill="oklch(0.72 0.12 85 / 0.15)" className="animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
      <circle cx="640" cy="280" r="10" fill="oklch(0.72 0.12 85)" filter="url(#glow)" />
      <circle cx="640" cy="280" r="5" fill="oklch(0.22 0.05 250)" />

      <text x="640" y="255" textAnchor="middle" fill="oklch(0.85 0.10 85)" fontSize="13" fontWeight="700">{t("frenchPolynesia")}</text>
      <text x="640" y="318" textAnchor="middle" fill="oklch(1 0 0 / 0.4)" fontSize="8">{t("tahitiSiege")}</text>

      <ellipse cx="500" cy="290" rx="250" ry="120" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="1" strokeDasharray="4 8" />
      <text x="500" y="425" textAnchor="middle" fill="oklch(1 0 0 / 0.12)" fontSize="8" letterSpacing="0.15em">{t("zoneLabel")}</text>

      <rect x="592" y="325" width="96" height="22" rx="11" fill="oklch(0.72 0.12 85 / 0.2)" />
      <text x="640" y="339" textAnchor="middle" fill="oklch(0.85 0.10 85)" fontSize="9" fontWeight="600">{t("missionsPf")}</text>

      <rect x="296" y="356" width="88" height="20" rx="10" fill="oklch(0.55 0.12 245 / 0.2)" />
      <text x="340" y="369" textAnchor="middle" fill="oklch(0.65 0.10 245)" fontSize="8" fontWeight="600">{t("missionsNc")}</text>
    </svg>
  );
}

/* ===== Page ===== */
export default function LeCabinetPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const t = useTranslations("cabinet");

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/images/hero-cabinet.jpg" alt={t("hero.imageAlt")} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 overlay-hero" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label={t("hero.label")}
              title={t("hero.title")}
              light
            />
          </div>
        </div>
      </section>

      {/* ===== MANIFESTE PBC ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal space-y-6 text-warm leading-[1.85] text-base" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <p>{t("manifeste.p1")}</p>
            <p>{t("manifeste.p2")}</p>
            <p>{t("manifeste.p3")}</p>
            <p>{t("manifeste.p4")}</p>
            <p>{t("manifeste.p5")}</p>
          </div>
        </div>
      </section>

      {/* ===== PORTRAIT PASCAL ===== */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <div className="gsap-reveal-scale">
                <PortraitCarousel
                  alt={t("portrait.imageAlt")}
                  label={t("portrait.name")}
                  founderLabel={t("portrait.founderLabel")}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="gsap-reveal">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{t("portrait.kicker")}</span>
                <h2 className="mt-3 font-display text-fluid-4xl font-bold text-navy">{t("portrait.name")}</h2>
              </div>

              <div className="gsap-reveal mt-6 space-y-4 text-warm leading-relaxed">
                <p>{t("portrait.bioP1")}</p>
                <p>{t("portrait.bioP2")}</p>
                <p>{t("portrait.bioP3")}</p>
                <p>
                  <strong className="text-navy">{t("portrait.bioP4Strong")}</strong>
                </p>
              </div>

              {/* Citation */}
              <div className="gsap-reveal mt-8 p-6 bg-gold/5 border-l-4 border-gold rounded-r-xl">
                <blockquote className="text-navy italic leading-relaxed">
                  {t("portrait.quote")}
                </blockquote>
              </div>

              <div className="gsap-reveal mt-10 grid grid-cols-3 gap-4">
                <Stat value={60} suffix="+" label={t("portrait.statMissions")} />
                <Stat value={8} suffix="" label={t("portrait.statYears")} />
                <Stat value={4} suffix="" label={t("portrait.statTerritories")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEME ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label={t("ecosysteme.label")}
              title={t("ecosysteme.title")}
            />
          </div>

          <div className="gsap-reveal space-y-4 text-warm leading-relaxed mb-12">
            <p>{t("ecosysteme.intro")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-stagger-parent>
            {ECO_KEYS.map((key) => (
              <div
                key={key}
                className="card-hover p-8 bg-navy-50/30 rounded-3xl border border-navy-100/30 text-center"
                data-stagger-child
              >
                <div className="w-14 h-14 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{t(`ecosysteme.items.${key}.name`)}</h3>
                <p className="mt-2 text-sm text-warm leading-relaxed">{t(`ecosysteme.items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle label={t("timeline.label")} title={t("timeline.title")} />
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-navy-200 to-transparent hidden md:block" />
            <div className="space-y-10" data-stagger-parent>
              {TIMELINE_KEYS.map((key) => (
                <div key={key} className="relative flex gap-8" data-stagger-child>
                  <div className="hidden md:flex shrink-0 w-16 items-start justify-center pt-1">
                    <div className="w-4 h-4 bg-gold rounded-full border-4 border-navy-50 z-10 shadow-glow-gold" />
                  </div>
                  <div className="flex-1 p-7 bg-white rounded-2xl border border-navy-100/40 card-hover">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{t(`timeline.items.${key}.year`)}</span>
                    <h3 className="mt-2 font-display text-xl font-bold text-navy">{t(`timeline.items.${key}.title`)}</h3>
                    <p className="mt-3 text-sm text-warm leading-relaxed">{t(`timeline.items.${key}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coquillage */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle label={t("coquillage.label")} title={t("coquillage.title")} />
          </div>
          <div className="gsap-reveal grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr] gap-10 lg:gap-16 items-center">
            <div className="flex justify-center md:justify-start">
              <Image
                src="/images/logo-pbc-transparent.png"
                alt={t("coquillage.imageAlt")}
                width={720}
                height={720}
                className="w-56 md:w-full h-auto drop-shadow-[0_10px_40px_rgba(15,40,77,0.25)]"
              />
            </div>
            <div className="space-y-6 text-warm leading-relaxed">
              <p>{t("coquillage.p1")}</p>
              <p>
                {t("coquillage.p2Before")}
                <em className="text-navy font-medium">{t("coquillage.p2Em")}</em>
                {t("coquillage.p2After")}
              </p>
              <p>{t("coquillage.p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Zones d'intervention */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <Image src="/images/aratika-village.jpg" alt={t("zones.imageAlt")} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 overlay-cta" />
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal">
            <SectionTitle
              label={t("zones.label")}
              title={t("zones.title")}
              description={t("zones.description")}
              light
            />
          </div>
          <div className="gsap-reveal-scale mt-12 rounded-3xl overflow-hidden border border-white/[0.06]">
            <PacificMap />
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-stagger-parent>
            {ZONE_KEYS.map((key) => (
              <div key={key} className="card-hover p-8 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl" data-stagger-child>
                <h3 className="font-display text-xl font-bold text-white">{t(`zones.items.${key}.name`)}</h3>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">{t(`zones.items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact territorial */}
      <section className="py-24 lg:py-32 bg-navy-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-16">
            <SectionTitle label={t("impact.label")} title={t("impact.title")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-stagger-parent>
            {IMPACT_KEYS.map((key) => (
              <div key={key} className="card-hover p-8 bg-white rounded-3xl border border-navy-100/30" data-stagger-child>
                <div className="w-12 h-12 bg-gold/8 rounded-2xl flex items-center justify-center text-gold mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d={IMPACT_ICONS[key]} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-navy">{t(`impact.items.${key}.title`)}</h3>
                <p className="mt-3 text-sm text-warm leading-relaxed">{t(`impact.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce que PBC apporte */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center mb-12">
            <SectionTitle
              label={t("support.label")}
              title={t("support.title")}
            />
          </div>

          <div className="space-y-6 text-warm leading-relaxed text-center">
            <p className="mx-auto">{t("support.p1")}</p>
            <p className="mx-auto">{t("support.p2")}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-reveal">
            <h2 className="font-display text-fluid-4xl font-bold text-navy text-balance">
              {t("cta.title")}
            </h2>
            <p className="mt-5 text-fluid-lg text-warm leading-relaxed">
              {t("cta.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm">
                {t("cta.ctaPrimary")}
              </Link>
              <Link href="/realisations" className="inline-flex items-center justify-center px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300 text-sm">
                {t("cta.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-16 mx-auto max-w-3xl px-4 text-center text-[11px] text-warm/50">
          {t("cta.legal")}
        </p>
      </section>
    </div>
  );
}
