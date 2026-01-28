#!/bin/bash
# Lance un serveur local pour le dashboard PACIFIK'AI
# Les assets s'ouvriront correctement

cd "/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI"

echo "Dashboard PACIFIK'AI - Serveur local"
echo "===================================="
echo ""
echo "URL: http://localhost:8080/dashboard/"
echo ""
echo "Ctrl+C pour arreter"
echo ""

# Ouvrir dans le navigateur
open "http://localhost:8080/dashboard/"

# Lancer le serveur
python3 -m http.server 8080
