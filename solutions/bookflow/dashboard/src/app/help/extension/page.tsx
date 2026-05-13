import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aide — Extension Ve'a Connect",
  description:
    "Comment installer et utiliser l'extension Ve'a Connect pour brancher ta Page Facebook a Ve'a.",
};

export default function ExtensionHelpPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          Ve&apos;a Connect — Aide
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          Branche ta Page Facebook a Ve&apos;a en 30 secondes.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Installation</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">1.</span>
              <span>
                Telecharge l&apos;extension depuis le{" "}
                <a
                  className="text-emerald-400 underline"
                  href="https://chromewebstore.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chrome Web Store
                </a>
                . Compatible Chrome, Brave et Edge.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">2.</span>
              <span>
                Une fois installee, l&apos;icone Ve&apos;a Connect apparait dans la
                barre d&apos;extensions (en haut a droite).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">3.</span>
              <span>
                Connecte-toi a ton dashboard Ve&apos;a (
                <a className="text-emerald-400 underline" href="/login">
                  /login
                </a>
                ) si ce n&apos;est pas deja fait.
              </span>
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Utilisation</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">1.</span>
              Click sur l&apos;icone Ve&apos;a Connect dans la barre d&apos;extensions.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">2.</span>
              Choisis le business Ve&apos;a auquel rattacher la Page.
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">3.</span>
              <span>
                Click "Continuer" — un nouvel onglet ouvre Meta Business
                Settings.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">4.</span>
              <span>
                Cree un Utilisateur Systeme (role Admin), assigne ta Page
                (controle complet), genere un token avec expiration{" "}
                <strong>Jamais</strong> et permissions :
                <code className="block mt-2 bg-gray-900 px-3 py-2 rounded text-xs text-emerald-400 font-mono">
                  pages_messaging, pages_manage_metadata, pages_read_engagement
                </code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">5.</span>
              <span>
                Le token est detecte automatiquement par l&apos;extension. Un
                toast vert apparait : "Token detecte ! Envoi vers Ve&apos;a..."
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-emerald-400 shrink-0">6.</span>
              <span>
                Le popup Ve&apos;a Connect affiche le succes. C&apos;est fait,
                ton agent IA peut repondre aux messages de cette Page.
              </span>
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Probleme ?</h2>
          <div className="space-y-4 text-gray-300">
            <details className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <summary className="cursor-pointer font-medium text-white">
                Le token n&apos;est pas detecte
              </summary>
              <p className="mt-3 text-sm text-gray-400">
                Verifie que tu es bien sur le domaine{" "}
                <code className="text-emerald-400">business.facebook.com</code>{" "}
                et pas sur facebook.com. Le token doit apparaitre dans le modal
                "Generated Token" — laisse-le visible quelques secondes.
              </p>
            </details>
            <details className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <summary className="cursor-pointer font-medium text-white">
                "Mauvais type de token"
              </summary>
              <p className="mt-3 text-sm text-gray-400">
                Tu as genere un User Access Token au lieu d&apos;un Page Access
                Token. Recommence en assignant d&apos;abord ta Page au System
                User AVANT de generer le token.
              </p>
            </details>
            <details className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <summary className="cursor-pointer font-medium text-white">
                "Permissions manquantes"
              </summary>
              <p className="mt-3 text-sm text-gray-400">
                Re-genere le token en cochant les 3 permissions :{" "}
                <code className="text-emerald-400">pages_messaging</code>,{" "}
                <code className="text-emerald-400">pages_manage_metadata</code>,{" "}
                <code className="text-emerald-400">pages_read_engagement</code>.
              </p>
            </details>
            <details className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <summary className="cursor-pointer font-medium text-white">
                "Connecte-toi a Ve&apos;a"
              </summary>
              <p className="mt-3 text-sm text-gray-400">
                Le popup ne te trouve pas en session sur vea.pacifikai.com.
                Click le bouton "Ouvrir Ve&apos;a", connecte-toi, puis reviens
                cliquer sur l&apos;icone Ve&apos;a Connect.
              </p>
            </details>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Alternative</h2>
          <p className="text-gray-300">
            Si tu prefere ne pas installer l&apos;extension, tu peux toujours
            connecter ta Page manuellement depuis{" "}
            <a className="text-emerald-400 underline" href="/channels">
              /channels
            </a>{" "}
            : meme flux Meta Business Settings, juste un copier-coller manuel
            du token a la place.
          </p>
        </section>
      </div>
    </div>
  );
}
