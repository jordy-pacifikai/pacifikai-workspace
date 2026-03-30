import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Tarifs | PACIFIK'AI — Solutions Digitales & SaaS",
  description:
    "Nos offres SaaS et services digitaux : assistants juridiques IA, chatbots, sites web, automatisation. Tarifs transparents en XPF pour les entreprises en Polynésie française.",
  openGraph: {
    title: "Tarifs | PACIFIK'AI",
    description:
      "Solutions SaaS et services digitaux pour les entreprises en Polynésie française. Tarifs transparents en XPF.",
    type: "website",
    locale: "fr_FR",
  },
};

type PricingCard = {
  name: string;
  description: string;
  price: string;
  unit?: string;
  period?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  variant: "default" | "featured" | "outline";
  badge?: string;
};

const SAAS_PLANS: PricingCard[] = [
  {
    name: "DroitPF Découverte",
    description: "Assistant juridique IA — accès gratuit limité",
    price: "0",
    unit: "XPF",
    period: "/ mois",
    features: [
      "3 questions juridiques / jour",
      "Droit du travail et droit civil",
      "Sources législatives PF",
      "Réponses avec citations",
    ],
    cta: "Essayer gratuitement",
    ctaHref: "https://droitpf.vercel.app",
    variant: "outline",
  },
  {
    name: "DroitPF Pro",
    description: "Assistant juridique IA — accès complet",
    price: "2 990",
    unit: "XPF",
    period: "/ mois",
    features: [
      "Questions illimitées",
      "Tous les domaines du droit PF",
      "Génération de documents",
      "Export PDF",
      "Support prioritaire",
    ],
    cta: "Commencer",
    ctaHref: "https://droitpf.vercel.app",
    variant: "featured",
    badge: "Populaire",
  },
  {
    name: "DroitPF Entreprise",
    description: "Pour cabinets et entreprises",
    price: "9 990",
    unit: "XPF",
    period: "/ mois",
    features: [
      "Tout DroitPF Pro inclus",
      "Multi-utilisateurs (5 comptes)",
      "Modèles de documents personnalisés",
      "API d'intégration",
      "Account manager dédié",
    ],
    cta: "Nous contacter",
    ctaHref: "mailto:jordy@pacifikai.com",
    variant: "outline",
  },
];

const SERVICE_PLANS: PricingCard[] = [
  {
    name: "Site Web Pro",
    description: "Site internet professionnel clé en main",
    price: "100 000",
    unit: "XPF",
    features: [
      "Design sur mesure responsive",
      "Hébergement inclus 1 an",
      "SEO optimisé",
      "Formulaire de contact",
      "Analytics intégré",
    ],
    cta: "Demander un devis",
    ctaHref: "mailto:jordy@pacifikai.com",
    variant: "default",
  },
  {
    name: "Chatbot IA",
    description: "Assistant conversationnel pour votre entreprise",
    price: "5 000",
    unit: "XPF",
    period: "/ mois",
    features: [
      "Chatbot IA sur votre site web",
      "Entraîné sur vos données",
      "Intégration Messenger / WhatsApp",
      "Prise de RDV automatique",
      "Dashboard de suivi",
    ],
    cta: "Essai gratuit 14 jours",
    ctaHref: "mailto:jordy@pacifikai.com",
    variant: "featured",
    badge: "Le plus demandé",
  },
  {
    name: "Automatisation IA",
    description: "Workflows sur mesure pour vos processus",
    price: "Sur devis",
    features: [
      "Audit de vos processus",
      "Workflows automatisés",
      "Intégration à vos outils existants",
      "Formation équipe",
      "Support continu",
    ],
    cta: "Discutons de votre projet",
    ctaHref: "mailto:jordy@pacifikai.com",
    variant: "outline",
  },
];

function PricingCardComponent({ card }: { card: PricingCard }) {
  const isFeatured = card.variant === "featured";

  return (
    <div
      data-tilt
      className={`relative flex flex-col rounded-2xl p-6 md:p-7 border transition-colors duration-300 ${
        isFeatured
          ? "bg-gradient-to-b from-[#f97066]/8 to-transparent border-[#f97066]/40 shadow-[0_0_40px_rgba(249,112,102,0.08)]"
          : "glass border-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      {/* Badge */}
      {card.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-[#f97066] text-bg text-[10px] font-bold tracking-widest uppercase whitespace-nowrap">
            {card.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className="font-semibold text-base text-text mb-1">{card.name}</h3>
        <p className="text-text-dim text-xs">{card.description}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        {card.unit ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-text">{card.price}</span>
            <span className="text-sm text-text-secondary">{card.unit}</span>
            {card.period && (
              <span className="text-xs text-text-dim">{card.period}</span>
            )}
          </div>
        ) : (
          <span className="text-2xl font-bold text-text">{card.price}</span>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-6 pt-5 border-t border-border/60">
        {card.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-text-secondary"
          >
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#14b8a6]/15 flex items-center justify-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                className="text-[#14b8a6]"
              >
                <path
                  d="M1 4l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={card.ctaHref}
        className={`block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isFeatured
            ? "bg-[#f97066] text-bg hover:bg-[#f97066]/90 shadow-[0_4px_20px_rgba(249,112,102,0.25)]"
            : "bg-white/[0.05] text-text border border-white/[0.08] hover:border-[#f97066]/40 hover:text-[#f97066]"
        }`}
      >
        {card.cta}
      </a>
    </div>
  );
}

export default function TarifsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[#f97066]/5 blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#14b8a6]/4 blur-[100px]" />
        </div>

        <div className="relative z-10 pt-32 pb-24 px-4 max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#f97066] mb-4">
              Tarifs transparents
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-4">
              Des solutions digitales{" "}
              <span className="gradient-text-coral">accessibles</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto leading-relaxed">
              Logiciels SaaS, sites web et automatisation IA pour les
              entreprises en Polynésie française et à l&apos;international.
            </p>
          </div>

          {/* SaaS section */}
          <div className="mb-20">
            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#f97066] mb-2">
                Solutions SaaS
              </p>
              <h2 className="text-2xl font-bold text-text">
                Nos produits digitaux
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SAAS_PLANS.map((plan) => (
                <PricingCardComponent key={plan.name} card={plan} />
              ))}
            </div>
          </div>

          {/* Services section */}
          <div className="mb-16">
            <div className="mb-8">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#14b8a6] mb-2">
                Services digitaux
              </p>
              <h2 className="text-2xl font-bold text-text">
                Sites web et automatisation
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SERVICE_PLANS.map((plan) => (
                <PricingCardComponent key={plan.name} card={plan} />
              ))}
            </div>
          </div>

          {/* MoR notice */}
          <div className="glass rounded-2xl p-6 md:p-8 text-center border border-white/[0.06] mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-text-dim flex-shrink-0"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5v4M8 11v.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs font-semibold text-text-dim uppercase tracking-widest">
                Paiements sécurisés
              </span>
            </div>
            <p className="text-text-dim text-sm leading-relaxed max-w-2xl mx-auto">
              Les paiements en ligne pour nos produits SaaS sont sécurisés et
              traités par{" "}
              <a
                href="https://www.paddle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f97066] hover:underline underline-offset-4"
              >
                Paddle.com
              </a>
              , qui agit en tant que Merchant of Record. Paddle gère la
              facturation, les taxes applicables et la conformité. Pour les
              services sur devis, la facturation est effectuée directement par
              PACIFIK&apos;AI. Tous les prix sont exprimés en{" "}
              <strong className="text-text-secondary">XPF</strong> (Franc CFP),
              hors taxes locales.
            </p>
          </div>

          {/* FAQ / objections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {[
              {
                q: "Puis-je résilier à tout moment ?",
                a: "Oui. Les abonnements SaaS sont résiliables à tout moment depuis votre espace client ou par email. La résiliation prend effet à la fin de la période en cours, sans frais.",
              },
              {
                q: "Y a-t-il une période d'engagement ?",
                a: "Aucun engagement minimum pour les abonnements mensuels. Les abonnements annuels bénéficient d'un tarif réduit et sont non remboursables au prorata.",
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Via Paddle : Visa, Mastercard, American Express, PayPal, Apple Pay et Google Pay. Pour les prestations sur devis, paiement par virement bancaire.",
              },
              {
                q: "Proposez-vous une aide pour la prise en main ?",
                a: "Oui, chaque abonnement Pro inclut une session d'onboarding de 30 minutes. Les clients Entreprise bénéficient d'un account manager dédié.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="p-5 rounded-2xl glass border border-white/[0.06] hover:border-white/[0.10] transition-colors"
              >
                <h3 className="text-sm font-semibold text-text mb-2">
                  {item.q}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* CTA bottom */}
          <div className="text-center glass rounded-2xl p-10 md:p-14 border border-white/[0.06]">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Vous avez un projet spécifique ?
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-7 leading-relaxed">
              Obtenez un devis personnalisé pour votre entreprise. Réponse
              garantie sous 24h.
            </p>
            <a
              href="mailto:jordy@pacifikai.com"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#f97066] text-bg font-semibold text-sm hover:bg-[#f97066]/90 transition-colors shadow-[0_4px_24px_rgba(249,112,102,0.3)]"
            >
              Demander un devis gratuit
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
