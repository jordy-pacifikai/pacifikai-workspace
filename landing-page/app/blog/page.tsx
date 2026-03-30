"use client";

import Link from "next/link";
import { useState } from "react";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  image?: string;
};

const ARTICLES: Article[] = [
  {
    slug: "automatisation-ia-entreprise-polynesie",
    title: "Comment l'IA transforme les entreprises en Polynésie française",
    excerpt:
      "Panorama des opportunités d'automatisation pour les PME polynésiennes : gains de temps, réduction des coûts et avantage concurrentiel dans un marché insulaire.",
    category: "Focus Polynésie",
    date: "Mars 2026",
    readTime: "8 min",
    featured: true,
    image: "https://v3b.fal.media/files/b/0a940533/MsceT9au7_JV5GkMUUluC.jpg",
  },
  {
    slug: "chatbot-ia-polynesie",
    title: "Chatbot IA : le nouveau standard du service client en Polynésie",
    excerpt:
      "Retour d'expérience sur le déploiement d'assistants conversationnels pour des entreprises locales. ROI, délais, et bonnes pratiques.",
    category: "Cas Concrets",
    date: "Mars 2026",
    readTime: "6 min",
    image: "https://v3b.fal.media/files/b/0a940533/NmTj2PrYLawXOx28rQTRu.jpg",
  },
  {
    slug: "prix-site-web-polynesie",
    title: "Combien coûte un site web professionnel en Polynésie en 2026 ?",
    excerpt:
      "Comparatif des tarifs pratiqués en Polynésie française, des templates aux sites sur mesure. Ce que vous payez vraiment — et ce que vous devriez éviter.",
    category: "Guides Pratiques",
    date: "Mars 2026",
    readTime: "5 min",
    image: "https://v3b.fal.media/files/b/0a940533/heJWVwR3-N4RxZsVzN4Wk.jpg",
  },
  {
    slug: "intelligence-artificielle-polynesie",
    title: "L'intelligence artificielle en Polynésie : état des lieux 2026",
    excerpt:
      "Quelles entreprises adoptent l'IA à Tahiti ? Quels secteurs sont en avance ? Un tour d'horizon complet du marché local.",
    category: "Focus Polynésie",
    date: "Février 2026",
    readTime: "7 min",
    image: "https://v3b.fal.media/files/b/0a940533/Oy5EwHZS7gGlfmASMCGQ-.jpg",
  },
  {
    slug: "automatisation-ia-vs-employe-polynesie",
    title: "IA vs employé : ce que l'automatisation change vraiment pour les PME",
    excerpt:
      "L'automatisation remplace-t-elle les emplois ? Ou libère-t-elle du temps pour ce qui compte ? Analyse honnête pour les dirigeants polynésiens.",
    category: "Tendances",
    date: "Février 2026",
    readTime: "6 min",
    image: "https://v3b.fal.media/files/b/0a940533/J1cHbAfQy3S4OnKRCUsJd.jpg",
  },
  {
    slug: "starbucks-deep-brew-ia",
    title: "Comment Starbucks utilise l'IA pour personnaliser 100 millions de commandes",
    excerpt:
      "Deep Brew, la plateforme IA de Starbucks, génère des recommandations en temps réel pour chaque client. Les leçons applicables à votre entreprise.",
    category: "Cas Concrets",
    date: "Janvier 2026",
    readTime: "5 min",
    image: "https://v3b.fal.media/files/b/0a8c5bbc/z7vc-eBDfbizjAurNlPEc_b405efbecdbb46efb4ad552ee5acce5c.png",
  },
  {
    slug: "marriott-chatbot-reservation",
    title: "Marriott : comment un chatbot IA gère 60% des réservations en ligne",
    excerpt:
      "Étude de cas complète sur le déploiement de l'assistant conversationnel Marriott. Chiffres réels, architecture technique, et impact sur les équipes.",
    category: "Cas Concrets",
    date: "Janvier 2026",
    readTime: "7 min",
    image: "https://v3b.fal.media/files/b/0a8c5bba/JjL4e8xzZQKqn1msaHopY_a4daac51f27343cba2456cf3fb5905ef.png",
  },
  {
    slug: "klm-service-client-ia",
    title: "KLM : l'IA qui répond à 1 700 questions clients par semaine",
    excerpt:
      "Depuis 2022, KLM utilise BlueBot pour gérer les demandes de service client. Délais divisés par 4, satisfaction en hausse. Décryptage.",
    category: "Cas Concrets",
    date: "Décembre 2025",
    readTime: "6 min",
    image: "https://v3b.fal.media/files/b/0a8c5bb7/AmFVDpoLDQsO9W7xPFti1_cff11274c3d141b7ae8052110a4b1fad.png",
  },
  {
    slug: "hsbc-extraction-documents",
    title: "HSBC extrait des données de millions de documents avec l'IA",
    excerpt:
      "La banque mondiale a déployé un système d'extraction documentaire IA traitant 100 000 contrats par jour. Ce que cela signifie pour le secteur bancaire PF.",
    category: "Cas Concrets",
    date: "Décembre 2025",
    readTime: "5 min",
    image: "https://v3b.fal.media/files/b/0a8c5bbe/Wnx3WF5OZR3_FooVxKaD8_e8bafb6f3a0540f2b4c82db35145e4c9.png",
  },
  {
    slug: "digitalisation-entreprise-tahiti",
    title: "Digitalisation des entreprises à Tahiti : par où commencer ?",
    excerpt:
      "Guide pratique pour les dirigeants polynésiens qui veulent moderniser leurs opérations sans se perdre dans la complexité technique.",
    category: "Guides Pratiques",
    date: "Novembre 2025",
    readTime: "8 min",
    image: "https://v3b.fal.media/files/b/0a940533/tuh0vlAstCVeLDYOdjThF.jpg",
  },
  {
    slug: "creation-site-internet-tahiti",
    title: "Créer un site internet professionnel à Tahiti : le guide complet",
    excerpt:
      "De la conception au lancement : étapes, coûts, délais et pièges à éviter pour votre site web en Polynésie française.",
    category: "Guides Pratiques",
    date: "Novembre 2025",
    readTime: "9 min",
    image: "https://v3b.fal.media/files/b/0a940533/7C8x4bfmGzKB2iDmuS1PQ.jpg",
  },
  {
    slug: "marketing-digital-tahiti",
    title: "Marketing digital à Tahiti : les stratégies qui fonctionnent vraiment",
    excerpt:
      "Facebook, Google, influenceurs locaux ou SEO — quels canaux prioriser pour toucher les consommateurs polynésiens en 2026 ?",
    category: "Tendances",
    date: "Octobre 2025",
    readTime: "7 min",
    image: "https://v3b.fal.media/files/b/0a940533/zPFqJssVV0joBCPf_yw1R.jpg",
  },
  {
    slug: "transformation-digitale-polynesie-francaise",
    title: "Transformation digitale en Polynésie française : enjeux et opportunités",
    excerpt:
      "Analyse des freins et leviers de la transformation numérique dans un territoire insulaire. Infrastructure, compétences, financement.",
    category: "Tendances",
    date: "Octobre 2025",
    readTime: "10 min",
    image: "https://v3b.fal.media/files/b/0a940533/1wWaQu7Tb-rU-l1OWPN7N.jpg",
  },
  {
    slug: "site-web-sur-mesure-vs-template-tahiti",
    title: "Site sur mesure vs template : que choisir pour votre entreprise à Tahiti ?",
    excerpt:
      "WordPress, Wix ou développement custom ? Comparatif détaillé selon votre budget, vos objectifs et votre secteur d'activité.",
    category: "Comparatifs",
    date: "Septembre 2025",
    readTime: "6 min",
    image: "https://v3b.fal.media/files/b/0a940533/U3w1RK4fQdrpnDcKbNpLM.jpg",
  },
  {
    slug: "application-mobile-polynesie",
    title: "Application mobile en Polynésie : est-ce vraiment nécessaire en 2026 ?",
    excerpt:
      "80% du trafic mobile polynésien passe par des PWA ou sites mobiles optimisés. Faut-il encore investir dans une app native ?",
    category: "Comparatifs",
    date: "Septembre 2025",
    readTime: "5 min",
    image: "https://v3b.fal.media/files/b/0a940533/-SsyAW8Euovc8vCsIKdbn.jpg",
  },
  {
    slug: "agence-web-tahiti-2026",
    title: "Agence web à Tahiti : comment choisir le bon prestataire en 2026",
    excerpt:
      "Les critères essentiels pour évaluer une agence digitale polynésienne. Portfolios, références, transparence tarifaire et suivi post-livraison.",
    category: "Guides Pratiques",
    date: "Août 2025",
    readTime: "6 min",
    image: "https://v3b.fal.media/files/b/0a940533/uJzHEn94Mtb-jnGzyzwxj.jpg",
  },
  {
    slug: "agence-digitale-tahiti-guide",
    title: "Guide complet : travailler avec une agence digitale à Tahiti",
    excerpt:
      "Processus, délais, livrables et KPIs à suivre pour maximiser votre investissement digital avec une agence locale.",
    category: "Guides Pratiques",
    date: "Août 2025",
    readTime: "7 min",
    image: "https://v3b.fal.media/files/b/0a940533/hrJ1gI-WfBbddLP1FABSP.jpg",
  },
  {
    slug: "agences-digitales-tahiti-comparatif",
    title: "Comparatif des agences digitales à Tahiti en 2026",
    excerpt:
      "Tour d'horizon des prestataires web et IA présents sur le marché polynésien. Spécialités, tarifs, et positionnement.",
    category: "Comparatifs",
    date: "Juillet 2025",
    readTime: "8 min",
    image: "https://v3b.fal.media/files/b/0a940533/8E_s7Fc11HcMh58rUmCYo.jpg",
  },
  {
    slug: "chatbot-ia-vs-standard-telephonique",
    title: "Chatbot IA vs standard téléphonique : le duel de l'accueil client",
    excerpt:
      "Disponibilité 24/7, coût par interaction, satisfaction client — comparatif chiffré entre accueil humain et assistant IA.",
    category: "Comparatifs",
    date: "Juillet 2025",
    readTime: "5 min",
    image: "https://v3b.fal.media/files/b/0a940533/qiiNPJ0RUzLAoa5-Xd7wu.jpg",
  },
  {
    slug: "automatisation-entreprise-tahiti",
    title: "5 processus à automatiser immédiatement dans votre entreprise tahitienne",
    excerpt:
      "Facturation, relances, prise de RDV, reporting, onboarding client — les automatisations avec le meilleur ROI pour les PME de Polynésie.",
    category: "Guides Pratiques",
    date: "Juin 2025",
    readTime: "7 min",
    image: "https://v3b.fal.media/files/b/0a940533/IzhFgCiahZQobgCrGoyB_.jpg",
  },
];

const CATEGORIES = [
  "Tous",
  "Tendances",
  "Cas Concrets",
  "Focus Polynésie",
  "Guides Pratiques",
  "Comparatifs",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Tendances": "text-[#f97066] bg-[#f97066]/10 border-[#f97066]/20",
  "Cas Concrets": "text-[#14b8a6] bg-[#14b8a6]/10 border-[#14b8a6]/20",
  "Focus Polynésie": "text-[#f5c542] bg-[#f5c542]/10 border-[#f5c542]/20",
  "Guides Pratiques": "text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/20",
  "Comparatifs": "text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Tendances": "from-[#f97066]/20 via-[#e85d5a]/10 to-[#080c14]",
  "Cas Concrets": "from-[#14b8a6]/20 via-[#0d9488]/10 to-[#080c14]",
  "Focus Polynésie": "from-[#f5c542]/20 via-[#eab308]/10 to-[#080c14]",
  "Guides Pratiques": "from-[#a78bfa]/20 via-[#7c3aed]/10 to-[#080c14]",
  "Comparatifs": "from-[#60a5fa]/20 via-[#3b82f6]/10 to-[#080c14]",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Tendances": (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "Cas Concrets": (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Focus Polynésie": (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f5c542" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "Guides Pratiques": (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  "Comparatifs": (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
};

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] ?? "text-white/60 bg-white/5 border-white/10";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase border ${colors}`}
    >
      {category}
    </span>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      data-tilt
      className="group col-span-full grid md:grid-cols-[1.4fr_1fr] glass glass-hover rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#f97066]/30 transition-colors duration-500 hover:shadow-[0_20px_60px_rgba(249,112,102,0.10)]"
    >
      {/* Cover image */}
      <div className={`relative h-56 md:h-auto bg-gradient-to-br ${CATEGORY_GRADIENTS[article.category] ?? "from-[#f97066]/20 to-[#080c14]"} flex items-center justify-center overflow-hidden`}>
        {article.image ? (
          <img
            src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}&w=920&q=75&output=webp`}
            alt={article.title}
            width={920}
            height={480}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIvPjwvc3ZnPg==')] opacity-60" />
            {CATEGORY_ICONS[article.category]}
          </>
        )}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f97066]/15 border border-[#f97066]/30 text-[#f97066] text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm">
            À la une
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center p-8 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge category={article.category} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight mb-3 group-hover:text-[#f97066] transition-colors duration-300">
          {article.title}
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-5">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-text-dim">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-text-dim/40" />
            <span>{article.readTime} de lecture</span>
          </div>
          <span className="text-xs font-semibold text-[#f97066] flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
            Lire
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      data-tilt
      className="group flex flex-col glass glass-hover rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#f97066]/30 transition-colors duration-500 hover:shadow-[0_16px_48px_rgba(249,112,102,0.08)]"
    >
      {/* Cover image */}
      <div className={`relative h-48 bg-gradient-to-br ${CATEGORY_GRADIENTS[article.category] ?? "from-[#f97066]/20 to-[#080c14]"} flex items-center justify-center overflow-hidden`}>
        {article.image ? (
          <img
            src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}&w=800&q=75&output=webp`}
            alt={article.title}
            width={800}
            height={400}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIvPjwvc3ZnPg==')] opacity-60" />
            {CATEGORY_ICONS[article.category]}
          </>
        )}
        <div className="absolute top-3 left-3">
          <CategoryBadge category={article.category} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 pb-6">
        <div className="flex items-center gap-2 text-[11px] text-text-dim mb-3">
          <span>{article.date}</span>
          <span className="w-0.5 h-0.5 rounded-full bg-text-dim/50" />
          <span>{article.readTime} de lecture</span>
        </div>

        <h3 className="font-bold text-base leading-snug tracking-tight mb-2.5 group-hover:text-[#f97066] transition-colors duration-300">
          {article.title}
        </h3>

        <p className="text-text-secondary text-sm leading-relaxed flex-1">
          {article.excerpt}
        </p>

        <span className="inline-flex items-center gap-1.5 text-[#f97066] text-xs font-semibold mt-4 group-hover:gap-2.5 transition-all duration-300">
          Lire l&apos;article
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = activeCategory === "Tous"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const featured = filtered.find((a) => a.featured);
  const rest = featured ? filtered.filter((a) => a !== featured) : filtered;

  return (
    <div className="min-h-screen bg-bg">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[#f97066]/5 blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#14b8a6]/4 blur-[100px]" />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-4 max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#f97066] mb-4">
            Ressources &amp; Insights
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
            L&apos;IA en{" "}
            <span className="gradient-text-coral">action</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Cas concrets d&apos;entreprises qui transforment leurs opérations avec
            l&apos;intelligence artificielle.
          </p>
        </div>

        {/* Category pills — functional filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                cat === activeCategory
                  ? "bg-[#f97066]/15 border-[#f97066]/30 text-[#f97066]"
                  : "bg-white/[0.03] border-white/[0.08] text-text-secondary hover:border-white/20 hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-8 mb-14 text-center">
          <div>
            <p className="text-2xl font-bold text-text">{filtered.length}</p>
            <p className="text-xs text-text-dim uppercase tracking-widest">Articles</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-2xl font-bold text-text">5</p>
            <p className="text-xs text-text-dim uppercase tracking-widest">Catégories</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-2xl font-bold text-text">100%</p>
            <p className="text-xs text-text-dim uppercase tracking-widest">Gratuit</p>
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Featured — spans full width */}
          {featured && <FeaturedCard article={featured} />}

          {/* Regular cards */}
          {rest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {/* Newsletter CTA */}
        <div data-tilt className="mt-20 glass rounded-2xl p-8 md:p-12 text-center border border-white/[0.06]">
          <div className="w-12 h-12 rounded-full bg-[#14b8a6]/15 border border-[#14b8a6]/20 flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#14b8a6]">
              <path d="M2 4h16v12H2V4zm0 0l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Restez informé
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Recevez nos derniers articles sur l&apos;IA et la transformation digitale
            en Polynésie française. Pas de spam — une newsletter mensuelle.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#14b8a6] text-bg font-semibold text-sm hover:bg-[#14b8a6]/90 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}
