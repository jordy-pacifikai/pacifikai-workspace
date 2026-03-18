"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const timeline = [
  {
    year: "2017",
    title: "Creation",
    description:
      "Fondation de Pacific Blue Consulting a Punaauia, Tahiti.",
  },
  {
    year: "2018",
    title: "Premieres missions aviation",
    description:
      "Certification des aerodromes polynesiens. 5 missions la premiere annee.",
  },
  {
    year: "2019",
    title: "Extension Pacifique",
    description:
      "Premiers contrats en Nouvelle-Caledonie. Audit surete Tontouta.",
  },
  {
    year: "2020",
    title: "Diversification",
    description:
      "Lancement du pole Environnement. Premier bilan carbone aerien.",
  },
  {
    year: "2021",
    title: "30 missions",
    description:
      "Cap symbolique franchi. Reconnaissance regionale etablie.",
  },
  {
    year: "2022",
    title: "AMO strategique",
    description:
      "Accompagnement reconstruction terminal Rangiroa. Schema directeur Bora Bora.",
  },
  {
    year: "2023",
    title: "Biodiversite",
    description:
      "EIE zone recifale. Integration complete terre-ciel dans chaque mission.",
  },
  {
    year: "2024",
    title: "Formation",
    description:
      "Programme de formation 80 agents aeroportuaires en Nouvelle-Caledonie.",
  },
  {
    year: "2025",
    title: "60 missions",
    description:
      "60+ missions realisees. Presence sur 3 territoires du Pacifique.",
  },
  {
    year: "2026",
    title: "Perspectives",
    description:
      "Elargissement vers le Pacifique Central. Decarbonation transport inter-iles.",
  },
];

const values = [
  {
    title: "Independance",
    description:
      "Aucune affiliation a un groupe ou un operateur. Notre conseil est libre, objectif et entierement au service de nos clients.",
    bg: "bg-forest",
  },
  {
    title: "Rigueur",
    description:
      "30 ans d'aviation civile forgent une exigence sans compromis. Chaque recommandation est etayee, chaque chiffre verifie.",
    bg: "bg-steel",
  },
  {
    title: "Ancrage territorial",
    description:
      "Implantes a Tahiti depuis toujours, nous connaissons les realites insulaires de l'interieur. Pas de solutions parachutees.",
    bg: "bg-gold",
  },
  {
    title: "Vision duale",
    description:
      "L'alliance rare de l'expertise aeronautique et de la sensibilite environnementale. Deux mondes, une seule vision strategique.",
    bg: "bg-charcoal",
  },
];

export default function AProposPage() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pascalImgRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero title
      if (heroTitleRef.current) {
        const split = new SplitText(heroTitleRef.current, { type: "chars" });
        gsap.from(split.chars, {
          y: 60,
          opacity: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.3,
        });
      }

      // Horizontal timeline scroll
      if (timelineRef.current && trackRef.current) {
        const track = trackRef.current;
        const scrollWidth = track.scrollWidth - track.clientWidth;

        gsap.to(track, {
          x: -scrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top center",
            end: `+=${scrollWidth}`,
            pin: true,
            scrub: 1,
          },
        });
      }

      // Pascal image — clip-path reveal
      if (pascalImgRef.current) {
        gsap.fromTo(
          pascalImgRef.current,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.4,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: pascalImgRef.current,
              start: "top 75%",
            },
          }
        );
      }

      // Values cards stagger
      valueRefs.current.forEach((card) => {
        if (!card) return;
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });

      // Map SVG points
      gsap.from("[data-map-point]", {
        scale: 0,
        opacity: 0,
        stagger: 0.2,
        duration: 0.6,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: "[data-map]",
          start: "top 70%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Hero — panoramic parallax */}
      <section
        className="relative pt-40 pb-20 md:pt-48 md:pb-28 hero-bg hero-bg-fixed min-h-[50vh] flex items-end"
        style={{
          backgroundImage: `url('/images/pbc-hero.png')`,
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.3) 60%, rgba(26,26,26,0.15) 100%)",
          }}
        />
        <div className="editorial-container relative z-10">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            A propos
          </span>
          <h1
            ref={heroTitleRef}
            className="font-serif text-display text-white max-w-3xl"
          >
            Notre histoire
          </h1>
        </div>
      </section>

      {/* Horizontal Timeline */}
      <section
        ref={timelineRef}
        className="py-20 md:py-28 overflow-hidden bg-cream-dark"
      >
        <div className="editorial-container mb-12">
          <h2 className="font-serif text-subheading text-charcoal">
            10 annees d&apos;engagement
          </h2>
          <p className="font-sans text-xs text-charcoal/30 mt-2 uppercase tracking-[0.15em]">
            Faites defiler pour parcourir notre histoire
          </p>
        </div>

        <div
          ref={trackRef}
          className="flex gap-0 pl-6 md:pl-20 will-change-transform"
          style={{ width: "max-content" }}
        >
          {timeline.map((item) => (
            <div
              key={item.year}
              className="flex-shrink-0 w-[280px] md:w-[350px] relative"
            >
              {/* Line */}
              <div className="h-px bg-separator w-full absolute top-[28px]" />
              {/* Dot */}
              <div className="w-3 h-3 rounded-full bg-gold relative z-10 mb-8" />

              <span className="font-serif text-[clamp(2rem,3vw,3.5rem)] text-charcoal/10 block mb-2 leading-none">
                {item.year}
              </span>
              <h3 className="font-sans text-sm font-medium text-charcoal mb-2">
                {item.title}
              </h3>
              <p className="font-sans text-sm text-charcoal/40 leading-relaxed pr-8 font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pascal Section */}
      <section className="py-24 md:py-36">
        <div className="editorial-container">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
            {/* Photo — 60% with overflow and clip-path */}
            <div className="w-full md:w-[60%] md:-ml-12 lg:-ml-20">
              <div
                ref={pascalImgRef}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden"
                style={{ willChange: "clip-path" }}
              >
                <Image
                  src="/images/pbc-consulting.png"
                  alt="Pascal BAZER-BACHI, fondateur de Pacific Blue Consulting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-charcoal/60 to-transparent">
                  <p className="font-sans text-[10px] text-white/50 uppercase tracking-[0.2em]">
                    Fondateur & Consultant principal
                  </p>
                </div>
              </div>
            </div>

            {/* Bio — 40% */}
            <div className="w-full md:w-[40%] md:pt-12">
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
                Le fondateur
              </span>
              <h2 className="font-serif text-subheading text-charcoal mb-6">
                Pascal BAZER-BACHI
              </h2>
              <p className="font-sans text-base text-charcoal/50 leading-relaxed mb-6 font-light">
                Ancien Directeur de l&apos;Aviation Civile en Polynesie
                francaise, Pascal cumule plus de 30 ans d&apos;experience dans
                le secteur aerien et la gestion des territoires insulaires.
              </p>
              <p className="font-sans text-base text-charcoal/50 leading-relaxed mb-10 font-light">
                En fondant Pacific Blue Consulting en 2017, il a mis cette
                expertise unique au service des collectivites et operateurs du
                Pacifique, avec une conviction : l&apos;aviation et
                l&apos;environnement ne sont pas antagonistes mais
                complementaires.
              </p>

              <blockquote className="border-l-2 border-gold pl-6 py-2">
                <p className="font-serif text-xl italic text-charcoal/60 leading-relaxed">
                  &ldquo;Nos iles meritent des solutions pensees pour elles, pas
                  des modeles importes qui ignorent la realite du
                  Pacifique.&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="editorial-container mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            Nos valeurs
          </span>
          <h2 className="font-serif text-heading text-charcoal">
            Ce qui nous guide
          </h2>
        </div>

        <div className="space-y-4 editorial-container">
          {values.map((v, i) => (
            <div
              key={v.title}
              ref={(el) => { valueRefs.current[i] = el; }}
              className={`${v.bg} text-white rounded-2xl overflow-hidden`}
            >
              <div className="py-12 md:py-16 px-8 md:px-16 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/30 shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl mb-3">
                    {v.title}
                  </h3>
                  <p className="font-sans text-base text-white/60 leading-relaxed max-w-2xl font-light">
                    {v.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Territories Map */}
      <section className="py-24 md:py-36 bg-cream-dark">
        <div className="editorial-container">
          <div className="text-center mb-16">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
              Nos territoires
            </span>
            <h2 className="font-serif text-heading text-charcoal">
              Le Pacifique, notre terrain
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto" data-map>
            <svg
              viewBox="0 0 800 400"
              className="w-full h-auto"
              role="img"
              aria-label="Carte du Pacifique montrant nos zones d'intervention"
            >
              {/* Ocean background */}
              <rect
                width="800"
                height="400"
                fill="#2E4057"
                rx="16"
                opacity="0.06"
              />

              {/* Water pattern */}
              <path
                d="M0 200 Q200 180 400 200 Q600 220 800 200"
                fill="none"
                stroke="#2E4057"
                strokeWidth="0.5"
                opacity="0.15"
              />
              <path
                d="M0 250 Q200 230 400 250 Q600 270 800 250"
                fill="none"
                stroke="#2E4057"
                strokeWidth="0.5"
                opacity="0.1"
              />

              {/* Australia */}
              <path
                d="M60 180 L120 160 L160 170 L180 200 L170 250 L140 280 L100 270 L70 240 Z"
                fill="#E5E5E0"
              />

              {/* New Zealand */}
              <path d="M230 280 L240 310 L235 340 L225 330 Z" fill="#E5E5E0" />
              <path
                d="M235 340 L245 360 L240 380 L230 370 Z"
                fill="#E5E5E0"
              />

              {/* Connection lines */}
              <line
                x1="260"
                y1="250"
                x2="500"
                y2="200"
                stroke="#B8860B"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />
              <line
                x1="500"
                y1="200"
                x2="620"
                y2="220"
                stroke="#B8860B"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />

              {/* Fiji */}
              <circle cx="350" cy="210" r="3" fill="#E5E5E0" />
              <text
                x="350"
                y="198"
                textAnchor="middle"
                className="fill-charcoal/25 font-sans"
                fontSize="9"
              >
                Fidji
              </text>

              {/* Nouvelle-Caledonie */}
              <g data-map-point>
                <circle cx="260" cy="250" r="8" fill="#B8860B" opacity="0.2" />
                <circle cx="260" cy="250" r="5" fill="#B8860B" />
                <text
                  x="260"
                  y="275"
                  textAnchor="middle"
                  className="fill-charcoal font-sans"
                  fontSize="11"
                  fontWeight="500"
                >
                  Nouvelle-Caledonie
                </text>
                <text
                  x="260"
                  y="290"
                  textAnchor="middle"
                  className="fill-charcoal/40 font-sans"
                  fontSize="9"
                >
                  15+ missions
                </text>
              </g>

              {/* Polynesie francaise */}
              <g data-map-point>
                <circle cx="620" cy="220" r="10" fill="#B8860B" opacity="0.2" />
                <circle cx="620" cy="220" r="6" fill="#B8860B" />
                <text
                  x="620"
                  y="245"
                  textAnchor="middle"
                  className="fill-charcoal font-sans"
                  fontSize="11"
                  fontWeight="500"
                >
                  Polynesie francaise
                </text>
                <text
                  x="620"
                  y="260"
                  textAnchor="middle"
                  className="fill-charcoal/40 font-sans"
                  fontSize="9"
                >
                  40+ missions | Siege
                </text>
              </g>

              {/* Pacifique Central */}
              <g data-map-point>
                <circle cx="500" cy="200" r="4" fill="#B8860B" opacity="0.4" />
                <text
                  x="500"
                  y="185"
                  textAnchor="middle"
                  className="fill-charcoal/30 font-sans"
                  fontSize="10"
                >
                  Pacifique Central
                </text>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
