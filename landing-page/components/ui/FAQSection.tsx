"use client";

import { useState } from "react";
import SectionReveal from "@/components/effects/SectionReveal";
import { useT } from "@/lib/i18n/useT";

const FAQS_FR = [
  {
    q: "Qu'est-ce qu'une agence digitale à Tahiti ?",
    a: "Une agence digitale à Tahiti comme PACIFIK'AI accompagne les entreprises de Polynésie française dans leur transformation numérique : création de sites web, chatbots IA, automatisation des process, marketing digital et formation.",
  },
  {
    q: "Combien coûte un site internet en Polynésie française ?",
    a: "Un site vitrine professionnel commence à 100 000 XPF avec PACIFIK'AI. Le tarif varie selon les fonctionnalités : chatbot IA, e-commerce, dashboard analytics. Chaque projet est sur mesure avec un devis détaillé gratuit.",
  },
  {
    q: "Comment un chatbot IA peut aider mon entreprise à Tahiti ?",
    a: "Un chatbot IA répond à vos clients 24/7 sur votre site et WhatsApp, qualifie les prospects, prend les rendez-vous et réduit votre charge de service client de 57% en moyenne.",
  },
  {
    q: "L'intelligence artificielle est-elle accessible aux PME polynésiennes ?",
    a: "Absolument. Nos solutions démarrent à 100 000 XPF/mois et s'adaptent à la taille de votre entreprise. L'IA n'est plus réservée aux grandes entreprises — c'est un levier de compétitivité pour les PME.",
  },
  {
    q: "Quelle est la meilleure agence digitale en Polynésie française ?",
    a: "PACIFIK'AI est la première agence spécialisée en intelligence artificielle à Tahiti. Nous combinons expertise web, IA et connaissance du marché polynésien pour des solutions vraiment adaptées.",
  },
  {
    q: "Par où commencer la digitalisation de son entreprise à Tahiti ?",
    a: "Envoyez-nous un email pour nous parler de votre projet. On échange sur vos besoins, on identifie les opportunités et on vous propose une approche personnalisée.",
  },
  {
    q: "PACIFIK'AI intervient-il en dehors de Tahiti ?",
    a: "Oui, nous intervenons sur toute la Polynésie française (Moorea, Bora Bora, Raiatea...) et auprès d'entreprises francophones dans le Pacifique. Nos solutions sont 100% en ligne.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-sm md:text-base pr-4 group-hover:text-accent transition-colors">
          {q}
        </span>
        <span
          className={`text-text-dim text-xl flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-text-secondary text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const t = useT("faq");
  const faqs = t?.items ?? FAQS_FR;

  return (
    <section id="faq" className="section-padding">
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-12 reveal-child">
            <p className="text-lagoon text-sm font-medium tracking-[0.2em] uppercase mb-4">
              {t?.label ?? "FAQ"}
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              {t ? (
                <>{t.title}{" "}<span className="gradient-text-lagoon">{t.titleHighlight}</span></>
              ) : (
                <>Questions{" "}<span className="gradient-text-lagoon">fréquentes</span></>
              )}
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal>
          <div className="glass rounded-3xl p-6 md:p-8 border border-border reveal-child">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
