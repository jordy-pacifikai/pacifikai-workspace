"use client";

import SectionReveal from "@/components/effects/SectionReveal";

const ROI_STATS = [
  {
    value: "-57%",
    label: "Réduction des coûts de service client",
    source: "McKinsey, 2025",
    color: "accent",
  },
  {
    value: "+42%",
    label: "Augmentation du taux de conversion",
    source: "Salesforce State of AI, 2025",
    color: "lagoon",
  },
  {
    value: "3-6 mois",
    label: "Retour sur investissement moyen",
    source: "Gartner, 2025",
    color: "gold",
  },
];

const COLOR_MAP: Record<string, string> = {
  accent: "gradient-text-coral",
  lagoon: "gradient-text-lagoon",
  gold: "text-gold",
};

export default function ROISection() {
  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16 reveal-child">
            <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Résultats prouvés
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              L&apos;impact de l&apos;IA en{" "}
              <span className="gradient-text-coral">chiffres</span>
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal stagger={0.12}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROI_STATS.map((stat, i) => (
              <div
                key={i}
                className="reveal-child glass rounded-3xl p-8 text-center border border-border"
              >
                <div className={`font-display text-[clamp(2rem,5vw,3rem)] mb-3 ${COLOR_MAP[stat.color]}`}>
                  {stat.value}
                </div>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                  {stat.label}
                </p>
                <p className="text-text-dim text-xs">Source: {stat.source}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
