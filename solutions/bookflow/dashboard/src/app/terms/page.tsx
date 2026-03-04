export const metadata = {
  title: "Conditions d'utilisation — Ve'a by PACIFIK'AI",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Conditions d&apos;utilisation</h1>
      <p className="text-sm text-gray-400 mb-8">Derniere mise a jour : 2 mars 2026</p>

      <section className="space-y-6 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">1. Objet</h2>
          <p>Les presentes conditions regissent l&apos;utilisation du service Ve&apos;a, solution d&apos;automatisation de prise de rendez-vous par intelligence artificielle, editee par PACIFIK&apos;AI.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">2. Description du service</h2>
          <p>Ve&apos;a fournit un assistant conversationnel intelligent deploye sur WhatsApp, Messenger et Instagram, permettant aux commerces de :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Recevoir et confirmer des reservations automatiquement</li>
            <li>Synchroniser les rendez-vous avec Google Calendar</li>
            <li>Gerer les disponibilites et creneaux horaires</li>
            <li>Suivre les statistiques de rendez-vous via un tableau de bord</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">3. Abonnement et tarification</h2>
          <p>Le service est propose sous forme d&apos;abonnement mensuel ou annuel (2 mois offerts). Les plans disponibles sont :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Essentiel</strong> : 9 900 XPF/mois — 200 conversations/mois</li>
            <li><strong>Premium</strong> : 19 900 XPF/mois — 500 conversations/mois</li>
            <li><strong>Business</strong> : sur devis — conversations illimitees</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">4. Obligations de l&apos;utilisateur</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fournir des informations exactes sur son commerce</li>
            <li>Ne pas utiliser le service a des fins illicites</li>
            <li>Respecter les conditions d&apos;utilisation de WhatsApp, Facebook et Google</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">5. Disponibilite</h2>
          <p>PACIFIK&apos;AI s&apos;engage a fournir un service disponible 24h/24, 7j/7, sous reserve des maintenances programmees et des interruptions des services tiers (Meta, Google, Twilio).</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">6. Resiliation</h2>
          <p>L&apos;abonnement est sans engagement. L&apos;utilisateur peut resilier a tout moment depuis son tableau de bord. La resiliation prend effet a la fin de la periode en cours.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">7. Propriete intellectuelle</h2>
          <p>Le service Ve&apos;a, son code source, son interface et sa marque sont la propriete exclusive de PACIFIK&apos;AI. L&apos;utilisateur dispose d&apos;un droit d&apos;usage non exclusif pendant la duree de son abonnement.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">8. Limitation de responsabilite</h2>
          <p>PACIFIK&apos;AI ne saurait etre tenu responsable des pertes de rendez-vous liees a des dysfonctionnements des services tiers (WhatsApp, Messenger, Google Calendar) ou a des informations erronees fournies par l&apos;utilisateur.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">9. Droit applicable</h2>
          <p>Les presentes conditions sont soumises au droit applicable en Polynesie francaise. Tout litige sera soumis aux juridictions competentes de Papeete.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">10. Contact</h2>
          <p>PACIFIK&apos;AI — support@vea.pacifikai.com</p>
        </div>
      </section>
    </main>
  );
}
