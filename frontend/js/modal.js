// =========================================================
// KILTIVE AI — Fenêtre modale générique
// Utilisée pour tous les formulaires (parcelle, annonce, diagnostic)
// à la place des prompt() du navigateur.
// =========================================================
let currentOnSubmit = null;

/**
 * Ouvre la modale avec un titre, un corps de formulaire (HTML) et un
 * callback appelé à la soumission avec un objet FormData-like simple.
 * onSubmit doit retourner soit rien (succès, ferme la modale),
 * soit une chaîne de texte (message d'erreur affiché dans la modale).
 */
export function openModal({ title, bodyHtml, onSubmit, submitLabel = 'Enregistrer' }){
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-submit').textContent = submitLabel;
  setModalMessage('');
  currentOnSubmit = onSubmit;
  document.getElementById('modal-backdrop').classList.add('open');
}

export function closeModal(){
  document.getElementById('modal-backdrop').classList.remove('open');
  currentOnSubmit = null;
}

function setModalMessage(text){
  const el = document.getElementById('modal-message');
  if(!el) return;
  el.textContent = text;
  el.className = 'modal-message' + (text ? ' error' : '');
}

document.addEventListener('click', (e) => {
  if(e.target.id === 'modal-backdrop' || e.target.closest('#modal-close') || e.target.closest('#modal-cancel')){
    closeModal();
  }
});

document.addEventListener('submit', async (e) => {
  if(e.target.id !== 'modal-form') return;
  e.preventDefault();
  if(!currentOnSubmit) return;
  const btn = document.getElementById('modal-submit');
  const originalLabel = btn.textContent;
  btn.disabled = true; btn.textContent = 'Enregistrement...';
  const form = new FormData(e.target);
  const result = await currentOnSubmit(form);
  btn.disabled = false; btn.textContent = originalLabel;
  if(typeof result === 'string' && result){
    setModalMessage(result);
  } else {
    closeModal();
  }
});
