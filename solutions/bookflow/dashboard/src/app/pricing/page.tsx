'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ChevronDown, ArrowRight } from 'lucide-react';
import { FreemiusCheckoutButton } from '@/components/ui/FreemiusCheckout';

const GREEN = '#25D366';

// ─── Plan Data ───────────────────────────────────────────────────────────────

interface Plan {
  name: string;
  desc: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  features: string[];
  cta: string;
  // Pour les plans Freemius : pricingId mensuel + annuel
  // null = plan gratuit (Decouverte) ou contact direct (Business)
  freemiusPricingIdMonthly: number | null;
  freemiusPricingIdAnnual: number | null;
  // Fallback href pour Decouverte (gratuit) et Business (email)
  href: string | null;
  featured: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Decouverte',
    desc: 'Testez Ve\'a gratuitement',
    monthlyPrice: null,
    annualPrice: null,
    features: [
      '14 jours d\'essai',
      '50 conversations',
      '1 canal (Messenger)',
      'Dashboard basique',
      'Configuration guidee',
    ],
    cta: 'Commencer gratuitement',
    freemiusPricingIdMonthly: null,
    freemiusPricingIdAnnual: null,
    href: '/signup?plan=decouverte',
    featured: false,
  },
  {
    name: 'Starter',
    desc: 'Pour les independants',
    monthlyPrice: 4900,
    annualPrice: 3920,
    features: [
      '500 conversations/mois',
      '1 canal (WhatsApp)',
      'Rappels automatiques',
      'Dashboard complet',
      'Avis clients',
      'Support par email',
    ],
    cta: 'Essayer 14 jours',
    freemiusPricingIdMonthly: 57672,
    freemiusPricingIdAnnual: 57672, // meme plan, Freemius gère le cycle
    href: null,
    featured: false,
  },
  {
    name: 'Pro',
    desc: 'L\'automatisation complete',
    monthlyPrice: 9900,
    annualPrice: 7920,
    features: [
      '2 000 conversations/mois',
      'Multi-canal (Messenger, IG, WA)',
      'Google Calendar sync',
      'Analytics avances',
      'Avis clients automatiques',
      'Branding personnalise',
      'Support prioritaire',
    ],
    cta: 'Essayer 14 jours',
    freemiusPricingIdMonthly: 57674,
    freemiusPricingIdAnnual: 57674,
    href: null,
    featured: true,
  },
  {
    name: 'Business',
    desc: 'Pour les equipes',
    monthlyPrice: 24900,
    annualPrice: 19920,
    features: [
      'Conversations illimitees',
      'Multi-staff / multi-sites',
      'Acces API',
      'Support prioritaire dedie',
      'Export CSV',
      'Liste d\'attente',
      'Onboarding personnalise',
    ],
    cta: 'Nous contacter',
    freemiusPricingIdMonthly: 57676,
    freemiusPricingIdAnnual: 57676,
    href: null,
    featured: false,
  },
];

// ─── Comparison Table Data ───────────────────────────────────────────────────

type CellValue = boolean | string;

interface ComparisonRow {
  label: string;
  values: [CellValue, CellValue, CellValue, CellValue];
}

const COMPARISON: ComparisonRow[] = [
  { label: 'Conversations/mois', values: ['50', '500', '2 000', 'Illimite'] },
  { label: 'Canaux', values: ['1', '1', '3', '3+'] },
  { label: 'Rappels automatiques', values: [false, true, true, true] },
  { label: 'Dashboard', values: ['Basique', 'Complet', 'Complet', 'Complet'] },
  { label: 'Google Calendar', values: [false, false, true, true] },
  { label: 'Analytics avances', values: [false, false, true, true] },
  { label: 'Avis clients', values: [false, true, true, true] },
  { label: 'Branding personnalise', values: [false, false, true, true] },
  { label: 'Multi-staff', values: [false, false, false, true] },
  { label: 'Acces API', values: [false, false, false, true] },
  { label: 'Support', values: ['Docs', 'Email', 'Prioritaire', 'Dedie'] },
  { label: 'Liste d\'attente', values: [false, false, false, true] },
];

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Puis-je changer de plan ?',
    a: 'Oui, a tout moment. Vous pouvez upgrader ou downgrader directement depuis votre tableau de bord. Le changement prend effet immediatement.',
  },
  {
    q: 'Y a-t-il un engagement ?',
    a: 'Non, aucun engagement. Vous pouvez annuler quand vous voulez. En formule annuelle, vous beneficiez de -20% mais restez libre d\'annuler.',
  },
  {
    q: 'Comment fonctionne l\'essai gratuit ?',
    a: 'Vous beneficiez de 14 jours avec toutes les fonctionnalites du plan Pro. Aucune carte bancaire requise. A la fin de l\'essai, vous passez automatiquement au plan Decouverte.',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: 'Carte bancaire (Visa, Mastercard) via Stripe. Paiement securise et automatique chaque mois ou chaque annee.',
  },
  {
    q: 'Que se passe-t-il apres l\'essai ?',
    a: 'Si vous ne choisissez pas de plan payant, vous passez automatiquement au plan Decouverte (gratuit). Vous ne perdez aucune donnee.',
  },
  {
    q: 'Puis-je avoir une demo personnalisee ?',
    a: 'Bien sur ! Ecrivez-nous a jordy@pacifikai.com et nous organiserons une demonstration adaptee a votre activite.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function PricingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logos/logo-transparent.png" alt="Ve'a" width={36} height={36} className="w-9 h-9 object-contain" />
          <span className="text-xl font-bold text-white">Ve&apos;a</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Accueil
          </Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function BillingToggle({
  annual,
  onToggle,
}: {
  annual: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <span className={`text-sm ${!annual ? 'text-white font-medium' : 'text-gray-500'}`}>
        Mensuel
      </span>
      <button
        onClick={onToggle}
        className="relative w-14 h-7 rounded-full transition-colors"
        style={{ backgroundColor: annual ? GREEN : '#374151' }}
        aria-label="Basculer facturation annuelle"
      >
        <div
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
            annual ? 'translate-x-7' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className={`text-sm ${annual ? 'text-white font-medium' : 'text-gray-500'}`}>
        Annuel
      </span>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: `${GREEN}20`, color: GREEN }}
      >
        -20%
      </span>
    </div>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const router = useRouter();
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const pricingId = annual
    ? plan.freemiusPricingIdAnnual
    : plan.freemiusPricingIdMonthly;

  const ctaClass = `mt-6 block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${
    plan.featured
      ? 'text-gray-950 hover:opacity-90'
      : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
  }`;
  const ctaStyle = plan.featured ? { backgroundColor: GREEN } : undefined;

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col ${
        plan.featured
          ? 'bg-gray-900 border-2'
          : 'bg-gray-900/50 border border-gray-800'
      }`}
      style={plan.featured ? { borderColor: GREEN } : undefined}
    >
      {plan.featured && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: GREEN, color: '#030712' }}
        >
          Populaire
        </div>
      )}

      <h3 className="text-lg font-bold text-white mt-1">{plan.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>

      <div className="mt-5 mb-6">
        {price !== null ? (
          <>
            <span className="text-4xl font-bold text-white">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-gray-500 ml-1">XPF/mois</span>
            {annual && plan.annualPrice && (
              <p className="text-xs text-gray-600 mt-1">
                Facture annuellement
              </p>
            )}
          </>
        ) : (
          <span className="text-4xl font-bold text-white">Gratuit</span>
        )}
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
            <Check
              size={15}
              className="shrink-0 mt-0.5"
              style={{ color: GREEN }}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA — 3 cas : Freemius checkout, lien interne, lien email */}
      {pricingId !== null ? (
        <FreemiusCheckoutButton
          pricingId={pricingId}
          label={plan.cta}
          trial
          className={ctaClass}
          style={ctaStyle}
          onSuccess={() => router.push('/dashboard')}
        />
      ) : plan.href ? (
        <Link href={plan.href} className={ctaClass} style={ctaStyle}>
          {plan.cta}
        </Link>
      ) : (
        <a
          href={`mailto:jordy@pacifikai.com?subject=Plan%20Business%20Ve%27a`}
          className={ctaClass}
          style={ctaStyle}
        >
          {plan.cta}
        </a>
      )}
    </div>
  );
}

// ─── Comparison Table ────────────────────────────────────────────────────────

function ComparisonTable() {
  const planNames = ['Decouverte', 'Starter', 'Pro', 'Business'];

  function renderCell(value: CellValue) {
    if (value === true) return <Check size={16} style={{ color: GREEN }} />;
    if (value === false) return <X size={16} className="text-gray-700" />;
    return <span className="text-sm text-gray-300">{value}</span>;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Comparaison detaillee
        </h2>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-sm font-medium text-gray-500 pb-4 pr-4 w-1/5">
                  Fonctionnalite
                </th>
                {planNames.map((name, i) => (
                  <th
                    key={name}
                    className={`text-center text-sm font-semibold pb-4 px-2 w-1/5 ${
                      i === 2 ? 'text-white' : 'text-gray-400'
                    }`}
                    style={i === 2 ? { color: GREEN } : undefined}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, ri) => (
                <tr
                  key={row.label}
                  className={ri < COMPARISON.length - 1 ? 'border-b border-gray-800/50' : ''}
                >
                  <td className="text-sm text-gray-400 py-3.5 pr-4">
                    {row.label}
                  </td>
                  {row.values.map((val, ci) => (
                    <td key={ci} className="text-center py-3.5 px-2">
                      <div className="flex justify-center">
                        {renderCell(val)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-6">
          {planNames.map((name, planIdx) => (
            <div
              key={name}
              className={`rounded-xl p-5 ${
                planIdx === 2
                  ? 'bg-gray-900 border-2'
                  : 'bg-gray-900/50 border border-gray-800'
              }`}
              style={planIdx === 2 ? { borderColor: GREEN } : undefined}
            >
              <h3
                className="text-base font-bold mb-4"
                style={planIdx === 2 ? { color: GREEN } : { color: 'white' }}
              >
                {name}
              </h3>
              <div className="space-y-2.5">
                {COMPARISON.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <div>{renderCell(row.values[planIdx])}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Questions frequentes
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl bg-gray-900/50 border border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-gray-500 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Footer ──────────────────────────────────────────────────────────────

function CTAFooter() {
  const router = useRouter();
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Pret a ne plus perdre de clients ?
        </h2>
        <p className="mt-4 text-gray-400 max-w-lg mx-auto">
          Commencez gratuitement et decouvrez comment Ve&apos;a peut
          transformer votre gestion de rendez-vous.
        </p>
        <div className="mt-8">
          <FreemiusCheckoutButton
            pricingId={57674}
            label="Commencer maintenant"
            trial
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-gray-950 hover:opacity-90 transition-all"
            style={{ backgroundColor: GREEN }}
            onSuccess={() => router.push('/dashboard')}
          />
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Aucune carte bancaire requise &bull; 14 jours d&apos;essai gratuit
        </p>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/logos/logo-transparent.png" alt="Ve'a" width={24} height={24} className="w-6 h-6 object-contain" />
          <p className="text-sm text-gray-500">
            &copy; 2026 PACIFIK&apos;AI. Tous droits reserves.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            Confidentialite
          </Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            Conditions
          </Link>
          <a
            href="mailto:jordy@pacifikai.com"
            className="hover:text-gray-300 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <PricingNav />

      {/* Hero */}
      <section className="pt-28 pb-8 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Tarifs simples, sans surprise
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
          Commencez gratuitement. Payez uniquement quand vous grandissez.
        </p>
        <BillingToggle annual={annual} onToggle={() => setAnnual(!annual)} />
      </section>

      {/* Plan Cards */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} annual={annual} />
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <CTAFooter />

      {/* Footer */}
      <Footer />
    </div>
  );
}
