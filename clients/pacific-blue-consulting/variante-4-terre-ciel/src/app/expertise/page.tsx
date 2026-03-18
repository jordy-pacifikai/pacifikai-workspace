"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const domains = [
  {
    id: "aviation",
    tag: "CIEL",
    title: "Aviation Civile & Reglementation",
    description:
      "Fort de 30 ans d'experience dans l'aviation civile, Pascal BAZER-BACHI accompagne les autorites et operateurs aeriens dans la mise en conformite reglementaire, les audits OACI et les processus de certification.",
    prestations: [
      "Audits de conformite OACI et DGAC",
      "Certification des aerodromes (14 CFR Part 139)",
      "Plans de securite et de surete",
      "Reglementation espace aerien",
      "Formation des personnels navigants",
    ],
    caseStudy:
      "Accompagnement de 12 aerodromes polynesiens vers la certification — taux de conformite passe de 62% a 97% en 18 mois.",
    image:
      "/images/pbc-cockpit.png",
    imageAlt: "Cockpit d'avion en vol",
  },
  {
    id: "infrastructures",
    tag: "CIEL",
    title: "Infrastructures Aeroportuaires",
    description:
      "La modernisation des infrastructures aeroportuaires est un enjeu vital pour la continuite territoriale des archipels. Nous intervenons de l'etude de faisabilite a la reception des travaux.",
    prestations: [
      "Schemas directeurs aeroportuaires",
      "Assistance maitrise d'ouvrage (AMO)",
      "Etudes de faisabilite et dimensionnement",
      "Suivi de travaux et reception",
      "Planification capacitaire",
    ],
    caseStudy:
      "Schema directeur de l'aeroport de Bora Bora — optimisation des flux passagers de 40% sans extension du terminal.",
    image:
      "/images/pbc-aeroport.png",
    imageAlt: "Aeroport tropical",
  },
  {
    id: "environnement",
    tag: "TERRE",
    title: "Environnement & Bilan Carbone",
    description:
      "La transition ecologique des territoires insulaires exige une approche adaptee aux realites du Pacifique. Nous realisons des bilans carbone complets et concevons des strategies de decarbonation pragmatiques.",
    prestations: [
      "Bilan GES scopes 1, 2 et 3",
      "Strategie bas-carbone et trajectoire",
      "Compensation carbone certifiee",
      "Formation eco-responsabilite",
      "Reporting RSE et extra-financier",
    ],
    caseStudy:
      "Premier bilan carbone complet d'une compagnie aerienne du Pacifique Sud — identification de 35% de reduction possible sur 5 ans.",
    image:
      "/images/pbc-foret.png",
    imageAlt: "Foret tropicale dense",
  },
  {
    id: "biodiversite",
    tag: "TERRE",
    title: "Biodiversite & Impact Environnemental",
    description:
      "Les ecosystemes du Pacifique comptent parmi les plus riches et les plus fragiles au monde. Nous realisons les etudes d'impact et proposons des mesures d'evitement, de reduction et de compensation.",
    prestations: [
      "Etudes d'impact environnemental (EIE)",
      "Inventaires faunistiques et floristiques",
      "Plans de gestion biodiversite",
      "Mesures compensatoires",
      "Suivi ecologique post-projet",
    ],
    caseStudy:
      "EIE pour l'extension d'un aerodrome en zone recifale — solution de piste decalee preservant 100% du recif frangeant.",
    image:
      "/images/pbc-corail.png",
    imageAlt: "Recif corallien vivant",
  },
  {
    id: "continuite",
    tag: "CIEL",
    title: "Continuite Territoriale",
    description:
      "Assurer la desserte aerienne des archipels eloignes est un defi logistique, economique et politique. Nous accompagnons les collectivites dans la definition de leurs obligations de service public.",
    prestations: [
      "Diagnostic des dessertes existantes",
      "Obligations de service public (OSP)",
      "Dimensionnement et tarification",
      "Negociation des delegations",
      "Evaluation des politiques publiques",
    ],
    caseStudy:
      "Refonte du schema de desserte des Tuamotu — 8 nouvelles liaisons hebdomadaires securisees sur 3 ans.",
    image:
      "/images/pbc-hero.png",
    imageAlt: "Atoll vu du ciel",
  },
  {
    id: "formation",
    tag: "TERRE",
    title: "Formation & Renforcement des Capacites",
    description:
      "Le transfert de competences est au coeur de notre mission. Nous formons les equipes locales aux normes aeronautiques internationales et aux enjeux de la transition ecologique.",
    prestations: [
      "Formation reglementation aeronautique",
      "Gestion de crise aeroportuaire",
      "Sensibilisation environnementale",
      "Coaching de dirigeants",
      "Ateliers strategiques collaboratifs",
    ],
    caseStudy:
      "Programme de formation pour 80 agents aeroportuaires en Nouvelle-Caledonie — certification obtenue par 95% des stagiaires.",
    image:
      "/images/pbc-consulting.png",
    imageAlt: "Session de conseil",
  },
];

const breakImages = [
  {
    src: "/images/pbc-hero.png",
    alt: "Plage tropicale Pacifique",
  },
  {
    src: "/images/pbc-cockpit.png",
    alt: "Vol au-dessus des nuages",
  },
  {
    src: "/images/pbc-corail.png",
    alt: "Monde sous-marin",
  },
  {
    src: "/images/pbc-foret.png",
    alt: "Canopee tropicale",
  },
  {
    src: "/images/pbc-aeroport.png",
    alt: "Lagon polynesien vu du ciel",
  },
];

export default function ExpertisePage() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const domainRefs = useRef<(HTMLElement | null)[]>([]);
  const sideNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero title split
      if (heroTitleRef.current) {
        const split = new SplitText(heroTitleRef.current, {
          type: "words",
        });
        gsap.from(split.words, {
          y: 40,
          opacity: 0,
          stagger: 0.06,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.2,
        });
      }

      // Each domain section — clip-path reveal on image
      domainRefs.current.forEach((section) => {
        if (!section) return;
        const img = section.querySelector("[data-domain-img]");
        const imgInner = section.querySelector("[data-domain-img-inner]");
        const content = section.querySelector("[data-domain-content]");

        if (img) {
          gsap.fromTo(
            img,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1.4,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
              },
            }
          );
        }

        if (imgInner) {
          gsap.fromTo(
            imgInner,
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.4,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
              },
            }
          );
        }

        if (content) {
          gsap.from(content, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 65%",
            },
          });
        }
      });

      // Side nav dot activation
      domainRefs.current.forEach((section, i) => {
        if (!section || !sideNavRef.current) return;
        const dot = sideNavRef.current.children[i] as HTMLElement;
        if (!dot) return;

        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => dot.classList.add("!bg-gold", "!scale-150"),
          onLeave: () => dot.classList.remove("!bg-gold", "!scale-150"),
          onEnterBack: () => dot.classList.add("!bg-gold", "!scale-150"),
          onLeaveBack: () => dot.classList.remove("!bg-gold", "!scale-150"),
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Hero compact with bg image */}
      <section
        className="relative pt-40 pb-20 md:pt-48 md:pb-28 hero-bg hero-bg-fixed min-h-[50vh] flex items-end"
        style={{
          backgroundImage: `url('/images/pbc-cockpit.png')`,
          backgroundPosition: "center 30%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.4) 60%, rgba(26,26,26,0.2) 100%)",
          }}
        />
        <div className="editorial-container relative z-10">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            Notre expertise
          </span>
          <h1
            ref={heroTitleRef}
            className="font-serif text-display text-white max-w-3xl mb-6"
          >
            L&apos;expertise qui reunit terre et ciel
          </h1>
          <p className="font-sans text-base text-white/50 max-w-2xl leading-relaxed font-light">
            Six domaines d&apos;intervention complementaires, forges par 30 ans
            d&apos;experience dans l&apos;aviation civile et
            l&apos;environnement insulaire du Pacifique.
          </p>
        </div>
      </section>

      {/* Sticky side nav (desktop only) */}
      <div
        ref={sideNavRef}
        className="fixed right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-4"
      >
        {domains.map((d, i) => (
          <button
            key={d.id}
            onClick={() =>
              domainRefs.current[i]?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-2.5 h-2.5 rounded-full bg-charcoal/20 transition-all duration-500 hover:bg-gold/60"
            aria-label={d.title}
            title={d.title}
          />
        ))}
      </div>

      {/* Domains */}
      {domains.map((domain, i) => {
        const isEven = i % 2 === 0;

        return (
          <div key={domain.title}>
            <section
              ref={(el) => { domainRefs.current[i] = el; }}
              className="py-20 md:py-28"
            >
              <div className="editorial-container">
                <div
                  className={`flex flex-col gap-10 md:gap-16 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } items-start`}
                >
                  {/* Image — 60% with clip-path reveal */}
                  <div
                    className="w-full md:w-[60%]"
                    data-domain-img
                    style={{ willChange: "clip-path" }}
                  >
                    <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
                      <div
                        data-domain-img-inner
                        className="absolute inset-0 will-change-transform"
                      >
                        <Image
                          src={domain.image}
                          alt={domain.imageAlt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 60vw"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content — 40% */}
                  <div data-domain-content className="w-full md:w-[40%]">
                    <span className="tag-terre mb-4 block">{domain.tag}</span>
                    <h2 className="font-serif text-subheading text-charcoal mb-6">
                      {domain.title}
                    </h2>
                    <p className="font-sans text-base text-charcoal/50 leading-relaxed mb-8 font-light">
                      {domain.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {domain.prestations.map((p) => (
                        <li
                          key={p}
                          className="font-sans text-sm text-charcoal/60 flex items-start gap-3 font-light"
                        >
                          <span className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>

                    <blockquote className="border-l-2 border-gold/30 pl-5">
                      <p className="font-serif text-sm italic text-charcoal/40 leading-relaxed">
                        {domain.caseStudy}
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </section>

            {/* Section break — full-bleed parallax image */}
            {i < domains.length - 1 && breakImages[i] && (
              <div
                className="h-[40vh] min-h-[300px] hero-bg hero-bg-fixed"
                style={{
                  backgroundImage: `url('${breakImages[i].src}')`,
                  backgroundPosition: "center",
                }}
                role="img"
                aria-label={breakImages[i].alt}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
