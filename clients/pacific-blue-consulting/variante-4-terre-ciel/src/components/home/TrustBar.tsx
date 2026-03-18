"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 60, suffix: "+", label: "Missions realisees" },
  { value: 2017, suffix: "", label: "Annee de creation" },
  { value: 3, suffix: "", label: "Territoires du Pacifique" },
  { value: 100, suffix: "%", label: "Independant" },
];

export function TrustBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      // Set final values immediately
      stats.forEach((stat, i) => {
        const el = numberRefs.current[i];
        if (el) el.textContent = String(stat.value);
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Gold line at top
      gsap.from("[data-gold-line]", {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Counter animations with GSAP
      stats.forEach((stat, i) => {
        const el = numberRefs.current[i];
        if (!el) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.value,
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
        });
      });

      // Labels stagger
      gsap.from("[data-stat-label]", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-white">
      <div className="editorial-container">
        {/* Gold separator line */}
        <div
          data-gold-line
          className="w-full h-px bg-gold/40 mb-16 md:mb-20 origin-left"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="mb-3">
                <span
                  ref={(el) => { numberRefs.current[i] = el; }}
                  className="font-serif text-[clamp(2.5rem,4vw,4.5rem)] text-charcoal leading-none"
                >
                  0
                </span>
                {stat.suffix && (
                  <span className="font-serif text-[clamp(1.5rem,2.5vw,2.5rem)] text-gold leading-none">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p
                data-stat-label
                className="font-sans text-[10px] md:text-xs text-charcoal/40 uppercase tracking-[0.2em]"
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
