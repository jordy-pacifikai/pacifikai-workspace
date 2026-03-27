import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';

const GREEN = '#25D366';

// ─── Sector Data ─────────────────────────────────────────────────────────────

interface SectorData {
  slug: string;
  emoji: string;
  title: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  painPoints: { icon: string; title: string; desc: string }[];
  solutions: { icon: string; title: string; desc: string }[];
  services: string[];
  ctaLabel: string;
  ctaHref: string;
}

const SECTORS: Record<string, SectorData> = {
  'salon-beaute': {
    slug: 'salon-beaute',
    emoji: '\u2702\uFE0F',
    title: "Ve'a pour les Salons de Beaute",
    headline: 'Arretez de perdre des clients entre deux coupes',
    subheadline:
      'Vos clientes reservent par WhatsApp pendant que vous travaillez. Plus besoin de decrocher le telephone.',
    metaTitle: "Ve'a pour les Salons de Beaute — Reservation IA WhatsApp",
    metaDescription:
      "Automatisez les rendez-vous de votre salon de beaute en Polynesie francaise. Reservation WhatsApp 24/7, rappels automatiques, zero no-show. Essai gratuit 14 jours.",
    ogTitle: "Ve'a — Reservation IA pour Salons de Beaute",
    painPoints: [
      {
        icon: '\uD83D\uDCDE',
        title: 'Le telephone sonne pendant les soins',
        desc: "Vous etes en pleine coloration ou coupe. Le telephone sonne. Impossible de repondre sans interrompre votre cliente. Resultat : l'appel est perdu, la cliente potentielle aussi.",
      },
      {
        icon: '\uD83D\uDCA8',
        title: 'Les no-shows plombent votre chiffre',
        desc: "20% de vos clientes ne viennent pas sans prevenir. Un creneau vide, c'est du revenu perdu. Et vous n'avez pas le temps d'envoyer des rappels un par un.",
      },
      {
        icon: '\uD83D\uDCCB',
        title: 'Le carnet de RDV est un cauchemar',
        desc: "Ratures, double-reservations, oublis. Le planning papier ou les messages eparpilles sur WhatsApp, Messenger et Instagram sont ingerable quand le salon tourne a plein.",
      },
    ],
    solutions: [
      {
        icon: '\uD83D\uDCAC',
        title: 'Reservation WhatsApp 24/7',
        desc: "Vos clientes envoient un message a n'importe quelle heure. L'IA propose les creneaux disponibles selon le service (coupe 30min, coloration 1h30) et confirme instantanement.",
      },
      {
        icon: '\uD83D\uDD14',
        title: 'Rappels automatiques',
        desc: "Ve'a envoie un rappel 24h et 2h avant chaque rendez-vous. Les no-shows chutent de 50%. Vos clientes apprecient l'attention, vous appreciez le planning rempli.",
      },
      {
        icon: '\u2B50',
        title: 'Suivi clients fideles',
        desc: "Chaque cliente a son historique : derniere coupe, couleur preferee, frequence de visite. Ve'a peut meme suggerer un rappel quand il est temps de revenir.",
      },
    ],
    services: ['Coupe femme / homme', 'Coloration & meches', 'Manucure & pedicure', 'Soins visage', 'Lissage & brushing', 'Extensions'],
    ctaLabel: 'Essayer gratuitement — 14 jours offerts',
    ctaHref: '/signup?plan=starter&sector=salon',
  },
  'restaurant-cafe': {
    slug: 'restaurant-cafe',
    emoji: '\uD83C\uDF7D\uFE0F',
    title: "Ve'a pour les Restaurants & Cafes",
    headline: 'Ne laissez plus le telephone sonner pendant le service',
    subheadline:
      'Vos clients reservent leur table par message. Confirmation automatique, zero appel manque.',
    metaTitle: "Ve'a pour Restaurants & Cafes — Reservation IA WhatsApp",
    metaDescription:
      "Automatisez les reservations de votre restaurant en Polynesie francaise. Gestion des tables par WhatsApp, confirmations automatiques, reduction des no-shows. Essai gratuit.",
    ogTitle: "Ve'a — Reservation IA pour Restaurants & Cafes",
    painPoints: [
      {
        icon: '\uD83D\uDCDE',
        title: 'Le telephone sonne en plein service',
        desc: "Le coup de feu du midi ou du soir, et le telephone n'arrete pas. Votre equipe ne peut pas servir et repondre en meme temps. Des reservations sont perdues chaque jour.",
      },
      {
        icon: '\uD83E\uDE91',
        title: 'Tables vides a cause des no-shows',
        desc: "Des clients reservent et ne viennent pas. Vous avez refuse d'autres demandes pour rien. Sans systeme de confirmation, c'est de l'argent qui s'evapore chaque semaine.",
      },
      {
        icon: '\uD83D\uDCC9',
        title: 'Aucun suivi de votre clientele',
        desc: "Vous ne savez pas qui sont vos habitues, combien de fois ils viennent, ce qu'ils preferent. Impossible de les fideliser ou de leur proposer vos evenements speciaux.",
      },
    ],
    solutions: [
      {
        icon: '\uD83D\uDCAC',
        title: 'Reservation par message, sans interruption',
        desc: "Vos clients envoient un message sur WhatsApp ou Messenger. L'IA leur demande la date, l'heure, le nombre de couverts et confirme la reservation. Votre equipe reste concentree sur le service.",
      },
      {
        icon: '\u2705',
        title: 'Confirmation et rappel automatiques',
        desc: "Chaque reservation est confirmee instantanement. Un rappel est envoye la veille. Si le client ne peut plus venir, il peut annuler par message et vous liberez la table.",
      },
      {
        icon: '\uD83D\uDCC8',
        title: 'Gestion des annulations intelligente',
        desc: "Quand un client annule, Ve'a peut automatiquement proposer le creneau libere aux clients en liste d'attente. Vos tables restent remplies, votre chiffre d'affaires aussi.",
      },
    ],
    services: ['Dejeuner', 'Diner', 'Brunch du weekend', 'Evenement prive', 'Terrasse / salle', 'Menu degustation'],
    ctaLabel: 'Essayer gratuitement — 14 jours offerts',
    ctaHref: '/signup?plan=starter&sector=restaurant',
  },
  'sante-bien-etre': {
    slug: 'sante-bien-etre',
    emoji: '\uD83E\uDE7A',
    title: "Ve'a pour la Sante & Bien-etre",
    headline: 'Liberez votre secretariat des appels repetitifs',
    subheadline:
      'Vos patients prennent rendez-vous par message. Rappels automatiques, planning toujours a jour.',
    metaTitle: "Ve'a pour Sante & Bien-etre — Prise de RDV IA",
    metaDescription:
      "Automatisez la prise de rendez-vous de votre cabinet en Polynesie francaise. Chatbot WhatsApp pour patients, rappels J-1, dossier client numerique. Essai gratuit 14 jours.",
    ogTitle: "Ve'a — Prise de RDV IA pour la Sante & Bien-etre",
    painPoints: [
      {
        icon: '\uD83D\uDCDE',
        title: 'Secretariat deborde',
        desc: "Le telephone sonne sans arret. Votre secretaire passe ses journees a noter des rendez-vous au lieu de s'occuper des patients presents. Aux heures de pointe, des appels restent sans reponse.",
      },
      {
        icon: '\uD83E\uDDD1\u200D\u2695\uFE0F',
        title: 'Patients qui oublient leur RDV',
        desc: "Sans rappel, 15 a 25% des patients ne se presentent pas. Un creneau vide dans un cabinet, c'est un patient en attente qui aurait pu etre vu.",
      },
      {
        icon: '\uD83D\uDCDD',
        title: 'Planning papier ou tableur depasse',
        desc: "Les post-it, le cahier de rendez-vous, le fichier Excel. Difficile a partager entre collegues, impossible a consulter de chez soi, risque d'erreurs constant.",
      },
    ],
    solutions: [
      {
        icon: '\uD83E\uDD16',
        title: 'Prise de RDV automatisee',
        desc: "Les patients envoient un message WhatsApp. L'IA identifie le type de consultation, verifie les disponibilites du praticien et confirme le rendez-vous. Disponible 24h/24.",
      },
      {
        icon: '\uD83D\uDD14',
        title: 'Rappels J-1 automatiques',
        desc: "Un message de rappel est envoye automatiquement la veille du rendez-vous. Le patient peut confirmer ou reporter en un clic. Les no-shows diminuent drastiquement.",
      },
      {
        icon: '\uD83D\uDCC2',
        title: 'Dossier client numerique',
        desc: "Chaque patient a sa fiche : historique des visites, preferences, notes du praticien. Tout est accessible depuis le tableau de bord, securise et confidentiel.",
      },
    ],
    services: ['Consultation generale', 'Massage therapeutique', 'Kinesitherapie', 'Yoga & Pilates', 'Sophrologie', 'Osteopathie'],
    ctaLabel: 'Essayer gratuitement — 14 jours offerts',
    ctaHref: '/signup?plan=starter&sector=sante',
  },
};

const SECTOR_SLUGS = Object.keys(SECTORS);

// ─── Static Params ───────────────────────────────────────────────────────────

export function generateStaticParams() {
  return SECTOR_SLUGS.map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const sector = SECTORS[params.slug];
  if (!sector) return {};

  return {
    title: sector.metaTitle,
    description: sector.metaDescription,
    openGraph: {
      title: sector.ogTitle,
      description: sector.metaDescription,
      url: `https://vea.pacifikai.com/secteur/${sector.slug}`,
      siteName: "Ve'a by PACIFIK'AI",
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: sector.ogTitle,
      description: sector.metaDescription,
    },
    alternates: {
      canonical: `https://vea.pacifikai.com/secteur/${sector.slug}`,
    },
  };
}

// ─── Pricing Plans (static copy) ─────────────────────────────────────────────

const PLANS = [
  {
    name: 'Starter',
    slug: 'starter',
    price: '4 900',
    features: ['Messenger IA', '50 conversations/mois', 'Tableau de bord', 'Support email'],
    featured: false,
  },
  {
    name: 'Essentiel',
    slug: 'essentiel',
    price: '9 900',
    features: ['Tout Starter', '200 conversations/mois', 'Instagram + WhatsApp', 'Google Calendar', 'Rappels auto'],
    featured: true,
  },
  {
    name: 'Premium',
    slug: 'premium',
    price: '19 900',
    features: ['Tout Essentiel', '500 conversations/mois', 'Stats avancees', 'Support prioritaire'],
    featured: false,
  },
];

// ─── JSON-LD Schema ──────────────────────────────────────────────────────────

function SectorJsonLd({ sector }: { sector: SectorData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: sector.title,
    description: sector.metaDescription,
    url: `https://vea.pacifikai.com/secteur/${sector.slug}`,
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: "Ve'a",
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: sector.metaDescription,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'XPF',
        lowPrice: 4900,
        highPrice: 19900,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SectorPage({ params }: { params: { slug: string } }) {
  const sector = SECTORS[params.slug];
  if (!sector) notFound();

  return (
    <>
      <SectorJsonLd sector={sector} />

      <main className="min-h-screen bg-gray-950 text-gray-100">
        {/* Nav */}
        <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">
              Ve&apos;a
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
              >
                Accueil
              </Link>
              <Link
                href="/faq"
                className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
              >
                FAQ
              </Link>
              <a
                href={`${sector.ctaHref}`}
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: GREEN }}
              >
                Essayer gratuitement
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-16 pb-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-5xl mb-4 block">{sector.emoji}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {sector.headline}
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {sector.subheadline}
            </p>
            <div className="mt-8">
              <a
                href={`${sector.ctaHref}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-base font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: GREEN }}
              >
                {sector.ctaLabel}
                <ArrowRight size={18} />
              </a>
              <p className="mt-3 text-xs text-gray-400">
                Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 px-6 bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
              Le probleme que vous vivez au quotidien
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {sector.painPoints.map((pp) => (
                <div key={pp.title} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <span className="text-3xl block mb-3">{pp.icon}</span>
                  <h3 className="text-base font-semibold text-white mb-2">{pp.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{pp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              Comment Ve&apos;a resout ces problemes
            </h2>
            <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto">
              Un assistant IA qui gere vos rendez-vous pendant que vous vous concentrez sur votre metier.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {sector.solutions.map((sol) => (
                <div key={sol.title} className="rounded-xl border border-gray-800 p-6 bg-gray-900/50">
                  <span className="text-3xl block mb-3">{sol.icon}</span>
                  <h3 className="text-base font-semibold text-white mb-2">{sol.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{sol.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services typiques */}
        <section className="py-12 px-6 bg-gray-900/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-6">
              Services typiques geres par Ve&apos;a
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {sector.services.map((svc) => (
                <span
                  key={svc}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-900 border border-gray-800 text-gray-300"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              Tarification simple et transparente
            </h2>
            <p className="text-center text-gray-400 mb-10">
              Sans engagement. 14 jours d&apos;essai gratuit.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl p-6 flex flex-col ${
                    plan.featured
                      ? 'border-2 shadow-lg bg-gray-900'
                      : 'border border-gray-800 bg-gray-900/50'
                  }`}
                  style={plan.featured ? { borderColor: GREEN } : undefined}
                >
                  {plan.featured && (
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full self-start mb-3"
                      style={{ backgroundColor: `${GREEN}20`, color: GREEN }}
                    >
                      Recommande
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-400 ml-1">XPF/mois</span>
                  </div>
                  <ul className="mt-5 space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check size={15} className="shrink-0 mt-0.5" style={{ color: GREEN }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`/signup?plan=${plan.slug}&sector=${sector.slug}`}
                    className={`mt-5 block text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      plan.featured
                        ? 'text-white hover:opacity-90'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    style={plan.featured ? { backgroundColor: GREEN } : undefined}
                  >
                    Commencer avec {plan.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 px-6" style={{ backgroundColor: `${GREEN}08` }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Pret a automatiser vos reservations ?
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">
              Rejoignez les professionnels polynesiens qui ne perdent plus de clients a cause d&apos;un telephone sans reponse.
            </p>
            <div className="mt-8">
              <a
                href={`${sector.ctaHref}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: GREEN }}
              >
                {sector.ctaLabel}
                <ArrowRight size={18} />
              </a>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Aucune carte bancaire requise &bull; Annulez quand vous voulez
            </p>
          </div>
        </section>

        {/* Footer minimal */}
        <footer className="border-t border-gray-800 py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; 2026 PACIFIK&apos;AI. Tous droits reserves.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/faq"
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Confidentialite
              </Link>
              <a
                href="mailto:vea@pacifikai.com"
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                vea@pacifikai.com
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
