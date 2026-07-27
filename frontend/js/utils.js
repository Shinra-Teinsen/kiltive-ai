// =========================================================
// KILTIVE AI — Petites fonctions utilitaires partagées
// =========================================================
export function timeAgo(dateStr){
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if(days <= 0) return "Aujourd'hui";
  if(days === 1) return "Il y a 1 jour";
  return `Il y a ${days} jours`;
}

export function diagIcon(status){
  if(status === 'maladie') return 'i-bug';
  if(status === 'attention') return 'i-warning';
  return 'i-check';
}
