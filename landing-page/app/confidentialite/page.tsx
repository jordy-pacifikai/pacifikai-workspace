import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | PACIFIK'AI",
  description:
    "Politique de confidentialité et protection des données personnelles des utilisateurs des services PACIFIK'AI — Polynésie française.",
  openGraph: {
    title: "Politique de Confidentialité | PACIFIK'AI",
    description:
      "Protection des données personnelles des utilisateurs des services PACIFIK'AI.",
    type: "website",
    locale: "fr_FR",
  },
};

function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="font-display text-lg font-semibold text-[#14b8a6] mt-12 mb-4 pb-3 border-b border-border"
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-text mt-6 mb-2">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-text-secondary text-sm leading-relaxed mb-3">
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
    <div className="my-5 p-4 rounded-xl bg-[#14b8a6]/5 border border-[#14b8a6]/15 border-l-[3px] border-l-[#14b8a6]">
      <p className="text-text-secondary text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-dim bg-white/[0.02]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-text-secondary leading-relaxed align-top"
                  dangerouslySetInnerHTML={{ __html: cell }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RightsGrid() {
  const rights = [
    {
      title: "Droit d'accès",
      desc: "Obtenir la confirmation que des données vous concernant sont traitées et en recevoir une copie.",
    },
    {
      title: "Droit de rectification",
      desc: "Faire corriger toute donnée inexacte ou incomplète vous concernant.",
    },
    {
      title: "Droit à l'effacement",
      desc: "Obtenir la suppression de vos données, sous réserve des obligations légales de conservation.",
    },
    {
      title: "Droit à la limitation",
      desc: "Demander la suspension temporaire du traitement de vos données dans certains cas.",
    },
    {
      title: "Droit à la portabilité",
      desc: "Recevoir vos données dans un format structuré, lisible par machine, pour les transférer à un autre responsable.",
    },
    {
      title: "Droit d'opposition",
      desc: "Vous opposer au traitement fondé sur l'intérêt légitime, notamment à des fins de prospection commerciale.",
    },
    {
      title: "Retrait du consentement",
      desc: "Retirer à tout moment un consentement préalablement donné (ex. : newsletters), sans effet rétroactif.",
    },
    {
      title: "Droit de réclamation",
      desc: "Introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {rights.map((r) => (
        <div
          key={r.title}
          className="p-4 rounded-xl bg-white/[0.02] border border-border hover:border-white/10 transition-colors"
        >
          <h4 className="text-sm font-semibold text-text mb-1">{r.title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">{r.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function ConfidentialitePage() {
  const tocItems = [
    { id: "responsable", label: "1. Responsable du traitement" },
    { id: "donnees", label: "2. Données collectées" },
    { id: "finalites", label: "3. Finalités du traitement" },
    { id: "base-legale", label: "4. Base légale" },
    { id: "destinataires", label: "5. Destinataires et sous-traitants" },
    { id: "conservation", label: "6. Durée de conservation" },
    { id: "droits", label: "7. Droits des utilisateurs" },
    { id: "cookies", label: "8. Cookies et traceurs" },
    { id: "transferts", label: "9. Transferts internationaux" },
    { id: "securite", label: "10. Sécurité" },
    { id: "modifications", label: "11. Modifications" },
    { id: "contact", label: "12. Contact et DPO" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-[#14b8a6]/4 blur-[120px]" />
        </div>

        <div className="relative z-10 pt-32 pb-24 px-4 max-w-3xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Politique de Confidentialité
            </h1>
            <p className="text-text-secondary text-sm mb-4">
              Protection des données personnelles des utilisateurs des services
              PACIFIK&apos;AI
            </p>
            <span className="inline-block px-3 py-1 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-xs font-medium">
              Dernière mise à jour : 24 mars 2026
            </span>
          </div>

          {/* Table of contents */}
          <div className="mb-8 p-5 rounded-2xl glass border border-white/[0.06]">
            <h3 className="text-sm font-semibold text-text mb-3">Sommaire</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-xs text-text-secondary hover:text-[#14b8a6] transition-colors py-0.5"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-2xl p-6 md:p-10 border border-white/[0.06]">
            <InfoBox>
              La protection de votre vie privée est une priorité pour
              PACIFIK&apos;AI. Cette politique explique quelles données nous
              collectons, pourquoi, comment elles sont protégées, et quels sont
              vos droits. Elle s&apos;applique à l&apos;ensemble des services
              PACIFIK&apos;AI : site web{" "}
              <strong className="text-text">pacifikai.com</strong>, plateformes
              SaaS (DroitPF, TARA), chatbots et services d&apos;automatisation
              fournis.
            </InfoBox>

            <SectionTitle id="responsable">
              1. Responsable du Traitement
            </SectionTitle>
            <P>
              Le responsable du traitement des données à caractère personnel
              collectées via les services PACIFIK&apos;AI est :
            </P>
            <div className="my-4 p-4 rounded-xl bg-white/[0.02] border border-border text-sm text-text-secondary leading-loose">
              <strong className="text-text">PACIFIK&apos;AI</strong>
              <br />
              Entreprise individuelle — Jordy TOOFA
              <br />
              Patente n° G67367
              <br />
              PK22 Vallée Orofero, Paea, 98711 — Polynésie française
              <br />
              Email :{" "}
              <a
                href="mailto:jordy@pacifikai.com"
                className="text-[#14b8a6] hover:underline underline-offset-4"
              >
                jordy@pacifikai.com
              </a>
            </div>
            <P>
              Le traitement des données personnelles des utilisateurs est
              effectué dans le respect des dispositions de la loi n°&nbsp;78-17
              du 6 janvier 1978 relative à l&apos;informatique, aux fichiers et
              aux libertés (dite &laquo;&nbsp;loi Informatique et
              Libertés&nbsp;&raquo;), telle que modifiée, et du Règlement (UE)
              2016/679 du 27 avril 2016 relatif à la protection des données
              (RGPD), applicable en Polynésie française en tant que territoire
              d&apos;outre-mer français.
            </P>

            <SectionTitle id="donnees">2. Données Collectées</SectionTitle>
            <P>
              PACIFIK&apos;AI collecte les catégories de données suivantes,
              selon les services utilisés :
            </P>
            <SubTitle>2.1 Données d&apos;identification et de contact</SubTitle>
            <UL>
              <li>Nom et prénom</li>
              <li>Adresse email professionnelle ou personnelle</li>
              <li>Numéro de téléphone (si fourni volontairement)</li>
              <li>
                Nom de l&apos;entreprise ou de l&apos;organisation (le cas
                échéant)
              </li>
            </UL>
            <SubTitle>2.2 Données de navigation et d&apos;utilisation</SubTitle>
            <UL>
              <li>Adresse IP et données de géolocalisation approximative</li>
              <li>
                Type et version du navigateur et du système d&apos;exploitation
              </li>
              <li>
                Pages visitées, durée des sessions, flux de navigation sur le
                site
              </li>
              <li>
                Journaux d&apos;accès et d&apos;événements sur les plateformes
                SaaS (logs de connexion, actions effectuées)
              </li>
            </UL>
            <SubTitle>2.3 Données de paiement</SubTitle>
            <P>
              Les transactions financières liées aux produits numériques
              commercialisés par PACIFIK&apos;AI sont traitées par{" "}
              <strong className="text-text">
                Paddle.com Market Limited
              </strong>
              , qui agit en qualité de <em>Merchant of Record</em>.
              PACIFIK&apos;AI{" "}
              <strong className="text-text">
                ne collecte pas et ne stocke jamais
              </strong>{" "}
              les numéros de carte bancaire, codes de sécurité (CVV) ou données
              de compte bancaire. Les seules données transmises à PACIFIK&apos;AI
              par Paddle sont : le statut de la transaction,
              l&apos;identifiant de l&apos;abonnement et les informations de
              facturation nécessaires à la comptabilité.
            </P>
            <SubTitle>2.4 Données fournies volontairement</SubTitle>
            <UL>
              <li>
                Messages envoyés via les formulaires de contact ou par email
              </li>
              <li>
                Contenus transmis dans le cadre de l&apos;utilisation des
                services (documents, requêtes juridiques sur DroitPF, fichiers
                comptables sur TARA)
              </li>
              <li>Informations saisies dans les chatbots et assistants IA</li>
            </UL>
            <SubTitle>2.5 Données non collectées</SubTitle>
            <P>
              PACIFIK&apos;AI ne collecte pas : les données sensibles au sens de
              l&apos;article&nbsp;9 du RGPD (origines raciales ou ethniques,
              opinions politiques, croyances religieuses, données de santé ou
              biométriques), les données des mineurs de moins de 16 ans, ni
              aucune donnée en dehors des finalités explicitement décrites dans
              la présente politique.
            </P>

            <SectionTitle id="finalites">
              3. Finalités du Traitement
            </SectionTitle>
            <P>
              Les données personnelles collectées sont traitées pour les
              finalités suivantes :
            </P>
            <DataTable
              headers={["Finalité", "Description"]}
              rows={[
                [
                  "<strong>Fourniture des services</strong>",
                  "Création et gestion des comptes utilisateurs, accès aux plateformes SaaS (DroitPF, TARA), exécution des prestations de développement et d'automatisation commandées.",
                ],
                [
                  "<strong>Gestion commerciale</strong>",
                  "Traitement des commandes, gestion des abonnements, facturation, suivi des paiements et comptabilité.",
                ],
                [
                  "<strong>Relation client et support</strong>",
                  "Réponse aux demandes, support technique, gestion des réclamations et litiges, envoi de communications relatives aux services souscrits.",
                ],
                [
                  "<strong>Amélioration des services</strong>",
                  "Analyse agrégée et anonymisée de l'utilisation des produits pour identifier les dysfonctionnements et améliorer les fonctionnalités.",
                ],
                [
                  "<strong>Communication marketing</strong>",
                  "Envoi de newsletters et annonces — uniquement sur consentement explicite et révocable à tout moment.",
                ],
                [
                  "<strong>Sécurité et prévention des fraudes</strong>",
                  "Détection et prévention des usages frauduleux, abusifs ou non autorisés des services.",
                ],
                [
                  "<strong>Obligations légales</strong>",
                  "Respect des obligations comptables, fiscales et légales applicables en Polynésie française.",
                ],
              ]}
            />

            <SectionTitle id="base-legale">
              4. Base Légale des Traitements
            </SectionTitle>
            <P>
              Chaque traitement repose sur l&apos;une des bases légales
              suivantes au sens de l&apos;article&nbsp;6 du RGPD :
            </P>
            <SubTitle>4.1 Exécution d&apos;un contrat (art. 6.1.b)</SubTitle>
            <P>
              Le traitement est nécessaire à l&apos;exécution du contrat auquel
              l&apos;utilisateur est partie. Cela couvre la fourniture des
              services SaaS, la gestion des abonnements, le support technique et
              la facturation.
            </P>
            <SubTitle>4.2 Consentement (art. 6.1.a)</SubTitle>
            <P>
              Pour les communications marketing (newsletters, offres
              promotionnelles) et pour les cookies de mesure d&apos;audience non
              strictement nécessaires, le traitement repose sur le consentement
              explicite et librement accordé par l&apos;utilisateur. Ce
              consentement peut être retiré à tout moment, sans que cela remette
              en cause la licéité des traitements effectués antérieurement.
            </P>
            <SubTitle>4.3 Intérêt légitime (art. 6.1.f)</SubTitle>
            <P>
              PACIFIK&apos;AI peut traiter certaines données sur la base de son
              intérêt légitime, notamment pour : la sécurité et la prévention
              des fraudes, l&apos;amélioration des produits par analyse agrégée
              anonymisée, et la gestion des relations avec les prospects
              (contacts professionnels établis dans un contexte B2B). Cet
              intérêt ne prime jamais sur les droits et libertés fondamentaux
              des personnes concernées.
            </P>
            <SubTitle>4.4 Obligation légale (art. 6.1.c)</SubTitle>
            <P>
              Certains traitements sont imposés par la réglementation en vigueur
              (conservation des documents comptables et fiscaux, réponse aux
              réquisitions judiciaires).
            </P>

            <SectionTitle id="destinataires">
              5. Destinataires et Sous-traitants
            </SectionTitle>
            <P>
              PACIFIK&apos;AI ne vend ni ne loue jamais vos données personnelles
              à des tiers. Les données peuvent être transmises aux
              sous-traitants techniques suivants, dans le strict cadre de la
              fourniture des services et sous garantie contractuelle de
              confidentialité :
            </P>
            <DataTable
              headers={["Sous-traitant", "Rôle", "Données transmises", "Localisation"]}
              rows={[
                [
                  "<strong>Paddle.com Market Limited</strong>",
                  "Merchant of Record — traitement des paiements, gestion fiscale, émissions des factures",
                  "Nom, adresse de facturation, email, pays, statut d'abonnement",
                  "Royaume-Uni / EEE",
                ],
                [
                  "<strong>Vercel Inc.</strong>",
                  "Hébergement des applications web et des plateformes SaaS",
                  "Données de navigation, adresses IP (anonymisées après 24h)",
                  "États-Unis / EEE",
                ],
                [
                  "<strong>Supabase Inc.</strong>",
                  "Base de données et authentification",
                  "Données de compte, historique d'utilisation, données métier",
                  "États-Unis (région EU disponible)",
                ],
                [
                  "<strong>Anthropic PBC</strong>",
                  "Modèles de langage (Claude API) pour les fonctionnalités IA",
                  "Contenu des requêtes soumises aux assistants IA (aucune donnée d'identification transmise)",
                  "États-Unis",
                ],
                [
                  "<strong>Brevo (Sendinblue)</strong>",
                  "Envoi d'emails transactionnels et de newsletters",
                  "Adresse email, prénom, statut d'abonnement newsletter",
                  "France / EEE",
                ],
              ]}
            />
            <P>
              Tout nouveau sous-traitant fait l&apos;objet d&apos;une évaluation
              préalable de ses garanties en matière de protection des données.
              Les contrats conclus incluent les clauses contractuelles types
              approuvées par la Commission européenne le cas échéant.
            </P>

            <SectionTitle id="conservation">
              6. Durée de Conservation
            </SectionTitle>
            <P>
              Les données sont conservées pour la durée strictement nécessaire
              aux finalités pour lesquelles elles ont été collectées :
            </P>
            <DataTable
              headers={["Catégorie de données", "Durée de conservation", "Justification"]}
              rows={[
                [
                  "<strong>Données de compte (actif)</strong>",
                  "Durée de vie du compte + 3 ans après la dernière activité",
                  "Gestion de la relation client",
                ],
                [
                  "<strong>Données de compte (clôturé)</strong>",
                  "Suppression dans les 30 jours suivant la clôture du compte",
                  "Droit à l'effacement",
                ],
                [
                  "<strong>Données de facturation</strong>",
                  "10 ans à compter de la date de la transaction",
                  "Obligation comptable et fiscale",
                ],
                [
                  "<strong>Journaux de connexion (logs)</strong>",
                  "12 mois",
                  "Sécurité des systèmes, obligation légale",
                ],
                [
                  "<strong>Données de navigation (Vercel Analytics)</strong>",
                  "24 heures (IP), 30 jours (métriques agrégées)",
                  "Analyse de performance, anonymisation rapide",
                ],
                [
                  "<strong>Correspondances et messages</strong>",
                  "3 ans à compter de la dernière interaction",
                  "Gestion du support et preuve en cas de litige",
                ],
                [
                  "<strong>Consentements marketing</strong>",
                  "3 ans à compter du consentement ou jusqu'à retrait",
                  "Preuve du consentement",
                ],
                [
                  "<strong>Requêtes IA (DroitPF, TARA)</strong>",
                  "Durée de la session uniquement — non persistées après traitement",
                  "Confidentialité des données métier",
                ],
              ]}
            />
            <P>
              À l&apos;expiration des délais de conservation, les données sont
              supprimées de façon sécurisée ou rendues définitivement anonymes.
            </P>

            <SectionTitle id="droits">7. Droits des Utilisateurs</SectionTitle>
            <P>
              Conformément au RGPD et à la loi Informatique et Libertés, vous
              disposez des droits suivants concernant vos données personnelles :
            </P>
            <RightsGrid />
            <SubTitle>7.1 Comment exercer vos droits</SubTitle>
            <P>
              Pour exercer l&apos;un de ces droits, adressez votre demande par
              email à{" "}
              <a
                href="mailto:jordy@pacifikai.com"
                className="text-[#14b8a6] hover:underline underline-offset-4"
              >
                jordy@pacifikai.com
              </a>{" "}
              en indiquant clairement : votre identité (nom, prénom, email de
              compte), le droit que vous souhaitez exercer, et tout élément
              permettant de traiter votre demande.
            </P>
            <P>
              PACIFIK&apos;AI s&apos;engage à répondre dans un délai
              d&apos;<strong className="text-text">un mois</strong> à compter de
              la réception de la demande. Ce délai peut être prolongé de deux
              mois en cas de complexité ou de volume important de demandes, avec
              information préalable du demandeur.
            </P>
            <SubTitle>7.2 Droit de réclamation auprès de la CNIL</SubTitle>
            <P>
              Si vous estimez que le traitement de vos données ne respecte pas
              la réglementation applicable, vous avez le droit d&apos;introduire
              une réclamation auprès de l&apos;autorité de contrôle compétente :
            </P>
            <div className="my-3 p-4 rounded-xl bg-white/[0.02] border border-border text-sm text-text-secondary leading-loose">
              <strong className="text-text">
                Commission Nationale de l&apos;Informatique et des Libertés
                (CNIL)
              </strong>
              <br />
              3 place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07
              <br />
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#14b8a6] hover:underline underline-offset-4"
              >
                www.cnil.fr
              </a>
            </div>

            <SectionTitle id="cookies">8. Cookies et Traceurs</SectionTitle>
            <P>
              Le site <strong className="text-text">pacifikai.com</strong> et
              les plateformes SaaS de PACIFIK&apos;AI utilisent des cookies et
              technologies similaires pour assurer le fonctionnement des
              services et analyser leur utilisation.
            </P>
            <SubTitle>8.1 Cookies strictement nécessaires</SubTitle>
            <P>
              Ces cookies sont indispensables au fonctionnement du site et des
              services. Ils incluent : les cookies de session
              d&apos;authentification, les cookies de sécurité (protection
              CSRF), et les préférences de langue.
            </P>
            <SubTitle>
              8.2 Cookies de mesure d&apos;audience (Vercel Analytics)
            </SubTitle>
            <P>
              PACIFIK&apos;AI utilise{" "}
              <strong className="text-text">Vercel Analytics</strong>, un outil
              de mesure d&apos;audience respectueux de la vie privée. Les
              données collectées sont agrégées et anonymisées : aucun suivi
              individuel inter-sessions n&apos;est effectué, aucun cookie tiers
              n&apos;est déposé, et aucune donnée n&apos;est partagée avec des
              plateformes publicitaires.
            </P>
            <P>
              En raison du caractère anonyme et non intrusif de Vercel
              Analytics, ces mesures ne nécessitent pas de consentement
              préalable au sens des recommandations de la CNIL.
            </P>
            <SubTitle>8.3 Absence de cookies publicitaires</SubTitle>
            <P>
              PACIFIK&apos;AI{" "}
              <strong className="text-text">n&apos;utilise pas</strong> de
              cookies de suivi publicitaire, de cookies de retargeting, ni de
              pixels publicitaires tiers (Meta Pixel, Google Ads, etc.) sur ses
              plateformes SaaS ou sur son site institutionnel.
            </P>
            <SubTitle>8.4 Gestion des cookies</SubTitle>
            <P>
              Vous pouvez à tout moment configurer votre navigateur pour refuser
              ou supprimer les cookies. Les instructions varient selon le
              navigateur :
            </P>
            <UL>
              <li>
                Chrome : Paramètres → Confidentialité et sécurité → Cookies
              </li>
              <li>Firefox : Paramètres → Vie privée et sécurité</li>
              <li>Safari : Préférences → Confidentialité</li>
              <li>
                Edge : Paramètres → Confidentialité, recherche et services
              </li>
            </UL>

            <SectionTitle id="transferts">
              9. Transferts Internationaux de Données
            </SectionTitle>
            <P>
              Certains de nos sous-traitants (Vercel, Supabase, Anthropic) sont
              établis en dehors de l&apos;Espace Économique Européen (EEE),
              principalement aux États-Unis. Ces transferts sont encadrés par
              les garanties appropriées prévues par le RGPD :
            </P>
            <UL>
              <li>
                <strong className="text-text">Paddle</strong> : établi au
                Royaume-Uni, reconnu comme pays offrant un niveau de protection
                adéquat par la Commission européenne dans le cadre du UK GDPR.
              </li>
              <li>
                <strong className="text-text">Vercel</strong> : adhère au{" "}
                <em>EU-US Data Privacy Framework</em> (DPF), certifié auprès du
                Département du Commerce américain.
              </li>
              <li>
                <strong className="text-text">Supabase</strong> : conclut des
                clauses contractuelles types (SCCs) conformes aux décisions de
                la Commission européenne. La région de base de données peut être
                configurée en Europe.
              </li>
              <li>
                <strong className="text-text">Anthropic</strong> : conclut des
                clauses contractuelles types (SCCs). Les requêtes IA sont
                traitées aux États-Unis et ne sont pas persistées au-delà de la
                session.
              </li>
              <li>
                <strong className="text-text">Brevo</strong> : établi en
                France, soumis directement au RGPD.
              </li>
            </UL>

            <SectionTitle id="securite">10. Sécurité des Données</SectionTitle>
            <P>
              PACIFIK&apos;AI met en œuvre des mesures techniques et
              organisationnelles appropriées pour protéger vos données
              personnelles contre toute destruction accidentelle ou illicite,
              perte, altération, divulgation ou accès non autorisé, conformément
              à l&apos;article&nbsp;32 du RGPD.
            </P>
            <P>Ces mesures comprennent notamment :</P>
            <UL>
              <li>
                Chiffrement des données en transit via TLS 1.3 (HTTPS
                obligatoire sur toutes les plateformes)
              </li>
              <li>
                Chiffrement des données au repos dans les bases de données
                Supabase
              </li>
              <li>
                Authentification forte (JWT, sessions expirantes) pour
                l&apos;accès aux comptes utilisateurs
              </li>
              <li>
                Accès aux données limité au strict nécessaire (principe du
                moindre privilège)
              </li>
              <li>
                Séparation des environnements de développement, de test et de
                production
              </li>
              <li>
                Surveillance et journalisation des accès aux données sensibles
              </li>
              <li>
                Revue régulière des droits d&apos;accès et des configurations de
                sécurité
              </li>
            </UL>
            <P>
              En cas de violation de données personnelles susceptible
              d&apos;engendrer un risque pour vos droits et libertés,
              PACIFIK&apos;AI s&apos;engage à notifier la CNIL dans les{" "}
              <strong className="text-text">72 heures</strong> après en avoir
              pris connaissance, conformément à l&apos;article&nbsp;33 du RGPD.
            </P>

            <SectionTitle id="modifications">
              11. Modifications de la Politique
            </SectionTitle>
            <P>
              PACIFIK&apos;AI se réserve le droit de modifier la présente
              politique de confidentialité à tout moment, notamment pour tenir
              compte des évolutions légales, réglementaires, jurisprudentielles
              ou technologiques.
            </P>
            <P>
              La date de dernière mise à jour est indiquée en haut de cette
              page. En cas de modification substantielle affectant vos droits ou
              la nature des traitements effectués, PACIFIK&apos;AI vous en
              informera par email (si vous êtes titulaire d&apos;un compte) ou
              par une notification prominente sur le site, au moins{" "}
              <strong className="text-text">30 jours</strong> avant
              l&apos;entrée en vigueur des modifications.
            </P>
            <P>
              Les versions antérieures de cette politique sont archivées et
              disponibles sur demande adressée à{" "}
              <a
                href="mailto:jordy@pacifikai.com"
                className="text-[#14b8a6] hover:underline underline-offset-4"
              >
                jordy@pacifikai.com
              </a>
              .
            </P>

            <SectionTitle id="contact">
              12. Contact et Responsable de la Protection des Données
            </SectionTitle>
            <P>
              Pour toute question relative à la présente politique de
              confidentialité, à l&apos;exercice de vos droits, ou pour toute
              préoccupation concernant le traitement de vos données personnelles :
            </P>
            <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-border text-sm text-text-secondary leading-loose">
              <strong className="text-text">
                PACIFIK&apos;AI — Jordy TOOFA
              </strong>
              <br />
              Entreprise individuelle — Patente n° G67367
              <br />
              PK22 Vallée Orofero, Paea, 98711, Polynésie française
              <br />
              Email :{" "}
              <a
                href="mailto:jordy@pacifikai.com"
                className="text-[#14b8a6] hover:underline underline-offset-4"
              >
                jordy@pacifikai.com
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
