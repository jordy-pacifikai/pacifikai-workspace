"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

type FilterCategory = "all" | "aviation" | "environnement" | "amo" | "etudes";

interface Mission {
  title: string;
  category: FilterCategory;
  categoryLabel: string;
  description: string;
  results: string;
  image: string;
  imageAlt: string;
  size: "large" | "medium" | "small";
}

const missions: Mission[] = [
  {
    title: "Certification des aerodromes polynesiens",
    category: "aviation",
    categoryLabel: "Aviation",
    description:
      "Accompagnement de 12 aerodromes vers la conformite OACI. Audits, plans de correction, formation du personnel.",
    results: "Taux de conformite: 62% -> 97%",
    image:
      "/images/pbc-aeroport.png",
    imageAlt: "Aeroport tropical",
    size: "large",
  },
  {
    title: "Bilan carbone Air Pacifique",
    category: "environnement",
    categoryLabel: "Environnement",
    description:
      "Premier bilan GES complet d'une compagnie aerienne insulaire. Scopes 1, 2 et 3 avec trajectoire de reduction.",
    results: "35% de reduction identifiee sur 5 ans",
    image:
      "/images/pbc-foret.png",
    imageAlt: "Foret tropicale",
    size: "medium",
  },
  {
    title: "Schema directeur aeroport de Bora Bora",
    category: "amo",
    categoryLabel: "AMO",
    description:
      "Planification a 20 ans de l'aeroport. Optimisation des flux sans extension du terminal existant.",
    results: "+40% capacite passagers",
    image:
      "/images/pbc-hero.png",
    imageAlt: "Lagon de Bora Bora vu du ciel",
    size: "medium",
  },
  {
    title: "EIE extension aerodrome en zone recifale",
    category: "environnement",
    categoryLabel: "Environnement",
    description:
      "Etude d'impact environnemental pour l'allongement d'une piste a proximite d'un recif frangeant.",
    results: "100% du recif preserve",
    image:
      "/images/pbc-corail.png",
    imageAlt: "Recif corallien",
    size: "small",
  },
  {
    title: "Desserte aerienne des Tuamotu",
    category: "etudes",
    categoryLabel: "Etudes",
    description:
      "Refonte complete du schema de desserte. Definition des OSP et negociation des delegations.",
    results: "8 nouvelles liaisons hebdomadaires",
    image:
      "/images/pbc-cockpit.png",
    imageAlt: "Avion en vol",
    size: "large",
  },
  {
    title: "Formation agents aeroportuaires Nouvelle-Caledonie",
    category: "aviation",
    categoryLabel: "Aviation",
    description:
      "Programme de formation complet pour 80 agents. Securite, surete, gestion de crise.",
    results: "95% de certification",
    image:
      "/images/pbc-consulting.png",
    imageAlt: "Formation professionnelle",
    size: "small",
  },
  {
    title: "Strategie decarbonation transport inter-iles",
    category: "environnement",
    categoryLabel: "Environnement",
    description:
      "Feuille de route pour la decarbonation du transport aerien et maritime inter-iles.",
    results: "Objectif -50% GES a horizon 2035",
    image:
      "/images/pbc-hero.png",
    imageAlt: "Ocean Pacifique",
    size: "medium",
  },
  {
    title: "Audit surete aeroport international Tontouta",
    category: "aviation",
    categoryLabel: "Aviation",
    description:
      "Audit complet de surete selon les standards OACI. Identification des failles et plan de remediation.",
    results: "Mise en conformite en 6 mois",
    image:
      "/images/pbc-aeroport.png",
    imageAlt: "Terminal aeroportuaire",
    size: "small",
  },
  {
    title: "Etude de faisabilite nouvel aerodrome Marquises",
    category: "etudes",
    categoryLabel: "Etudes",
    description:
      "Analyse technique, financiere et environnementale pour l'implantation d'un nouvel aerodrome.",
    results: "Recommandation retenue par le gouvernement",
    image:
      "/images/pbc-hero.png",
    imageAlt: "Iles du Pacifique vues du ciel",
    size: "medium",
  },
  {
    title: "AMO reconstruction terminal Rangiroa",
    category: "amo",
    categoryLabel: "AMO",
    description:
      "Assistance a maitrise d'ouvrage pour la reconstruction du terminal passagers.",
    results: "Livraison dans les delais et le budget",
    image:
      "/images/pbc-cockpit.png",
    imageAlt: "Architecture aeroportuaire",
    size: "small",
  },
];

const filters: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "aviation", label: "Aviation" },
  { value: "environnement", label: "Environnement" },
  { value: "amo", label: "AMO" },
  { value: "etudes", label: "Etudes" },
];

export default function ReferencesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? missions
        : missions.filter((m) => m.category === activeFilter),
    [activeFilter]
  );

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "large":
        return "col-span-1 md:col-span-2 row-span-2";
      case "medium":
        return "col-span-1 row-span-2";
      case "small":
      default:
        return "col-span-1 row-span-1";
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Hero title
    if (heroTitleRef.current) {
      const split = new SplitText(heroTitleRef.current, { type: "words" });
      gsap.from(split.words, {
        y: 40,
        opacity: 0,
        stagger: 0.06,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
      });
    }
  }, []);

  // Animate grid items on filter change
  useEffect(() => {
    if (!gridRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const items = gridRef.current.children;
    gsap.fromTo(
      items,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.06,
        duration: 0.6,
        ease: "power3.out",
      }
    );
  }, [activeFilter]);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-12 md:pt-44 md:pb-16">
        <div className="editorial-container">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            Nos references
          </span>
          <h1
            ref={heroTitleRef}
            className="font-serif text-display text-charcoal max-w-3xl mb-6"
          >
            60+ missions, 3 territoires
          </h1>
          <p className="font-sans text-base text-charcoal/50 max-w-2xl leading-relaxed font-light">
            Depuis 2017, Pacific Blue Consulting intervient en Polynesie
            francaise, Nouvelle-Caledonie et dans les iles du Pacifique.
          </p>
        </div>
      </section>

      {/* Filters — sticky */}
      <section className="sticky top-[68px] z-30 bg-cream/95 backdrop-blur-md border-b border-separator/50">
        <div className="editorial-container py-4">
          <div
            className="flex gap-2 overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Filtrer par domaine"
          >
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                role="tab"
                aria-selected={activeFilter === f.value}
                className={`px-5 py-2.5 font-sans text-[13px] whitespace-nowrap rounded-full transition-all duration-500 ease-out-expo ${
                  activeFilter === f.value
                    ? "bg-charcoal text-white"
                    : "text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="py-12 md:py-20">
        <div className="editorial-container">
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]"
          >
            {filtered.map((mission, i) => (
              <div
                key={`${activeFilter}-${mission.title}`}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group ${getSizeClasses(
                  mission.size
                )}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image */}
                <Image
                  src={mission.image}
                  alt={mission.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Default overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent transition-opacity duration-500" />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm ${
                      mission.category === "environnement"
                        ? "bg-forest/70 text-white"
                        : "bg-steel/70 text-white"
                    }`}
                  >
                    {mission.categoryLabel}
                  </span>
                </div>

                {/* Title - always visible */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-5 md:p-6 transition-opacity duration-400 ${
                    hoveredIndex === i ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <h3 className="font-serif text-lg md:text-xl text-white leading-snug">
                    {mission.title}
                  </h3>
                </div>

                {/* Hover expanded content — slides up */}
                <div
                  className={`absolute inset-0 bg-charcoal/90 backdrop-blur-sm p-6 flex flex-col justify-end transition-all duration-500 ease-out-expo ${
                    hoveredIndex === i
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <h3 className="font-serif text-lg md:text-xl text-white mb-3">
                    {mission.title}
                  </h3>
                  <p className="font-sans text-sm text-white/60 leading-relaxed mb-4 font-light">
                    {mission.description}
                  </p>
                  <p className="font-sans text-[10px] font-semibold text-gold uppercase tracking-[0.15em]">
                    {mission.results}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
