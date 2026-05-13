"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import RotatingText from "@/components/effects/RotatingText";
import MagneticButton from "@/components/effects/MagneticButton";
import { useT } from "@/lib/i18n/useT";
// import TrustBar from "@/components/ui/TrustBar";

const HeroScene = dynamic(() => import("@/components/3d/HeroScene"), { ssr: false });

export default function HeroSection() {
  const t = useT("hero");
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Badge fade in
      gsap.from(badgeRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.1,
      });
      // Subtitle
      gsap.from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 1.2,
      });
      // CTAs
      gsap.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 1.5,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-screen overflow-visible hero-mesh">
      {/* 3D Canvas — behind text, scrolls with page */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl text-center">
          {/* Badge */}
          <div ref={badgeRef} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-medium tracking-[0.15em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              {t?.badge ?? "Agence IA — Tahiti"}
            </span>
          </div>

          {/* Headline — dynamic rotating */}
          <RotatingText
            prefix={t?.prefix ?? "Transformez votre"}
            words={t?.words ?? [
              "business.",
              "marketing.",
              "service client.",
              "productivité.",
              "croissance.",
              "présence digitale.",
            ]}
            className="font-display font-bold text-[clamp(2.5rem,7vw,5rem)] leading-[1.1] tracking-tight mb-6 text-text"
            interval={3000}
          />

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-text-secondary text-[clamp(1rem,2vw,1.25rem)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t?.subtitle ?? "Création de sites internet, applications mobiles, chatbots IA, automatisation et marketing digital — votre agence digitale en Polynésie française."}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex gap-4 justify-center flex-wrap">
            <MagneticButton href="#services" variant="primary">
              {t?.cta1 ?? "Découvrir nos solutions"}
            </MagneticButton>
            <MagneticButton href="#contact" variant="secondary">
              {t?.cta2 ?? "Nous contacter"}
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Mini trust indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="flex items-center justify-center gap-6 md:gap-10 text-text-dim text-xs tracking-wide">
          <span className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {t?.trust1 ?? "+20 projets livrés"}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {t?.trust2 ?? "100% sur mesure"}
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {t?.trust3 ?? "Basé à Tahiti"}
          </span>
        </div>
      </div>
    </section>
  );
}
