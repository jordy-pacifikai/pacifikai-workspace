"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const expertises = [
  {
    tag: "CIEL",
    title: "Aviation Civile",
    description:
      "Reglementation OACI, certification des aerodromes, audits de conformite, plans de securite et de surete.",
    image:
      "/images/pbc-cockpit.png",
    imageAlt: "Vue depuis un cockpit d'avion",
  },
  {
    tag: "CIEL",
    title: "Infrastructures Aeroportuaires",
    description:
      "Planification, modernisation et mise aux normes des aeroports et aerodromes insulaires du Pacifique.",
    image:
      "/images/pbc-aeroport.png",
    imageAlt: "Infrastructure aeroportuaire",
  },
  {
    tag: "TERRE",
    title: "Environnement & Carbone",
    description:
      "Bilans carbone, strategies de decarbonation, etudes d'impact environnemental, compensation et adaptation.",
    image:
      "/images/pbc-foret.png",
    imageAlt: "Foret tropicale luxuriante",
  },
  {
    tag: "TERRE",
    title: "AMO & Etudes Strategiques",
    description:
      "Assistance a maitrise d'ouvrage, etudes de faisabilite, schemas directeurs, aide a la decision.",
    image:
      "/images/pbc-consulting.png",
    imageAlt: "Reunion de conseil strategique",
  },
  {
    tag: "TERRE",
    title: "Formation & Renforcement",
    description:
      "Formation des equipes aux normes aeronautiques, a la gestion de crise et aux enjeux environnementaux.",
    image:
      "/images/pbc-corail.png",
    imageAlt: "Recif corallien tropical",
  },
  {
    tag: "CIEL",
    title: "Continuite Territoriale",
    description:
      "Planification des liaisons inter-iles, obligations de service public, desserte des archipels eloignes.",
    image:
      "/images/pbc-hero.png",
    imageAlt: "Vue aerienne iles du Pacifique",
  },
];

export function ExpertiseGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Section title
      gsap.from("[data-exp-title]", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Each expertise item — image scale reveal + clip-path
      itemRefs.current.forEach((item) => {
        if (!item) return;
        const img = item.querySelector("[data-exp-img]");
        const imgInner = item.querySelector("[data-exp-img-inner]");
        const text = item.querySelector("[data-exp-text]");

        // Clip-path reveal on image container
        if (img) {
          gsap.fromTo(
            img,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: item,
                start: "top 75%",
              },
            }
          );
        }

        // Image scale shrink during scroll
        if (imgInner) {
          gsap.fromTo(
            imgInner,
            { scale: 1.2 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Text content reveal
        if (text) {
          gsap.from(text, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 70%",
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-36">
      <div className="editorial-container">
        <div data-exp-title className="mb-20 md:mb-28">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            Nos expertises
          </span>
          <h2 className="font-serif text-heading text-charcoal max-w-2xl">
            Un spectre d&apos;intervention unique dans le Pacifique
          </h2>
        </div>

        <div className="space-y-20 md:space-y-32">
          {expertises.map((exp, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={exp.title}
                ref={(el) => { itemRefs.current[i] = el; }}
                className={`flex flex-col gap-8 md:gap-16 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } items-start`}
              >
                {/* Image — 55% with overflow, negative margin */}
                <div
                  className="w-full md:w-[55%] lg:w-[58%] -mt-0 md:-mt-6"
                  data-exp-img
                  style={{ willChange: "clip-path" }}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <div data-exp-img-inner className="absolute inset-0 will-change-transform">
                      <Image
                        src={exp.image}
                        alt={exp.imageAlt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 58vw"
                      />
                    </div>
                    {/* Subtle gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Text — 40% */}
                <div
                  data-exp-text
                  className="w-full md:w-[45%] lg:w-[42%] md:py-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="tag-terre">{exp.tag}</span>
                    <span className="font-sans text-[10px] text-charcoal/20 tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-serif text-subheading text-charcoal mb-5">
                    {exp.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal/50 leading-relaxed font-light mb-8">
                    {exp.description}
                  </p>
                  <a
                    href="/expertise"
                    className="link-slide font-sans text-sm text-charcoal/60 uppercase tracking-[0.12em] font-light inline-flex items-center gap-3"
                  >
                    En savoir plus
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
