// =========================================================
// KILTIVE AI — Marché (annonces publiques, Supabase)
// =========================================================
import { sb } from '../config/supabase.js';
import { state } from './state.js';
import { openModal } from './modal.js';

const CAT_COLORS = {
  legumes:  'linear-gradient(160deg,#66BB6A,#2E7D32)',
  fruits:   'linear-gradient(160deg,#FFD54F,#F9A825)',
  cereales: 'linear-gradient(160deg,#FBC02D,#F57F17)',
  intrants: 'linear-gradient(160deg,#8D6E4E,#5D4630)',
};

export async function loadListings(){
  const { data, error } = await sb.from('listings').select('*').order('created_at', { ascending: false });
  if(error){ console.warn('Erreur annonces :', error.message); return; }
  state.allListings = data || [];
  renderListings();
}

function renderListings(){
  const grid = document.getElementById('market-grid');
  const searchInput = document.getElementById('market-search');
  if(!grid || !searchInput) return;
  const search = (searchInput.value || '').toLowerCase();
  const filtered = state.allListings.filter(l =>
    (state.activeCategory === 'tout' || l.category === state.activeCategory) &&
    l.title.toLowerCase().includes(search)
  );
  if(!filtered.length){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><svg class="icon"><use href="#i-store"/></svg>Aucune annonce pour le moment. Soyez le premier à publier avec le "+".</div>`;
    return;
  }
  grid.innerHTML = filtered.map(l => `
    <div class="prod-card">
      <div class="prod-photo" style="background:${CAT_COLORS[l.category] || CAT_COLORS.legumes};"></div>
      <div class="prod-info">
        <div class="name">${l.title}</div>
        <div class="loc">${[l.location, l.quantity].filter(Boolean).join(' · ')}</div>
        <div class="price">${l.price} HTG/${l.unit}</div>
      </div>
    </div>`).join('');
}

// --------- Délégation d'événements ---------
document.addEventListener('input', (e) => {
  if(e.target.id === 'market-search') renderListings();
});

document.addEventListener('click', async (e) => {
  const chip = e.target.closest('#market-cat-row .cat-chip');
  if(chip){
    document.querySelectorAll('#market-cat-row .cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.activeCategory = chip.dataset.cat;
    renderListings();
    return;
  }

  if(e.target.closest('#add-listing-btn')){
    openModal({
      title: 'Publier une annonce',
      submitLabel: 'Publier',
      bodyHtml: `
        <div class="modal-field">
          <label>Nom du produit</label>
          <input type="text" name="title" placeholder="ex: Tomates fraîches" required>
        </div>
        <div class="modal-field">
          <label>Catégorie</label>
          <select name="category">
            <option value="legumes">Légumes</option>
            <option value="fruits">Fruits</option>
            <option value="cereales">Céréales</option>
            <option value="intrants">Intrants</option>
          </select>
        </div>
        <div class="modal-field">
          <label>Prix (HTG)</label>
          <input type="number" name="price" min="0" step="0.01" placeholder="ex: 250" required>
        </div>
        <div class="modal-field">
          <label>Unité</label>
          <input type="text" name="unit" placeholder="ex: kg, sac, régime" value="kg">
        </div>
        <div class="modal-field">
          <label>Quantité disponible</label>
          <input type="text" name="quantity" placeholder="ex: 12kg">
        </div>
        <div class="modal-field">
          <label>Localisation</label>
          <input type="text" name="location" placeholder="ex: Cap-Haïtien" value="${(state.currentProfile && state.currentProfile.location) || ''}">
        </div>
      `,
      onSubmit: async (form) => {
        const title = form.get('title').trim();
        const price = parseFloat(form.get('price'));
        if(!title) return 'Le nom du produit est requis.';
        if(!price || isNaN(price) || price <= 0) return 'Prix invalide.';
        const { data: session } = await sb.auth.getSession();
        if(!session || !session.session) return 'Vous devez être connecté.';
        const { error } = await sb.from('listings').insert({
          user_id: session.session.user.id,
          title, price,
          category: form.get('category'),
          unit: form.get('unit').trim() || 'unité',
          quantity: form.get('quantity').trim(),
          location: form.get('location').trim(),
        });
        if(error) return 'Erreur : ' + error.message;
        loadListings();
      }
    });
  }
});
