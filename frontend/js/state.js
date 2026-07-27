// =========================================================
// KILTIVE AI — État partagé entre les modules
// Un seul objet mutable, importé partout où il faut lire/
// écrire l'état courant (profil, météo en cache, sélections).
// =========================================================
export const state = {
  currentProfile: null,      // profil de l'utilisateur connecté (table "profiles")

  // Météo
  cachedCoords: null,        // position résolue une fois par session
  lastWeatherData: null,     // dernière réponse Open-Meteo brute
  lastWeatherCoords: null,
  lastWeatherFetch: 0,
  weatherIntervalId: null,

  // Suivi de culture
  selectedParcelleId: null,

  // Marché
  allListings: [],
  activeCategory: 'tout',
};
