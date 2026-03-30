"use client";

import Link from "next/link";
import SectionReveal from "@/components/effects/SectionReveal";
import GlassCard from "@/components/effects/GlassCard";
import MagneticButton from "@/components/effects/MagneticButton";

export interface ServiceStep {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ServiceMetric {
  icon: React.ReactNode;
  value: string;
  label: string;
  barPercent?: number;
}

export interface ServiceUseCase {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServicePageProps {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  heroStat?: string;
  heroVisual?: React.ReactNode;
  ctaLabel?: string;
  steps: ServiceStep[];
  stepsTitle: string;
  stepsSubtitle: string;
  metrics: ServiceMetric[];
  metricsTitle: string;
  useCases: ServiceUseCase[];
  useCasesTitle: string;
  useCasesSubtitle: string;
  faqs: ServiceFaq[];
  ctaFinalTitle: string;
  ctaFinalSubtitle: string;
}

function FaqItem({ question, answer }: ServiceFaq) {
  return (
    <details className="group glass rounded-2xl overflow-hidden">
      <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
        <span>{question}</span>
        <span className="ml-4 flex-shrink-0 w-5 h-5 border border-border-light rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </summary>
      <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
        {answer}
      </div>
    </details>
  );
}

export default function ServicePage({
  badge,
  title,
  titleHighlight,
  description,
  heroStat,
  heroVisual,
  ctaLabel = "Demander un devis",
  steps,
  stepsTitle,
  stepsSubtitle,
  metrics,
  metricsTitle,
  useCases,
  useCasesTitle,
  useCasesSubtitle,
  faqs,
  ctaFinalTitle,
  ctaFinalSubtitle,
}: ServicePageProps) {
  return (
    <div className="relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent opacity-[0.08] blur-[100px]" />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-lagoon opacity-[0.06] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] rounded-full bg-accent opacity-[0.05] blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(249, 112, 102, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 112, 102, 0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
      </div>

      {/* Back link */}
      <div className="relative z-10 pt-28 pb-0 px-6 max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors duration-200"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour à l&apos;accueil
        </Link>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-12 pb-20 px-6">
        <div className={`max-w-6xl mx-auto ${heroVisual ? "grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center" : "text-center"}`}>
          <div className={heroVisual ? "" : "max-w-3xl mx-auto flex flex-col items-center gap-6"}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {badge}
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight mb-6">
              {title}{" "}
              <span className="text-accent">{titleHighlight}</span>
            </h1>

            <p className={`text-text-secondary text-lg leading-relaxed mb-8 ${heroVisual ? "max-w-lg" : "max-w-2xl"}`}>
              {description}
            </p>

            {heroStat && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-4 h-4"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                {heroStat}
              </div>
            )}

            <MagneticButton href="/contact" variant="primary">
              {ctaLabel}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </MagneticButton>
          </div>

          {heroVisual && (
            <div className="flex items-center justify-center">
              {heroVisual}
            </div>
          )}
        </div>
      </section>

      {/* Steps — Comment ça marche */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 reveal-child">
              <p className="text-xs font-semibold uppercase tracking-[3px] text-accent mb-3">
                Comment ça marche
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
                {stepsTitle}
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto">
                {stepsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <GlassCard
                  key={step.number}
                  className="reveal-child p-8 text-center rounded-2xl hover:border-accent/30 transition-colors duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    {step.icon}
                  </div>
                  <p className="text-xs font-bold text-accent uppercase tracking-[2px] mb-3">
                    {step.number}
                  </p>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Metrics */}
      <section className="relative z-10 py-20 px-6 bg-bg-card/30">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 reveal-child">
              <p className="text-xs font-semibold uppercase tracking-[3px] text-accent mb-3">
                Chiffres clés
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">
                {metricsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric, i) => (
                <GlassCard
                  key={i}
                  className="reveal-child p-6 text-center rounded-2xl"
                >
                  <div className="text-accent mb-3 flex justify-center">
                    {metric.icon}
                  </div>
                  <div className="font-display text-3xl font-bold text-accent mb-1">
                    {metric.value}
                  </div>
                  <p className="text-text-secondary text-xs leading-snug">
                    {metric.label}
                  </p>
                  {metric.barPercent !== undefined && (
                    <div className="mt-3 w-full h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-[#8b5cf6]"
                        style={{ width: `${metric.barPercent}%` }}
                      />
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 reveal-child">
              <p className="text-xs font-semibold uppercase tracking-[3px] text-accent mb-3">
                Cas d&apos;usage
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
                {useCasesTitle}
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto">
                {useCasesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((uc, i) => (
                <GlassCard
                  key={i}
                  tilt
                  className="reveal-child p-7 rounded-2xl hover:border-accent/30 transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors duration-300">
                    {uc.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold mb-3">
                    {uc.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {uc.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-20 px-6 bg-bg-card/30">
        <div className="max-w-2xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-12 reveal-child">
              <p className="text-xs font-semibold uppercase tracking-[3px] text-accent mb-3">
                FAQ
              </p>
              <h2 className="font-display text-3xl font-semibold">
                Questions fréquentes
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <div key={i} className="reveal-child">
                  <FaqItem {...faq} />
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-xl mx-auto">
          <GlassCard className="p-10 md:p-14 text-center rounded-3xl relative overflow-hidden">
            {/* Glow interne */}
            <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-accent/20 blur-[60px] pointer-events-none" />

            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4 relative">
              {ctaFinalTitle}
            </h2>
            <p className="text-text-secondary mb-8 relative">
              {ctaFinalSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
              <MagneticButton href="/contact" variant="primary">
                Discutons de votre projet →
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
