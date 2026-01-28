#!/bin/bash
# =============================================================================
# PACIFIK'AI - Création Dossier Prospect Structuré
# Crée un dossier prospect avec la structure standard
# =============================================================================

PACIFIKAI_DIR="/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI"
PROSPECT_NAME="$1"
SECTOR="${2:-Non specifie}"

if [ -z "$PROSPECT_NAME" ]; then
    echo "Usage: $0 <nom_entreprise> [secteur]"
    echo "Exemple: $0 'Air Tahiti Nui' 'Transport aerien'"
    exit 1
fi

PROSPECT_DIR="$PACIFIKAI_DIR/$PROSPECT_NAME"

if [ -d "$PROSPECT_DIR" ]; then
    echo "Le dossier '$PROSPECT_NAME' existe deja."
    echo "Voulez-vous reorganiser ses fichiers? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 0
    fi
fi

echo "Creation du dossier prospect: $PROSPECT_NAME"
echo "Secteur: $SECTOR"
echo ""

# Créer la structure
mkdir -p "$PROSPECT_DIR"
mkdir -p "$PROSPECT_DIR/prospection"
mkdir -p "$PROSPECT_DIR/demo"
mkdir -p "$PROSPECT_DIR/demo/assets"
mkdir -p "$PROSPECT_DIR/docs"
mkdir -p "$PROSPECT_DIR/docs/builds"
mkdir -p "$PROSPECT_DIR/workflows"

# Créer MEMORY.md si n'existe pas
if [ ! -f "$PROSPECT_DIR/MEMORY.md" ]; then
    cat > "$PROSPECT_DIR/MEMORY.md" << EOF
# $PROSPECT_NAME - Memoire Prospect

> **Instructions**: Ce fichier contient tout le contexte du prospect.

---

## Informations Entreprise

**Nom**: $PROSPECT_NAME
**Secteur**: $SECTOR
**Localisation**: Polynesie francaise
**Date creation**: $(date +%Y-%m-%d)

### Contacts
| Nom | Poste | Email | Telephone |
|-----|-------|-------|-----------|
| - | - | - | - |

---

## Status Commercial

**Statut actuel**: Lead
**Priorite**: A definir
**Valeur estimee**: A definir

### Historique Interactions
| Date | Action | Resultat |
|------|--------|----------|
| $(date +%Y-%m-%d) | Dossier cree | - |

---

## Assets Crees

| Type | Fichier | Description |
|------|---------|-------------|
| - | - | - |

---

## Prochaines Actions

- [ ] Generer fiche recherche IA
- [ ] Preparer email prospection
- [ ] Premier contact

---

*Derniere MAJ: $(date +%Y-%m-%d)*
EOF
    echo "✓ MEMORY.md cree"
fi

# Créer templates dans prospection/
if [ ! -f "$PROSPECT_DIR/prospection/email-prospection.md" ]; then
    cat > "$PROSPECT_DIR/prospection/email-prospection.md" << EOF
# Email Prospection - $PROSPECT_NAME

## Email Initial

**Objet**: $PROSPECT_NAME + IA = [BENEFICE]

\`\`\`
Ia ora na [PRENOM],

Je suis Jordy Banks, fondateur de PACIFIK'AI.

[PERSONNALISER]

Mauruuru,
Jordy
\`\`\`

## Email Relance J+3

[A completer apres fiche recherche]
EOF
    echo "✓ email-prospection.md cree"
fi

if [ ! -f "$PROSPECT_DIR/prospection/script-appel.md" ]; then
    cat > "$PROSPECT_DIR/prospection/script-appel.md" << EOF
# Script Appel - $PROSPECT_NAME

## Accroche (30 sec)
\`\`\`
Ia ora na [PRENOM],

C'est Jordy de PACIFIK'AI. Je vous appelle parce que...
[PERSONNALISER APRES FICHE RECHERCHE]
\`\`\`

## Questions Decouverte
1. Volume: "Combien de [X] traitez-vous par mois?"
2. Temps: "Combien de temps passe votre equipe sur [Y]?"
3. Douleur: "Qu'est-ce qui vous frustre le plus?"
4. Budget: "Avez-vous deja envisage l'automatisation?"
5. Decision: "Qui d'autre serait implique?"

## Closing
\`\`\`
Parfait. Je vous propose un audit gratuit de 30 minutes.
Disponible [PROPOSITION DATE]?
\`\`\`
EOF
    echo "✓ script-appel.md cree"
fi

echo ""
echo "================================================"
echo "Dossier prospect cree: $PROSPECT_DIR"
echo "================================================"
echo ""
echo "Structure:"
find "$PROSPECT_DIR" -type f | sed "s|$PROSPECT_DIR/||" | sort
echo ""
echo "Prochaine etape: Generer la fiche recherche IA"
echo "./scripts/generate-prospect-fiche.sh \"$PROSPECT_NAME\" \"$SECTOR\""

# Regenerer le manifest
echo ""
echo "Actualisation du manifest..."
"$PACIFIKAI_DIR/scripts/generate-assets-manifest.sh"
