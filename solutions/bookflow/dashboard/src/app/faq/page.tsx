import type { Metadata } from 'next';
import Link from 'next/link';

const GREEN = '#25D366';

export const metadata: Metadata = {
  title: "FAQ — Ve'a, Assistant IA de reservation",
  description:
    "Toutes les reponses a vos questions sur Ve'a : fonctionnement, tarifs, canaux supportes, securite des donnees, personnalisation du chatbot IA pour votre commerce en Polynesie francaise.",
  openGraph: {
    title: "FAQ — Ve'a by PACIFIK'AI",
    description:
      "Comment fonctionne Ve'a ? Combien ca coute ? WhatsApp, Messenger, Instagram ? Toutes les reponses.",
    url: 'https://vea.pacifikai.com/faq',
    siteName: "Ve'a by PACIFIK'AI",
    locale: 'fr_FR',
    type: 'website',
  },
};

const FAQS = [
  {
    q: "C'est quoi Ve'a ?",
    a: "Ve'a est un assistant intelligent qui repond automatiquement aux messages de vos clients sur WhatsApp, Messenger et Instagram. Il comprend leurs demandes, propose les creneaux disponibles et confirme les rendez-vous a votre place. Vous gardez le controle total depuis un tableau de bord en ligne.",
  },
  {
    q: 'Comment ca marche ?',
    a: "Vous creez votre compte, ajoutez vos services et horaires, puis connectez votre numero WhatsApp ou votre page Facebook. Des qu'un client envoie un message, l'IA engage la conversation, identifie le service souhaite, verifie vos disponibilites et confirme le rendez-vous. Tout est visible en temps reel dans votre tableau de bord.",
  },
  {
    q: 'Quels canaux sont supportes ?',
    a: "Ve'a fonctionne sur trois canaux : WhatsApp (via l'API Business), Facebook Messenger et Instagram DM. Le plan Essentiel inclut WhatsApp. Les plans Business et Premium ajoutent Messenger et Instagram. Vos clients vous contactent ou ils preferent.",
  },
  {
    q: 'Combien ca coute ?',
    a: "Trois formules sans engagement : Essentiel a 9 900 F/mois (WhatsApp, 200 conversations), Business a 19 900 F/mois (multi-canal, 500 conversations, Google Calendar), et Premium sur devis (conversations illimitees, multi-sites). Abonnement annuel : 2 mois offerts.",
  },
  {
    q: 'Est-ce que le bot comprend le tahitien ?',
    a: "Ve'a est optimise pour le francais et comprend les expressions courantes en reo tahiti utilisees dans la conversation quotidienne (ia ora na, maeva, mauruuru, etc.). Pour les echanges entierement en tahitien, l'IA redirige poliment vers un appel direct. Nous travaillons a etendre la couverture linguistique.",
  },
  {
    q: 'Comment mes clients prennent rendez-vous ?',
    a: "Vos clients envoient simplement un message sur WhatsApp, Messenger ou Instagram comme ils le feraient avec vous. L'IA pose les bonnes questions (quel service, quelle date, quelle heure), verifie vos disponibilites en temps reel et confirme le creneau. Le client recoit un message de confirmation instantanement.",
  },
  {
    q: 'Je peux personnaliser les reponses du chatbot ?',
    a: "Oui. Vous configurez le ton, le vocabulaire, les messages d'accueil et les regles specifiques a votre activite depuis votre tableau de bord. Vous pouvez aussi ajouter une base de connaissances (tarifs, infos pratiques, politiques d'annulation) pour que l'IA reponde avec precision.",
  },
  {
    q: 'Est-ce que ca se synchronise avec Google Calendar ?',
    a: "Oui, la synchronisation Google Calendar est bidirectionnelle. Les rendez-vous pris par Ve'a apparaissent dans votre agenda, et les evenements deja presents dans Google Calendar bloquent automatiquement les creneaux pour eviter les doublons. Disponible sur les plans Business et Premium.",
  },
  {
    q: 'Combien de conversations par mois ?',
    a: "Le plan Essentiel inclut 200 conversations par mois, le plan Business 500. Le plan Premium offre des conversations illimitees. Une conversation correspond a un echange complet avec un client (de la premiere question a la confirmation du rendez-vous).",
  },
  {
    q: 'Puis-je bloquer des creneaux ?',
    a: "Oui. Depuis le tableau de bord ou via Google Calendar, vous pouvez bloquer des plages horaires (conges, pauses, reunions). L'IA ne proposera jamais ces creneaux a vos clients. Vous pouvez aussi definir des horaires differents selon les jours de la semaine.",
  },
  {
    q: 'Les clients recoivent des rappels ?',
    a: "Oui. Ve'a envoie automatiquement un rappel WhatsApp ou Messenger avant chaque rendez-vous. Le delai est configurable (24h, 12h, 2h avant). Les rappels reduisent significativement les rendez-vous manques (no-shows).",
  },
  {
    q: 'Mes donnees sont-elles securisees ?',
    a: "Absolument. Toutes les communications sont chiffrees (TLS). Les donnees sont hebergees sur des serveurs securises (Supabase, Vercel). Les tokens OAuth sont chiffres au repos. Aucune donnee n'est vendue a des tiers. Vous pouvez demander la suppression de vos donnees a tout moment.",
  },
  {
    q: 'Comment commencer ?',
    a: "Inscrivez-vous gratuitement en 30 secondes. Ajoutez vos services, vos horaires et connectez votre canal (WhatsApp, Messenger ou Instagram). L'ensemble prend environ 5 minutes. Aucune carte bancaire n'est requise pour demarrer.",
  },
  {
    q: 'Quel support technique est disponible ?',
    a: "Tous les plans incluent un support par email (support@vea.pacifikai.com). Les plans Business et Premium beneficient d'un support prioritaire avec un temps de reponse garanti. Nous proposons aussi un accompagnement a la configuration initiale pour vous aider a demarrer.",
  },
];

function FAQJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function FAQPage() {
  return (
    <>
      <FAQJsonLd />

      <main className="min-h-screen bg-gray-950">
        {/* Nav */}
        <nav className="border-b border-gray-800/50 bg-gray-950/90 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">
              Ve&apos;a
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-gray-950 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: GREEN }}
              >
                Essayer gratuitement
              </Link>
            </div>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-16 pb-10 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Questions frequentes
            </h1>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              Tout ce que vous devez savoir sur Ve&apos;a, l&apos;assistant IA
              de reservation pour les commerces de Polynesie francaise.
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl bg-gray-900/50 border border-gray-800 overflow-hidden [&[open]>summary]:border-b [&[open]>summary]:border-gray-800/50"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-left select-none">
                  <span className="text-sm font-medium text-white pr-4">
                    {faq.q}
                  </span>
                  <svg
                    className="shrink-0 w-4 h-4 text-gray-500 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-4 pt-2">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-gray-900/50 border border-gray-800 p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Vous avez d&apos;autres questions ?
              </h2>
              <p className="mt-4 text-gray-400 max-w-md mx-auto">
                Notre equipe est disponible pour vous accompagner dans la mise
                en place de Ve&apos;a pour votre commerce.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-gray-950 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: GREEN }}
                >
                  Nous contacter
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer minimal */}
        <footer className="border-t border-gray-800/50 py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; 2026 PACIFIK&apos;AI. Tous droits reserves.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Confidentialite
              </Link>
              <Link
                href="/terms"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Conditions
              </Link>
              <a
                href="mailto:support@vea.pacifikai.com"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                support@vea.pacifikai.com
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
