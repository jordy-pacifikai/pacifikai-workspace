#!/bin/bash
# =============================================================================
# PACIFIK'AI - Générateur de Fiche Prospect
# Utilise Claude Code (Opus via forfait Max) pour recherche approfondie
# =============================================================================

# Configuration
PROSPECT_NAME="$1"
SECTOR="$2"
OUTPUT_DIR="/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI"

# Vérification des arguments
if [ -z "$PROSPECT_NAME" ]; then
    echo "Usage: $0 <nom_entreprise> [secteur]"
    echo "Exemple: $0 'Air Tahiti Nui' 'Transport aérien'"
    exit 1
fi

# Créer le dossier du prospect s'il n'existe pas
PROSPECT_DIR="$OUTPUT_DIR/$PROSPECT_NAME"
mkdir -p "$PROSPECT_DIR"

echo "================================================"
echo "PACIFIK'AI - Génération Fiche Prospect"
echo "================================================"
echo "Entreprise: $PROSPECT_NAME"
echo "Secteur: ${SECTOR:-'Non spécifié'}"
echo "Dossier: $PROSPECT_DIR"
echo ""
echo "Lancement de Claude Code avec recherche web..."
echo ""

# Prompt pour Claude Code
PROMPT="Tu es l'agent de recherche PACIFIK'AI. Tu dois générer une fiche prospect complète pour l'entreprise '$PROSPECT_NAME' (secteur: ${SECTOR:-'à déterminer'}) en Polynésie française.

INSTRUCTIONS:
1. Fais une recherche web approfondie sur cette entreprise
2. Analyse leur présence digitale (site web, réseaux sociaux, avis Google)
3. Identifie leurs pain points potentiels
4. Propose 10 features d'automatisation IA pertinentes pour leur secteur
5. Estime le potentiel commercial (packages Basic/Pro/Enterprise)
6. Rédige un script d'appel téléphonique personnalisé
7. Rédige un email de prospection accrocheur

TEMPLATE À UTILISER:
Lis le fichier: $OUTPUT_DIR/_templates/FICHE_PROSPECT_TEMPLATE.md

OUTPUT:
Génère la fiche complète et sauvegarde-la dans: $PROSPECT_DIR/FICHE_RECHERCHE.md

IMPORTANT:
- Adapte tout au contexte polynésien (XPF, culture locale)
- Sois spécifique et actionnable
- Les scripts doivent être prêts à l'emploi
- Utilise 'Ia ora na' et 'Mauruuru' dans les communications"

# Lancer Claude Code
claude --print "$PROMPT"

echo ""
echo "================================================"
echo "Fiche générée dans: $PROSPECT_DIR/FICHE_RECHERCHE.md"
echo "================================================"
