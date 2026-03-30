"use client";

import SectionReveal from "@/components/effects/SectionReveal";
import MagneticButton from "@/components/effects/MagneticButton";

const PLANS = [
  {
    name: "Starter",
    price: "100 000",
    unit: "XPF",
    popular: false,
    features: [
      "Design sur mesure responsive",
      "Hebergement premium inclus",
      "Nom de domaine .pf ou .com",
      "SEO local optimise",
      "Formulaire de contact",
      "Livraison en 1-2 semaines",
    ],
    cta: "Demander un devis",
    href: "#contact",
  },
  {
    name: "Business",
    price: "250 000",
    unit: "XPF",
    popular: true,
    features: [
      "Tout le pack Starter",
      "Chatbot IA 24/7 (WhatsApp + site)",
      "5 workflows automatises",
      "Tableau de bord analytics",
      "Formation de votre equipe",
      "Support 3 mois inclus",
    ],
    cta: "Demander un devis",
    href: "#contact",
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    unit: "",
    popular: false,
    features: [
      "Tout le pack Business",
      "Workflows illimites",
      "Application mobile dediee",
      "Integrations API sur mesure",
      "Extraction de documents IA",
      "Support prioritaire 12 mois",
    ],
    cta: "Nous contacter",
    href: "#contact",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16 reveal-child">
            <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Investissement
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              Nos <span className="gradient-text-coral">tarifs</span>
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal stagger={0.12}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                data-tilt
                className={`reveal-child glass rounded-3xl p-8 relative flex flex-col ${
                  plan.popular
                    ? "border-accent/30 border-2 ring-1 ring-accent/10"
                    : "border border-border"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-accent text-bg text-xs font-semibold tracking-wide">
                      Populaire
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="font-display text-xl mb-4">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-display text-[clamp(1.8rem,4vw,2.5rem)] gradient-text-coral">
                    {plan.price}
                  </span>
                  {plan.unit && (
                    <span className="text-text-dim text-sm ml-2">{plan.unit}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-text-secondary">
                      <span className="text-lagoon mt-0.5 flex-shrink-0">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <MagneticButton
                  href={plan.href}
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full justify-center"
                >
                  {plan.cta}
                </MagneticButton>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
