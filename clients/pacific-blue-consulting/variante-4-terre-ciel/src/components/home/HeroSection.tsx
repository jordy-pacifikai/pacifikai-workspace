"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleLine1Ref = useRef<HTMLSpanElement>(null);
  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // SplitText on both title lines
      const split1 = new SplitText(titleLine1Ref.current!, {
        type: "chars",
      });
      const split2 = new SplitText(titleLine2Ref.current!, {
        type: "chars",
      });

      const tl = gsap.timeline({ delay: 0.5 });

      // Chars reveal stagger
      tl.from(split1.chars, {
        y: 80,
        opacity: 0,
        rotateX: -90,
        stagger: 0.03,
        duration: 1,
        ease: "power3.out",
      })
        .from(
          split2.chars,
          {
            y: 80,
            opacity: 0,
            rotateX: -90,
            stagger: 0.03,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.7"
        )
        .from(
          subtitleRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .from(
          scrollRef.current,
          {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.2"
        );

      // Parallax on scroll - overlay darkens, bg moves
      gsap.to(heroRef.current, {
        backgroundPositionY: "30%",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Fade out content on scroll
      gsap.to([titleLine1Ref.current, titleLine2Ref.current, subtitleRef.current], {
        y: -60,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "20% top",
          end: "60% top",
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-[100dvh] min-h-[700px] overflow-hidden hero-bg hero-bg-fixed"
      style={{
        backgroundImage: `url('/images/pbc-hero.png')`,
        backgroundPosition: "center 40%",
      }}
    >
      {/* Radial gradient overlay — dark at bottom-center */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.4) 50%, rgba(26,26,26,0.15) 100%)",
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content — bottom left, editorial */}
      <div className="absolute bottom-0 left-0 right-0 pb-28 md:pb-36">
        <div className="editorial-container">
          <div className="max-w-4xl" style={{ perspective: "600px" }}>
            <h1 className="font-serif text-hero text-white mb-6">
              <span
                ref={titleLine1Ref}
                className="block"
              >
                Votre boussole
              </span>
              <span
                ref={titleLine2Ref}
                className="block"
              >
                dans un monde complexe
              </span>
            </h1>
            <p
              ref={subtitleRef}
              className="font-sans text-[11px] md:text-xs text-white/50 uppercase tracking-[0.25em] font-light"
            >
              Aviation &middot; Environnement &middot; Territoires insulaires
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator — animated line */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-white/30 font-light">
          Decouvrir
        </span>
        <div className="scroll-indicator" />
      </div>
    </section>
  );
}
