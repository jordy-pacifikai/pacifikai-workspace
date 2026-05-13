/**
 * Reo Tahiti translations for PACIFIK'AI landing page
 *
 * Sources: ReoPF Supabase DB (tzfwzeysrhqrowcygzce)
 *   - reo_dictionary: curated_seed, lexique-curated
 *   - reo_translation_memory: dictionary (verified), Bible, legends, Jaussen 1898, DGEE
 *
 * Orthography: macrons (ā ē ī ō ū), glottal stop (ʻ)
 * Approach: verified Reo Tahiti words ONLY — zero French loanwords
 *
 * Contournements (tech loanwords → Tahitian):
 *   site web → ʻuputa rarauʻa (porte de l'internet)
 *   chatbot → reo IA (voix IA)
 *   agent IA → tahuʻa IA (expert IA)
 *   workflow → tereʻa ʻohipa (chemin de travail)
 *   landing page → ʻuputa mātamua (première porte)
 *   design → huru (forme, apparence)
 *   newsletter → rata nūtaʻi (lettre de nouvelles)
 *   email/mēra → rata (lettre)
 *   marketing → faʻaʻite ʻohipa (faire connaître)
 *   template → huru tumu (forme de base)
 *   blog → puta parau (livre de paroles)
 *   dashboard → piha faʻatere (salle de pilotage)
 *   lead → manihini hou (nouveau visiteur)
 *   CRM → puta manihini (livre des visiteurs)
 *   spam → parau faufaʻa ʻore (paroles sans valeur)
 *   application → ravea ʻohipa (outil de travail)
 *   e-commerce → fare hoo rarauʻa (boutique en ligne)
 *   robot → mātini (machine)
 *   hosting → faʻatere piha (gérer l'espace)
 *   responsive → tiʻa i te mau ravea pauroa (adapté à tous les supports)
 *   API → tāpiri ravea (connecter les outils)
 *   SEO → ʻite hia i niʻa i te rarauʻa (visible sur internet)
 *   menu → tāpura (programme, liste)
 *   facture → puta moni (livre d'argent)
 *   contrat → parau faati (accord)
 *   bon de commande → parau titaʻu (papier de demande)
 *   devis → tāpura piʻiraʻa (liste de prix)
 *   relance → hāpono faʻahou (renvoyer)
 *   formulaire → tāpura pāpaʻi (liste à remplir)
 *   code → pāpaʻi (écriture)
 *   rapport → tāpura (liste, programme)
 *   PME → ʻohipa iti (petite entreprise)
 *   admin → faʻatere (diriger)
 *   pub → faʻaʻite (faire connaître)
 *   minute → taime iti (petit moment)
 *
 * Emprunts reconnus (dans ReoPF dict):
 *   taime = heure, moment, temps | hepetoma = semaine | nūmerā = numéro, nombre
 */

export const ty = {
  // ── Navbar ──
  nav: {
    announcement: "Tārifa hōʻē noa : ʻUputa rarauʻa mai te 100 000 XPF →",
    solutions: "Ravea",
    expertise: "ʻIte rahi",
    blog: "Puta parau",
    faq: "ʻUiʻuiraʻa",
    contact: "Paraparau mai",
    cta: "A paraparau",
    openMenu: "Iriti i te tāpura",
    closeMenu: "ʻŌpani i te tāpura",
    solutionsGroups: [
      {
        title: "IA e Faʻanaho",
        items: [
          { label: "Reo IA", description: "Tauturu 24/7 i niʻa i tō ʻoe ʻuputa rarauʻa" },
          { label: "Faʻanaho ʻohipa", description: "Tereʻa ʻohipa i faʻanaho hia" },
          { label: "IA parau", description: "Poiete parau ma te IA" },
          { label: "Faʻaʻite IA", description: "Parau e rave hia e te IA" },
        ],
      },
      {
        title: "Hāmani rarauʻa",
        items: [
          { label: "ʻUputa rarauʻa", description: "Huru i hāmani hia nō ʻoe, maitaʻi roa" },
          { label: "Ravea ʻohipa", description: "Ravea ʻohipa i hāmani hia nō ʻoe" },
          { label: "Faʻaara", description: "Arataʻi e tauturu" },
          { label: "Tāpiri ravea", description: "ʻĀpiti i tō ʻoe mau ravea" },
        ],
      },
    ],
  },

  // ── Hero ──
  hero: {
    badge: "Tōroʻa IA — Tahiti",
    prefix: "E taui i tō ʻoe",
    words: [
      "ʻohipa.",
      "faʻaʻite.",
      "tauturu.",
      "ravea.",
      "faʻatupuraʻa.",
      "ʻite rarauʻa.",
    ],
    subtitle:
      "Hāmani ʻuputa rarauʻa, ravea ʻohipa, reo IA, faʻanaho ʻohipa e faʻaʻite rarauʻa — tō ʻoe tōroʻa rarauʻa i Pōrīnetia farāni.",
    cta1: "ʻIte i tā mātou ravea",
    cta2: "Paraparau mai ia mātou",
    trust1: "+20 ʻohipa i rave hia",
    trust2: "I hāmani hia nō ʻoe",
    trust3: "I Tahiti nei",
  },

  // ── Stats ──
  stats: [
    { label: "Pāpaʻi i hāmani hia nō ʻoe" },
    { label: "IA tiʻa i te taime pauroa" },
    { label: "Ravea rarauʻa" },
    { label: "Hōpeʻa vitiviti" },
  ],

  // ── Services ──
  services: {
    label: "Tā mātou ʻite",
    title: "Te mau mea pauroa nō te",
    titleHighlight: "taui",
    titleEnd: "i tō ʻoe ʻohipa",
    cards: [
      {
        title: "ʻUputa rarauʻa e Ravea ʻohipa",
        description:
          "ʻUputa rarauʻa, ʻuputa mātamua, piha faʻatere, ravea ʻohipa e fare hoo rarauʻa. Mai te hāmani e tae atu i te faʻatere.",
        why: "Nō te aha mātou",
        whyPoints: [
          "Huru i hāmani hia nō ʻoe, ʻaore ra huru tumu",
          "ʻIte hia i niʻa i te rarauʻa mai te hāmataraʻa",
          "Faʻatere piha e faʻatere, tāʻatoʻa",
        ],
        links: ["ʻUputa rarauʻa", "Ravea ʻohipa"],
      },
      {
        title: "Ravea IA",
        description:
          "Reo IA, tahuʻa IA, faʻanaho ʻohipa, faʻaʻite IA e poiete parau.",
        why: "Nō te aha mātou",
        whyPoints: [
          "Reo IA e parau mai ia ʻoe, ʻaore mai te mātini",
          "Tō ʻoe mau ravea e vai ra — e ʻāpiti mātou",
          "Hōpeʻa ʻite hia mai te hepetoma mātamua",
        ],
        links: ["Reo IA", "Faʻanaho ʻohipa"],
      },
      {
        title: "Faʻaara e Haʻapiʻiraʻa",
        description:
          "Arataʻi i tō ʻoe ʻohipa, ravea IA i faʻanaho hia, haʻapiʻiraʻa e tauturu.",
        why: "Nō te aha mātou",
        whyPoints: [
          "E hiʻo mātou i tō ʻoe ʻohipa e e faʻaʻite i te vāhi e tauturu ai",
          "Tō ʻoe mau taʻata e ʻite i te faʻaʻohipa i te IA",
          "Hōʻē taʻata tauturu mai te hāmataraʻa e tae atu i te hōpeʻa",
        ],
        links: ["Faʻaara", "Tāpiri ravea"],
      },
    ],
  },

  // ── Process ──
  process: {
    label: "Tā mātou ravea",
    title: "Nāfea e",
    titleHighlight: "rave ai",
    chatLeft: "E hinaaro mātou i te faʻanaho…",
    chatRight: "E hiʻo e e roaʻa te ravea !",
    steps: [
      {
        subtitle: "Paraparau e Faʻaroo",
        title: "E paraparau i tō ʻoe ʻohipa",
        description:
          "30 taime iti nō te faʻaroo i tō ʻoe mau hinaaro, tō ʻoe mau teveraʻa e te mau ravea maitaʻi.",
      },
      {
        subtitle: "Hāmani e Tāmata",
        title: "E hāmani i tō ʻoe ravea",
        description:
          "Tereʻa ʻohipa, reo IA, ravea ʻohipa, ʻuputa rarauʻa — hāmani e tāmata. ʻĀ ʻite ʻoe i te hōpeʻa.",
      },
      {
        subtitle: "Tuhā e Haʻapiʻi",
        title: "E faʻatere e e haʻapiʻi",
        description:
          "Faʻatere te ravea, haʻapiʻi tō ʻoe mau taʻata e tauturu ia maitaʻi. ʻĀ tiʻa tō ʻoe ʻohipa.",
      },
    ],
  },

  // ── Solutions ──
  solutions: {
    label: "Ravea pauroa",
    title: "Tā mātou ravea i roto i te",
    titleHighlight: "hōʻē noa",
    learnMore: "A taʻio rahi aʻe",
    cards: [
      {
        title: "Faʻanaho ʻohipa e Tereʻa ʻohipa",
        description:
          "Tō ʻoe mau ʻohipa tāmau e rave hia e te IA. Rata, hāpono faʻahou, tāpura — 10 e tae 20+ tereʻa ʻohipa.",
      },
      {
        title: "Reo IA e Tahuʻa IA",
        description:
          "Tō ʻoe mau manihini e fāriʻi hia 24/7 i niʻa i WhatsApp, Messenger, Instagram e tō ʻoe ʻuputa rarauʻa.",
      },
      {
        title: "IA Parau",
        description:
          "Te IA e taʻio i tō ʻoe mau puta moni, parau faati e parau titaʻu. Te mau ʻohipa e rave hia i roto i te mau taime iti.",
      },
      {
        title: "Faʻaʻite e ʻIte hia i te rarauʻa",
        description:
          "Rata nūtaʻi, parau, ʻite hia i niʻa i te rarauʻa — te parau e poiete hia e te IA, faʻanaho hia e tuhā hia i niʻa i tō ʻoe mau ravea pauroa.",
      },
      {
        title: "ʻUputa rarauʻa e ʻUputa mātamua",
        description:
          "ʻUputa rarauʻa, ʻuputa mātamua, fare hoo rarauʻa — huru maitaʻi, tiʻa i te mau ravea pauroa, Lighthouse 90+.",
      },
      {
        title: "Ravea ʻohipa",
        description:
          "Piha faʻatere, puta manihini, ravea ʻohipa — ravea ʻohipa i ʻāpiti hia i tō ʻoe mau rarauʻa.",
      },
      {
        title: "Faʻaara e Haʻapiʻiraʻa",
        description:
          "Hiʻo i tō ʻoe ʻohipa, ravea IA i faʻanaho hia, haʻapiʻiraʻa. E tauturu mai te A e tae i te Z.",
      },
      {
        title: "Tāpiri ravea",
        description:
          "ʻĀpiti i tō ʻoe mau ravea — puta manihini, faʻatere ʻohipa. Te pauroa e parau nā roto i te tāpiri ravea.",
      },
    ],
  },

  // ── Infra ──
  infra: {
    label: "Faʻanahoraʻa",
    title: "Tō ʻoe ʻohipa tāʻatoʻa",
    titleHighlight: "ʻāpiti hia",
    titleEnd: ". ʻĒ !",
    subtitle: "Tō ʻoe ʻohipa tāʻatoʻa, ʻāpiti hia.",
    subtitleHighlight: "ʻĒ !",
    description:
      "ʻAore mātou e hōroʻa i te ravea hōʻē noa. E hāmani mātou i te",
    descriptionBold: "ravea tāʻatoʻa",
    descriptionEnd:
      "i reira tō ʻoe mau rata, tō ʻoe mau fāriʻiraʻa, tō ʻoe faʻatere moni e tō ʻoe tauturu e rave pauroa, ʻaore ʻoe e mānaʻo.",
    benefits: [
      "Tō ʻoe mau ʻohipa tāmau e rave hia e te IA",
      "Hōʻē piha faʻatere nō te hiʻo i te pauroa",
      "ʻĀpiti i tō ʻoe mau ravea — ʻaore e mea e taui",
    ],
  },

  // ── Compare ──
  compare: {
    label: "Te hōpeʻa",
    title: "I mua vs I muri",
    titleHighlight: "PACIFIK\u2019AI",
    intro:
      "Te mea e taui tā mātou mau ravea i roto i tō ʻoe ʻohipa, mai te mau hepetoma mātamua.",
    beforeTitle: "ʻAore e IA",
    beforeSubtitle: "Te huru o te rahi o te mau ʻohipa tumu",
    afterTitle: "Ma te PACIFIK\u2019AI",
    afterSubtitle: "Tō ʻoe ʻohipa, i faʻatupu hia e te IA",
    before: [
      {
        text: "Pāhono ʻōhie i te tahi e te tahi titaʻuraʻa a te manihini",
        detail: "Rave ʻōhie noa, hape, mōʻehia… e tiʻaʻi te manihini.",
      },
      {
        text: "Mōʻina hora i niʻa i te mau ʻohipa tāmau",
        detail: "Puta moni, hāpono faʻahou — te mau rave-ʻōhie ā.",
      },
      {
        text: "Tiʻa noa i te mau hora ʻohipa",
        detail: "E manihini i te pō ? E haere ē atu ia.",
      },
      {
        text: "Hape taʻata i niʻa i te pāpaʻi e te faʻatere",
        detail: "Hōʻē nūmerā hape, hōʻē rata mōʻehia, hōʻē tāpura piʻiraʻa hape.",
      },
      {
        text: "Hiʻo manihini ʻōhie i niʻa i Excel",
        detail: "ʻAore e hiʻo, ʻaore e hāpono faʻahou faʻanaho hia.",
      },
      {
        text: "ʻUputa rarauʻa ʻaore e manihini hou",
        detail: "Nehenehe ia, ʻaore rā e parau — zero tauiraʻa.",
      },
      {
        text: "ʻAore e ʻite rarauʻa faʻanaho hia",
        detail: "ʻAore ʻite hia i te rarauʻa, ʻaore parau, ʻaore e ʻite hia i niʻa i Google.",
      },
    ],
    after: [
      {
        text: "Reo IA e pāhono 24/7 i te taime pauroa",
        detail: "WhatsApp, Messenger, ʻuputa rarauʻa — i te mau vāhi pauroa.",
      },
      {
        text: "Tereʻa ʻohipa faʻanaho hia, zero ʻohipa tāmau",
        detail: "Tāpura piʻiraʻa, puta moni, hāpono faʻahou — te pauroa e rave hia ʻaore ʻoe.",
      },
      {
        text: "Tauturu tāmau, i te pō e te mahana faʻaʻeaʻa",
        detail: "Tō ʻoe mau manihini e fāriʻi hia i te hora pauroa.",
      },
      {
        text: "Hāmani e faʻatere IA maitaʻi roa aʻe",
        detail: "Parau, rata, tāpura pāpaʻi — faʻatere hia i roto i te mau taime iti.",
      },
      {
        text: "Puta manihini māramarama ma te hāpono faʻahou faʻanaho hia",
        detail: "Te tahi e te tahi manihini hou e hiʻo hia, ʻaore e mōʻehia.",
      },
      {
        text: "ʻUputa rarauʻa e taui i tō ʻoe mau manihini",
        detail: "ʻIte hia i te rarauʻa, tāpura pāpaʻi, reo IA — te tahi e te tahi manihini e faufaʻa.",
      },
      {
        text: "Ravea rarauʻa pauroa, ʻite hia",
        detail: "ʻIte hia i te rarauʻa, parau, faʻaʻite — te pauroa e faʻatere hia e te rarauʻa.",
      },
    ],
    metrics: [
      { label: "hora mōʻina ʻore i niʻa i te mau ʻohipa faʻatere" },
      { label: "tiʻarāʻa nō tō ʻoe tauturu manihini" },
      { label: "rahi aʻe manihini hou fāriʻi hia" },
      { label: "nō te hiʻo i te mau hōpeʻa mātamua" },
    ],
  },

  // ── FAQ ──
  faq: {
    label: "ʻUiʻuiraʻa",
    title: "Mau ʻuiʻuiraʻa",
    titleHighlight: "tāmau",
    items: [
      {
        q: "E aha te tōroʻa rarauʻa i Tahiti ?",
        a: "Te tōroʻa rarauʻa i Tahiti mai ia PACIFIK\u2019AI e tauturu i te mau ʻohipa tumu o Pōrīnetia farāni i roto i te taui rarauʻa : hāmani ʻuputa rarauʻa, reo IA, faʻanaho ʻohipa, faʻaʻite rarauʻa e haʻapiʻiraʻa.",
      },
      {
        q: "Ehia moni hōʻē ʻuputa rarauʻa i Pōrīnetia farāni ?",
        a: "Hōʻē ʻuputa rarauʻa maitaʻi e hāmata i te 100 000 XPF ma te PACIFIK\u2019AI. Te piʻiraʻa e taui ia i te mau ravea : reo IA, fare hoo rarauʻa, piha faʻatere. Te tahi e te tahi ʻohipa e hāmani hia nō ʻoe ma te tāpura piʻiraʻa hōroʻa hia.",
      },
      {
        q: "Nāfea te reo IA e tauturu ai i tōʻu ʻohipa tumu i Tahiti ?",
        a: "Te reo IA e pāhono i tō ʻoe mau manihini 24/7 i niʻa i tō ʻoe ʻuputa rarauʻa e WhatsApp, e faʻaiti i tō ʻoe ʻohipa tauturu manihini e 57%.",
      },
      {
        q: "E tiʻa ānei te IA i te mau ʻohipa iti i Pōrīnetia ?",
        a: "ʻĒ mau ! Tā mātou mau ravea e hāmata i te 100 000 XPF i te mārama e e faʻahuru ia i te rahi o tō ʻoe ʻohipa tumu. Te IA ʻaore i vai nō te mau ʻohipa rahi noa — hōʻē ravea nō te mau ʻohipa iti.",
      },
      {
        q: "Tehea te tōroʻa rarauʻa maitaʻi roa i Pōrīnetia farāni ?",
        a: "PACIFIK\u2019AI te tōroʻa mātamua i Tahiti i te IA. E ʻāpiti mātou i te ʻite rarauʻa, IA e te ʻite i te mākētē o Pōrīnetia nō te mau ravea mau.",
      },
      {
        q: "Mai hea e hāmata ai te taui rarauʻa i tō ʻoe ʻohipa tumu i Tahiti ?",
        a: "A hāpono mai i te rata nō te paraparau i tō ʻoe ʻohipa. E paraparau mātou i tō ʻoe mau hinaaro, e ʻimi i te mau ravea e e faʻaʻite i te ravea i hāmani hia nō ʻoe.",
      },
      {
        q: "E rave ānei PACIFIK\u2019AI i rapae mai Tahiti ?",
        a: "ʻĒ, e rave mātou i Pōrīnetia farāni tāʻatoʻa (Moorea, Bora Bora, Raiatea…) e te mau ʻohipa farāni i te Pātifika. Tā mātou mau ravea, 100% i niʻa i te rarauʻa.",
      },
    ],
  },

  // ── CTA ──
  cta: {
    title: "A paraparau i tō ʻoe",
    titleHighlight: "ʻohipa",
    description:
      "Hōʻē paraparau ʻōhie, ʻaore e tamoni, nō te faʻaroo i tō ʻoe mau hinaaro.",
    nameLabel: "Iʻoa tāʻatoʻa *",
    namePlaceholder: "Tō ʻoe iʻoa",
    emailLabel: "Rata *",
    companyLabel: "ʻOhipa tumu",
    companyPlaceholder: "Iʻoa o tō ʻoe ʻohipa tumu",
    messageLabel: "Tō ʻoe parau *",
    messagePlaceholder: "Faʻaʻite mai i tō ʻoe ʻohipa, tō ʻoe mau hinaaro…",
    submit: "Hāpono i tōʻu parau",
    sending: "Te hāpono nei…",
    successTitle: "Parau hāpono hia",
    successMessage: "Māuruuru {name} ! E pāhono vitiviti mātou.",
    error: "Hōʻē hape. A tāmata faʻahou, a pāpaʻi i contact@pacifikai.com.",
    footer: "100% noa · ʻAore e tamoni · Pāhono i raro i te 24h",
  },

  // ── Footer ──
  footer: {
    newsletterTitle: "A vai i te mātamua i te IA i Pōrīnetia",
    newsletterDescription:
      "Faʻaʻite maitaʻi, ravea IA, tārifa — i te tahi e te tahi mārama i roto i tō ʻoe rata.",
    subscribe: "Pāpaʻi iʻoa",
    subscribeSuccess: "Māuruuru ! Ua pāpaʻi hia tō ʻoe iʻoa.",
    noSpam: "ʻAore parau faufaʻa ʻore. Faʻaʻore i te hōʻē noa ā.",
    stayInformed: "A vai māramarama",
    brand:
      "Tōroʻa rarauʻa e IA i Papeʻete, Tahiti. ʻUputa rarauʻa, reo IA, faʻanaho ʻohipa e faʻaara nō te mau ʻohipa tumu i Pōrīnetia farāni.",
    locations: "Tahiti · Moorea · Bora Bora",
    copyright: "© {year} PACIFIK\u2019AI. Te mau tiʻarāʻa pauroa e vaiiho hia.",
    polynesie: "Pōrīnetia farāni",
    sections: {
      solutions: "Ravea",
      creation: "Hāmani",
      expertise: "ʻIte",
      resources: "Ravea tauturu",
      legal: "Ture",
    },
    error: "Hape, a tāmata faʻahou.",
  },
};
