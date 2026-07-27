# Kiltive AI

Assistant agricole intelligent — application web responsive (sans framework, sans build).

## Architecture du projet

```
kiltive-app/
├── index.html              Squelette léger (charge tout le reste)
├── config/
│   └── supabase.js          Clé + client Supabase (À REMPLIR — voir plus bas)
├── css/
│   ├── style.css             Design system : tokens, composants, mise en page de base
│   └── responsive.css        Tous les points de rupture (desktop <-> mobile)
├── js/
│   ├── main.js               Point d'entrée : charge les composants puis démarre l'auth
│   ├── state.js               État partagé (profil courant, cache météo, sélections)
│   ├── navigation.js          Routeur : charge pages/*.html à la demande
│   ├── modal.js                Fenêtre modale générique (formulaires parcelle/annonce/diagnostic)
│   ├── auth.js                Inscription / connexion / session / déconnexion
│   ├── dashboard.js           Page Accueil (diagnostics réels, alerte, météo courte)
│   ├── weather.js             Météo réelle (Open-Meteo) + auto-rafraîchissement
│   ├── parcelles.js           Page Suivi de culture
│   ├── market.js              Page Marché
│   ├── chat.js                Assistant IA (démo pour l'instant, voir TODO dans le fichier)
│   └── utils.js               Petites fonctions partagées
├── components/                Fragments HTML persistants, injectés une fois au démarrage
│   ├── icons.html              Sprite SVG partagé par toutes les pages
│   ├── sidebar.html            Navigation desktop
│   ├── topbar.html             Barre du haut
│   ├── bottomnav.html          Navigation mobile
│   └── modal.html               Fenêtre modale générique
├── assets/
│   └── favicon.svg             Favicon (feuille verte)
├── pages/                     Fragments HTML chargés à la demande par navigation.js
│   ├── welcome.html, register.html, login.html   (avant connexion)
│   └── accueil.html, chat.html, diagnostic.html, suivi.html,
│       meteo.html, marche.html, profil.html       (après connexion)
└── supabase/                  Scripts SQL à exécuter dans Supabase (dans l'ordre)
    ├── 01_profiles.sql
    ├── 02_diagnostics.sql
    └── 03_parcelles_listings.sql
```

## Mise en route

### 1. Supabase
1. Crée un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécute les 3 scripts du dossier `supabase/`, **dans l'ordre** (01, 02, 03)
3. Dans **Authentication → Providers → Email**, désactive *"Confirm email"* pour tester rapidement
4. Dans **Project Settings → API**, récupère `Project URL` et la clé `anon public`
5. Colle ces deux valeurs dans `config/supabase.js`

### 2. Lancer le projet en local

⚠️ **Important** : contrairement à l'ancienne version en un seul fichier, ce projet utilise `fetch()` pour charger les pages et composants HTML. Cela **ne fonctionne pas** en ouvrant `index.html` directement depuis l'explorateur de fichiers (double-clic) — il faut un petit serveur local. Deux options simples, au choix :

**Avec Python (déjà installé sur macOS/Linux) :**
```bash
cd kiltive-app
python3 -m http.server 8000
```
Puis ouvre `http://localhost:8000`

**Avec Node.js :**
```bash
cd kiltive-app
npx serve
```

### 3. Mise en ligne (production)

Le projet est 100% statique (HTML/CSS/JS + Supabase) : n'importe quel hébergeur statique gratuit fonctionne, sans configuration serveur.
- **Netlify** : glisser-déposer le dossier `kiltive-app` sur [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** : `vercel deploy` depuis le dossier
- **GitHub Pages** : pousser le dossier dans un repo et activer Pages dans les réglages

## État des fonctionnalités

| Fonctionnalité | État |
|---|---|
| Inscription / connexion | ✅ Réel (Supabase Auth) |
| Tableau de bord (Accueil) | ✅ Réel (diagnostics + météo en direct) |
| Météo (page complète) | ✅ Réel (Open-Meteo) |
| Suivi de culture | ✅ Réel (parcelles Supabase) |
| Marché | ✅ Réel (annonces publiques Supabase) |
| Formulaires (parcelle/annonce/diagnostic) | ✅ Fenêtre modale, plus de prompt() |
| Lien diagnostic → parcelle | ✅ Sélectionnable à la création |
| Favicon / meta de partage / écran de chargement | ✅ |
| Chat IA | ⏳ Démo — voir `js/chat.js` |
| Diagnostic photo | ⏳ Démo — analyse d'image pas encore branchée |

## Prochaine étape prévue : Chat IA

`js/chat.js` contient un `TODO` à l'endroit exact où brancher une vraie IA (DeepSeek via une Supabase Edge Function, pour ne jamais exposer la clé API côté navigateur).
