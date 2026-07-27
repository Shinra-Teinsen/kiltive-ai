# Kiltive AI

Assistant agricole intelligent pour Haïti — RAG, agents IA spécialisés, LLM open
source (Qwen), pensé pour être utilisé par des milliers d'agriculteurs.

## Structure du projet

```
kiltive-ai/
├── frontend/     Application web agriculteur (HTML/CSS/JS, déjà fonctionnelle)
├── backend/      API — pont entre le frontend et l'intelligence artificielle
├── llm/          Configuration Ollama/Qwen (développement local)
├── rag/          Base de connaissances agricole interrogeable (pgvector)
├── agents/       Agents IA spécialisés (Agronome, Météo, Diagnostic, Marché)
├── n8n/          Workflows d'automatisation
├── supabase/     Scripts SQL (Auth, tables, pgvector)
└── docs/
    ├── ARCHITECTURE.md   Vue d'ensemble technique complète
    └── DECISIONS.md       Journal des décisions techniques (vivant)
```

## Documents à lire en premier

1. **`docs/ARCHITECTURE.md`** — comment toutes les briques s'articulent
2. **`docs/DECISIONS.md`** — chaque choix technique fait, et pourquoi

## Méthode de travail

Ce projet avance **une étape à la fois**, chaque étape étant testée et validée avant
de passer à la suivante. Voir `docs/DECISIONS.md` pour l'historique des étapes
déjà validées.
