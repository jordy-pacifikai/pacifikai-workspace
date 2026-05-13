import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getOptimalLinks } from "@/lib/internal-links";
import { generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Marketing Digital Automatisé à Tahiti | PACIFIK'AI — IA Polynésie",
  description:
    "Marketing digital automatisé à Tahiti par PACIFIK'AI. Campagnes email, réseaux sociaux, publicité en ligne et SMS automatisés par IA pour entreprises en Polynésie française.",
  alternates: {
    canonical: "https://pacifikai.com/marketing-automatise-tahiti",
  },
  openGraph: {
    title: "Marketing Digital Automatisé à Tahiti | PACIFIK'AI",
    description:
      "Agence marketing digital à Tahiti spécialisée en automatisation IA. Email, social media, ads et SMS pour entreprises polynésiennes.",
    url: "https://pacifikai.com/marketing-automatise-tahiti",
    locale: "fr_PF",
    type: "website",
  },
};

const CHANNELS = [
  {
    title: "Email marketing automatisé",
    desc: "Newsletters, séquences de bienvenue, relances panier abandonné et campagnes promotionnelles — tout est envoyé automatiquement par l'IA selon le comportement de vos contacts.",
    icon: "📧",
  },
  {
    title: "Réseaux sociaux & contenu",
    desc: "Publications Facebook, Instagram et TikTok générées et programmées par l'IA. Visuels, légendes et hashtags adaptés au marché polynésien, sans effort de votre part.",
    icon: "📱",
  },
  {
    title: "Publicité en ligne (Ads)",
    desc: "Campagnes Facebook Ads et Google Ads optimisées par l'intelligence artificielle. Ciblage précis, A/B testing automatique et budget maîtrisé pour un ROI maximal à Tahiti.",
    icon: "📈",
  },
  {
    title: "SMS & notifications",
    desc: "Messages SMS ciblés pour promotions flash, rappels de rendez-vous et confirmations. Taux d'ouverture de 98% — le canal le plus efficace en Polynésie française.",
    icon: "💬",
  },
];

const USE_CASES = [
  {
    title: "Hôtels & pensions",
    desc: "Séquences email avant/pendant/après séjour, demandes d'avis automatiques, promotions basse saison et retargeting des visiteurs du site.",
    icon: "🏨",
  },
  {
    title: "Restaurants & commerces",
    desc: "Programme de fidélité digital, promotions du jour sur les réseaux sociaux, SMS pour les happy hours et relances clients inactifs.",
    icon: "🍽️",
  },
  {
    title: "Prestataires de services",
    desc: "Génération de leads qualifiés, nurturing par email, rappels de rendez-vous automatiques et collecte d'avis Google.",
    icon: "🔧",
  },
  {
    title: "E-commerce & artisanat",
    desc: "Relance panier abandonné, recommandations produits par IA, campagnes saisonnières automatisées et suivi post-achat.",
    icon: "🛒",
  },
];

const APPROACH_STEPS = [
  {
    step: "01",
    title: "Audit & stratégie",
    desc: "Analyse de votre présence digitale actuelle, identification des opportunités et définition d'une stratégie marketing adaptée au marché polynésien.",
  },
  {
    step: "02",
    title: "Configuration des canaux",
    desc: "Mise en place des outils d'automatisation : séquences email, planification réseaux sociaux, campagnes publicitaires et tracking des conversions.",
  },
  {
    step: "03",
    title: "Création de contenu IA",
    desc: "L'intelligence artificielle génère vos visuels, textes et publications. Contenu adapté au ton polynésien et optimisé pour l'engagement local.",
  },
  {
    step: "04",
    title: "Optimisation continue",
    desc: "L'IA analyse les performances en temps réel et ajuste automatiquement vos campagnes. Rapports mensuels détaillés pour suivre votre ROI.",
  },
];

const STATS = [
  { value: "85%", label: "de temps gagné sur le marketing" },
  { value: "3x", label: "plus de leads qualifiés" },
  { value: "98%", label: "taux d'ouverture SMS" },
  { value: "24/7", label: "vos campagnes tournent seules" },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qu'est-ce que le marketing automatisé pour une entreprise à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le marketing automatisé consiste à utiliser l'intelligence artificielle pour gérer vos campagnes marketing sans intervention manuelle. Emails, publications réseaux sociaux, publicités en ligne et SMS sont envoyés automatiquement selon des scénarios prédéfinis. PACIFIK'AI adapte ces technologies au marché polynésien.",
      },
    },
    {
      "@type": "Question",
      name: "Combien coûte le marketing digital automatisé en Polynésie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'accompagnement marketing automatisé par PACIFIK'AI démarre à partir de 50 000 XPF par mois. Ce tarif inclut la gestion de 2 canaux (email + réseaux sociaux), la création de contenu par IA et un rapport mensuel. Les formules complètes avec publicité en ligne sont sur devis.",
      },
    },
    {
      "@type": "Question",
      name: "Le marketing automatisé fonctionne-t-il pour les petites entreprises polynésiennes ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolument. Le marketing automatisé est particulièrement adapté aux PME polynésiennes qui manquent de temps et de ressources pour gérer leur communication. L'IA prend en charge les tâches répétitives — publications, emails, relances — pendant que vous vous concentrez sur votre activité.",
      },
    },
    {
      "@type": "Question",
      name: "Quels résultats peut-on attendre du marketing digital à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nos clients en Polynésie française constatent en moyenne 3 fois plus de leads qualifiés, 85% de temps gagné sur la gestion marketing et une visibilité en ligne significativement améliorée dès le premier mois. Les résultats dépendent du secteur et du budget publicitaire alloué.",
      },
    },
  ],
};

const CITIES = [
  "Papeete",
  "Punaauia",
  "Faa'a",
  "Pirae",
  "Moorea",
  "Bora Bora",
  "Raiatea",
  "Huahine",
  "Rangiroa",
  "Tahaa",
];

const relatedLinks = getOptimalLinks("/marketing-automatise-tahiti", "static", ["marketing", "digital", "automatise", "tahiti", "email", "ads", "polynesie"]);

export default function MarketingAutomatiseTahiti() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Accueil", url: "https://pacifikai.com" }, { name: "Marketing Automatisé Tahiti", url: "https://pacifikai.com/marketing-automatise-tahiti" }])) }} />
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Marketing digital automatisé en Polynésie française
          </p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-6">
            Marketing digital automatisé à Tahiti,{" "}
            <span className="gradient-text-coral">propulsé par l&apos;intelligence artificielle</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl mb-8">
            PACIFIK&apos;AI est votre agence de marketing digital à Tahiti, spécialisée
            dans l&apos;automatisation par IA. Campagnes email, réseaux sociaux,
            publicité en ligne et SMS — tout est généré, envoyé et optimisé
            automatiquement. Vos campagnes marketing tournent en pilote automatique
            pendant que vous vous concentrez sur votre activité en Polynésie française.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Demander un audit gratuit
            </Link>
            <Link
              href="/services/marketing"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-medium hover:border-accent hover:text-accent transition-colors"
            >
              Voir nos services marketing
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-display font-bold gradient-text-coral mb-1">
                  {s.value}
                </div>
                <div className="text-text-secondary text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Qu'est-ce que le marketing automatisé */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Qu&apos;est-ce que le marketing digital automatisé ?
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 max-w-3xl">
            <p>
              Le marketing automatisé utilise l&apos;intelligence artificielle pour
              gérer vos campagnes marketing sans intervention manuelle. Au lieu de
              passer des heures à rédiger des posts, envoyer des emails et gérer vos
              publicités, l&apos;IA s&apos;occupe de tout — de la création du contenu
              à l&apos;envoi, en passant par l&apos;optimisation des performances.
            </p>
            <p>
              Pour les entreprises de Tahiti et de Polynésie française, c&apos;est
              une révolution. Les PME polynésiennes n&apos;ont souvent ni le temps ni
              le budget pour embaucher un community manager ou un responsable marketing
              à plein temps. Grâce au marketing automatisé par IA, vous obtenez les
              mêmes résultats qu&apos;une grande entreprise — à une fraction du coût.
            </p>
            <p>
              Concrètement : un client visite votre site web sans acheter. L&apos;IA
              lui envoie automatiquement un email de relance avec une offre
              personnalisée. En parallèle, vos réseaux sociaux publient du contenu
              régulier sans que vous leviez le petit doigt. Vos campagnes publicitaires
              s&apos;optimisent en temps réel pour toucher les bonnes personnes au bon
              moment, partout en Polynésie.
            </p>
          </div>
        </section>

        {/* Canaux */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Les canaux de votre marketing automatisé
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Une stratégie multi-canal adaptée au comportement des consommateurs
            polynésiens — email, social, ads et SMS, tous pilotés par l&apos;IA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHANNELS.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 hover:border-accent/30 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{s.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      {s.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notre approche */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Notre approche marketing IA
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Un processus structuré pour mettre votre marketing digital en pilote
            automatique, adapté aux spécificités du marché polynésien.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APPROACH_STEPS.map((s) => (
              <div key={s.step} className="glass rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-display font-bold gradient-text-coral mt-0.5">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      {s.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cas d'usage */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Le marketing automatisé pour votre secteur
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Des stratégies concrètes adaptées aux secteurs clés de l&apos;économie
            polynésienne.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {USE_CASES.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 hover:border-accent/30 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{s.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      {s.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Zones d'intervention */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Agence marketing digital pour toute la Polynésie
          </h2>
          <p className="text-text-secondary mb-6 max-w-3xl">
            Basés à Papeete, nous accompagnons les entreprises de toute la Polynésie
            française dans leur stratégie de marketing digital automatisé. Services
            100% en ligne.
          </p>
          <div className="flex flex-wrap gap-3">
            {CITIES.map((city) => (
              <span
                key={city}
                className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary"
              >
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Questions fréquentes sur le marketing automatisé à Tahiti
          </h2>
          <div className="space-y-3 max-w-3xl">
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Qu&apos;est-ce que le marketing automatisé pour une entreprise à Tahiti ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Le marketing automatisé consiste à utiliser l&apos;intelligence artificielle pour gérer vos campagnes marketing sans intervention manuelle. Emails, publications réseaux sociaux, publicités en ligne et SMS sont envoyés automatiquement selon des scénarios prédéfinis. PACIFIK&apos;AI adapte ces technologies au marché polynésien.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Combien coûte le marketing digital automatisé en Polynésie ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                L&apos;accompagnement marketing automatisé par PACIFIK&apos;AI démarre à partir de 50 000 XPF par mois. Ce tarif inclut la gestion de 2 canaux (email + réseaux sociaux), la création de contenu par IA et un rapport mensuel. Les formules complètes avec publicité en ligne sont sur devis.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Le marketing automatisé fonctionne-t-il pour les petites entreprises ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Absolument. Le marketing automatisé est particulièrement adapté aux PME polynésiennes qui manquent de temps et de ressources pour gérer leur communication. L&apos;IA prend en charge les tâches répétitives — publications, emails, relances — pendant que vous vous concentrez sur votre activité.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Quels résultats peut-on attendre du marketing digital à Tahiti ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Nos clients en Polynésie française constatent en moyenne 3 fois plus de leads qualifiés, 85% de temps gagné sur la gestion marketing et une visibilité en ligne significativement améliorée dès le premier mois. Les résultats dépendent du secteur et du budget publicitaire alloué.
              </div>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-4">
            Prêt à automatiser votre marketing à Tahiti ?
          </h2>
          <p className="text-text-secondary mb-8">
            Contactez-nous pour un audit marketing gratuit. Nous analysons votre
            présence digitale et proposons une stratégie personnalisée — contact@pacifikai.com.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Demander un audit gratuit →
          </Link>
        </section>
      </main>
      <RelatedLinks links={relatedLinks} />
      <Footer />
    </>
  );
}
