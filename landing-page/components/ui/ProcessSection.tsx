"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useT } from "@/lib/i18n/useT";

gsap.registerPlugin(ScrollTrigger);

/* ---------- Process Card 1 — Chat ---------- */
function ChatVisual({ left, right }: { left?: string; right?: string }) {
  return (
    <div className="card-visual-wrap">
      <div className="chat-anim">
        <div className="cb cb-left">{left ?? "On a besoin d\u2019automatiser..."}</div>
        <div className="cb cb-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="cb cb-right">{right ?? "On va auditer et trouver la solution !"}</div>
      </div>
    </div>
  );
}

/* ---------- Process Card 2 — Code Typing ---------- */
function CodeVisual() {
  return (
    <div className="card-visual-wrap">
      <div
        className="code-anim"
        style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "var(--text-dim, #6b7280)" }}
      >
        <div style={{ color: "var(--accent, #f97066)" }}>// solution.ts</div>
        <div>const build = async () =&gt; {"{"}</div>
        <div>
          &nbsp;&nbsp;await{" "}
          <span style={{ color: "var(--accent, #f97066)" }}>deploy</span>()
        </div>
        <div>
          &nbsp;&nbsp;return{" "}
          <span style={{ color: "rgba(240,242,248,0.7)" }}>solution</span>
        </div>
        <div>
          {"}"}<span className="code-cursor" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Process Card 3 — Radar ---------- */
function RadarVisual() {
  return (
    <div
      className="card-visual-wrap"
      style={{
        background: "linear-gradient(135deg, #080c14 0%, rgba(249,112,102,0.05) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        aria-hidden="true"
        className="radar-svg"
        width="80"
        height="80"
        viewBox="0 0 100 100"
      >
        <circle
          className="radar-ring radar-ring-1"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="var(--accent, #f97066)"
          strokeWidth="0.5"
        />
        <circle
          className="radar-ring radar-ring-2"
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="var(--accent, #f97066)"
          strokeWidth="0.5"
        />
        <circle
          className="radar-ring radar-ring-3"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke="var(--accent, #f97066)"
          strokeWidth="0.8"
        />
        <circle
          className="radar-ping"
          cx="50"
          cy="50"
          r="3"
          fill="none"
          stroke="var(--accent, #f97066)"
          strokeWidth="1.5"
        />
        <circle cx="50" cy="50" r="3" fill="var(--accent, #f97066)" />
      </svg>
    </div>
  );
}

const STEPS = [
  {
    step: "01",
    subtitle: "Échange & Audit",
    title: "On discute de votre business",
    description:
      "Un appel de 30 minutes pour comprendre vos défis, vos objectifs et identifier les opportunités d'automatisation les plus impactantes.",
    color: "accent",
    visualType: "chat" as const,
    animClass: "pc-chat",
  },
  {
    step: "02",
    subtitle: "Construction & Tests",
    title: "On développe sur mesure",
    description:
      "Workflows, chatbots, apps, sites — développement agile avec tests en conditions réelles. Vous suivez l'avancement en temps réel.",
    color: "lagoon",
    visualType: "code" as const,
    animClass: "pc-code",
  },
  {
    step: "03",
    subtitle: "Livraison & Formation",
    title: "On déploie et on forme",
    description:
      "Mise en production, formation de votre équipe et support continu pour garantir votre succès. Vous êtes autonomes.",
    color: "gold",
    visualType: "radar" as const,
    animClass: "pc-radar",
  },
];

const COLOR_CLASSES: Record<string, { border: string; text: string; badge: string }> = {
  accent: {
    border: "border-accent/30 hover:border-accent/60",
    text: "text-accent",
    badge: "bg-accent/10 text-accent border-accent/20",
  },
  lagoon: {
    border: "border-lagoon/30 hover:border-lagoon/60",
    text: "text-lagoon",
    badge: "bg-lagoon/10 text-lagoon border-lagoon/20",
  },
  gold: {
    border: "border-gold/30 hover:border-gold/60",
    text: "text-gold",
    badge: "bg-gold/10 text-gold border-gold/20",
  },
};

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useT("process");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>(".process-card");

    // Add is-visible when card enters viewport (for CSS animations)
    const observers: IntersectionObserver[] = [];
    cards.forEach((card) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) card.classList.add("is-visible");
          else card.classList.remove("is-visible");
        },
        { threshold: 0.3 }
      );
      obs.observe(card);
      observers.push(obs);
    });

    // GSAP scroll-driven stagger reveal
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          delay: i * 0.06,
        });
      });
    });

    return () => {
      ctx.revert();
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return (
    <section id="process" ref={sectionRef} className="section-padding">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-lagoon text-sm font-medium tracking-[0.2em] uppercase mb-4">
            {t?.label ?? "Notre méthode"}
          </p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
            {t ? (
              <>{t.title}{" "}<span className="gradient-text-lagoon">{t.titleHighlight}</span></>
            ) : (
              <>Comment ça{" "}<span className="gradient-text-lagoon">marche</span></>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => {
            const cls = COLOR_CLASSES[step.color];
            const ts = t?.steps[i];
            const visual = step.visualType === "chat"
              ? <ChatVisual left={t?.chatLeft} right={t?.chatRight} />
              : step.visualType === "code"
              ? <CodeVisual />
              : <RadarVisual />;
            return (
              <div
                key={i}
                data-tilt
                className={`process-card ${step.animClass} glass rounded-3xl border overflow-hidden transition-colors duration-400 ${cls.border}`}
              >
                {visual}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border ${cls.badge}`}
                    >
                      {step.step}
                    </span>
                    <span className={`text-[11px] tracking-[0.1em] uppercase ${cls.text} opacity-70`}>
                      {ts?.subtitle ?? step.subtitle}
                    </span>
                  </div>
                  <h3 className="font-display text-lg mb-2">{ts?.title ?? step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {ts?.description ?? step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
