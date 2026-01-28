'use client'

import { useState } from 'react'
import { Book, ChevronDown, ChevronRight, Rocket, LayoutDashboard, Calendar, Mail, FileText, TrendingUp, MessageCircle, Star, Users, Plane, ShoppingCart, MessageSquare, FileBarChart, Settings, HelpCircle } from 'lucide-react'

interface Section {
  id: string
  title: string
  icon: any
  content: React.ReactNode
}

function AccordionSection({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
  const Icon = section.icon
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-atn-secondary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-atn-secondary" />
        </div>
        <span className="font-semibold flex-1">{section.title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 bg-white border-t border-slate-100">
          {section.content}
        </div>
      )}
    </div>
  )
}

function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="space-y-3 mt-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-6 h-6 rounded-full bg-atn-secondary text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <div>
            <p className="font-medium text-sm">{step.title}</p>
            <p className="text-sm text-slate-500">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
      <p className="text-sm text-amber-800">💡 <strong>Astuce:</strong> {children}</p>
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
      <p className="text-sm text-red-800">⚠️ <strong>Attention:</strong> {children}</p>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-slate-700 border-b">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-600">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GuidePage() {
  const [openSections, setOpenSections] = useState<string[]>(['demarrage'])

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const sections: Section[] = [
    {
      id: 'demarrage',
      title: 'Démarrage rapide',
      icon: Rocket,
      content: (
        <>
          <p className="text-slate-600">Le dashboard ATN centralise tous vos outils marketing et opérationnels.</p>
          <StepList steps={[
            { title: 'Accédez au dashboard', description: 'La page d\'accueil affiche tous les KPIs importants.' },
            { title: 'Consultez l\'Overview', description: 'Conversations, newsletters, revenus upsell en un coup d\'œil.' },
            { title: 'Utilisez l\'assistant IA', description: 'Cliquez sur la bulle 💬 en bas à droite pour interagir.' },
            { title: 'Naviguez via le menu', description: 'La sidebar donne accès à toutes les sections.' },
          ]} />
          <Tip>Commencez par le Calendar pour planifier vos contenus, puis l'Overview pour suivre les performances.</Tip>
        </>
      ),
    },
    {
      id: 'overview',
      title: 'Page d\'accueil (Overview)',
      icon: LayoutDashboard,
      content: (
        <>
          <p className="text-slate-600">Vue synthétique de toutes les activités.</p>
          <Table
            headers={['Métrique', 'Description', 'Source']}
            rows={[
              ['Conversations', 'Échanges traités par le concierge IA', 'Build 1'],
              ['Taux d\'ouverture', 'Ouverture dernière newsletter', 'Build 2'],
              ['Revenus Upsell', 'Revenus additionnels générés', 'Build 10'],
              ['Alertes actives', 'Alertes concurrentielles', 'Build 7'],
            ]}
          />
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Indicateurs workflows:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li><span className="text-emerald-500">●</span> Vert: Workflow actif</li>
              <li><span className="text-amber-500">●</span> Orange: En cours de traitement</li>
              <li><span className="text-red-500">●</span> Rouge: Erreur (action requise)</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      id: 'calendrier',
      title: 'Calendrier éditorial',
      icon: Calendar,
      content: (
        <>
          <p className="text-slate-600">Visualisez et planifiez tous vos contenus (newsletters et articles).</p>

          <h4 className="font-medium mt-4 mb-2">Navigation</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Flèches ◀ ▶ pour changer de mois</li>
            <li>• "Aujourd'hui" pour revenir au mois courant</li>
            <li>• Filtres par type: Tous, Newsletters, Articles</li>
          </ul>

          <h4 className="font-medium mt-4 mb-2">Planifier un contenu</h4>
          <StepList steps={[
            { title: 'Cliquez sur une date', description: 'Une modal s\'ouvre pour créer un contenu.' },
            { title: 'Choisissez le type', description: 'Newsletter (rose) ou Article SEO (violet).' },
            { title: 'Remplissez le titre', description: 'Utilisé pour la génération IA.' },
            { title: 'Enregistrez', description: 'Le contenu apparaît sur le calendrier.' },
          ]} />

          <h4 className="font-medium mt-4 mb-2">Drag & Drop</h4>
          <p className="text-sm text-slate-600">Survolez un contenu, glissez vers la nouvelle date, relâchez.</p>
          <Warning>Les contenus programmés dans les 24h ne peuvent plus être déplacés.</Warning>
        </>
      ),
    },
    {
      id: 'newsletters',
      title: 'Gestion des newsletters',
      icon: Mail,
      content: (
        <>
          <p className="text-slate-600">Historique et performances des newsletters.</p>
          <Table
            headers={['Métrique', 'Bon', 'Moyen', 'À améliorer']}
            rows={[
              ['Taux d\'ouverture', '> 35%', '25-35%', '< 25%'],
              ['Taux de clic', '> 5%', '2-5%', '< 2%'],
              ['Score personnalisation', '> 90%', '70-90%', '< 70%'],
            ]}
          />
          <StepList steps={[
            { title: 'Cliquez sur "Nouvelle newsletter"', description: '' },
            { title: 'Choisissez le segment cible', description: 'Tous, fidèles, nouveaux...' },
            { title: 'Entrez le sujet', description: 'Ou laissez l\'IA suggérer.' },
            { title: 'Prévisualisez et programmez', description: '' },
          ]} />
          <Tip>L'IA personnalise automatiquement selon l'historique client.</Tip>
        </>
      ),
    },
    {
      id: 'articles',
      title: 'Articles SEO',
      icon: FileText,
      content: (
        <>
          <p className="text-slate-600">Génération d'articles optimisés pour le référencement.</p>
          <h4 className="font-medium mt-4 mb-2">Scores de qualité</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>Score SEO:</strong> Optimisation mots-clés, structure, meta</li>
            <li><strong>Score GEO:</strong> Pertinence pour recherches locales</li>
            <li><strong>Readability:</strong> Lisibilité et accessibilité</li>
          </ul>
          <StepList steps={[
            { title: 'Cliquez sur "Nouvel article"', description: '' },
            { title: 'Entrez le sujet', description: 'Ex: "Meilleure période pour visiter Moorea"' },
            { title: 'L\'IA génère', description: 'Article de 1500-2000 mots.' },
            { title: 'Relisez et publiez', description: '' },
          ]} />
          <Tip>Articles avec score SEO {'>'}90% ont 3x plus de chances d'apparaître en 1ère page Google.</Tip>
        </>
      ),
    },
    {
      id: 'roi',
      title: 'Analyse ROI',
      icon: TrendingUp,
      content: (
        <>
          <p className="text-slate-600">Performances commerciales par route aérienne.</p>
          <Table
            headers={['Indicateur', 'Description']}
            rows={[
              ['Revenus', 'Chiffre d\'affaires total'],
              ['Réservations', 'Nombre de billets vendus'],
              ['Remplissage', 'Taux d\'occupation moyen'],
              ['Ticket moyen', 'Prix moyen par passager'],
            ]}
          />
          <h4 className="font-medium mt-4 mb-2">Alertes d'anomalie</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><span className="text-red-500">▼ Rouge:</span> Baisse significative ({'>'}20%)</li>
            <li><span className="text-emerald-500">▲ Vert:</span> Hausse significative ({'>'}20%)</li>
          </ul>
          <Warning>Quand une route montre une anomalie rouge, l'IA peut suggérer une campagne ciblée.</Warning>
        </>
      ),
    },
    {
      id: 'conversations',
      title: 'Conversations concierge',
      icon: MessageCircle,
      content: (
        <>
          <p className="text-slate-600">Historique des interactions avec le concierge IA multilingue.</p>
          <h4 className="font-medium mt-4 mb-2">Langues supportées</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {['🇫🇷 Français', '🇬🇧 Anglais', '🇪🇸 Espagnol', '🇯🇵 Japonais', '🇨🇳 Chinois', '🇩🇪 Allemand'].map(lang => (
              <span key={lang} className="px-2 py-1 bg-slate-100 rounded text-sm">{lang}</span>
            ))}
          </div>
          <h4 className="font-medium mt-4 mb-2">Score de satisfaction</h4>
          <p className="text-sm text-slate-600">Basé sur: résolution du problème, temps de réponse, feedback implicite.</p>
        </>
      ),
    },
    {
      id: 'avis',
      title: 'Avis clients',
      icon: Star,
      content: (
        <>
          <p className="text-slate-600">Centralisez et répondez aux avis de toutes les plateformes.</p>
          <h4 className="font-medium mt-4 mb-2">Workflow de validation</h4>
          <StepList steps={[
            { title: 'Nouvel avis détecté', description: 'L\'IA analyse et génère une réponse.' },
            { title: 'Statut "À valider"', description: 'Relisez, modifiez si nécessaire.' },
            { title: 'Approuver ou Rejeter', description: 'Passe en file de publication.' },
            { title: 'Publication', description: 'Postée sur la plateforme d\'origine.' },
          ]} />
          <h4 className="font-medium mt-4 mb-2">Tons de réponse</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>Reconnaissant:</strong> Avis positifs (4-5 étoiles)</li>
            <li><strong>Empathique:</strong> Avis négatifs avec problème réel</li>
            <li><strong>Professionnel:</strong> Avis neutres</li>
          </ul>
          <Tip>Traitez les avis négatifs en priorité. Une réponse rapide peut transformer un mécontent en ambassadeur.</Tip>
        </>
      ),
    },
    {
      id: 'social',
      title: 'Social Monitor',
      icon: Users,
      content: (
        <>
          <p className="text-slate-600">Surveillez les mentions sur les réseaux sociaux.</p>
          <h4 className="font-medium mt-4 mb-2">Plateformes surveillées</h4>
          <div className="flex gap-2 mt-2">
            {['Twitter/X', 'Instagram', 'Facebook', 'LinkedIn'].map(p => (
              <span key={p} className="px-2 py-1 bg-slate-100 rounded text-sm">{p}</span>
            ))}
          </div>
          <Table
            headers={['Priorité', 'Critères', 'Action']}
            rows={[
              ['🔴 Haute', 'Sentiment négatif + forte portée', 'Répondre immédiatement'],
              ['🟠 Moyenne', 'Mention positive influente', 'Répondre dans la journée'],
              ['⚪ Basse', 'Mention neutre ou faible portée', 'Optionnel'],
            ]}
          />
        </>
      ),
    },
    {
      id: 'vols',
      title: 'Alertes vols',
      icon: Plane,
      content: (
        <>
          <p className="text-slate-600">Notifications automatiques pour retards et annulations.</p>
          <h4 className="font-medium mt-4 mb-2">Types d'alertes</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>Retard:</strong> Notification si {'>'} 30 minutes</li>
            <li><strong>Annulation:</strong> Notification immédiate + options rebooking</li>
            <li><strong>Changement de porte:</strong> Notification passagers en zone embarquement</li>
          </ul>
          <h4 className="font-medium mt-4 mb-2">Canaux de notification</h4>
          <div className="flex gap-2 mt-2">
            {['📱 SMS', '📧 Email', '🔔 Push App', '💬 WhatsApp'].map(c => (
              <span key={c} className="px-2 py-1 bg-slate-100 rounded text-sm">{c}</span>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'upsell',
      title: 'Upsell Engine',
      icon: ShoppingCart,
      content: (
        <>
          <p className="text-slate-600">Moteur d'upsell automatisé avec tracking des conversions.</p>
          <h4 className="font-medium mt-4 mb-2">Types d'offres</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Upgrade classe (Economy → Premium → Business)</li>
            <li>• Bagages supplémentaires</li>
            <li>• Assurance voyage</li>
            <li>• Accès lounge</li>
            <li>• Sièges préférentiels</li>
          </ul>
          <h4 className="font-medium mt-4 mb-2">Métriques suivies</h4>
          <p className="text-sm text-slate-600">Taux de conversion, revenus additionnels, segmentation client.</p>
        </>
      ),
    },
    {
      id: 'assistant',
      title: 'Assistant IA (ChatWidget)',
      icon: MessageSquare,
      content: (
        <>
          <p className="text-slate-600">L'assistant flottant peut effectuer des actions sur tout le dashboard.</p>
          <h4 className="font-medium mt-4 mb-2">Actions rapides</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• "Reprogramme le contenu de demain à vendredi"</li>
            <li>• "Génère un rapport du jour"</li>
            <li>• "Modifie le titre de la prochaine newsletter"</li>
            <li>• "Quelles routes sont en baisse ?"</li>
          </ul>
          <h4 className="font-medium mt-4 mb-2">Commandes utiles</h4>
          <div className="bg-slate-800 text-slate-100 p-3 rounded-lg text-sm font-mono mt-2">
            <p>"Donne-moi le rapport du jour"</p>
            <p>"Génère un article sur [sujet]"</p>
            <p>"Quels sont les avis négatifs à traiter ?"</p>
          </div>
          <Tip>L'assistant est connecté aux 10 workflows métier. Il peut lire les données ET effectuer des actions.</Tip>
        </>
      ),
    },
    {
      id: 'rapports',
      title: 'Génération de rapports',
      icon: FileBarChart,
      content: (
        <>
          <p className="text-slate-600">Créez des rapports personnalisés ou utilisez les templates.</p>
          <Table
            headers={['Rapport', 'Fréquence', 'Contenu']}
            rows={[
              ['Résumé quotidien', 'Tous les jours', 'KPIs des 10 workflows'],
              ['Performance Marketing', 'Hebdomadaire', 'Newsletters, articles, conversions'],
              ['Analyse ROI', 'Hebdomadaire', 'Performance par route'],
              ['Satisfaction client', 'Hebdomadaire', 'Avis, NPS, temps réponse'],
              ['Veille concurrentielle', 'Bi-hebdomadaire', 'Prix, nouvelles routes'],
            ]}
          />
          <h4 className="font-medium mt-4 mb-2">Rapport personnalisé avec l'IA</h4>
          <p className="text-sm text-slate-600">Décrivez ce que vous voulez analyser en langage naturel.</p>
        </>
      ),
    },
    {
      id: 'settings',
      title: 'Configuration',
      icon: Settings,
      content: (
        <>
          <p className="text-slate-600">Paramètres de génération automatique de contenu.</p>
          <h4 className="font-medium mt-4 mb-2">Smart Generator (Build 15)</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li><strong>Fréquence:</strong> Quotidien, Hebdomadaire, Bi-hebdomadaire</li>
            <li><strong>Contenu/semaine:</strong> Nombre total (newsletters + articles)</li>
            <li><strong>Semaines d'avance:</strong> Combien planifier à l'avance</li>
            <li><strong>Seuil d'anomalie:</strong> % de variation pour déclencher suggestion</li>
          </ul>
          <h4 className="font-medium mt-4 mb-2">Configuration recommandée</h4>
          <div className="bg-slate-800 text-slate-100 p-3 rounded-lg text-sm font-mono mt-2">
            <p>Fréquence: Hebdomadaire (Lundi 8h)</p>
            <p>Newsletters/semaine: 3</p>
            <p>Articles/semaine: 4</p>
            <p>Semaines d'avance: 4</p>
            <p>Seuil anomalie: 20%</p>
          </div>
          <Warning>Après modification, cliquez sur "Sauvegarder" pour appliquer.</Warning>
        </>
      ),
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      content: (
        <>
          <div className="space-y-4">
            {[
              {
                q: 'Comment lancer manuellement un workflow n8n ?',
                a: 'Utilisez l\'assistant ("Lance le workflow newsletter") ou allez dans Settings > "Lancer génération maintenant".',
              },
              {
                q: 'Pourquoi un workflow est en orange/rouge ?',
                a: 'Orange = en cours d\'exécution. Rouge = erreur, consultez les logs n8n.',
              },
              {
                q: 'Comment modifier un contenu déjà programmé ?',
                a: 'Allez dans Calendar ou Planner, cliquez sur le contenu, modifiez ou utilisez le champ "Prompt IA".',
              },
              {
                q: 'Les données sont-elles en temps réel ?',
                a: 'Actuellement données de démo. En production: synchro Airtable toutes les 5 minutes.',
              },
              {
                q: 'Comment ajouter un nouveau type de rapport ?',
                a: 'Utilisez "Rapport personnalisé" dans Reports. Décrivez votre besoin en langage naturel.',
              },
              {
                q: 'Comment contacter le support ?',
                a: 'Email: jordy@pacifikai.com',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-sm text-atn-primary">{item.q}</p>
                <p className="text-sm text-slate-600 mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Book className="w-7 h-7 text-atn-secondary" />
          Guide d'utilisation
        </h1>
        <p className="text-slate-500">Mode d'emploi complet du dashboard ATN</p>
      </div>

      {/* Quick navigation */}
      <div className="card bg-gradient-to-r from-atn-primary/5 to-atn-secondary/5 border-atn-secondary/20">
        <h2 className="font-semibold mb-3">Navigation rapide</h2>
        <div className="flex flex-wrap gap-2">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setOpenSections([s.id])
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:border-atn-secondary hover:text-atn-secondary transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Expand/Collapse all */}
      <div className="flex gap-2">
        <button
          onClick={() => setOpenSections(sections.map(s => s.id))}
          className="text-sm text-atn-secondary hover:underline"
        >
          Tout ouvrir
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setOpenSections([])}
          className="text-sm text-atn-secondary hover:underline"
        >
          Tout fermer
        </button>
      </div>

      {/* Sections */}
      <div>
        {sections.map(section => (
          <div key={section.id} id={section.id}>
            <AccordionSection
              section={section}
              isOpen={openSections.includes(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-400 pt-6 border-t">
        <p>Dashboard ATN v2.0 • Dernière mise à jour: 28 janvier 2026</p>
        <p>Développé par PACIFIK'AI</p>
      </div>
    </div>
  )
}
