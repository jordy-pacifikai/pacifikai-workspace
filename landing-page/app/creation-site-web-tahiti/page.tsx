import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getOptimalLinks } from "@/lib/internal-links";
import { generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Création de Site Web à Tahiti | PACIFIK'AI — Sites Internet Polynésie",
  description:
    "Création de site web à Tahiti par PACIFIK'AI. Sites internet vitrines, e-commerce, landing pages et blogs pour entreprises en Polynésie française. À partir de 100 000 XPF.",
  alternates: {
    canonical: "https://pacifikai.com/creation-site-web-tahiti",
  },
  openGraph: {
    title: "Création de Site Web à Tahiti | PACIFIK'AI",
    description:
      "Faire un site web à Tahiti avec PACIFIK'AI. Sites internet professionnels, design sur mesure, SEO et hébergement inclus pour la Polynésie française.",
    url: "https://pacifikai.com/creation-site-web-tahiti",
    locale: "fr_PF",
    type: "website",
  },
};

const SITE_TYPES = [
  {
    title: "Site vitrine",
    desc: "Présentez votre activité avec un site moderne et professionnel. Idéal pour les pensions, restaurants, artisans et prestataires de services à Tahiti.",
    icon: "🏢",
    price: "À partir de 100 000 XPF",
  },
  {
    title: "Site e-commerce",
    desc: "Vendez vos produits locaux en ligne : monoï, perles, artisanat, cosmétiques. Paiement sécurisé et gestion des stocks intégrée.",
    icon: "🛒",
    price: "À partir de 250 000 XPF",
  },
  {
    title: "Landing page",
    desc: "Page de conversion ultra-optimisée pour vos campagnes publicitaires. Formulaire de contact, témoignages et appel à l'action — taux de conversion maximal.",
    icon: "🎯",
    price: "À partir de 80 000 XPF",
  },
  {
    title: "Blog & contenu",
    desc: "Positionnez-vous comme expert dans votre domaine grâce à un blog professionnel. Contenu généré par IA et optimisé pour le référencement Google.",
    icon: "📝",
    price: "À partir de 120 000 XPF",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Découverte & brief",
    desc: "On échange sur votre activité, vos objectifs et vos besoins. Analyse de votre marché et de vos concurrents en Polynésie française.",
  },
  {
    step: "02",
    title: "Design sur mesure",
    desc: "Maquettes visuelles adaptées à votre identité de marque. Design responsive mobile-first pour un affichage parfait sur tous les écrans.",
  },
  {
    step: "03",
    title: "Développement & intégration",
    desc: "Création du site internet avec les dernières technologies. Performance optimale, temps de chargement rapide même avec la connectivité polynésienne.",
  },
  {
    step: "04",
    title: "SEO & mise en ligne",
    desc: "Optimisation du référencement Google, configuration du domaine et hébergement. Votre site web est live et visible depuis toute la Polynésie.",
  },
];

const STATS = [
  { value: "100+", label: "sites web livrés en Polynésie" },
  { value: "7j", label: "délai moyen de livraison" },
  { value: "100%", label: "responsive mobile" },
  { value: "100K", label: "XPF — prix de départ" },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Combien coûte la création d'un site web à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La création d'un site web professionnel à Tahiti coûte à partir de 100 000 XPF chez PACIFIK'AI. Ce tarif inclut le design sur mesure, le développement responsive, l'hébergement pour un an, le certificat SSL et l'optimisation SEO. Les sites e-commerce démarrent à 250 000 XPF.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps faut-il pour créer un site internet à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chez PACIFIK'AI, un site vitrine est livré en 5 à 10 jours ouvrés. Un site e-commerce prend entre 2 et 4 semaines selon la complexité. Les landing pages peuvent être prêtes en 3 à 5 jours.",
      },
    },
    {
      "@type": "Question",
      name: "Pourquoi faire créer son site web par une agence locale à Tahiti ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Une agence locale comme PACIFIK'AI comprend les spécificités du marché polynésien : fuseau horaire UTC-10, connectivité variable, marché bilingue français-tahitien, et budget adapté aux PME locales. Vous bénéficiez d'un interlocuteur sur place et de solutions optimisées pour la Polynésie.",
      },
    },
    {
      "@type": "Question",
      name: "Le site web est-il optimisé pour Google en Polynésie française ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, chaque site créé par PACIFIK'AI est optimisé pour le référencement local en Polynésie française. Balises meta, vitesse de chargement, responsive mobile, données structurées et contenu SEO sont inclus pour vous positionner sur les recherches locales comme 'creation site web tahiti'.",
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

const relatedLinks = getOptimalLinks("/creation-site-web-tahiti", "static", ["creation", "site", "web", "tahiti", "internet", "polynesie", "design"]);

export default function CreationSiteWebTahiti() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Accueil", url: "https://pacifikai.com" }, { name: "Création Site Web Tahiti", url: "https://pacifikai.com/creation-site-web-tahiti" }])) }} />
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Création de site internet en Polynésie française
          </p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-6">
            Création de site web à Tahiti,{" "}
            <span className="gradient-text-coral">professionnel et sur mesure</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl mb-8">
            PACIFIK&apos;AI est spécialisée dans la création de sites internet à Tahiti
            et en Polynésie française. Sites vitrines, e-commerce, landing pages — nous
            concevons des sites web modernes, rapides et optimisés pour le référencement
            Google. Votre présence en ligne professionnelle commence ici, à partir de
            100 000 XPF.
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

        {/* Pourquoi créer un site web en Polynésie */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Pourquoi créer un site web en Polynésie française ?
          </h2>
          <div className="text-text-secondary text-base leading-relaxed space-y-4 max-w-3xl">
            <p>
              En Polynésie française, plus de 80% des recherches locales passent par Google.
              Un client qui cherche un restaurant à Moorea, un prestataire à Bora Bora ou
              un artisan à Papeete va taper sa recherche en ligne. Sans site internet,
              votre entreprise est invisible pour ces clients potentiels.
            </p>
            <p>
              La création d&apos;un site web à Tahiti n&apos;est plus un luxe — c&apos;est
              une nécessité. Un site internet professionnel vous donne de la crédibilité,
              vous rend visible sur Google et vous permet de convertir des visiteurs en
              clients 24h/24, même quand votre magasin est fermé.
            </p>
            <p>
              Chez PACIFIK&apos;AI, nous comprenons les spécificités de la Polynésie :
              connectivité variable entre les îles, marché bilingue français-tahitien, et
              budget adapté aux réalités des entreprises locales. Nos sites sont optimisés
              pour charger rapidement, même avec une connexion limitée.
            </p>
          </div>
        </section>

        {/* Notre processus */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Notre processus de création de site internet
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            De la première idée à la mise en ligne — un processus clair et efficace
            pour votre site web à Tahiti.
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

        {/* Types de sites */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3">
            Types de sites web que nous créons à Tahiti
          </h2>
          <p className="text-text-secondary mb-10 max-w-2xl">
            Chaque projet est unique. Nous adaptons le type de site internet à votre
            activité et vos objectifs en Polynésie française.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SITE_TYPES.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 hover:border-accent/30 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{s.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      {s.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-2">
                      {s.desc}
                    </p>
                    <span className="text-accent text-sm font-medium">{s.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Offre 100K */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-4">
              🔥 Offre spéciale : site web professionnel à 100 000 XPF
            </h2>
            <p className="text-text-secondary text-base leading-relaxed max-w-2xl mx-auto mb-6">
              Votre site internet professionnel à Tahiti à un prix accessible. Design sur
              mesure, responsive mobile, hébergement un an, certificat SSL, optimisation
              SEO et contenu généré par IA — tout est inclus.{" "}
              <Link href="/offre-site-web" className="text-accent hover:underline">
                Découvrir l&apos;offre complète →
              </Link>
            </p>
            <Link
              href="/offre-site-web"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-medium text-lg hover:bg-accent/90 transition-colors"
            >
              Voir l&apos;offre 100 000 XPF
            </Link>
          </div>
        </section>

        {/* Ce qui est inclus */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Ce qui est inclus dans chaque site internet
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Design responsive mobile", icon: "📱" },
              { label: "Hébergement premium 1 an", icon: "☁️" },
              { label: "Certificat SSL (HTTPS)", icon: "🔒" },
              { label: "Optimisation SEO Google", icon: "🔍" },
              { label: "Contenu rédigé par IA", icon: "✍️" },
              { label: "Formulaire de contact", icon: "📧" },
              { label: "Analytics & statistiques", icon: "📊" },
              { label: "Nom de domaine offert", icon: "🌐" },
              { label: "Support technique 6 mois", icon: "🛠️" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border text-sm font-medium"
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* Zones d'intervention */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-6">
            Création de site web dans toute la Polynésie française
          </h2>
          <p className="text-text-secondary mb-6 max-w-3xl">
            Basés à Papeete, nous réalisons la création de sites internet pour les
            entreprises de toute la Polynésie. Nos services sont 100% en ligne — pas
            besoin de se déplacer.
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
            Questions fréquentes sur la création de site web à Tahiti
          </h2>
          <div className="space-y-3 max-w-3xl">
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Combien coûte la création d&apos;un site web à Tahiti ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                La création d&apos;un site web professionnel à Tahiti coûte à partir de 100 000 XPF chez PACIFIK&apos;AI. Ce tarif inclut le design sur mesure, le développement responsive, l&apos;hébergement pour un an, le certificat SSL et l&apos;optimisation SEO. Les sites e-commerce démarrent à 250 000 XPF.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Combien de temps faut-il pour créer un site internet à Tahiti ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Chez PACIFIK&apos;AI, un site vitrine est livré en 5 à 10 jours ouvrés. Un site e-commerce prend entre 2 et 4 semaines selon la complexité. Les landing pages peuvent être prêtes en 3 à 5 jours.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Pourquoi faire créer son site web par une agence locale à Tahiti ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Une agence locale comme PACIFIK&apos;AI comprend les spécificités du marché polynésien : fuseau horaire UTC-10, connectivité variable, marché bilingue français-tahitien, et budget adapté aux PME locales. Vous bénéficiez d&apos;un interlocuteur sur place et de solutions optimisées pour la Polynésie.
              </div>
            </details>
            <details className="glass rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm select-none hover:text-accent transition-colors duration-200 list-none">
                <span>Le site web est-il optimisé pour Google en Polynésie française ?</span>
                <span className="ml-4 flex-shrink-0 w-5 h-5 border border-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-text-dim">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                Oui, chaque site créé par PACIFIK&apos;AI est optimisé pour le référencement local en Polynésie française. Balises meta, vitesse de chargement, responsive mobile, données structurées et contenu SEO sont inclus pour vous positionner sur les recherches locales.
              </div>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-4">
            Prêt à créer votre site web à Tahiti ?
          </h2>
          <p className="text-text-secondary mb-8">
            Contactez-nous pour un échange gratuit sur votre projet de création de site
            internet. Devis personnalisé sous 24h — contact@pacifikai.com.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Demander un devis gratuit →
          </Link>
        </section>
      </main>
      <RelatedLinks links={relatedLinks} />
      <Footer />
    </>
  );
}
