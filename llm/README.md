# llm/

Configuration du modèle de langage local utilisé en développement.

**Rempli à partir de :**
- Étape 2 — Installation d'Ollama
- Étape 3 — Installation du modèle Qwen (`qwen2.5:3b-instruct`)
- Étape 4 — Test du modèle en local

**Contiendra à terme :**
- `Modelfile` (personnalisation du modèle Ollama, si besoin)
- Scripts de test du modèle
- Notes de configuration (context window, température, etc.)

**Rappel important :** cette configuration est pour le **développement uniquement**.
En production, le backend appellera une API Qwen hébergée (voir `docs/DECISIONS.md`).
