"use client";

import { useRef, useEffect } from "react";
import SectionReveal from "@/components/effects/SectionReveal";
import { useT } from "@/lib/i18n/useT";

export default function InfraSection() {
  const t = useT("infra");
  const vizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = vizRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("is-visible");
        else el.classList.remove("is-visible");
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="infrastructure" className="section-padding border-t border-border">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16 reveal-child">
            <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
              {t?.label ?? "Infrastructure"}
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              {t ? (
                <>{t.title}{" "}<span className="gradient-text-coral">{t.titleHighlight}</span>{t.titleEnd}</>
              ) : (
                <>Tout votre business{" "}<span className="gradient-text-coral">connecté</span>. Enfin.</>
              )}
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal>
          <div className="reveal-child glass rounded-3xl border border-border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* Left — Visual diagram */}
              <div
                ref={vizRef}
                className="infra-viz relative h-[280px] lg:h-auto lg:min-h-[320px] flex items-center justify-center p-8"
              >
                {/* SVG connections */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 300 200"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  {/* Lines from corners to center */}
                  <line x1="60" y1="50" x2="150" y2="100" stroke="rgba(249,112,102,0.2)" strokeWidth="1" className="infra-line" />
                  <line x1="240" y1="50" x2="150" y2="100" stroke="rgba(20,184,166,0.2)" strokeWidth="1" className="infra-line" />
                  <line x1="60" y1="150" x2="150" y2="100" stroke="rgba(20,184,166,0.2)" strokeWidth="1" className="infra-line" />
                  <line x1="240" y1="150" x2="150" y2="100" stroke="rgba(249,112,102,0.2)" strokeWidth="1" className="infra-line" />

                  {/* Animated data packets */}
                  <circle r="3" fill="#f97066" className="infra-packet infra-packet-1">
                    <animateMotion dur="2.5s" repeatCount="indefinite" begin="0s">
                      <mpath href="#path1" />
                    </animateMotion>
                  </circle>
                  <circle r="3" fill="#14b8a6" className="infra-packet infra-packet-2">
                    <animateMotion dur="3s" repeatCount="indefinite" begin="0.8s">
                      <mpath href="#path2" />
                    </animateMotion>
                  </circle>
                  <circle r="3" fill="#14b8a6" className="infra-packet infra-packet-3">
                    <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.5s">
                      <mpath href="#path3" />
                    </animateMotion>
                  </circle>
                  <circle r="3" fill="#f97066" className="infra-packet infra-packet-4">
                    <animateMotion dur="3.2s" repeatCount="indefinite" begin="0.4s">
                      <mpath href="#path4" />
                    </animateMotion>
                  </circle>

                  {/* Motion paths (hidden) */}
                  <path id="path1" d="M60,50 L150,100" fill="none" stroke="none" />
                  <path id="path2" d="M240,50 L150,100" fill="none" stroke="none" />
                  <path id="path3" d="M60,150 L150,100" fill="none" stroke="none" />
                  <path id="path4" d="M240,150 L150,100" fill="none" stroke="none" />

                  {/* Center glow */}
                  <circle cx="150" cy="100" r="20" fill="none" stroke="rgba(249,112,102,0.15)" strokeWidth="1" className="infra-center-ring" />
                  <circle cx="150" cy="100" r="30" fill="none" stroke="rgba(249,112,102,0.08)" strokeWidth="0.5" className="infra-center-ring" />
                </svg>

                {/* Corner nodes */}
                <div className="infra-corner-node" style={{ top: "15%", left: "15%" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-text-secondary">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div className="infra-corner-node" style={{ top: "15%", right: "15%" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-text-secondary">
                    <circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" />
                  </svg>
                </div>
                <div className="infra-corner-node" style={{ bottom: "15%", left: "15%" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-text-secondary">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="infra-corner-node" style={{ bottom: "15%", right: "15%" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-text-secondary">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>

                {/* Center hub */}
                <div className="infra-center-hub">
                  <span className="text-sm font-bold text-white">IA</span>
                </div>
              </div>

              {/* Right — Text content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="font-display text-2xl mb-4">
                  {t ? (
                    <>{t.subtitle}{" "}<span className="gradient-text-coral">{t.subtitleHighlight}</span></>
                  ) : (
                    <>Tout votre business connecté.{" "}<span className="gradient-text-coral">Enfin.</span></>
                  )}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                  {t ? (
                    <>{t.description}{" "}<strong className="text-accent">{t.descriptionBold}</strong> {t.descriptionEnd}</>
                  ) : (
                    <>On ne livre pas un outil dans un coin. On crée un{" "}<strong className="text-accent">système complet</strong> où vos emails, vos réservations, votre facturation et votre service client fonctionnent ensemble, sans que vous ayez a y penser.</>
                  )}
                </p>
                <ul className="space-y-3">
                  {(t?.benefits ?? [
                    "Vos tâches répétitives tournent en automatique",
                    "Un tableau de bord pour tout suivre en un coup d'œil",
                    "Connecté à vos outils actuels — pas besoin de tout changer",
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
