#!/bin/bash
# PACIFIK'AI Dashboard - Port 8080
# Usage: ./start.sh ou double-clic

# Se placer dans le dossier PACIFIK'AI (parent de dashboard)
cd "$(dirname "$0")/.."
echo "🚀 PACIFIK'AI Dashboard"
echo "📍 http://localhost:8080/dashboard/"
echo ""
echo "Ctrl+C pour arrêter"
echo ""
open "http://localhost:8080/dashboard/"
python3 -m http.server 8080
