import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialite — Ve'a Connect Extension",
  description:
    "Comment l'extension Ve'a Connect traite vos donnees Facebook et votre token de Page.",
};

export default function ExtensionPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-6 py-12">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-3xl font-bold text-white mb-2">
          Politique de confidentialite — Ve&apos;a Connect
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Derniere mise a jour : 7 mai 2026
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-3">
          Quelles donnees l&apos;extension lit
        </h2>
        <p>
          L&apos;extension Ve&apos;a Connect lit uniquement le contenu de la page{" "}
          <code className="text-emerald-400">business.facebook.com/settings/system-users</code>{" "}
          afin de detecter le Page Access Token genere par l&apos;utilisateur.
          La detection est strictement basee sur le motif{" "}
          <code className="text-emerald-400">EAA[A-Za-z0-9]&#123;180,&#125;</code>{" "}
          a l&apos;interieur d&apos;un element de type{" "}
          <code>textarea</code>, <code>input</code>, <code>code</code>, ou{" "}
          <code>pre</code>.
        </p>
        <p>
          L&apos;extension ne lit aucune autre information : ni les messages
          Messenger, ni les contacts, ni les pages, ni le profil utilisateur,
          ni les emails, ni les mots de passe.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-3">
          Ou les donnees sont envoyees
        </h2>
        <p>
          Le token detecte est envoye uniquement a{" "}
          <code className="text-emerald-400">vea.pacifikai.com/api/auth/facebook/byo-token</code>{" "}
          via HTTPS, en utilisant les cookies de session de l&apos;utilisateur Ve&apos;a deja
          authentifie. Aucun tiers ne recoit ces donnees.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-3">
          Stockage local
        </h2>
        <p>
          L&apos;extension utilise <code>chrome.storage.local</code> pour
          memoriser temporairement :
        </p>
        <ul>
          <li>Le business Vea selectionne (id + nom)</li>
          <li>Le dernier token detecte (auto-purge apres 10 minutes)</li>
        </ul>
        <p>
          Aucune donnee n&apos;est synchronisee dans le cloud par l&apos;extension.
          Une fois le token transmis a Ve&apos;a, il est automatiquement efface du
          stockage local au plus tard 10 minutes apres detection.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8 mb-3">
          Permissions demandees
        </h2>
        <ul>
          <li>
            <code>tabs</code> : ouvrir Meta Business Settings et le dashboard Vea
          </li>
          <li>
            <code>storage</code> : memoriser le business actif (purge auto 10 min)
          </li>
          <li>
            <code>scripting</code> : injecter le content script de detection
          </li>
          <li>
            <code>alarms</code> : declencher le nettoyage periodique
          </li>
          <li>
            <code>host_permissions</code> :
            <ul>
              <li>
                <code>vea.pacifikai.com/*</code> : envoyer le token a votre dashboard
              </li>
              <li>
                <code>business.facebook.com/*</code> : detecter le token dans la page
              </li>
            </ul>
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-3">
          Donnees personnelles & RGPD
        </h2>
        <p>
          Le token de Page Facebook est une donnee technique permettant a votre
          chatbot Ve&apos;a d&apos;envoyer des messages a partir de votre Page. Il est
          stocke chiffre dans la base de donnees de Ve&apos;a et utilise
          uniquement pour les fonctions du chatbot.
        </p>
        <p>
          Vous pouvez a tout moment :
        </p>
        <ul>
          <li>
            Revoquer le token cote Meta : <a className="text-emerald-400" href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer">Business Settings → System Users</a>
          </li>
          <li>
            Le supprimer cote Vea : <a className="text-emerald-400" href="/channels">Canaux → Deconnecter</a>
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8 mb-3">
          Contact
        </h2>
        <p>
          Pour toute question : <a className="text-emerald-400" href="mailto:contact@pacifikai.com">contact@pacifikai.com</a>
        </p>
      </div>
    </div>
  );
}
