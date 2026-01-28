# PACIFIKAI - Contexte Entreprise

## Qui suis-je

**Jordy** - Fondateur de PACIFIKAI, basé en Polynésie française (Tahiti).

Je suis en train de construire une entreprise d'automatisation IA ciblant les entreprises locales polynésiennes. Mon objectif principal est le "100K Project" : prouver ma capacité à vendre des services B2B à haute valeur ajoutée avant de développer mon personal branding.

### Autres activités (revenus passifs)
- **Trading Forex** : Formation "Méthode ARD" (~70K€/an), copy trading (~50K€ en 2025)
- **Affiliations brokers** : 10-30K€/mois
- **Email marketing** : 1000 abonnés, newsletters automatisées

---

## PACIFIKAI - L'entreprise

### Vision
Devenir le leader de l'automatisation IA en Polynésie française en proposant des solutions clé-en-main pour les entreprises locales qui n'ont pas les ressources techniques pour digitaliser leurs processus.

### Positionnement
- **Marché** : Polynésie française (marché peu digitalisé, forte opportunité)
- **Cible** : PME locales (hôtels, restaurants, importateurs, comptables, etc.)
- **Proposition de valeur** : Solutions d'automatisation IA sur-mesure avec ROI rapide

### Stack technique
- **n8n** (self-hosted sur Hostinger) pour l'orchestration des workflows
- **Claude API** (Anthropic) pour l'intelligence artificielle
- **Twilio** pour WhatsApp et SMS
- **Airtable** pour les bases de données clients
- **Google Calendar** pour la gestion de calendriers
- **Supabase** pour le vector store (RAG)

---

## Solutions Développées

### 1. Chatbot Hôtels (Agentic RAG)
**Secteur** : Hôtellerie  
**Problème résolu** : Répondre automatiquement aux questions fréquentes des clients 24/7 via WhatsApp  
**Technologie** : RAG (Retrieval Augmented Generation) avec base de connaissances FAQ  
**Statut** : ✅ Développé et fonctionnel

### 2. Extraction Documents Comptables
**Secteur** : Cabinets comptables  
**Problème résolu** : Extraire automatiquement les données des factures, relevés bancaires et autres documents  
**Technologie** : OCR + IA pour structurer les données  
**Statut** : ✅ Développé et fonctionnel

### 3. Prise de Commandes Importateurs
**Secteur** : Import/Distribution  
**Problème résolu** : Automatiser la prise de commandes via WhatsApp avec génération de bons de commande PDF  
**Technologie** : Agent conversationnel + génération PDF automatique  
**Statut** : ✅ Développé et fonctionnel

### 4. Réservations Restaurants (En cours)
**Secteur** : Restauration  
**Problème résolu** : Gérer les réservations automatiquement via WhatsApp, avec synchronisation calendrier, confirmations SMS et rappels J-1  
**Technologie** : Agent IA + Google Calendar + Airtable + Twilio SMS  
**Statut** : 🔄 En cours de développement

**Cible commerciale** : 60 restaurants en Polynésie française  
**Pricing prévu** : 125K XPF setup (~1050€) + 30-50K XPF/mois maintenance (~250-420€)

### Workflows du projet Réservations Restaurants :
- **Workflow 1** : Réservation Main (réception WhatsApp → Agent IA → Calendar → Airtable → SMS)
- **Workflow 2** : Rappels SMS J-1 (automatique chaque matin)
- **Workflow 3** : Annulations/Modifications (gestion via WhatsApp)

---

## Solutions Futures (Roadmap)

### 5. Call Center Vocal IA
**Secteur** : Multi-secteur  
**Concept** : Agent vocal capable de répondre aux appels téléphoniques, qualifier les leads, prendre des rendez-vous  
**Technologie envisagée** : Twilio Voice + ElevenLabs (ou autre TTS) + Claude  
**Statut** : 📋 Planifié

### 6. Assistant RH / Recrutement
**Secteur** : Entreprises avec besoins RH  
**Concept** : Pré-qualification automatique des candidats, scheduling d'entretiens, réponses aux questions fréquentes  
**Statut** : 💡 Idée

### 7. Gestion de Flotte / Livraisons
**Secteur** : Logistique, livreurs  
**Concept** : Optimisation des tournées, notifications clients automatiques, tracking  
**Statut** : 💡 Idée

### 8. Support Client Automatisé Multi-canal
**Secteur** : E-commerce, services  
**Concept** : Centraliser WhatsApp, email, Messenger avec un seul agent IA  
**Statut** : 💡 Idée

### 9. Plateforme de Priorisation Fiscale
**Secteur** : Comptabilité / Fiscalité  
**Concept** : Outil pour aider les comptables à prioriser les dossiers fiscaux selon urgence et complexité  
**Statut** : 💡 Idée explorée

---

## Contexte Marché Polynésie Française

### Opportunités
- **Faible digitalisation** : La plupart des entreprises locales fonctionnent encore avec des processus manuels
- **Concurrence limitée** : Peu d'acteurs proposent des solutions d'automatisation IA
- **Besoin réel** : Les entreprises cherchent à optimiser leurs coûts (main d'œuvre chère)
- **WhatsApp dominant** : Canal de communication préféré localement

### Analyse concurrentielle
- **Tickee** (concurrent identifié) : 60 clients en 2 ans sur la digitalisation basique de formulaires → indique un marché encore largement inexploité pour des solutions plus avancées

### Pricing local
- Les entreprises polynésiennes sont habituées à des coûts élevés (isolement géographique)
- Un setup à 125K XPF (1050€) + maintenance mensuelle est acceptable si le ROI est démontré
- ROI type : économie d'un employé mi-temps (~150K XPF/mois) = rentabilisé en 1-2 mois

---

## Certifications en cours

Pour renforcer la crédibilité et les compétences techniques :
- **Google AI Essentials**
- **Microsoft AI-900** (Azure AI Fundamentals)
- **DeepLearning.AI** (cours spécialisés)

---

## Résumé pour Claude Code

**Ce que tu dois savoir pour m'aider :**

1. Je construis des **workflows n8n** pour automatiser des processus métier
2. J'utilise principalement **Claude API** comme cerveau IA des solutions
3. **WhatsApp via Twilio** est le canal principal de communication
4. **Airtable** sert de base de données simple et flexible
5. Le marché cible est la **Polynésie française** (entreprises locales)
6. Je préfère des solutions **pragmatiques et rapides à déployer** plutôt que parfaites
7. Mon style de travail : **direct, orienté action, pas d'over-engineering**

**Projet actuel** : Finaliser le système de réservation restaurant WhatsApp (workflows n8n déjà construits, phase de test/debug)
