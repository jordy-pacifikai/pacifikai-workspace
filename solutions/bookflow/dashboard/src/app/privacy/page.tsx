export const metadata = {
  title: "Politique de confidentialite — Ve'a by PACIFIK'AI",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Politique de confidentialite</h1>
      <p className="text-sm text-gray-400 mb-8">Derniere mise a jour : 2 mars 2026</p>

      <section className="space-y-6 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">1. Responsable du traitement</h2>
          <p>PACIFIK&apos;AI — Jordy TOOFA, Entrepreneur Individuel<br />
          Patente G67367 — Polynesie francaise<br />
          Contact : jordy@pacifikai.com | +689 89 55 81 89</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">2. Donnees collectees</h2>
          <p>Ve&apos;a collecte les donnees suivantes dans le cadre de son fonctionnement :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Nom et coordonnees du commerce (nom, telephone, email, adresse)</li>
            <li>Services proposes et horaires d&apos;ouverture</li>
            <li>Rendez-vous pris via le chatbot (nom client, date, heure, service)</li>
            <li>Messages echanges avec le chatbot WhatsApp/Messenger</li>
            <li>Donnees de connexion Google Calendar (token OAuth, identifiant calendrier)</li>
            <li>Donnees de connexion Facebook/Instagram (token de page, identifiant page)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">3. Finalites du traitement</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestion automatisee des rendez-vous pour le commerce</li>
            <li>Synchronisation avec Google Calendar</li>
            <li>Envoi de reponses automatiques via WhatsApp et Messenger</li>
            <li>Statistiques d&apos;utilisation du service (nombre de conversations, rendez-vous)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">4. Base legale</h2>
          <p>Le traitement est fonde sur l&apos;execution du contrat de service entre PACIFIK&apos;AI et le commerce utilisateur de Ve&apos;a.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">5. Duree de conservation</h2>
          <p>Les donnees sont conservees pendant la duree du contrat de service, puis supprimees dans un delai de 30 jours apres resiliation.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">6. Partage des donnees</h2>
          <p>Les donnees sont traitees par les sous-traitants suivants :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Supabase (hebergement base de donnees — Singapore)</li>
            <li>Vercel (hebergement application — USA)</li>
            <li>Trigger.dev (execution taches automatisees — USA)</li>
            <li>Meta Platforms (Messenger, Instagram — USA)</li>
            <li>Google (Calendar API — USA)</li>
            <li>Twilio (WhatsApp API — USA)</li>
          </ul>
          <p className="mt-2">Aucune donnee n&apos;est vendue a des tiers.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">7. Droits des utilisateurs</h2>
          <p>Conformement a la reglementation applicable, vous disposez des droits d&apos;acces, de rectification, de suppression et de portabilite de vos donnees. Pour exercer ces droits, contactez : jordy@pacifikai.com</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">8. Securite</h2>
          <p>Les donnees sont chiffrees en transit (TLS) et au repos. Les tokens OAuth sont stockes de maniere securisee dans notre base de donnees avec chiffrement au niveau des colonnes.</p>
        </div>
      </section>
    </main>
  );
}
