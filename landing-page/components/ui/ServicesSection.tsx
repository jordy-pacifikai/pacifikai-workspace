"use client";

import { useRef, useCallback } from "react";
import SectionReveal from "@/components/effects/SectionReveal";
import CardStack from "@/components/ui/CardStack";
import {
  FKDashboard, FKLandingPage, FKEcommerce, FKBookingApp, FKMapApp,
  FKWhatsApp, FKWorkflow, FKEmailAuto, FKAnalytics,
  FKAudit, FKRoadmap, FKKPI, FKFormation,
} from "@/components/ui/FakeUIs";

const SERVICES = [
  {
    icon: "🌐",
    title: "Sites & Applications",
    description:
      "Sites vitrines, landing pages, dashboards, apps métier et portails clients. Du design au déploiement, tout inclus.",
    accent: "coral" as const,
    why: "Pourquoi nous",
    whyPoints: [
      "Design premium, pas de templates",
      "SEO local optimisé dès le départ",
      "Hébergement et maintenance inclus",
    ],
    links: [
      { label: "Sites web", href: "/services/landing-pages" },
      { label: "Applications", href: "/services/apps" },
    ],
    cards: [<FKDashboard key="d" />, <FKLandingPage key="l" />, <FKEcommerce key="e" />, <FKBookingApp key="b" />, <FKMapApp key="m" />],
  },
  {
    icon: "🧠",
    title: "Solutions IA",
    description:
      "Chatbots, agents IA, automatisation des process, marketing IA et extraction de documents.",
    accent: "lagoon" as const,
    why: "Pourquoi nous",
    whyPoints: [
      "Chatbot qui parle comme vous, pas comme un robot",
      "Vos outils actuels restent — on les connecte",
      "Résultats mesurables dès la première semaine",
    ],
    links: [
      { label: "Chatbots", href: "/services/chatbots" },
      { label: "Automatisation", href: "/services/workflows" },
    ],
    cards: [<FKWhatsApp key="w" />, <FKWorkflow key="wf" />, <FKEmailAuto key="ea" />, <FKAnalytics key="an" />],
  },
  {
    icon: "🎓",
    title: "Conseil & Formation",
    description:
      "Audit de vos process, stratégie IA personnalisée, formation de vos équipes et accompagnement continu.",
    accent: "gold" as const,
    why: "Pourquoi nous",
    whyPoints: [
      "On analyse votre activité et on vous dit où vous perdez du temps",
      "Vos équipes apprennent à utiliser l'IA avec des cas concrets",
      "Un interlocuteur unique qui vous suit du début à la fin",
    ],
    links: [
      { label: "Conseil", href: "/services/conseil" },
      { label: "Intégrations", href: "/services/api" },
    ],
    cards: [<FKAudit key="au" />, <FKRoadmap key="rm" />, <FKKPI key="kp" />, <FKFormation key="fm" />],
  },
];

const ACCENT_STYLES = {
  coral: {
    tileAccent: "var(--accent, #f97066)",
    glow: "var(--accent-glow, rgba(249,112,102,0.4))",
    soft: "var(--accent-soft, rgba(249,112,102,0.08))",
    textClass: "text-accent",
    borderHover: "hover:border-accent/40 hover:shadow-[0_0_40px_rgba(249,112,102,0.15)]",
  },
  lagoon: {
    tileAccent: "var(--lagoon, #14b8a6)",
    glow: "var(--lagoon-glow, rgba(20,184,166,0.3))",
    soft: "var(--lagoon-soft, rgba(20,184,166,0.08))",
    textClass: "text-lagoon",
    borderHover: "hover:border-lagoon/40 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]",
  },
  gold: {
    tileAccent: "var(--gold, #f5c542)",
    glow: "rgba(245,197,66,0.3)",
    soft: "rgba(245,197,66,0.08)",
    textClass: "text-gold",
    borderHover: "hover:border-gold/40 hover:shadow-[0_0_40px_rgba(245,197,66,0.15)]",
  },
};

function BentoTile({ service }: { service: typeof SERVICES[number] }) {
  const tileRef = useRef<HTMLDivElement>(null);
  const style = ACCENT_STYLES[service.accent];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    tileRef.current.style.setProperty("--mouse-x", `${x}%`);
    tileRef.current.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  return (
    <div
      ref={tileRef}
      onMouseMove={handleMouseMove}
      data-tilt
      className={`relative bg-bg-card border border-border rounded-2xl overflow-hidden cursor-default transition-colors duration-400 ${style.borderHover} group h-full flex flex-col`}
    >
      {/* Mouse-tracking glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity duration-400"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${style.glow}, transparent 40%)`,
        }}
      />

      {/* Front content — lifts on hover */}
      <div className="relative z-[2] p-7 flex-shrink-0">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] mb-3.5"
          style={{ background: `linear-gradient(135deg, ${style.tileAccent}, transparent)` }}
        >
          {service.icon}
        </div>

        <h3 className="text-[1.15rem] font-bold mb-1.5">{service.title}</h3>
        <p className="text-text-secondary text-[0.88rem] leading-relaxed mb-4">
          {service.description}
        </p>
      </div>

      {/* Card Stack Carousel */}
      <div className="flex-1">
        <CardStack>{service.cards}</CardStack>
      </div>

      {/* Detail panel */}
      <div className="relative z-[3] px-7 py-4 border-t border-border mt-auto flex-shrink-0">
        <h4
          className="text-xs font-semibold uppercase tracking-[0.05em] mb-2"
          style={{ color: style.tileAccent }}
        >
          {service.why}
        </h4>
        <ul className="list-none p-0 m-0 mb-3">
          {service.whyPoints.map((point, i) => (
            <li
              key={i}
              className="text-text-secondary text-[0.82rem] py-0.5 pl-4 relative"
            >
              <span
                className="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full opacity-50"
                style={{ background: style.tileAccent }}
              />
              {point}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          {service.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[0.82rem] font-semibold no-underline hover:underline underline-offset-4 ${style.textClass}`}
            >
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16 reveal-child">
            <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Nos expertises
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              Tout ce qu&apos;il faut pour{" "}
              <span className="gradient-text-coral">digitaliser</span> votre entreprise
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal stagger={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {SERVICES.map((service, i) => (
              <div key={i} className={`reveal-child flex ${i === 2 ? "md:col-span-2 lg:col-span-1" : ""}`}>
                <BentoTile service={service} />
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
