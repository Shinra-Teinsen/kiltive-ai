# Architecture — Kiltive AI

## Vue d'ensemble

```
                         ┌─────────────────┐
                         │    frontend/     │  (déjà construit)
                         │  HTML/CSS/JS     │
                         │  statique        │
                         └────────┬─────────┘
                                  │ HTTPS
                                  ▼
                         ┌─────────────────┐
                         │    backend/      │  (Étape 5+)
                         │  API             │◄──────────────┐
                         └────────┬─────────┘                │
                    ┌─────────────┼──────────────┐           │
                    ▼             ▼              ▼           │
             ┌───────────┐ ┌───────────┐  ┌────────────┐    │
             │ Supabase   │ │   rag/     │  │  agents/   │    │
             │ - Auth     │ │ pgvector   │  │ Agronome   │    │
             │ - Database │ │ embeddings │  │ Météo      │    │
             │ - pgvector │ │            │  │ Diagnostic │    │
             └───────────┘ └───────────┘  │ Marché     │    │
                                            └─────┬──────┘    │
                                                  ▼           │
                                           ┌────────────┐     │
                                           │    llm/     │     │
                                           │ Ollama+Qwen │─────┘
                                           │ (dev local) │
                                           │      ↓      │
                                           │ API hébergée│
                                           │ (production)│
                                           └────────────┘

             ┌────────────┐
             │    n8n/     │  automatisations transverses (Étape 19)
             └────────────┘
```

## Rôle de chaque brique

| Dossier | Rôle | Statut |
|---|---|---|
| `frontend/` | Application web agriculteur (déjà construite) | ✅ Existant |
| `supabase/` | Auth, base de données, pgvector | ✅ Partiellement existant (profiles, diagnostics, parcelles, listings) |
| `backend/` | API faisant le pont frontend ↔ IA | ⏳ Étape 5 |
| `llm/` | Modèle Qwen local (dev) via Ollama | ⏳ Étapes 2-4 |
| `rag/` | Base de connaissances agricole interrogeable | ⏳ Étapes 9-12 |
| `agents/` | Agents IA spécialisés | ⏳ Étapes 14-17 |
| `n8n/` | Automatisations | ⏳ Étape 19 |

## Principe directeur : dev local → production hébergée

Le LLM (Qwen) tournera d'abord **en local via Ollama** pendant le développement
(machine actuelle : 8 Go RAM, GPU non confirmé → modèle `qwen2.5:3b-instruct`).

Le `backend/` sera conçu dès le départ avec une **couche d'abstraction** pour l'appel
au LLM, de sorte que passer d'Ollama local à une API Qwen hébergée (DeepInfra/Together/
Fireworks) en production soit un changement de configuration, jamais une réécriture.

## Roadmap complet (23 étapes)

Voir la liste complète dans le message original de cadrage du projet. Ce document
sera mis à jour à la fin de chaque étape validée.

**Dernière étape validée : Étape 1 — Architecture complète du projet**
