import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | PACIFIK'AI",
  description:
    "Conditions Générales d'Utilisation des services PACIFIK'AI — agence d'automatisation IA en Polynésie française. EI Jordy TOOFA, Patente G67367.",
  openGraph: {
    title: "CGU | PACIFIK'AI",
    description:
      "Conditions Générales d'Utilisation des services PACIFIK'AI — agence d'automatisation IA en Polynésie française.",
    type: "website",
    locale: "fr_FR",
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg font-semibold text-[#f97066] mt-12 mb-4 pb-3 border-b border-border">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-text mt-6 mb-2">
      {children}
    </h3>
  );
}

function P({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-text-secondary text-sm leading-relaxed mb-3${className ? ` ${className}` : ""}`}>
      {children}
    </p>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="text-text-secondary text-sm leading-relaxed mb-3 pl-5 space-y-1 list-disc marker:text-text-dim">
      {children}
    </ul>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 p-4 rounded-xl bg-[#f97066]/5 border border-[#f97066]/15 border-l-[3px] border-l-[#f97066]">
      <p className="text-text-secondary text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function CGUPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[#f97066]/4 blur-[120px]" />
        </div>

        <div className="relative z-10 pt-32 pb-24 px-4 max-w-3xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-text-secondary text-sm mb-4">
              Règles d&apos;utilisation des services PACIFIK&apos;AI — applicables à tous les utilisateurs
            </p>
            <span className="inline-block px-3 py-1 rounded-full bg-[#f97066]/10 border border-[#f97066]/20 text-[#f97066] text-xs font-medium">
              Dernière mise à jour : 24 mars 2026
            </span>
          </div>

          {/* Content */}
          <div className="glass rounded-2xl p-6 md:p-10 border border-white/[0.06]">

            <SectionTitle>1. Objet</SectionTitle>
            <P>
              Les présentes Conditions Générales d&apos;Utilisation (ci-après &laquo;&nbsp;CGU&nbsp;&raquo;) définissent
              les modalités d&apos;accès et d&apos;utilisation des services proposés par{" "}
              <strong className="text-text">PACIFIK&apos;AI</strong>, entreprise individuelle exploitée par Jordy TOOFA,
              aux utilisateurs (ci-après &laquo;&nbsp;l&apos;Utilisateur&nbsp;&raquo;) qui accèdent à ses plateformes,
              logiciels, et services en ligne.
            </P>
            <P>Les CGU s&apos;appliquent à l&apos;ensemble des services PACIFIK&apos;AI, notamment :</P>
            <UL>
              <li>Le site institutionnel <strong className="text-text">pacifikai.com</strong></li>
              <li>La plateforme SaaS <strong className="text-text">DroitPF</strong> (droitpf.com) — assistant juridique IA dédié à la Polynésie française</li>
              <li>La plateforme SaaS <strong className="text-text">TARA</strong> — logiciel de comptabilité et fiscalité IA adapté au droit polynésien</li>
              <li>Les chatbots et assistants conversationnels déployés pour le compte de clients PACIFIK&apos;AI</li>
              <li>Les dashboards, applications et outils d&apos;automatisation mis à disposition</li>
            </UL>

            <SectionTitle>2. Acceptation des Conditions</SectionTitle>
            <P>
              L&apos;accès aux services PACIFIK&apos;AI implique l&apos;acceptation pleine et entière des présentes CGU.
              Cette acceptation intervient :
            </P>
            <UL>
              <li>Lors de la création d&apos;un compte utilisateur (case à cocher obligatoire)</li>
              <li>Lors de la souscription à un abonnement payant</li>
              <li>Par la simple navigation sur les interfaces lorsqu&apos;aucune inscription n&apos;est requise</li>
            </UL>
            <P>
              Toute utilisation des services après modification des présentes CGU vaut acceptation des nouvelles
              conditions. Si l&apos;Utilisateur n&apos;accepte pas les CGU en vigueur, il doit cesser immédiatement
              d&apos;utiliser les services concernés.
            </P>
            <InfoBox>
              <strong className="text-text">Note aux mineurs :</strong> Les services PACIFIK&apos;AI sont destinés aux
              personnes majeures (18 ans ou plus) ou aux mineurs agissant sous la supervision d&apos;un représentant
              légal. La création d&apos;un compte par un mineur non accompagné est interdite.
            </InfoBox>

            <SectionTitle>3. Description des Services</SectionTitle>
            <SubTitle>3.1 Plateformes SaaS</SubTitle>
            <P>
              PACIFIK&apos;AI édite des logiciels accessibles en ligne par abonnement. Ces plateformes fournissent des
              outils d&apos;assistance, d&apos;analyse et d&apos;automatisation à titre informatif. Les informations
              générées par les outils d&apos;intelligence artificielle (notamment les analyses juridiques de DroitPF et
              les calculs fiscaux de TARA){" "}
              <strong className="text-text">ne constituent pas des conseils professionnels certifiés</strong> et ne
              remplacent pas l&apos;intervention d&apos;un avocat, d&apos;un expert-comptable ou d&apos;un conseiller
              fiscal agréé.
            </P>
            <SubTitle>3.2 Création de sites web et applications</SubTitle>
            <P>
              PACIFIK&apos;AI réalise des prestations de développement informatique sur mesure pour des clients tiers.
              Les utilisateurs finaux de ces sites ou applications sont soumis aux conditions propres à chaque client
              commanditaire.
            </P>
            <SubTitle>3.3 Chatbots et automatisations IA</SubTitle>
            <P>
              Les agents conversationnels et workflows déployés par PACIFIK&apos;AI utilisent des modèles de langage
              tiers (notamment Anthropic Claude). Les réponses générées automatiquement sont fournies à titre
              indicatif. PACIFIK&apos;AI ne garantit pas l&apos;exactitude exhaustive des réponses produites par
              intelligence artificielle.
            </P>
            <SubTitle>3.4 Accès gratuit et payant</SubTitle>
            <P>
              Certains services proposent un accès gratuit limité (version d&apos;essai, fonctionnalités de base).
              L&apos;accès complet est conditionné à la souscription d&apos;un abonnement payant. Les conditions
              tarifaires sont précisées sur la page dédiée de chaque service.
            </P>

            <SectionTitle>4. Tarifs et Paiement</SectionTitle>
            <SubTitle>4.1 Devise et fiscalité</SubTitle>
            <P>
              Les tarifs des services SaaS sont exprimés en Euros (EUR) ou en Francs CFP (XPF). La Polynésie française
              n&apos;étant pas soumise à la TVA métropolitaine, les prix affichés sont nets de toute taxe locale. La
              conversion EUR/XPF s&apos;effectue au taux fixe officiel de{" "}
              <strong className="text-text">1 EUR = 119,332 XPF</strong>.
            </P>
            <SubTitle>4.2 Marchand de référence pour les produits numériques</SubTitle>
            <P>
              Pour les abonnements et produits numériques distribués via les plateformes SaaS PACIFIK&apos;AI,{" "}
              <strong className="text-text">Paddle.com Market Limited</strong> (ci-après &laquo;&nbsp;Paddle&nbsp;&raquo;)
              agit en qualité de <em>Merchant of Record</em> (revendeur officiel). À ce titre :
            </P>
            <UL>
              <li>Paddle collecte et traite les paiements au nom de PACIFIK&apos;AI</li>
              <li>La facturation est émise par Paddle, conformément à la réglementation applicable dans le pays de l&apos;acheteur</li>
              <li>La gestion des taxes, remboursements et litiges de paiement relève de la responsabilité de Paddle</li>
              <li>Les données de paiement (numéro de carte, etc.) sont traitées exclusivement par Paddle et ne transitent jamais par les serveurs PACIFIK&apos;AI</li>
            </UL>
            <P>
              Les conditions générales de Paddle sont accessibles sur{" "}
              <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-[#f97066] hover:underline underline-offset-4">
                paddle.com/legal/terms
              </a>. En effectuant un achat via nos plateformes SaaS, l&apos;Utilisateur accepte également les conditions de Paddle.
            </P>
            <SubTitle>4.3 Moyens de paiement acceptés</SubTitle>
            <P>Les paiements sont effectués via Paddle, qui accepte :</P>
            <UL>
              <li>Cartes bancaires (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
              <li>Apple Pay / Google Pay (selon disponibilité régionale)</li>
            </UL>
            <P>
              Pour les prestations sur mesure (développement, conseil), le paiement s&apos;effectue par virement
              bancaire selon l&apos;échéancier défini dans le devis accepté.
            </P>
            <SubTitle>4.4 Renouvellement et abonnements</SubTitle>
            <P>
              Les abonnements sont à durée mensuelle ou annuelle, renouvelables par tacite reconduction à
              l&apos;échéance. L&apos;Utilisateur peut résilier à tout moment depuis son espace client ou en
              contactant{" "}
              <a href="mailto:jordy@pacifikai.com" className="text-[#f97066] hover:underline underline-offset-4">
                jordy@pacifikai.com
              </a>. La résiliation prend effet à la fin de la période en cours.
            </P>
            <SubTitle>4.5 Retard de paiement</SubTitle>
            <P>
              Tout retard de paiement supérieur à 15 jours entraîne la suspension automatique de l&apos;accès aux
              services, sans mise en demeure préalable. L&apos;accès est rétabli dans les 24 heures suivant la
              régularisation.
            </P>

            <SectionTitle>5. Propriété Intellectuelle</SectionTitle>
            <SubTitle>5.1 Contenu PACIFIK&apos;AI</SubTitle>
            <P>
              L&apos;ensemble des éléments constituant les services PACIFIK&apos;AI — codes sources, algorithmes,
              interfaces graphiques, bases de données, textes, logos, marques, et toute documentation associée — sont
              la propriété exclusive de PACIFIK&apos;AI ou de ses concédants de licence, et sont protégés par les lois
              applicables en matière de propriété intellectuelle.
            </P>
            <P>
              PACIFIK&apos;AI concède à l&apos;Utilisateur un droit d&apos;utilisation personnel, non exclusif, non
              cessible et révocable, limité à la durée de l&apos;abonnement ou du contrat en cours, aux seules fins
              d&apos;utilisation normale du service souscrit. Toute reproduction, représentation, distribution,
              modification ou exploitation commerciale, même partielle, est strictement interdite sans autorisation
              écrite préalable.
            </P>
            <SubTitle>5.2 Contenu de l&apos;Utilisateur</SubTitle>
            <P>
              L&apos;Utilisateur conserve la propriété des données et contenus qu&apos;il importe ou génère via les
              services PACIFIK&apos;AI. Il accorde à PACIFIK&apos;AI une licence non exclusive, gratuite et mondiale,
              pour héberger, traiter et utiliser ces contenus aux seules fins de la fourniture du service, notamment
              pour l&apos;entraînement et l&apos;amélioration des modèles IA, dans les limites définies à l&apos;article 7
              (Protection des données).
            </P>
            <SubTitle>5.3 Marque PACIFIK&apos;AI</SubTitle>
            <P>
              La marque &laquo;&nbsp;PACIFIK&apos;AI&nbsp;&raquo;, le logo associé, ainsi que les noms de produits
              &laquo;&nbsp;DroitPF&nbsp;&raquo; et &laquo;&nbsp;TARA&nbsp;&raquo; sont des signes distinctifs
              appartenant à Jordy TOOFA. Toute utilisation non autorisée constitue une contrefaçon susceptible de
              poursuites.
            </P>

            <SectionTitle>6. Limitation de Responsabilité</SectionTitle>
            <SubTitle>6.1 Nature des services IA</SubTitle>
            <P>
              Les services d&apos;intelligence artificielle proposés par PACIFIK&apos;AI (analyses juridiques, calculs
              fiscaux, réponses de chatbots) sont fournis{" "}
              <strong className="text-text">à titre informatif uniquement</strong>. Ils ne constituent pas des avis
              juridiques, fiscaux, financiers ou médicaux certifiés. L&apos;Utilisateur assume seul la responsabilité
              des décisions prises sur la base de ces informations et est invité à consulter un professionnel qualifié
              pour toute décision importante.
            </P>
            <SubTitle>6.2 Disponibilité du service</SubTitle>
            <P>
              PACIFIK&apos;AI s&apos;efforce de maintenir ses services accessibles 24h/24, 7j/7. Des interruptions
              pour maintenance peuvent survenir, avec un préavis de 48 heures sauf urgence technique.
              PACIFIK&apos;AI ne saurait être tenu responsable des conséquences d&apos;une indisponibilité temporaire,
              notamment pour les services hébergés sur des infrastructures tierces (Vercel, Supabase, fournisseurs de
              modèles IA).
            </P>
            <SubTitle>6.3 Exclusions</SubTitle>
            <P>PACIFIK&apos;AI ne saurait être tenu responsable :</P>
            <UL>
              <li>Des interruptions dues à des maintenances, pannes de fournisseurs tiers, ou cas de force majeure</li>
              <li>Des pertes de données résultant d&apos;une mauvaise utilisation des services ou d&apos;une défaillance hors du contrôle de PACIFIK&apos;AI</li>
              <li>Des préjudices indirects, pertes de revenus ou d&apos;opportunités commerciales découlant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser les services</li>
              <li>Du contenu généré par des modèles d&apos;IA tiers intégrés aux plateformes</li>
            </UL>
            <SubTitle>6.4 Plafond d&apos;indemnisation</SubTitle>
            <P>
              En tout état de cause, la responsabilité de PACIFIK&apos;AI est limitée au montant total des sommes
              effectivement versées par l&apos;Utilisateur au cours des 12 mois précédant le fait générateur du litige.
            </P>
            <SubTitle>6.5 Obligations de l&apos;Utilisateur</SubTitle>
            <P>
              L&apos;Utilisateur s&apos;engage à utiliser les services de manière licite, conformément aux présentes
              CGU et aux lois applicables. Il lui est notamment interdit :
            </P>
            <UL>
              <li>D&apos;utiliser les services à des fins illicites, frauduleuses ou contraires à l&apos;ordre public</li>
              <li>De tenter de contourner les mesures de sécurité ou de compromettre l&apos;intégrité des systèmes</li>
              <li>De reproduire, revendre ou distribuer les services ou leurs résultats sans autorisation</li>
              <li>D&apos;utiliser des robots, scrapers ou systèmes automatisés non autorisés pour accéder aux interfaces</li>
              <li>De diffuser des contenus illicites, diffamatoires, ou portant atteinte aux droits de tiers</li>
            </UL>

            <SectionTitle>7. Protection des Données Personnelles</SectionTitle>
            <P>
              PACIFIK&apos;AI collecte et traite les données personnelles des Utilisateurs dans le strict cadre de la
              fourniture de ses services, conformément à la loi n°&nbsp;78-17 du 6 janvier 1978 modifiée relative à
              l&apos;informatique, aux fichiers et aux libertés, telle qu&apos;applicable en Polynésie française.
            </P>
            <SubTitle>7.1 Données collectées</SubTitle>
            <UL>
              <li><strong className="text-text">Données d&apos;identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
              <li><strong className="text-text">Données de facturation :</strong> adresse postale, historique des transactions (gérées par Paddle)</li>
              <li><strong className="text-text">Données d&apos;utilisation :</strong> logs de connexion, pages visitées, interactions avec les services et les assistants IA</li>
              <li><strong className="text-text">Données techniques :</strong> adresse IP, type de navigateur, appareil utilisé</li>
            </UL>
            <SubTitle>7.2 Finalités du traitement</SubTitle>
            <UL>
              <li>Fourniture, personnalisation et amélioration des services</li>
              <li>Gestion des comptes utilisateurs et de la relation client</li>
              <li>Facturation et recouvrement</li>
              <li>Envoi de communications relatives aux services souscrits (mises à jour, maintenance)</li>
              <li>Amélioration des modèles d&apos;intelligence artificielle (données anonymisées)</li>
              <li>Respect des obligations légales applicables</li>
            </UL>
            <SubTitle>7.3 Droits de l&apos;Utilisateur</SubTitle>
            <P>
              L&apos;Utilisateur dispose d&apos;un droit d&apos;accès, de rectification, de suppression et de
              portabilité de ses données personnelles. Ces droits s&apos;exercent par email à{" "}
              <a href="mailto:jordy@pacifikai.com" className="text-[#f97066] hover:underline underline-offset-4">
                jordy@pacifikai.com
              </a>. La demande sera traitée dans un délai maximum de 30 jours. La suppression complète des données
              entraîne la clôture du compte et la fin de l&apos;accès aux services.
            </P>
            <SubTitle>7.4 Sous-traitants et transferts</SubTitle>
            <P>
              Les données peuvent être traitées par des sous-traitants techniques soigneusement sélectionnés :
              hébergement (Vercel, Supabase), paiement (Paddle), modèles IA (Anthropic), analytics. Ces transferts
              s&apos;effectuent dans le strict cadre de la fourniture des services. Aucune donnée n&apos;est vendue ou
              partagée à des fins commerciales tierces.
            </P>
            <P>
              Pour plus d&apos;informations sur la gestion de vos données personnelles, consultez notre{" "}
              <a href="/confidentialite" className="text-[#f97066] hover:underline underline-offset-4">
                Politique de Confidentialité
              </a>.
            </P>

            <SectionTitle>8. Droit Applicable et Juridiction Compétente</SectionTitle>
            <P>
              Les présentes CGU sont rédigées en langue française et régies par le droit applicable en{" "}
              <strong className="text-text">Polynésie française</strong>. En cas de contradiction entre une version
              traduite et la version française, la version française prévaut.
            </P>
            <P>
              En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU, les parties
              s&apos;engagent à rechercher une solution amiable dans un délai de{" "}
              <strong className="text-text">30 jours</strong> à compter de la notification du différend par voie
              écrite. À défaut de règlement amiable, les tribunaux de{" "}
              <strong className="text-text">Papeete (Polynésie française)</strong> seront seuls compétents, nonobstant
              pluralité de défendeurs ou appel en garantie.
            </P>
            <P>
              Pour les Utilisateurs résidant dans un État membre de l&apos;Union européenne, les dispositions
              obligatoires de protection du consommateur applicables dans leur pays de résidence demeurent applicables
              dans la mesure où elles offrent une protection supérieure à celles prévues par les présentes CGU.
            </P>

            <SectionTitle>9. Modification des Conditions Générales d&apos;Utilisation</SectionTitle>
            <P>
              PACIFIK&apos;AI se réserve le droit de modifier les présentes CGU à tout moment, notamment pour se
              conformer à l&apos;évolution législative et réglementaire, adapter les services proposés, ou intégrer de
              nouvelles fonctionnalités.
            </P>
            <P>
              Les modifications entrent en vigueur{" "}
              <strong className="text-text">30 jours après leur publication</strong> sur cette page, la date de mise à
              jour étant indiquée en haut du document. En cas de modification substantielle affectant les droits des
              Utilisateurs, une notification par email sera adressée à l&apos;ensemble des comptes actifs au moins 14
              jours avant l&apos;entrée en vigueur.
            </P>
            <P>
              La poursuite de l&apos;utilisation des services après l&apos;entrée en vigueur des nouvelles CGU vaut
              acceptation sans réserve. En cas de désaccord, l&apos;Utilisateur peut résilier son compte sans pénalité
              dans le délai de préavis de 30 jours.
            </P>

            <SectionTitle>10. Contact</SectionTitle>
            <P>
              Pour toute question relative aux présentes Conditions Générales d&apos;Utilisation, pour exercer vos
              droits ou pour signaler un manquement :
            </P>
            <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-text-secondary leading-loose">
              <strong className="text-text">PACIFIK&apos;AI — Jordy TOOFA</strong><br />
              Entreprise individuelle — Patente n° G67367<br />
              PK22 Vallée Orofero, Paea, 98711, Polynésie française<br />
              Email :{" "}
              <a href="mailto:jordy@pacifikai.com" className="text-[#f97066] hover:underline underline-offset-4">
                jordy@pacifikai.com
              </a>
            </div>
            <P className="mt-4">
              Toute communication officielle relative à ces CGU doit être adressée par écrit à l&apos;adresse email
              ci-dessus. Les demandes reçues par tout autre canal (réseaux sociaux, messageries instantanées) ne seront
              pas considérées comme des notifications officielles au sens des présentes.
            </P>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
