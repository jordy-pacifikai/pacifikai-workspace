"use client";

import { useRef, useEffect } from "react";
import SectionReveal from "@/components/effects/SectionReveal";

/* ─────────────────────────────────────────────
   ANIMATED VISUALS — one per service card
───────────────────────────────────────────── */

function WfVisual() {
  return (
    <div className="svc-card-visual wf-visual">
      <div className="wf-pipeline">
        <div className="wf-node wf-node-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span>Trigger</span>
        </div>
        <svg className="wf-wire wf-wire-1" viewBox="0 0 60 20" aria-hidden="true">
          <line x1="0" y1="10" x2="60" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 4"/>
          <circle className="wf-particle" cx="0" cy="10" r="3" fill="#f97066"/>
        </svg>
        <div className="wf-node wf-node-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          <span>IA</span>
        </div>
        <svg className="wf-wire wf-wire-2" viewBox="0 0 60 20" aria-hidden="true">
          <line x1="0" y1="10" x2="60" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 4"/>
          <circle className="wf-particle" cx="0" cy="10" r="3" fill="#f97066"/>
        </svg>
        <div className="wf-node wf-node-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Action</span>
        </div>
      </div>
      <div className="wf-status">
        <span className="wf-status-dot"/>
        <span>3 workflows actifs</span>
      </div>
    </div>
  );
}

function ChatbotVisual() {
  return (
    <div className="svc-card-visual chat-visual">
      <div className="chat-window">
        <div className="chat-header-bar">
          <div className="chat-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div className="chat-header-info">
            <span className="chat-header-name">Assistant IA</span>
            <span className="chat-header-status">
              <span className="chat-online-dot"/>En ligne
            </span>
          </div>
        </div>
        <div className="chat-messages">
          <div className="chat-msg chat-user">Je veux réserver pour samedi</div>
          <div className="chat-typing">
            <span/><span/><span/>
          </div>
          <div className="chat-msg chat-ai">Bien sûr ! Samedi 14h, ça vous va ?</div>
        </div>
      </div>
    </div>
  );
}

function DocsVisual() {
  return (
    <div className="svc-card-visual docs-visual">
      <div className="docs-container">
        <div className="docs-source">
          <div className="docs-page">
            <div className="docs-line" style={{ width: "85%" }}/>
            <div className="docs-line" style={{ width: "70%" }}/>
            <div className="docs-line" style={{ width: "90%" }}/>
            <div className="docs-line" style={{ width: "60%" }}/>
            <div className="docs-line" style={{ width: "80%" }}/>
            <div className="docs-scan-beam"/>
          </div>
          <span className="docs-label">Facture PDF</span>
        </div>
        <svg className="docs-arrow" width="32" height="20" viewBox="0 0 32 20" aria-hidden="true">
          <path d="M0 10h28M22 4l6 6-6 6" stroke="#f97066" strokeWidth="1.5" fill="none"/>
        </svg>
        <div className="docs-output">
          <div className="docs-field docs-field-1">
            <span className="docs-field-label">Montant</span>
            <span className="docs-field-value">450 000 F</span>
          </div>
          <div className="docs-field docs-field-2">
            <span className="docs-field-label">Date</span>
            <span className="docs-field-value">15/03/26</span>
          </div>
          <div className="docs-field docs-field-3">
            <span className="docs-field-label">Client</span>
            <span className="docs-field-value">Société ABC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketingVisual() {
  return (
    <div className="svc-card-visual mkt-visual">
      <div className="mkt-dashboard">
        <div className="mkt-chart-area">
          <div className="mkt-bar mkt-bar-1"/>
          <div className="mkt-bar mkt-bar-2"/>
          <div className="mkt-bar mkt-bar-3"/>
          <div className="mkt-bar mkt-bar-4"/>
          <div className="mkt-bar mkt-bar-5"/>
          <div className="mkt-bar mkt-bar-6"/>
          <div className="mkt-bar mkt-bar-7"/>
        </div>
        <div className="mkt-metrics">
          <div className="mkt-metric mkt-metric-1">
            <div className="mkt-ring-wrap">
              <svg className="mkt-ring" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                <circle
                  className="mkt-ring-progress"
                  cx="22" cy="22" r="16"
                  fill="none" stroke="#f97066" strokeWidth="3"
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                />
              </svg>
              <span className="mkt-metric-value">72%</span>
            </div>
            <span className="mkt-metric-label">Ouverture</span>
          </div>
          <div className="mkt-metric mkt-metric-2">
            <span className="mkt-metric-big">+34%</span>
            <span className="mkt-metric-label">Croissance</span>
          </div>
        </div>
      </div>
      <div className="mkt-badge">
        <span className="mkt-badge-dot"/>
        Campagne active
      </div>
    </div>
  );
}

function LandingPageVisual() {
  return (
    <div className="svc-card-visual lp-visual">
      <div className="lp-browser">
        <div className="lp-toolbar">
          <span className="lp-dot"/>
          <span className="lp-dot"/>
          <span className="lp-dot"/>
          <div className="lp-url"/>
        </div>
        <div className="lp-content">
          <div className="lp-hero-block"/>
          <div className="lp-text-block" style={{ width: "85%" }}/>
          <div className="lp-text-block" style={{ width: "65%" }}/>
          <div className="lp-text-block" style={{ width: "75%" }}/>
          <div className="lp-cta-block"/>
        </div>
      </div>
    </div>
  );
}

function AppVisual() {
  return (
    <div className="svc-card-visual app-visual">
      <div className="app-phone">
        <div className="app-notch"/>
        <div className="app-screen">
          <div className="app-row app-row-accent" style={{ width: "70%" }}/>
          <div className="app-row" style={{ width: "90%" }}/>
          <div className="app-row" style={{ width: "60%" }}/>
          <div className="app-row app-row-accent" style={{ width: "80%" }}/>
        </div>
      </div>
      <span className="app-arrow">&#x21C4;</span>
      <div className="app-sidebar">
        <div className="app-sidebar-item app-sidebar-active" style={{ width: "70%" }}/>
        <div className="app-sidebar-item" style={{ width: "85%" }}/>
        <div className="app-sidebar-item" style={{ width: "60%" }}/>
        <div className="app-sidebar-item" style={{ width: "75%" }}/>
      </div>
    </div>
  );
}

function ConseilVisual() {
  return (
    <div className="svc-card-visual conseil-visual">
      <div className="conseil-steps">
        <div className="conseil-step conseil-step-active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span>Audit</span>
        </div>
        <div className="conseil-wire"/>
        <div className="conseil-step">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
          <span>Forme</span>
        </div>
        <div className="conseil-wire"/>
        <div className="conseil-step">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Suivi</span>
        </div>
      </div>
      <div className="conseil-label">Accompagnement continu</div>
    </div>
  );
}

function ApiVisual() {
  return (
    <div className="svc-card-visual api-visual">
      <div className="api-hub">
        <div className="api-line api-line-v api-line-top"/>
        <div className="api-line api-line-v api-line-bottom"/>
        <div className="api-line api-line-h api-line-right"/>
        <div className="api-line api-line-h api-line-left"/>
        <div className="api-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <div className="api-node api-node-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div className="api-node api-node-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div className="api-node api-node-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
        </div>
        <div className="api-node api-node-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SOLUTIONS DATA
───────────────────────────────────────────── */
const SOLUTIONS = [
  {
    svcClass: "svc-workflow",
    href: "/services/workflows",
    visual: <WfVisual />,
    title: "Automatisation & Workflows",
    description:
      "Vos tâches répétitives tournent en pilote automatique. Emails, relances, rapports, synchronisations — 10 à 20+ workflows connectés.",
  },
  {
    svcClass: "svc-chatbot",
    href: "/services/chatbots",
    visual: <ChatbotVisual />,
    title: "Chatbots & Agents IA",
    description:
      "Vos clients sont accueillis 24/7 sur WhatsApp, Messenger, Instagram et votre site. Réponses instantanées, prises de RDV, qualification de leads.",
  },
  {
    svcClass: "svc-docs",
    href: "/services/documents",
    visual: <DocsVisual />,
    title: "Extraction de documents",
    description:
      "L'IA lit vos factures, contrats et bons de commande. Les données sont extraites et injectées dans vos outils en quelques secondes.",
  },
  {
    svcClass: "svc-marketing",
    href: "/services/marketing",
    visual: <MarketingVisual />,
    title: "Marketing & SEO IA",
    description:
      "Newsletters, posts sociaux, SEO — le contenu est généré par l'IA, programmé et diffusé automatiquement sur tous vos canaux.",
  },
  {
    svcClass: "svc-landing",
    href: "/services/landing-pages",
    visual: <LandingPageVisual />,
    title: "Sites & Landing Pages",
    description:
      "Sites vitrines, landing pages, e-commerce — design premium, responsive, performance 90+ Lighthouse. Du brief au déploiement.",
  },
  {
    svcClass: "svc-apps",
    href: "/services/apps",
    visual: <AppVisual />,
    title: "Applications sur mesure",
    description:
      "Dashboards, CRM, portails clients, apps mobiles PWA — des outils métier connectés à vos données et vos workflows.",
  },
  {
    svcClass: "svc-conseil",
    href: "/services/conseil",
    visual: <ConseilVisual />,
    title: "Conseil & Formation",
    description:
      "Audit de vos process, stratégie IA personnalisée, formation de vos équipes. On vous accompagne de A à Z.",
  },
  {
    svcClass: "svc-api",
    href: "/services/api",
    visual: <ApiVisual />,
    title: "Intégrations API",
    description:
      "Connexion de vos outils existants — CRM, ERP, comptabilité, planning. Tout communique via des APIs sur mesure.",
  },
];

/* ─────────────────────────────────────────────
   SOLUTION CARD
───────────────────────────────────────────── */
function SolutionCard({ sol }: { sol: typeof SOLUTIONS[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("is-visible");
        else el.classList.remove("is-visible");
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      data-tilt
      className={`svc-detail-card ${sol.svcClass} group`}
    >
      {sol.visual}
      <div className="svc-detail-body">
        <h3>{sol.title}</h3>
        <p>{sol.description}</p>
        <a href={sol.href} className="card-cta">
          En savoir plus
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION
───────────────────────────────────────────── */
export default function SolutionsSection() {
  return (
    <section id="solutions" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16 reveal-child">
            <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Solutions complètes
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              Nos solutions en{" "}
              <span className="gradient-text-coral">détail</span>
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal stagger={0.07}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOLUTIONS.map((sol, i) => (
              <div key={i} className="reveal-child">
                <SolutionCard sol={sol} />
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
