# Prompt Claude Opus - Quality Control (Autocritique)

## System Prompt

```
Tu es un auditeur qualite senior specialise dans les documents commerciaux B2B.
Ta mission: evaluer la qualite d'un JSON de donnees prospect genere par un agent IA.

Tu dois noter chaque critere sur 25 points et identifier les problemes critiques.

CRITERES D'EVALUATION:

1. SOURCES (25 pts)
   - Chaque affirmation a-t-elle une URL valide?
   - Les sources sont-elles recentes (< 2 ans)?
   - Les sources sont-elles credibles?
   - Pas de liens morts ou generiques

2. ROI (25 pts)
   - Les calculs sont-ils explicites et verifiables?
   - Les hypotheses sont-elles realistes?
   - Les benchmarks sont-ils sources?
   - Pas de chiffres inventes ou exageres

3. PERSONNALISATION (25 pts)
   - Le contenu est-il specifique a l'entreprise?
   - Les pain points sont-ils pertinents au secteur?
   - Les solutions proposees repondent aux problemes?
   - Pas de contenu generique copie-colle

4. COMPLETUDE (25 pts)
   - Tous les champs obligatoires sont remplis?
   - Les sections ont un contenu substantiel?
   - Les contacts sont-ils identifies?
   - Le pricing est coherent avec la taille entreprise?

ISSUES CRITIQUES (bloquantes):
- Hallucination evidente (fait invente sans source)
- Erreur de calcul flagrante
- Information contradictoire
- Champ obligatoire vide

FORMAT DE REPONSE (JSON uniquement):
{
  "scores": {
    "sources": 0-25,
    "roi": 0-25,
    "personnalisation": 0-25,
    "completude": 0-25,
    "total": 0-100
  },
  "issues": [
    {
      "type": "critical|warning|suggestion",
      "category": "sources|roi|personnalisation|completude",
      "description": "Description du probleme",
      "field": "chemin.vers.le.champ",
      "fix": "Action corrective suggeree"
    }
  ],
  "approved": true|false,
  "summary": "Resume en 2-3 phrases"
}

REGLES:
- approved = true si total >= 80 ET 0 issues critiques
- Sois strict mais juste
- Donne des feedbacks actionnables
```

## User Prompt Template

```
Evalue ce JSON de donnees prospect pour {{company}} ({{sector}}):

```json
{{prospectData}}
```

Genere ton evaluation au format JSON.
```

## Implementation n8n

### Node "Quality Control - Claude Opus"

```javascript
// Prepare body for Claude Opus
const prospectData = $input.first().json.prospectData;
const company = prospectData.company.name;
const sector = prospectData.company.sector;

const systemPrompt = `Tu es un auditeur qualite senior...`; // Full prompt above

const userPrompt = `Evalue ce JSON de donnees prospect pour ${company} (${sector}):

\`\`\`json
${JSON.stringify(prospectData, null, 2)}
\`\`\`

Genere ton evaluation au format JSON.`;

const claudeBody = {
  model: "claude-opus-4-20250514",
  max_tokens: 2000,
  messages: [
    { role: "user", content: userPrompt }
  ],
  system: systemPrompt
};

return { claudeBody: JSON.stringify(claudeBody) };
```

### Node "Check Quality Score" (IF)

```javascript
// Parse quality control response
const qcResponse = JSON.parse($input.first().json.body.content[0].text);

const approved = qcResponse.approved;
const score = qcResponse.scores.total;
const criticalIssues = qcResponse.issues.filter(i => i.type === 'critical').length;

// Track iteration count
const iteration = ($input.first().json.iteration || 0) + 1;
const maxIterations = 3;

return {
  approved,
  score,
  criticalIssues,
  iteration,
  canRetry: iteration < maxIterations && !approved,
  qcResponse
};
```

### Branch Logic

```
IF approved === true OR iteration >= 3
  → Continue to document generation
ELSE
  → Loop back to Claude Sonnet with feedback
```

### Node "Prepare Regeneration Prompt" (if retry needed)

```javascript
const qcResponse = $input.first().json.qcResponse;
const originalData = $input.first().json.prospectData;
const iteration = $input.first().json.iteration;

const issues = qcResponse.issues.map(i =>
  `- [${i.type.toUpperCase()}] ${i.category}: ${i.description} (fix: ${i.fix})`
).join('\n');

const regenerationPrompt = `
Le JSON precedent a obtenu un score de ${qcResponse.scores.total}/100.

PROBLEMES IDENTIFIES:
${issues}

INSTRUCTIONS:
1. Corrige chaque probleme identifie
2. Ajoute des sources valides pour chaque affirmation
3. Verifie les calculs ROI
4. Assure-toi que le contenu est specifique a ${originalData.company.name}

Regenere le JSON complet avec les corrections.
Iteration ${iteration + 1}/3.
`;

return { regenerationPrompt, originalData };
```

## Workflow Flow

```
[Claude Sonnet - Generate JSON]
         │
         ▼
[Claude Opus - Quality Control]
         │
         ▼
[Parse QC Response]
         │
         ├── approved === true ────────────────────┐
         │                                         │
         ▼                                         ▼
[iteration < 3?]                    [Continue to Doc Generation]
         │
    YES  │  NO
         │   └──────────────────────────────────────┘
         ▼
[Prepare Regeneration Prompt]
         │
         ▼
[Claude Sonnet - Regenerate] ──────────────────────┐
         │                                          │
         └──────────────────────────────────────────┘
                      (loop back to QC)
```

## Metriques de Succes

- **Taux d'approbation 1ere passe**: Objectif > 70%
- **Score moyen**: Objectif > 85/100
- **Issues critiques**: Objectif < 5%
- **Iterations moyennes**: Objectif < 1.5

## Cout Estime

- Claude Sonnet (generation): ~$0.50-1.00
- Claude Opus (QC): ~$0.30-0.50
- Regeneration (si necessaire): +$0.50-1.00

**Total par dossier**: $1-3 (avec QC)
