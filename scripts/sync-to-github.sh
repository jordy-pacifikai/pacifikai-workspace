#!/bin/bash
# =============================================================================
# PACIFIK'AI - Sync to GitHub
# Pousse les changements vers GitHub et déclenche le déploiement
# =============================================================================

PACIFIKAI_DIR="/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI"
cd "$PACIFIKAI_DIR"

echo "Synchronisation PACIFIK'AI vers GitHub..."
echo "=========================================="

# 1. Régénérer le manifest
echo ""
echo "[1/4] Regeneration du manifest assets..."
bash scripts/generate-assets-manifest.sh

# 2. Ajouter tous les fichiers
echo ""
echo "[2/4] Ajout des fichiers modifies..."
git add -A

# 3. Commit avec message automatique
echo ""
echo "[3/4] Commit..."
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
git commit -m "Auto-sync: $TIMESTAMP" || echo "Rien a commiter"

# 4. Push
echo ""
echo "[4/4] Push vers GitHub..."
git push origin main

echo ""
echo "Synchronisation terminee!"
echo "Le dashboard sera mis a jour dans ~2 minutes sur GitHub Pages."
