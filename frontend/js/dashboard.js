// =========================================================
// KILTIVE AI — Tableau de bord (page Accueil)
// =========================================================
import { sb } from '../config/supabase.js';
import { timeAgo, diagIcon } from './utils.js';
import { maybeRefreshWeather } from './weather.js';
import { openModal } from './modal.js';

export async function loadDashboard(){
  const { data: session } = await sb.auth.getSession();
  if(!session || !session.session) return;
  const userId = session.session.user.id;

  const { data: diagnostics, error } = await sb
    .from('diagnostics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if(error){ console.warn('Erreur chargement diagnostics :', error.message); }
  renderAlertZone(diagnostics || []);
  renderDiagnosticsList(diagnostics || []);
  maybeRefreshWeather();
}

function renderAlertZone(diagnostics){
  const zone = document.getElementById('accueil-alert-zone');
  if(!zone) return;
  const latestProblem = diagnostics.find(d => d.status === 'maladie' || d.status === 'attention');
  if(!latestProblem){ zone.innerHTML = ''; return; }
  zone.innerHTML = `
    <div class="alert-card">
      <svg class="icon"><use href="#i-warning"/></svg>
      <div class="txt"><b>Attention requise</b><span>${latestProblem.plant_name}${latestProblem.disease_name ? ' — ' + latestProblem.disease_name : ''} (${timeAgo(latestProblem.created_at)})</span></div>
    </div>`;
}

function renderDiagnosticsList(diagnostics){
  const list = document.getElementById('accueil-diagnostics-list');
  if(!list) return;
  if(!diagnostics.length){
    list.innerHTML = `
      <div class="empty-state">
        <svg class="icon"><use href="#i-camera"/></svg>
        Aucun diagnostic encore.<br>Lancez votre première analyse, ou testez avec le bouton "+".
      </div>`;
    return;
  }
  list.innerHTML = diagnostics.map(d => `
    <div class="mini-row">
      <div class="mini-ic ${d.status !== 'sain' ? 'warn' : ''}"><svg class="icon sm"><use href="#${diagIcon(d.status)}"/></svg></div>
      <div class="mini-txt"><b>${d.plant_name}${d.disease_name ? ' — ' + d.disease_name : ' (saine)'}</b><span>${timeAgo(d.created_at)}</span></div>
    </div>`).join('');
}

// Ajout d'un diagnostic (en attendant que le module "Diagnostiquer" analyse
// de vraies photos) — formulaire modal, avec liaison optionnelle à une parcelle.
document.addEventListener('click', async (e) => {
  if(!e.target.closest('#quick-add-diag')) return;

  const { data: session } = await sb.auth.getSession();
  if(!session || !session.session){ alert('Vous devez être connecté.'); return; }

  const { data: parcelles } = await sb.from('parcelles').select('id, name, crop').eq('user_id', session.session.user.id);
  const parcelleOptions = (parcelles || []).map(p => `<option value="${p.id}">${p.name} (${p.crop})</option>`).join('');

  openModal({
    title: 'Ajouter un diagnostic',
    submitLabel: 'Enregistrer',
    bodyHtml: `
      <div class="modal-field">
        <label>Nom de la plante</label>
        <input type="text" name="plant_name" placeholder="ex: Tomate" required>
      </div>
      <div class="modal-field">
        <label>État</label>
        <div class="modal-radio-row">
          <label><input type="radio" name="status" value="sain" checked><span>Saine</span></label>
          <label><input type="radio" name="status" value="attention"><span>Attention</span></label>
          <label><input type="radio" name="status" value="maladie"><span>Maladie</span></label>
        </div>
      </div>
      <div class="modal-field">
        <label>Problème détecté (facultatif)</label>
        <input type="text" name="disease_name" placeholder="ex: Mildiou, pucerons...">
      </div>
      ${parcelleOptions ? `
      <div class="modal-field">
        <label>Parcelle concernée</label>
        <select name="parcelle_id">
          <option value="">Aucune / non liée</option>
          ${parcelleOptions}
        </select>
      </div>` : ''}
    `,
    onSubmit: async (form) => {
      const plant_name = form.get('plant_name').trim();
      if(!plant_name) return 'Le nom de la plante est requis.';
      const status = form.get('status');
      const disease_name = form.get('disease_name').trim() || null;
      const parcelle_id = form.get('parcelle_id') || null;

      const { error } = await sb.from('diagnostics').insert({
        user_id: session.session.user.id, plant_name, disease_name, status, parcelle_id
      });
      if(error) return 'Erreur : ' + error.message;
      loadDashboard();
    }
  });
});
