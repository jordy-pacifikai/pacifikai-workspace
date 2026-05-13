"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionReveal from "@/components/effects/SectionReveal";
import { useT } from "@/lib/i18n/useT";

gsap.registerPlugin(ScrollTrigger);

const BEFORE = [
  {
    text: "Répondre manuellement à chaque message client",
    detail: "Copier-coller, fautes, oublis... et le client attend.",
  },
  {
    text: "Perdre des heures sur des tâches répétitives",
    detail: "Factures, relances, saisie — toujours les mêmes gestes.",
  },
  {
    text: "Disponible uniquement aux heures de bureau",
    detail: "Un prospect le soir ? Il ira voir ailleurs.",
  },
  {
    text: "Erreurs humaines sur la saisie et le traitement",
    detail: "Un chiffre inversé, un mail oublié, un devis perdu.",
  },
  {
    text: "Suivi client approximatif sur Excel ou papier",
    detail: "Aucune visibilité, aucune relance automatique.",
  },
  {
    text: "Site web statique qui ne génère aucun lead",
    detail: "Beau mais silencieux — zéro conversion.",
  },
  {
    text: "Aucune présence digitale structurée",
    detail: "Pas de SEO, pas de contenu, invisible sur Google.",
  },
];

const AFTER = [
  {
    text: "Chatbot IA qui répond 24/7 instantanément",
    detail: "WhatsApp, Messenger, site web — partout, tout le temps.",
  },
  {
    text: "Workflows automatisés, zéro tâche répétitive",
    detail: "Devis, factures, relances — tout tourne sans vous.",
  },
  {
    text: "Service continu, même la nuit et le week-end",
    detail: "Vos clients sont pris en charge à toute heure.",
  },
  {
    text: "Extraction et traitement IA ultra-précis",
    detail: "Documents, emails, formulaires — traités en secondes.",
  },
  {
    text: "CRM intelligent avec relances automatiques",
    detail: "Chaque prospect est suivi, rien ne tombe dans l'oubli.",
  },
  {
    text: "Site web optimisé qui convertit vos visiteurs",
    detail: "SEO, formulaires, chatbot — chaque visite compte.",
  },
  {
    text: "Stratégie digitale complète et mesurable",
    detail: "Référencement, contenu, pub — tout est piloté par la data.",
  },
];

function AnimatedCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to({ v: 0 }, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate() { setVal(Math.round(this.targets()[0].v)); },
          });
        },
      });
    });
    return () => ctx.revert();
  }, [target]);

  return <span ref={ref}>{val}</span>;
}

export default function CompareSection() {
  const t = useT("compare");
  const beforeItems = t?.before ?? BEFORE;
  const afterItems = t?.after ?? AFTER;

  return (
    <section id="compare" className="section-padding">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16 reveal-child">
            <p className="text-lagoon text-sm font-medium tracking-[0.2em] uppercase mb-4">
              {t?.label ?? "L\u2019impact"}
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              {t ? (
                <>{t.title}{" "}<span className="gradient-text-coral">{t.titleHighlight}</span></>
              ) : (
                <>Avant vs Après{" "}<span className="gradient-text-coral">PACIFIK&apos;AI</span></>
              )}
            </h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">
              {t?.intro ?? "Ce que nos solutions changent concrètement pour votre entreprise, dès les premières semaines."}
            </p>
          </div>
        </SectionReveal>

        <SectionReveal stagger={0.06}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="glass p-8 rounded-3xl border border-accent/10 reveal-child">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg text-accent">{t?.beforeTitle ?? "Sans automatisation IA"}</h3>
                  <p className="text-text-dim text-xs">{t?.beforeSubtitle ?? "La réalité de la plupart des entreprises"}</p>
                </div>
              </div>
              <ul className="space-y-5">
                {beforeItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                      <span className="text-accent text-xs">✕</span>
                    </span>
                    <div>
                      <p className="text-text text-sm font-medium leading-snug">{item.text}</p>
                      <p className="text-text-dim text-xs mt-0.5 leading-relaxed">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="glass p-8 rounded-3xl border border-lagoon/20 relative overflow-hidden reveal-child">
              {/* Subtle glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-lagoon/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-lagoon/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lagoon">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-lagoon">{t?.afterTitle ?? "Avec PACIFIK\u2019AI"}</h3>
                    <p className="text-text-dim text-xs">{t?.afterSubtitle ?? "Votre entreprise, augmentée par l\u2019IA"}</p>
                  </div>
                </div>

                <ul className="space-y-5">
                  {afterItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-lagoon/10 flex items-center justify-center mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lagoon">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-text text-sm font-medium leading-snug">{item.text}</p>
                        <p className="text-text-dim text-xs mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Impact metrics */}
        <SectionReveal>
          <div className="mt-12 glass rounded-2xl border border-white/[0.06] p-8 reveal-child">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-display text-3xl md:text-4xl gradient-text-coral mb-1">
                  <AnimatedCounter target={80} />%
                </div>
                <p className="text-text-dim text-xs">{t?.metrics[0]?.label ?? "de temps gagné sur les tâches admin"}</p>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl text-lagoon mb-1">
                  24<span className="text-xl">/7</span>
                </div>
                <p className="text-text-dim text-xs">{t?.metrics[1]?.label ?? "disponibilité de votre service client"}</p>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl gradient-text-coral mb-1">
                  x<AnimatedCounter target={3} />
                </div>
                <p className="text-text-dim text-xs">{t?.metrics[2]?.label ?? "plus de leads capturés en moyenne"}</p>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl text-lagoon mb-1">
                  <AnimatedCounter target={48} />h
                </div>
                <p className="text-text-dim text-xs">{t?.metrics[3]?.label ?? "pour voir les premiers résultats"}</p>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
