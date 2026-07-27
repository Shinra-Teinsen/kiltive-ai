// =========================================================
// KILTIVE AI — Suivi de culture (parcelles réelles)
// =========================================================
import { sb } from '../config/supabase.js';
import { state } from './state.js';
import { timeAgo, diagIcon } from './utils.js';
import { openModal } from './modal.js';

const STAGE_ORDER = ['germination', 'croissance', 'floraison', 'recolte'];
const STAGE_LABELS = { germination:'Germination', croissance:'Croissance', floraison:'Floraison', recolte:'Récolte' };

export async function loadParcelles(){
  const { data: session } = await sb.auth.getSession();
  if(!session || !session.session) return;
  const { data: parcelles, error } = await sb
    .from('parcelles').select('*').eq('user_id', session.session.user.id)
    .order('created_at', { ascending: false });
  if(error){ console.warn('Erreur parcelles :', error.message); return; }

  renderParcellesList(parcelles || []);
  if(!parcelles || !parcelles.length){
    document.getElementById('parcelle-detail-zone').innerHTML = '';
    state.selectedParcelleId = null;
  } else if(!state.selectedParcelleId || !parcelles.find(p => p.id === state.selectedParcelleId)){
    selectParcelle(parcelles[0].id);
  } else {
    selectParcelle(state.selectedParcelleId);
  }
}

function renderParcellesList(parcelles){
  const zone = document.getElementById('parcelles-list-zone');
  if(!zone) return;
  if(!parcelles.length){
    zone.innerHTML = `<div class="empty-state"><svg class="icon"><use href="#i-layers"/></svg>Aucune parcelle encore. Cliquez sur "+" pour ajouter votre première culture.</div>`;
    return;
  }
  zone.innerHTML = parcelles.map(p => `
    <button class="parcelle-card ${p.id === state.selectedParcelleId ? 'selected' : ''}" data-parcelle-id="${p.id}">
      <div class="pname">${p.name}</div>
      <div class="pcrop">${p.crop}</div>
      <span class="stage-chip">${STAGE_LABELS[p.stage] || p.stage}</span>
    </button>`).join('');
}

async function selectParcelle(id){
  state.selectedParcelleId = id;
  document.querySelectorAll('.parcelle-card').forEach(el => el.classList.toggle('selected', el.dataset.parcelleId === id));

  const { data: parcelle, error } = await sb.from('parcelles').select('*').eq('id', id).single();
  if(error || !parcelle) return;

  const { data: diags } = await sb.from('diagnostics').select('*').eq('parcelle_id', id).order('created_at', { ascending:false }).limit(5);

  const stageIndex = STAGE_ORDER.indexOf(parcelle.stage);
  const stageRowHtml = STAGE_ORDER.map((s, i) => {
    const dotClass = i <= stageIndex ? '' : 'todo';
    const lineClass = i < stageIndex ? '' : 'todo';
    return `<div class="stage-dot ${dotClass}"></div>` + (i < STAGE_ORDER.length - 1 ? `<div class="stage-line ${lineClass}"></div>` : '');
  }).join('');

  const diagsHtml = (diags && diags.length) ? diags.map(d => `
    <div class="mini-row">
      <div class="mini-ic ${d.status !== 'sain' ? 'warn' : ''}"><svg class="icon sm"><use href="#${diagIcon(d.status)}"/></svg></div>
      <div class="mini-txt"><b>${d.plant_name}${d.disease_name ? ' — ' + d.disease_name : ' (saine)'}</b><span>${timeAgo(d.created_at)}</span></div>
    </div>`).join('') : `<div class="empty-state">Aucun diagnostic lié à cette parcelle.</div>`;

  document.getElementById('parcelle-detail-zone').innerHTML = `
    <div class="monitor-layout">
      <div>
        <div class="score-card">
          <div class="ring" style="background:conic-gradient(var(--sun) ${parcelle.health_score}%, rgba(255,255,255,0.18) 0);">
            <div class="ring-inner"><b>${parcelle.health_score}</b><span>SANTÉ</span></div>
          </div>
          <div class="score-txt"><b>${parcelle.name} — ${parcelle.crop}</b><span>${parcelle.health_score >= 70 ? 'Bonne santé générale' : parcelle.health_score >= 40 ? 'Surveillance recommandée' : 'Attention requise'}</span></div>
        </div>
        <div class="section-label">Stade de croissance</div>
        <div class="stage-row">${stageRowHtml}</div>
        <div class="stage-labels"><span>Germin.</span><span>Croissance</span><span>Floraison</span><span>Récolte</span></div>
        <button class="btn btn-ghost btn-block" id="advance-stage-btn" data-parcelle-id="${id}" style="margin-top:18px;" ${stageIndex >= STAGE_ORDER.length - 1 ? 'disabled' : ''}>
          ${stageIndex >= STAGE_ORDER.length - 1 ? 'Récolte atteinte 🎉' : 'Passer au stade suivant'}
        </button>
      </div>
      <div class="panel">
        <h3>Diagnostics liés</h3>
        ${diagsHtml}
      </div>
    </div>`;
}

// --------- Délégation d'événements (boutons injectés dynamiquement) ---------
document.addEventListener('click', async (e) => {
  const parcelleCard = e.target.closest('.parcelle-card');
  if(parcelleCard){ selectParcelle(parcelleCard.dataset.parcelleId); return; }

  const advanceBtn = e.target.closest('#advance-stage-btn');
  if(advanceBtn && !advanceBtn.disabled){
    const id = advanceBtn.dataset.parcelleId;
    const { data: parcelle } = await sb.from('parcelles').select('stage').eq('id', id).single();
    const idx = STAGE_ORDER.indexOf(parcelle.stage);
    if(idx < STAGE_ORDER.length - 1){
      await sb.from('parcelles').update({ stage: STAGE_ORDER[idx + 1] }).eq('id', id);
      loadParcelles();
    }
    return;
  }

  if(e.target.closest('#add-parcelle-btn')){
    openModal({
      title: 'Nouvelle parcelle',
      submitLabel: 'Créer',
      bodyHtml: `
        <div class="modal-field">
          <label>Nom de la parcelle</label>
          <input type="text" name="name" placeholder="ex: Parcelle Nord" required>
        </div>
        <div class="modal-field">
          <label>Culture</label>
          <input type="text" name="crop" placeholder="ex: Tomate" required>
        </div>
      `,
      onSubmit: async (form) => {
        const name = form.get('name').trim();
        const crop = form.get('crop').trim();
        if(!name || !crop) return 'Nom et culture sont requis.';
        const { data: session } = await sb.auth.getSession();
        if(!session || !session.session) return 'Vous devez être connecté.';
        const { error } = await sb.from('parcelles').insert({
          user_id: session.session.user.id, name, crop, stage: 'germination', health_score: 100
        });
        if(error) return 'Erreur : ' + error.message;
        loadParcelles();
      }
    });
  }
});
