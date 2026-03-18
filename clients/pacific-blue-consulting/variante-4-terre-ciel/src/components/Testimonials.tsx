"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "Pascal a su allier expertise technique et comprehension des enjeux insulaires pour transformer notre approche de la continuite territoriale aerienne.",
    name: "Direction des Transports Aeriens",
    org: "Gouvernement de la Polynesie francaise",
  },
  {
    quote:
      "Un accompagnement remarquable sur notre bilan carbone. Sa connaissance du terrain Pacifique et des contraintes aeriennes est inegalee dans la region.",
    name: "Direction de l'Environnement",
    org: "Province Sud, Nouvelle-Caledonie",
  },
  {
    quote:
      "Pacific Blue Consulting a apporte une vision strategique determinante pour la modernisation de nos infrastructures aeroportuaires.",
    name: "Direction de l'Aviation Civile",
    org: "Polynesie francaise",
  },
  {
    quote:
      "La rigueur methodologique et la parfaite maitrise des reglementations internationales ont ete des atouts decisifs pour la reussite de notre projet.",
    name: "Responsable Infrastructures",
    org: "Aeroport international de Tahiti-Faa'a",
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (index === active || !quoteRef.current) return;

      const tl = gsap.timeline();
      tl.to(quoteRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => setActive(index),
      }).fromTo(
        quoteRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    },
    [active]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((active + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [active, goTo]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-cream-dark py-28 md:py-40 relative overflow-hidden"
    >
      {/* Decorative giant quote marks */}
      <div className="absolute top-12 left-8 md:left-20 font-serif text-[15rem] md:text-[20rem] text-gold/[0.06] leading-none select-none pointer-events-none">
        &ldquo;
      </div>
      <div className="absolute bottom-0 right-8 md:right-20 font-serif text-[15rem] md:text-[20rem] text-gold/[0.06] leading-none select-none pointer-events-none">
        &rdquo;
      </div>

      <div className="editorial-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Quote */}
          <div ref={quoteRef} className="min-h-[200px] flex flex-col items-center justify-center">
            <blockquote>
              <p className="font-serif text-quote italic text-charcoal leading-relaxed text-balance mb-10">
                &ldquo;{testimonials[active].quote}&rdquo;
              </p>
              <footer>
                <p className="font-sans text-sm font-medium text-charcoal tracking-wide">
                  {testimonials[active].name}
                </p>
                <p className="font-sans text-xs text-charcoal/40 mt-1 uppercase tracking-[0.15em]">
                  {testimonials[active].org}
                </p>
              </footer>
            </blockquote>
          </div>

          {/* Dots */}
          <div
            className="flex justify-center gap-3 mt-14"
            role="tablist"
            aria-label="Temoignages"
          >
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={`Temoignage ${i + 1}`}
                className={`h-[3px] rounded-full transition-all duration-500 ease-out-expo ${
                  i === active
                    ? "bg-gold w-10"
                    : "bg-charcoal/15 w-6 hover:bg-charcoal/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
