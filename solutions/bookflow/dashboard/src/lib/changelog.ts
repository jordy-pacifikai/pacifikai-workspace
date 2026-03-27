export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix';
  icon?: string; // lucide icon name
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.6.0',
    date: '2026-03-20',
    title: 'Campagnes WhatsApp',
    description: 'Envoyez des messages cibles a vos segments de clients directement depuis le dashboard.',
    type: 'feature',
  },
  {
    version: '1.5.0',
    date: '2026-03-20',
    title: "Messages d'anniversaire",
    description: "Voeux automatiques par WhatsApp le jour de l'anniversaire de vos clients avec offre -10%.",
    type: 'feature',
  },
  {
    version: '1.4.0',
    date: '2026-03-20',
    title: 'Import/Export clients CSV',
    description: 'Importez vos clients depuis un fichier Excel/CSV et exportez votre base en un clic.',
    type: 'feature',
  },
  {
    version: '1.3.0',
    date: '2026-03-20',
    title: 'Page de tarifs',
    description: 'Nouvelle page /tarifs avec comparaison des plans et FAQ.',
    type: 'feature',
  },
  {
    version: '1.2.0',
    date: '2026-03-20',
    title: 'Reservation bilingue FR/EN',
    description: 'Vos clients internationaux peuvent reserver en anglais grace au bouton de langue.',
    type: 'feature',
  },
  {
    version: '1.1.0',
    date: '2026-03-20',
    title: 'Confirmation par email',
    description: 'Email de confirmation automatique avec lien Google Calendar apres chaque reservation.',
    type: 'feature',
  },
  {
    version: '1.0.0',
    date: '2026-03-20',
    title: 'Actions en masse',
    description: 'Selectionnez plusieurs rendez-vous et changez leur statut ou supprimez-les en un clic.',
    type: 'feature',
  },
  {
    version: '0.9.0',
    date: '2026-03-19',
    title: 'Tendances et sparklines',
    description: 'Les KPI du dashboard affichent les tendances semaine/semaine avec des mini-graphiques.',
    type: 'improvement',
  },
  {
    version: '0.8.0',
    date: '2026-03-19',
    title: 'Retention clients',
    description: 'Analysez vos cohortes de retention, taux de churn et LTV dans les statistiques.',
    type: 'feature',
  },
  {
    version: '0.7.0',
    date: '2026-03-19',
    title: 'Avis clients automatiques',
    description: "Demande d'avis automatique H+24 par WhatsApp avec page publique de notation.",
    type: 'feature',
  },
  {
    version: '0.6.0',
    date: '2026-03-19',
    title: 'Mode sombre/clair',
    description: 'Basculez entre le theme sombre et clair depuis la sidebar.',
    type: 'improvement',
  },
  {
    version: '0.5.0',
    date: '2026-03-19',
    title: "Liste d'attente",
    description: 'Gerez les clients en attente et notifiez-les quand un creneau se libere.',
    type: 'feature',
  },
  {
    version: '0.4.0',
    date: '2026-03-19',
    title: 'Rendez-vous recurrents',
    description: 'Programmez des rendez-vous hebdomadaires, bi-hebdomadaires ou mensuels.',
    type: 'feature',
  },
  {
    version: '0.3.0',
    date: '2026-03-19',
    title: 'Rappels automatiques',
    description: 'Rappels WhatsApp J-1 et H-2 avec detection automatique des no-shows.',
    type: 'feature',
  },
  {
    version: '0.2.0',
    date: '2026-03-19',
    title: 'Dashboard analytics',
    description: 'Statistiques completes : revenus, heatmap, services populaires, funnel de conversion.',
    type: 'feature',
  },
  {
    version: '0.1.0',
    date: '2026-03-18',
    title: "Lancement Ve'a",
    description: 'Chatbot IA WhatsApp + Dashboard de gestion des rendez-vous + Page de reservation.',
    type: 'feature',
  },
];
