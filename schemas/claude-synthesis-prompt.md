# Prompt Claude - Synthese Prospect B2B

## System Prompt

```
Tu es un analyste commercial senior specialise dans l'automatisation IA pour les entreprises B2B.
Tu travailles pour PACIFIK'AI, une agence basee en Polynesie francaise.

Ta mission: analyser les donnees de recherche sur un prospect et generer un JSON structure complet pour creer des documents commerciaux personnalises.

REGLES CRITIQUES:
1. Chaque affirmation DOIT avoir une source URL valide
2. Les calculs ROI doivent etre realistes et transparents
3. Le pricing est DYNAMIQUE selon la taille de l'entreprise
4. Pas d'hallucinations - si une info n'est pas dans les sources, ne l'invente pas
5. Reponse en JSON valide uniquement, pas de markdown
```

## User Prompt Template

```
Analyse ces donnees de recherche sur {{company}} (secteur: {{sector}}) et genere un JSON complet.

## SOURCES DE RECHERCHE
{{sources}}

## SCHEMA JSON A REMPLIR

Genere un JSON avec TOUTES ces sections:

{
  "company": {
    "name": "{{company}}",
    "sector": "{{sector}}",
    "description": "Description en 1-2 phrases basee sur les sources",
    "website": "URL du site officiel si trouve",
    "size": "TPE|PME|ETI|GE selon CA estime",
    "employees": nombre estime,
    "revenue": { "amount": nombre, "currency": "XPF" },
    "location": { "country": "", "city": "", "region": "" },
    "contacts": [
      { "name": "", "role": "", "email": "", "linkedin": "" }
    ]
  },

  "scores": {
    "global": 0-100,
    "urgency": 0-100 (besoin immediat d'automatisation?),
    "budget": 0-100 (capacite financiere estimee),
    "fit": 0-100 (adequation avec PACIFIK'AI)
  },

  "sectorContext": {
    "marketSize": "Taille du marche avec source",
    "growthRate": "Taux de croissance avec source",
    "trends": ["5 tendances du secteur"],
    "challenges": ["5 defis du secteur"],
    "opportunities": ["5 opportunites IA"]
  },

  "keyFacts": [
    "5 faits cles sur l'entreprise avec sources"
  ],

  "painPoints": [
    {
      "title": "Probleme identifie",
      "description": "Explication detaillee",
      "impact": "high|medium|low",
      "icon": "emoji representatif"
    }
  ],

  "solutions": [
    {
      "title": "Solution PACIFIK'AI",
      "description": "Comment ca resout le probleme",
      "savings": { "amount": nombre, "currency": "XPF", "period": "month" },
      "roi": pourcentage,
      "workflowId": "reference workflow si applicable"
    }
  ],

  "caseStudies": [
    {
      "company": "Nom entreprise",
      "sector": "Secteur",
      "metric": "KPI ameliore",
      "value": "+X% ou -X heures",
      "source": "URL de la source"
    }
  ],

  "pricing": {
    "recommended": "starter|business|enterprise",
    "tiers": {
      "starter": {
        "name": "Starter",
        "setup": montant XPF,
        "monthly": montant XPF,
        "features": ["5 features"],
        "workflows": 5
      },
      "business": {
        "name": "Business",
        "setup": montant XPF,
        "monthly": montant XPF,
        "features": ["8 features"],
        "workflows": 10
      },
      "enterprise": {
        "name": "Enterprise",
        "setup": montant XPF,
        "monthly": montant XPF,
        "features": ["12 features"],
        "workflows": 20
      }
    },
    "currency": "XPF",
    "sizeMultiplier": 0.3-1.5 selon taille,
    "sectorMultiplier": 0.8-1.3 selon secteur
  },

  "timeline": [
    { "day": "J0", "title": "Audit", "description": "..." },
    { "day": "J2", "title": "Demo", "description": "..." },
    { "day": "J5", "title": "POC", "description": "..." },
    { "day": "J10", "title": "Deploiement", "description": "..." }
  ],

  "salesScript": {
    "hook": "Accroche personnalisee en 1 phrase",
    "questions": ["5 questions de qualification"],
    "objections": [
      { "objection": "Objection courante", "response": "Reponse efficace" }
    ]
  },

  "emailTemplate": {
    "subject": "Objet email accrocheur",
    "body": "Corps de l'email de prospection (3 paragraphes)"
  },

  "sources": [
    { "url": "URL", "title": "Titre", "snippet": "Extrait pertinent" }
  ],

  "metadata": {
    "generatedAt": "ISO date",
    "version": "1.0",
    "qualityScore": 0-100
  }
}

## CALCUL PRICING DYNAMIQUE

Prix de base (ETI, secteur standard):
- Starter: Setup 5M XPF, Monthly 600K XPF
- Business: Setup 10M XPF, Monthly 1M XPF
- Enterprise: Setup 15M XPF, Monthly 1.5M XPF

Multiplicateurs taille:
- TPE (CA < 1M EUR): x0.3
- PME (CA 1-10M EUR): x0.5
- ETI (CA 10-250M EUR): x1.0
- GE (CA > 250M EUR): x1.5

Multiplicateurs secteur:
- Aviation: x1.2
- Hotellerie: x1.0
- E-commerce: x0.8
- Banque/Finance: x1.3
- Telecom: x1.1
- Tourisme: x0.9
- Automobile: x1.0

IMPORTANT: Reponds UNIQUEMENT avec le JSON, sans markdown ni explication.
```

## Notes Implementation

### Dans n8n (node "Prepare Claude Body")

```javascript
const company = $input.first().json.company;
const sector = $input.first().json.sector;
const sources = $input.first().json.aggregatedResults || [];

const systemPrompt = `Tu es un analyste commercial senior...`; // Version complete ci-dessus

const userPrompt = `Analyse ces donnees de recherche sur ${company} (secteur: ${sector})...

## SOURCES DE RECHERCHE
${JSON.stringify(sources, null, 2)}

## SCHEMA JSON A REMPLIR
...`; // Version complete ci-dessus

const claudeBody = {
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 8000,
  messages: [
    { role: "user", content: userPrompt }
  ],
  system: systemPrompt
};

return { claudeBody: JSON.stringify(claudeBody) };
```

### Validation Post-Generation

Criteres de qualite (score /100):
1. **Sources** (25 pts): Chaque section a au moins 1 URL valide
2. **ROI** (25 pts): Calculs explicites et realistes
3. **Personnalisation** (25 pts): Contenu specifique a l'entreprise
4. **Completude** (25 pts): Tous les champs obligatoires remplis

Score >= 80 = Approuve
Score < 80 = Regeneration avec feedback
