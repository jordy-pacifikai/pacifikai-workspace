"use client";

import { useEffect, useRef } from "react";

export default function HeroHome() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let ctx: { revert: () => void } | null = null;

    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!heroRef.current) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay: 0.3 });

        // Image scale-in
        if (imageRef.current) {
          tl.from(imageRef.current, {
            scale: 1.2,
            duration: 2.5,
            ease: "power2.out",
          }, 0);
        }

        // Title reveal - word by word
        if (titleRef.current) {
          const words = titleRef.current.querySelectorAll(".word");
          tl.from(words, {
            y: 120,
            opacity: 0,
            rotationX: -40,
            stagger: 0.08,
            duration: 1.4,
            ease: "power4.out",
          }, 0.4);
        }

        // Subtitle fade
        if (subtitleRef.current) {
          tl.from(subtitleRef.current, {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          }, 1.2);
        }

        // Scroll indicator
        if (scrollRef.current) {
          tl.from(scrollRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.8,
            ease: "power2.out",
          }, 1.6);
        }

        // Parallax on scroll: image zooms slightly, content fades
        if (heroRef.current && imageRef.current) {
          gsap.to(imageRef.current, {
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        }

        if (heroRef.current && titleRef.current) {
          gsap.to(titleRef.current, {
            y: -60,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "60% top",
              scrub: 0.5,
            },
          });
        }
      }, heroRef);
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, []);

  // Split title into words for stagger animation
  const titleWords = "Votre refuge au c\u0153ur du lagon".split(" ");

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Background image with overlay */}
      <div ref={imageRef} className="absolute inset-0 gpu">
        <div
          className="absolute inset-0 hero-bg"
          style={{
            backgroundImage: `url('/images/povai-hero.png')`,
          }}
        />
      </div>

      {/* Gradient overlay - radial from center-bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end items-center pb-44 md:pb-40 px-8">
        <h1
          ref={titleRef}
          className="font-serif text-white text-center font-light"
          style={{
            fontSize: "clamp(2rem, 4.5vw, 4.5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            perspective: "600px",
          }}
        >
          {titleWords.map((word, i) => (
            <span
              key={i}
              className="word inline-block"
              style={{ marginRight: i < titleWords.length - 1 ? "0.3em" : 0 }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="mt-8 font-sans text-white/50 text-[11px] tracking-[0.25em] uppercase"
        >
          Bora Bora &mdash; Polynesie francaise
        </p>
      </div>

      {/* Scroll indicator — vertical line */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-sans">
          Decouvrir
        </span>
        <div className="scroll-indicator-line" />
      </div>

      {/* Bottom fade for smooth section transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-sand))",
        }}
      />
    </section>
  );
}
