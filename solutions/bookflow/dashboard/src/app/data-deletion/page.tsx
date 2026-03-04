export const metadata = {
  title: "Suppression des donnees — Ve'a by PACIFIK'AI",
};

export default function DataDeletionPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Suppression des donnees</h1>
      <p className="text-sm text-gray-400 mb-8">Derniere mise a jour : 2 mars 2026</p>

      <section className="space-y-6 text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">Comment supprimer vos donnees</h2>
          <p>Si vous souhaitez supprimer les donnees associees a votre utilisation de Ve&apos;a (via Facebook Login, Messenger ou Instagram), vous pouvez :</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">Option 1 : Depuis votre tableau de bord</h2>
          <p>Connectez-vous a votre tableau de bord Ve&apos;a, allez dans <strong>Parametres &gt; Channels</strong> et cliquez sur &quot;Deconnecter&quot; pour supprimer les tokens Facebook/Instagram associes a votre compte.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">Option 2 : Par email</h2>
          <p>Envoyez un email a <strong>support@vea.pacifikai.com</strong> avec l&apos;objet &quot;Suppression de donnees Ve&apos;a&quot; en precisant :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Le nom de votre commerce</li>
            <li>L&apos;adresse email associee a votre compte</li>
          </ul>
          <p className="mt-2">Nous traiterons votre demande dans un delai de 7 jours ouvrables.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">Option 3 : Depuis Facebook</h2>
          <p>Vous pouvez egalement supprimer l&apos;acces de Ve&apos;a depuis vos parametres Facebook :</p>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Allez dans Parametres Facebook &gt; Applications et sites web</li>
            <li>Trouvez &quot;PACIFIKAI Messaging&quot;</li>
            <li>Cliquez sur &quot;Supprimer&quot;</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">Donnees supprimees</h2>
          <p>Lors de la suppression, les donnees suivantes sont effacees :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Tokens d&apos;acces Facebook/Instagram</li>
            <li>Identifiants de page connectee</li>
            <li>Conversations Messenger/Instagram liees a votre page</li>
            <li>Rendez-vous associes (sur demande)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-white">Contact</h2>
          <p>PACIFIK&apos;AI — support@vea.pacifikai.com</p>
        </div>
      </section>
    </main>
  );
}
