# rag/

Système de récupération augmentée (Retrieval-Augmented Generation) : permet à l'IA
de répondre en s'appuyant sur de vrais documents agricoles plutôt que sur sa seule
mémoire.

**Rempli à partir de :**
- Étape 9 — Configuration de pgvector (extension activée directement dans Supabase)
- Étape 10 — Création du système RAG (découpage, embeddings, recherche)
- Étape 11 — Tests du RAG
- Étape 12 — Import des premiers documents agricoles

**Structure prévue :**
```
rag/
├── documents/        Documents sources (guides agricoles, fiches maladies...)
├── ingest.py (ou .js) Script de découpage + génération d'embeddings
└── search.py (ou .js) Fonction de recherche sémantique
```
