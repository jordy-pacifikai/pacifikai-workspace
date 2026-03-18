"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SplitExpertise() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Left panel slides from left
      gsap.from("[data-panel-left]", {
        x: -120,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
        },
      });

      // Right panel slides from right
      gsap.from("[data-panel-right]", {
        x: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
        },
      });

      // Center line grows
      gsap.from("[data-center-line]", {
        scaleY: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
        },
      });

      // Bullet items stagger
      gsap.from("[data-bullet]", {
        x: -20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      {/* Full width split — no container */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[700px] lg:min-h-[800px] relative">
        {/* Gold center line */}
        <div
          data-center-line
          className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] bg-gold/60 z-10 origin-top"
        />

        {/* LEFT — TERRE & OCEAN */}
        <div
          data-panel-left
          className="relative bg-forest text-white overflow-hidden"
        >
          {/* Background image with blend mode */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `url('/images/pbc-corail.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "overlay",
            }}
          />

          <div className="relative z-10 p-10 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center h-full">
            <span className="tag-terre mb-8 block">Terre</span>
            <h3 className="font-serif text-subheading text-white mb-6 max-w-md">
              Proteger les ecosystemes insulaires
            </h3>
            <p className="font-sans text-base text-white/60 leading-relaxed mb-10 max-w-md font-light">
              Nos territoires du Pacifique abritent une biodiversite unique. Nous
              accompagnons la transition ecologique avec rigueur et pragmatisme.
            </p>
            <ul className="space-y-4 mb-12">
              {[
                "Bilan carbone & strategie bas-carbone",
                "Etudes d'impact biodiversite",
                "Decarbonation des transports",
              ].map((item) => (
                <li
                  key={item}
                  data-bullet
                  className="font-sans text-sm text-white/50 flex items-start gap-3 font-light"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/expertise"
              className="link-slide font-sans text-sm text-white/70 uppercase tracking-[0.15em] font-light inline-flex items-center gap-3 w-fit"
            >
              Explorer
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* RIGHT — CIEL & INFRASTRUCTURES */}
        <div
          data-panel-right
          className="relative bg-steel text-white overflow-hidden"
        >
          {/* Background image with blend mode */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `url('/images/pbc-aeroport.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "overlay",
            }}
          />

          <div className="relative z-10 p-10 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center h-full">
            <span className="tag-ciel mb-8 block">Ciel</span>
            <h3 className="font-serif text-subheading text-white mb-6 max-w-md">
              Connecter les iles au monde
            </h3>
            <p className="font-sans text-base text-white/60 leading-relaxed mb-10 max-w-md font-light">
              L&apos;aviation est le lien vital des territoires insulaires. De la
              certification a la strategie de continuite territoriale.
            </p>
            <ul className="space-y-4 mb-12">
              {[
                "Certification OACI & DGAC",
                "Planification aeroportuaire",
                "Continuite territoriale aerienne",
              ].map((item) => (
                <li
                  key={item}
                  data-bullet
                  className="font-sans text-sm text-white/50 flex items-start gap-3 font-light"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/expertise"
              className="link-slide font-sans text-sm text-white/70 uppercase tracking-[0.15em] font-light inline-flex items-center gap-3 w-fit"
            >
              Explorer
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
