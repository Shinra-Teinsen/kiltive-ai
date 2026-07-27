// =========================================================
// KILTIVE AI — Navigation / routeur
// Charge les fragments HTML depuis pages/*.html à la demande
// et déclenche le contrôleur JS correspondant.
// =========================================================
import { state } from './state.js';
import { loadDashboard } from './dashboard.js';
import { renderFullWeatherPage } from './weather.js';
import { loadParcelles } from './parcelles.js';
import { loadListings } from './market.js';
import { initChatPage } from './chat.js';

const AUTH_VIEW_CLASS = {
  welcome: 'view-welcome',
  register: 'view-register',
  login: 'view-register', // la page login réutilise le même style que register
};

const pageMeta = {
  accueil:    { title: 'Bonjour 👋',        sub: 'Cap-Haïtien, Nord' },
  chat:       { title: 'Assistant IA',      sub: 'Kiltive AI · en ligne' },
  diagnostic: { title: 'Diagnostiquer',     sub: 'Analyse par photo' },
  suivi:      { title: 'Suivi de culture',  sub: 'Vos parcelles' },
  meteo:      { title: 'Météo',             sub: 'Cap-Haïtien, Nord' },
  marche:     { title: 'Marché',            sub: 'Producteurs locaux' },
  profil:     { title: 'Mon profil',        sub: '' },
};

const cache = new Map(); // évite de re-télécharger un fragment déjà chargé

async function fetchFragment(path){
  if(cache.has(path)) return cache.get(path);
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Impossible de charger ${path}`);
  const html = await res.text();
  cache.set(path, html);
  return html;
}

// --------- Vues plein écran avant connexion (welcome / register / login) ---------
export async function showAuthView(name){
  document.getElementById('shell').style.display = 'none';
  const root = document.getElementById('auth-root');
  root.className = AUTH_VIEW_CLASS[name] || '';
  root.style.display = 'flex';
  root.innerHTML = await fetchFragment(`pages/${name}.html`);
}

export function hideAuthViews(){
  document.getElementById('auth-root').style.display = 'none';
  document.getElementById('shell').style.display = 'flex';
}

// --------- Pages internes de l'application (après connexion) ---------
export async function showPage(name){
  const content = document.getElementById('content');
  content.innerHTML = await fetchFragment(`pages/${name}.html`);

  document.querySelectorAll('.nav-link[data-page], .navitem[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === name);
  });

  const meta = pageMeta[name];
  if(meta){
    let title = meta.title;
    if(name === 'accueil' && state.currentProfile){
      title = `Bonjour ${firstName(state.currentProfile.full_name)} 👋`;
    }
    const topbarTitle = document.getElementById('topbar-title');
    const topbarSub = document.getElementById('topbar-sub');
    if(topbarTitle) topbarTitle.textContent = title;
    if(topbarSub) topbarSub.textContent = (state.currentProfile && state.currentProfile.location) || meta.sub;
    const accueilH1 = document.getElementById('accueil-h1');
    if(name === 'accueil' && accueilH1) accueilH1.textContent = title;
  }

  // Déclenche le contrôleur propre à chaque page
  if(name === 'accueil')    loadDashboard();
  if(name === 'meteo')      renderFullWeatherPage();
  if(name === 'suivi')      loadParcelles();
  if(name === 'marche')     loadListings();
  if(name === 'chat')       initChatPage();
  if(name === 'profil')     applyProfileToProfilPage();

  document.getElementById('content').scrollTo({ top: 0, behavior: 'instant' });
  window.scrollTo({ top: 0, behavior: 'instant' });
  closeDrawer();
}

function firstName(fullName){
  return fullName ? fullName.trim().split(' ')[0] : '';
}

function initials(fullName){
  if(!fullName) return '?';
  return fullName.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// Réinjecte les infos du profil courant dans la page Profil qu'on vient de charger
function applyProfileToProfilPage(){
  const p = state.currentProfile;
  if(!p) return;
  const hero = document.querySelector('.profile-hero');
  if(hero){
    hero.querySelector('b').textContent = p.full_name || '';
    hero.querySelector('span').textContent = [p.location, p.main_crops].filter(Boolean).join(' · ');
  }
  const avatar = document.querySelector('.profile-avatar');
  if(avatar) avatar.textContent = initials(p.full_name);
}

// Met à jour partout où l'avatar / le nom apparaissent en dehors de #content (sidebar, topbar)
export function applyProfileToShell(profile, email){
  state.currentProfile = profile;
  const name = (profile && profile.full_name) || email;
  const ini = initials(name);
  document.querySelectorAll('.avatar').forEach(el => el.textContent = ini);
  const sidebarMeta = document.querySelector('.sidebar-user .meta');
  if(sidebarMeta){
    sidebarMeta.querySelector('b').textContent = name;
    sidebarMeta.querySelector('span').textContent = (profile && profile.location) || email;
  }
}

// --------- Menu tiroir mobile ---------
export function openDrawer(){
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-backdrop').classList.add('open');
}
export function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-backdrop').classList.remove('open');
}

// --------- Délégation d'événements globale pour toute navigation data-page / data-nav ---------
document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]');
  if(navBtn){
    const val = navBtn.dataset.nav;
    if(val.startsWith('app')){
      hideAuthViews();
      showPage(val.split(':')[1] || 'accueil');
    } else {
      showAuthView(val);
    }
    return;
  }
  const pageBtn = e.target.closest('[data-page]');
  if(pageBtn){ showPage(pageBtn.dataset.page); return; }

  if(e.target.closest('#hamburger-btn')){ openDrawer(); return; }
  if(e.target.closest('#drawer-backdrop')){ closeDrawer(); return; }
});
