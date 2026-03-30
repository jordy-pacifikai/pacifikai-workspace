"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionReveal from "@/components/effects/SectionReveal";


gsap.registerPlugin(ScrollTrigger);

/* ============ Color system ============ */
type AccentColor = "accent" | "lagoon" | "gold" | "purple" | "indigo" | "emerald" | "orange";

const ACCENT_MAP: Record<AccentColor, {
  text: string;
  bg: string;
  hex: string;
  border: string;
  glow: string;
  badge: string;
  gradient: string;
  orbColor: string;
}> = {
  accent: {
    text: "text-accent",
    bg: "bg-accent",
    hex: "#f97066",
    border: "border-accent/30 hover:border-accent/50",
    glow: "shadow-[0_0_40px_rgba(249,112,102,0.15)]",
    badge: "bg-accent/10 text-accent border-accent/20",
    gradient: "gradient-text-coral",
    orbColor: "rgba(249,112,102,0.08)",
  },
  lagoon: {
    text: "text-lagoon",
    bg: "bg-lagoon",
    hex: "#14b8a6",
    border: "border-lagoon/30 hover:border-lagoon/50",
    glow: "shadow-[0_0_40px_rgba(20,184,166,0.15)]",
    badge: "bg-lagoon/10 text-lagoon border-lagoon/20",
    gradient: "gradient-text-lagoon",
    orbColor: "rgba(20,184,166,0.08)",
  },
  gold: {
    text: "text-gold",
    bg: "bg-gold",
    hex: "#f5c542",
    border: "border-gold/30 hover:border-gold/50",
    glow: "shadow-[0_0_40px_rgba(245,197,66,0.15)]",
    badge: "bg-gold/10 text-gold border-gold/20",
    gradient: "gradient-text-coral",
    orbColor: "rgba(245,197,66,0.08)",
  },
  purple: {
    text: "text-purple",
    bg: "bg-purple",
    hex: "#8b5cf6",
    border: "border-purple/30 hover:border-purple/50",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.15)]",
    badge: "bg-purple/10 text-purple border-purple/20",
    gradient: "gradient-text-purple",
    orbColor: "rgba(139,92,246,0.08)",
  },
  indigo: {
    text: "text-indigo",
    bg: "bg-indigo",
    hex: "#6366f1",
    border: "border-indigo/30 hover:border-indigo/50",
    glow: "shadow-[0_0_40px_rgba(99,102,241,0.15)]",
    badge: "bg-indigo/10 text-indigo border-indigo/20",
    gradient: "gradient-text-indigo",
    orbColor: "rgba(99,102,241,0.08)",
  },
  emerald: {
    text: "text-emerald",
    bg: "bg-emerald",
    hex: "#10b981",
    border: "border-emerald/30 hover:border-emerald/50",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    badge: "bg-emerald/10 text-emerald border-emerald/20",
    gradient: "gradient-text-emerald",
    orbColor: "rgba(16,185,129,0.08)",
  },
  orange: {
    text: "text-orange",
    bg: "bg-orange",
    hex: "#f59e0b",
    border: "border-orange/30 hover:border-orange/50",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    badge: "bg-orange/10 text-orange border-orange/20",
    gradient: "gradient-text-orange",
    orbColor: "rgba(245,158,11,0.08)",
  },
};

/* ============ Types ============ */
export interface ExpertiseCompetency {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ExpertiseMetric {
  value: string;
  label: string;
}

export interface ExpertiseProcess {
  step: string;
  title: string;
  description: string;
}

export interface ExpertiseUseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
  result?: string;
}

export interface ExpertisePageProps {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  accentColor: AccentColor;
  heroVisual: React.ReactNode;
  competencies: ExpertiseCompetency[];
  competenciesTitle: string;
  metrics: ExpertiseMetric[];
  process: ExpertiseProcess[];
  useCases: ExpertiseUseCase[];
  useCasesTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

/* ============ Counter animation ============ */
function MetricCounter({ value, label, color }: ExpertiseMetric & { color: AccentColor }) {
  const ref = useRef<HTMLDivElement>(null);
  const cls = ACCENT_MAP[color];

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current!,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className={`font-display text-4xl md:text-5xl font-bold ${cls.text}`}>
        {value}
      </div>
      <p className="text-text-secondary text-sm mt-2">{label}</p>
    </div>
  );
}

/* ============ Main component ============ */
export default function ExpertisePage({
  badge,
  title,
  titleHighlight,
  description,
  accentColor,
  heroVisual,
  competencies,
  competenciesTitle,
  metrics,
  process,
  useCases,
  useCasesTitle,
  ctaTitle,
  ctaSubtitle,
}: ExpertisePageProps) {
  const cls = ACCENT_MAP[accentColor];

  return (
    <div className="relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: cls.orbColor }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-50"
          style={{ background: cls.orbColor }}
        />
      </div>

      {/* ====== HERO ====== */}
      <section className="relative z-10 pt-32 md:pt-40 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
          {/* Left — Text */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6 ${cls.badge}`}>
              <span className={`w-2 h-2 rounded-full ${cls.bg} animate-pulse`} />
              {badge}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight mb-6">
              {title}{" "}
              <span className={cls.gradient}>{titleHighlight}</span>
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-lg mb-8">
              {description}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-opacity"
              style={{ background: cls.hex }}
            >
              Discutons de votre projet
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Right — Animated visual */}
          <div className="flex items-center justify-center">
            {heroVisual}
          </div>
        </div>
      </section>

      {/* ====== COMPETENCIES ====== */}
      <SectionReveal>
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="reveal-child font-display text-3xl md:text-4xl font-semibold text-center mb-12">
              {competenciesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competencies.map((comp, i) => (
                <div
                  key={i}
                  data-tilt
                  className={`reveal-child glass rounded-2xl p-6 border transition-colors duration-300 ${cls.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${cls.badge}`}>
                    {comp.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold mb-2">{comp.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ====== METRICS ====== */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-2xl border p-10 ${cls.border} bg-white/[0.02]`}>
            <div className={`grid gap-8 ${metrics.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
              {metrics.map((m, i) => (
                <MetricCounter key={i} {...m} color={accentColor} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== PROCESS ====== */}
      <SectionReveal>
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="reveal-child font-display text-3xl md:text-4xl font-semibold text-center mb-14">
              Notre <span className={cls.gradient}>approche</span>
            </h2>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-border" />

              {process.map((step, i) => (
                <div key={i} className="reveal-child text-center relative">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 border ${cls.badge} relative z-10 bg-bg`}>
                    <span className="font-display text-lg font-bold">{step.step}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-[280px] mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ====== USE CASES ====== */}
      <SectionReveal>
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="reveal-child font-display text-3xl md:text-4xl font-semibold text-center mb-12">
              {useCasesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  data-tilt
                  className={`reveal-child glass rounded-2xl p-6 border transition-colors duration-300 ${cls.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${cls.badge}`}>
                    {uc.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold mb-2">{uc.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-3">{uc.description}</p>
                  {uc.result && (
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${cls.badge}`}>
                      {uc.result}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ====== CTA ====== */}
      <section className="relative z-10 pb-24 pt-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div data-tilt className={`glass rounded-3xl p-10 md:p-14 border ${cls.border} ${cls.glow}`}>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
              {ctaTitle}
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              {ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-full font-semibold text-sm text-white hover:opacity-90 transition-opacity"
                style={{ background: cls.hex }}
              >
                Discutons de votre projet
              </Link>
              <a
                href="mailto:contact@pacifikai.com"
                className="text-sm text-text-secondary hover:text-text transition-colors"
              >
                contact@pacifikai.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
