import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getOptimalLinks } from "@/lib/internal-links";
import { generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Application Mobile & Web à Tahiti | PACIFIK'AI — Développement Polynésie",
  description:
    "Développement d'applications mobiles et web à Tahiti par PACIFIK'AI. PWA, dashboards, portails clients et apps métier pour entreprises en Polynésie française.",
  alternates: {
    canonical: "https://pacifikai.com/application-mobile-tahiti",
  },
  openGraph: {
    title: "Application Mobile & Web à Tahiti | PACIFIK'AI",
    description:
      "Application mobile et web à Tahiti. Développement d'apps sur mesure, PWA et dashboards pour les entreprises de Polynésie française.",
    url: "https://pacifikai.com/application-mobile-tahiti",
    locale: "fr_PF",
    type: "website",
  },
};

const APP_TYPES = [
  {
    title: "Progressive Web App (PWA)",
    desc: "Application installable depuis le navigateur, sans passer par l'App Store. Fonctionne hors-ligne, notifications push et accès rapide — parfait pour la connectivité variable en Polynésie.",
    icon: "📱",
  },
  {
    title: "Dashboard & back-office",
    desc: "Tableaux de bord personnalisés pour piloter votre activité. Suivi des ventes, réservations, stocks et équipes en temps réel depuis n'importe quelle île.",
    icon: "📊",
  },
  {
    title: "Portail client",
    desc: "Espace client sécurisé où vos utilisateurs consultent leurs commandes, factures et documents. Interface intuitive et adaptée mobile pour une expérience fluide.",
    icon: "👤",
  },
  {
    title: "Application métier sur mesure",
    desc: "Solution développée spécifiquement pour votre secteur : gestion de chantiers, suivi de flotte, planning d'activités touristiques, logistique inter-îles.",
    icon: "⚙️",
  },
];

const USE_CASES = [
  {
    title: "Hôtellerie & tourisme",
    desc: "Réservation en ligne, check-in digital, conciergerie IA et gestion multi-propriétés pour pensions et hôtels de Tahiti à Bora Bora.",
    icon: "🏨",
  },
  {
    title: "Restauration & commerce",
    desc: "Commande en ligne, carte digitale, programme de fidélité et gestion des livraisons pour restaurants et commerces polynésiens.",
    icon: "🍽️",
  },
  {
    title: "Services & terrain",
    desc: "Suivi d'interventions, planification des équipes, rapports terrain et géolocalisation pour les entreprises de maintenance et BTP.",
    icon: "🔧",
  },
  {
    title: "Administration & associations",
    desc: "Portails de démarches en ligne, gestion des adhérents, billetterie événementielle et communication interne pour organisations polynésiennes.",
    icon: "🏛️",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Analyse & cadrage",
    desc: "Étude de vos besoins, des parcours utilisateurs et des contraintes techniques spécifiques à la Polynésie française.",
  },
  {
    step: "02",
    title: "Prototypage & design",
    desc: "Maquettes interactives validées avec vous. Design mobile-first pensé pour une utilisation terrain, même en zone de couverture limitée.",
  },
  {
    step: "03",
    title: "Développement & tests",
    desc: "Construction de l'application web avec les dernières technologies. Tests sur les réseaux polynésiens pour garantir performance et fiabilité.",
  },
  {
    step: "04",
    title: "Déploiement & accompagnement",
    desc: "Mise en production, formation de vos équipes et support technique continu. Mises à jour et évolutions incluses pendant 6 mois.",
  },
];

const STATS = [
  { value: "85%", label: "du trafic web est mobile en PF" },
  { value: "24/7", label: "accessible depuis toutes les îles" },
  { value: "3x", label: "plus rapide qu'une app native" },
  { value: "0", label: "frais App Store ou Google Play" },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Combien coûte une application mobile à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le développement d'une application web (PWA) à Tahiti démarre à partir de 300 000 XPF chez PACIFIK'AI. Le coût dépend de la complexité : un dashboard simple coûte moins qu'une application métier complète avec gestion hors-ligne. Nous proposons un devis gratuit personnalisé.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle est la différence entre une app native et une PWA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une PWA (Progressive Web App) est accessible via le navigateur et installable sur l'écran d'accueil sans passer par l'App Store. Elle coûte 3 à 5 fois moins cher qu'une app native iOS/Android, se met à jour instantanément et fonctionne sur tous les appareils. Idéal pour le marché polynésien.",
      },
    },
    {
      "@type": "Question",
      name: "Les applications fonctionnent-elles hors-ligne en Polynésie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, nos PWA sont conçues pour la connectivité variable de la Polynésie française. Les données essentielles sont mises en cache localement et se synchronisent automatiquement quand la connexion revient. Vos équipes terrain peuvent travailler même sans réseau.",
      },
    },
    {
      "@type": "Question",
      name: "Développez-vous des applications pour toute la Polynésie française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, PACIFIK'AI développe des applications web et mobiles pour les entreprises de toute la Polynésie française : Tahiti, Moorea, Bora Bora, Raiatea, Rangiroa et les autres îles. Nos services sont 100% en ligne avec un accompagnement à distance.",
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
  "Nuku Hiva",
];

const relatedLinks = getOptimalLinks("/application-mobile-tahiti", "static", ["application", "mobile", "web", "tahiti", "pwa", "dashboard", "polynesie"]);

export default function ApplicationMobileTahiti() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Accueil", url: "https://pacifikai.com" }, { name: "Application Mobile Tahiti", url: "https://pacifikai.com/application-mobile-tahiti" }])) }} />
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Développement d&apos;applications en Polynésie française
          </p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-6">
            Application mobile et web à Tahiti,{" "}
            <span className="gradient-text-coral">pensée pour la Polynésie</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl mb-8">
            PACIFIK&apos;AI développe des applications mobiles et web sur mesure pour les
            entreprises de Polynésie française. PWA installables, dashboards, portails
            clients et apps métier — des solutions performantes qui fonctionnent sur
            toutes les îles, même avec une connectivité limitée. 85% du trafic web en
            Polynésie est mobile : votre application doit être à la hauteur.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Discuter de votre projet
            </Link>
            <Link
              href="/services/apps"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-medium hover:border-accent hover:text-accent transition-colors"
            >
              Voir nos services apps
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

        {/* Pourquoi le mobile en PF */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Pourquoi investir dans une application mobile en Polynésie ?
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 max-w-3xl">
            <p>
              La Polynésie française affiche un taux de pénétration mobile de 85%. Les
              Polynésiens utilisent leur smartphone pour tout : chercher un restaurant,
              réserver une activité, contacter un prestataire. Si votre entreprise
              n&apos;est pas accessible sur mobile, vous perdez la majorité de vos
              clients potentiels.
            </p>
            <p>
              Le développement d&apos;une application web à Tahiti pose des défis
              uniques. La connectivité varie considérablement entre Papeete et les
              atolls éloignés. Nos applications sont conçues pour fonctionner en mode
              hors-ligne et se synchroniser automatiquement — vos équipes terrain
              travaillent sans interruption, où qu&apos;elles soient dans l&apos;archipel.
            </p>
            <p>
              Avec les Progressive Web Apps (PWA), plus besoin de développer
              séparément pour iOS et Android. Une seule application web, installable
              directement depuis le navigateur, qui coûte 3 à 5 fois moins cher
              qu&apos;une app native traditionnelle. C&apos;est la solution idéale
              pour les entreprises polynésiennes.
            </p>
          </div>
        </section>

        {/* Types d'apps */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Types d&apos;applications que nous développons
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            De la PWA simple au système métier complexe — nous développons
            l&apos;application web adaptée à votre activité en Polynésie.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APP_TYPES.map((s) => (
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

        {/* Notre processus */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Notre processus de développement
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Un processus éprouvé pour livrer des applications web fiables et
            performantes aux entreprises polynésiennes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROCESS_STEPS.map((s) => (
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
            Cas d&apos;usage en Polynésie française
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Des applications concrètes pour les secteurs clés de l&apos;économie
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
            Développement d&apos;applications pour toute la Polynésie
          </h2>
          <p className="text-text-secondary mb-6 max-w-3xl">
            Basés à Papeete, nous développons des applications web et mobiles pour les
            entreprises de toute la Polynésie française. Accompagnement 100% en ligne.
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
            Questions fréquentes sur le développement d&apos;apps à Tahiti
          </h2>
          <div className="space-y-3 max-w-3xl">
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Combien coûte une application mobile à Tahiti ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Le développement d&apos;une application web (PWA) à Tahiti démarre à partir de 300 000 XPF chez PACIFIK&apos;AI. Le coût dépend de la complexité : un dashboard simple coûte moins qu&apos;une application métier complète avec gestion hors-ligne. Nous proposons un devis gratuit personnalisé.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Quelle est la différence entre une app native et une PWA ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Une PWA (Progressive Web App) est accessible via le navigateur et installable sur l&apos;écran d&apos;accueil sans passer par l&apos;App Store. Elle coûte 3 à 5 fois moins cher qu&apos;une app native iOS/Android, se met à jour instantanément et fonctionne sur tous les appareils. Idéal pour le marché polynésien.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Les applications fonctionnent-elles hors-ligne en Polynésie ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Oui, nos PWA sont conçues pour la connectivité variable de la Polynésie française. Les données essentielles sont mises en cache localement et se synchronisent automatiquement quand la connexion revient. Vos équipes terrain peuvent travailler même sans réseau.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Développez-vous des applications pour toute la Polynésie française ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Oui, PACIFIK&apos;AI développe des applications web et mobiles pour les entreprises de toute la Polynésie française : Tahiti, Moorea, Bora Bora, Raiatea, Rangiroa et les autres îles. Nos services sont 100% en ligne avec un accompagnement à distance.
              </div>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-4">
            Prêt à lancer votre application à Tahiti ?
          </h2>
          <p className="text-text-secondary mb-8">
            Contactez-nous pour un échange gratuit sur votre projet d&apos;application
            mobile ou web. Devis personnalisé sous 24h — contact@pacifikai.com.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Discuter de votre projet →
          </Link>
        </section>
      </main>
      <RelatedLinks links={relatedLinks} />
      <Footer />
    </>
  );
}
