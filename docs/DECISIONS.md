# Journal des décisions techniques — Kiltive AI

Ce document est mis à jour à la fin de chaque étape validée. Objectif : ne jamais
recontredire une décision déjà prise sans le décider explicitement.

## Décisions prises

| # | Décision | Choix retenu | Raison | Étape |
|---|---|---|---|---|
| 1 | Architecture frontend | Statique (HTML/CSS/JS), sans build, sans framework | Simplicité, hébergement gratuit, déjà construit | Pré-projet |
| 2 | Backend/Auth/DB | Supabase | Gratuit au démarrage, Auth + Postgres + pgvector intégrés | Pré-projet |
| 3 | Météo | Open-Meteo (API publique gratuite, sans clé) | Pas de coût, pas de gestion de clé | Pré-projet |
| 4 | LLM développement | Ollama + `qwen2.5:3b-instruct` en local | Machine 8 Go RAM, GPU non confirmé → modèle léger sûr | Cadrage IA |
| 5 | LLM production (futur) | API Qwen hébergée (DeepInfra/Together/Fireworks) — fournisseur exact à confirmer | Pas de serveur GPU à payer avant d'avoir des utilisateurs réels | Cadrage IA |
| 6 | Fine-tuning LoRA | Reporté aux étapes 22-23, sur GPU loué à ce moment-là | Coût GPU justifié seulement une fois le produit validé | Cadrage IA |
| 7 | Vecteurs (RAG) | pgvector activé directement dans Supabase | Supporté nativement, aucun serveur séparé nécessaire | Cadrage IA |
| 8 | Structure du projet | Monorepo : `frontend/ backend/ llm/ rag/ agents/ n8n/ supabase/ docs/` | Un emplacement clair par responsabilité, évite l'incohérence | Étape 1 |

## Décisions en attente (à trancher avant l'étape concernée)

| Décision à prendre | Options envisagées | Étape concernée |
|---|---|---|
| Langage/framework du backend | Python + FastAPI (recommandé) vs Node.js + Express | Étape 5 |
| Fournisseur exact de l'API Qwen hébergée | DeepInfra, Together AI, Fireworks | Étape 5 (ou plus tard, quand on passe en prod) |
| Modèle de vision pour le diagnostic photo | GPT-4o mini, Claude, Gemini, modèle open source spécialisé | Étape 16 |
| Hébergement du serveur GPU (fine-tuning) | RunPod, Vast.ai, OVH | Étape 22-23 |

## Contraintes matérielles connues

- Machine de développement : **8 Go de RAM**, GPU non confirmé
- → Modèle LLM local limité à de petites tailles (≤ 3B paramètres confortablement)

## Historique des étapes validées

- ✅ **Étape 1** — Architecture complète du projet
