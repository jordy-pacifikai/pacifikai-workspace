"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function CTAFinal() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title split reveal
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "chars,words" });
        gsap.from(split.chars, {
          y: 40,
          opacity: 0,
          stagger: 0.02,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        });
      }

      // Buttons fade up
      if (buttonsRef.current) {
        gsap.from(buttonsRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[70vh] min-h-[500px] flex items-center justify-center hero-bg hero-bg-fixed"
      style={{
        backgroundImage: `url('/images/pbc-hero.png')`,
        backgroundPosition: "center",
      }}
    >
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(26,26,26,0.8) 0%, rgba(26,26,26,0.5) 40%, rgba(26,26,26,0.3) 100%)",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <h2
          ref={titleRef}
          className="font-serif text-heading text-white mb-10"
        >
          Parlons de votre projet
        </h2>
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-primary">
            Prendre rendez-vous
          </Link>
          <Link href="/contact" className="btn-outline">
            Nous ecrire
          </Link>
        </div>
      </div>
    </section>
  );
}
