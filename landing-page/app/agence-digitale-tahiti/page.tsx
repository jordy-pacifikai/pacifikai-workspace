import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Agence Digitale à Tahiti | PACIFIK'AI — IA, Sites Web & Automatisation",
  description:
    "PACIFIK'AI est l'agence digitale de référence à Tahiti, spécialisée en intelligence artificielle. Création de sites internet, chatbots, applications mobiles, automatisation et marketing digital en Polynésie française.",
  alternates: {
    canonical: "https://pacifikai.com/agence-digitale-tahiti",
  },
  openGraph: {
    title: "Agence Digitale à Tahiti | PACIFIK'AI",
    description:
      "PACIFIK'AI, agence digitale à Tahiti spécialisée en IA. Sites web, chatbots, apps, automatisation pour entreprises en Polynésie française.",
    url: "https://pacifikai.com/agence-digitale-tahiti",
    locale: "fr_PF",
    type: "website",
  },
};

const SERVICES = [
  {
    title: "Création de sites internet",
    desc: "Sites vitrines, e-commerce, landing pages et blogs. Design moderne, responsive et optimisé SEO pour convertir vos visiteurs en clients à Tahiti.",
    href: "/services/landing-pages",
    icon: "🌐",
  },
  {
    title: "Chatbots & agents IA",
    desc: "Chatbots intelligents disponibles 24/7 sur WhatsApp, Messenger et votre site web. Service client automatisé pour entreprises polynésiennes.",
    href: "/services/chatbots",
    icon: "🤖",
  },
  {
    title: "Applications web & mobiles",
    desc: "Dashboards, portails clients et applications métier sur-mesure. Développement d'apps alimentées par l'intelligence artificielle.",
    href: "/services/apps",
    icon: "📱",
  },
  {
    title: "Automatisation des processus",
    desc: "Automatisez vos tâches répétitives : facturation, relances, réservations, onboarding. Gagnez 85% de temps sur vos opérations quotidiennes.",
    href: "/services/workflows",
    icon: "⚡",
  },
  {
    title: "Marketing digital automatisé",
    desc: "Newsletters, publications réseaux sociaux, campagnes email — tout est généré et envoyé automatiquement par l'IA. Marketing en pilote automatique.",
    href: "/services/marketing",
    icon: "📈",
  },
  {
    title: "Extraction de documents IA",
    desc: "L'IA lit vos factures, bons de commande et relevés bancaires. Extraction automatique — fini la saisie manuelle pour vos équipes à Tahiti.",
    href: "/services/documents",
    icon: "📄",
  },
  {
    title: "Intégrations API",
    desc: "Connectez tous vos outils : CRM, comptabilité, calendrier, messaging. Un écosystème unifié où tout communique automatiquement.",
    href: "/services/api",
    icon: "🔗",
  },
  {
    title: "Conseil & formation IA",
    desc: "Audit de vos processus, stratégie digitale personnalisée et formation de vos équipes à l'utilisation de l'intelligence artificielle.",
    href: "/services/conseil",
    icon: "🎯",
  },
];

const STATS = [
  { value: "100+", label: "projets livrés en Polynésie" },
  { value: "24/7", label: "chatbots actifs pour nos clients" },
  { value: "85%", label: "de temps gagné en moyenne" },
  { value: "7j", label: "pour livrer un site web pro" },
];

const CITIES = [
  "Papeete",
  "Punaauia",
  "Faa'a",
  "Pirae",
  "Moorea",
  "Bora Bora",
  "Raiatea",
  "Huahine",
];

export default function AgenceDigitaleTahiti() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Agence digitale &amp; IA en Polynésie française
          </p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-6">
            Votre agence digitale à Tahiti,{" "}
            <span className="gradient-text-coral">spécialisée en intelligence artificielle</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl mb-8">
            PACIFIK&apos;AI est la première agence digitale à Tahiti entièrement dédiée à
            l&apos;intelligence artificielle. Nous accompagnons les entreprises de Polynésie
            française dans leur transformation numérique : création de sites internet,
            chatbots IA, applications mobiles, automatisation des processus et marketing
            digital. Basés à Papeete, nous intervenons sur toutes les îles de la Polynésie.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/offre-site-web"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-medium hover:border-accent hover:text-accent transition-colors"
            >
              Offre site web 100 000 XPF
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

        {/* Pourquoi une agence digitale à Tahiti */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Pourquoi choisir une agence digitale à Tahiti ?
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 max-w-3xl">
            <p>
              Le marché polynésien est unique. Les entreprises de Tahiti, Moorea, Bora Bora
              et des autres îles font face à des défis spécifiques : éloignement géographique,
              connectivité variable, marché bilingue français-tahitien et concurrence croissante
              des acteurs métropolitains.
            </p>
            <p>
              Une agence digitale locale comme PACIFIK&apos;AI comprend ces réalités. Nous
              construisons des solutions adaptées au contexte polynésien — des sites web
              optimisés pour les connexions locales, des chatbots qui parlent français et
              reo tahiti, des automatisations pensées pour le fuseau horaire UTC-10.
            </p>
            <p>
              L&apos;intelligence artificielle n&apos;est plus réservée aux grandes entreprises
              de la métropole. Grâce à PACIFIK&apos;AI, les PME polynésiennes accèdent aux
              mêmes technologies que les leaders mondiaux — à un prix adapté au marché local.
            </p>
          </div>
        </section>

        {/* Nos services */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Nos services d&apos;agence digitale en Polynésie française
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            De la création de votre site internet à l&apos;automatisation complète de vos
            processus métier — nous couvrons tout le spectre digital.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="glass rounded-2xl p-6 hover:border-accent/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{s.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1 group-hover:text-accent transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Création de site internet à Tahiti */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Création de site internet à Tahiti — notre expertise
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 max-w-3xl">
            <p>
              La <strong>création de site internet à Tahiti</strong> est au coeur de notre
              activité. Que vous ayez besoin d&apos;un site vitrine pour votre pension de
              famille à Moorea, d&apos;une boutique en ligne pour vendre vos produits locaux,
              ou d&apos;un portail de réservation pour votre activité touristique à Bora Bora
              — nous concevons des sites web sur-mesure, rapides et optimisés pour le
              référencement Google.
            </p>
            <p>
              Chaque site est livré avec un design responsive (adapté mobile), un
              hébergement performant, un certificat SSL et une optimisation SEO complète pour
              vous positionner en première page sur les recherches locales. Notre{" "}
              <Link href="/offre-site-web" className="text-accent hover:underline">
                offre site web pro à 100 000 XPF
              </Link>{" "}
              est la solution idéale pour les entrepreneurs polynésiens qui veulent une
              présence en ligne professionnelle sans se ruiner.
            </p>
          </div>
        </section>

        {/* IA et automatisation */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Intelligence artificielle et automatisation pour les entreprises polynésiennes
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 max-w-3xl">
            <p>
              L&apos;IA transforme la façon dont les entreprises travaillent — et la Polynésie
              française n&apos;est pas en reste. Nos{" "}
              <Link href="/services/chatbots" className="text-accent hover:underline">
                chatbots IA
              </Link>{" "}
              répondent à vos clients 24h/24, même quand vous dormez. Nos{" "}
              <Link href="/services/workflows" className="text-accent hover:underline">
                workflows automatisés
              </Link>{" "}
              éliminent les tâches répétitives qui vous font perdre du temps et de l&apos;argent.
            </p>
            <p>
              Imaginez : un client envoie un message sur votre page Facebook à 23h. Votre
              chatbot le qualifie, répond à ses questions, et prend rendez-vous dans votre
              agenda — le tout sans intervention humaine. Le lendemain matin, vous trouvez un
              nouveau prospect qualifié dans votre boîte mail. C&apos;est ça, la puissance de
              l&apos;IA appliquée au business polynésien.
            </p>
            <p>
              Nos{" "}
              <Link href="/services/apps" className="text-accent hover:underline">
                applications web et mobiles
              </Link>{" "}
              permettent à vos équipes de travailler plus efficacement, où qu&apos;elles
              soient dans l&apos;archipel. Et notre{" "}
              <Link href="/services/marketing" className="text-accent hover:underline">
                marketing digital automatisé
              </Link>{" "}
              fait tourner vos campagnes en pilote automatique.
            </p>
          </div>
        </section>

        {/* Zones d'intervention */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Agence digitale pour toute la Polynésie française
          </h2>
          <p className="text-text-secondary mb-6 max-w-3xl">
            Basés à Papeete, nous accompagnons les entreprises de toute la Polynésie
            française. Nos solutions sont 100% en ligne — pas besoin de se déplacer pour
            bénéficier de nos services.
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

        {/* Expertise */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Nos domaines d&apos;expertise
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl">
            Au-delà de nos services, nous avons développé une expertise pointue dans 7 domaines
            stratégiques du digital.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "SEO & Référencement IA", href: "/expertise/seo-referencement-ia" },
              { label: "Chatbots & Agents IA", href: "/expertise/chatbots-ia" },
              { label: "Sites Web Premium", href: "/expertise/sites-web-premium" },
              { label: "Contenu IA", href: "/expertise/contenu-ia" },
              { label: "Automatisation", href: "/expertise/automatisation" },
              { label: "Marketing & Acquisition", href: "/expertise/marketing-acquisition" },
              { label: "Stratégie Digitale", href: "/expertise/strategie-digitale" },
            ].map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-accent/30 hover:text-accent transition-all text-sm font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                {e.label}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-4">
            Prêt à digitaliser votre entreprise à Tahiti ?
          </h2>
          <p className="text-text-secondary mb-8">
            Contactez-nous pour un échange gratuit sur votre projet. Nous vous proposons
            une approche personnalisée, adaptée à votre budget et vos objectifs.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Discutons de votre projet →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
