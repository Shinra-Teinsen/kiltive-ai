// =========================================================
// KILTIVE AI — Authentification (Supabase Auth)
// =========================================================
import { sb } from '../config/supabase.js';
import { state } from './state.js';
import { showAuthView, hideAuthViews, showPage, applyProfileToShell } from './navigation.js';
import { startWeatherAutoRefresh, stopWeatherAutoRefresh, resetWeatherCache } from './weather.js';

function setMessage(id, text, type){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = text;
  el.className = 'form-message ' + (type || '');
}

async function fetchProfile(userId){
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if(error){ console.warn('Profil introuvable :', error.message); return null; }
  return data;
}

async function enterAppWithSession(session){
  const profile = await fetchProfile(session.user.id);
  applyProfileToShell(profile, session.user.email);
  hideAuthViews();
  await showPage('accueil');
  startWeatherAutoRefresh();
}

// Vérifie au chargement si une session Supabase existe déjà (reste connecté après refresh)
export async function checkExistingSession(){
  const { data } = await sb.auth.getSession();
  if(data && data.session){
    await enterAppWithSession(data.session);
  } else {
    showAuthView('welcome');
  }
}

async function handleRegisterSubmit(form){
  const btn = document.getElementById('register-submit');
  setMessage('register-message', '', '');
  const email = form.querySelector('#reg-email').value.trim();
  const password = form.querySelector('#reg-password').value;
  const full_name = form.querySelector('#reg-name').value.trim();
  const phone = form.querySelector('#reg-phone').value.trim();
  const location = form.querySelector('#reg-location').value.trim();
  const main_crops = form.querySelector('#reg-crops').value.trim();
  const farm_size = form.querySelector('#reg-farmsize').value.trim();
  const activeLangPill = form.querySelector('#reg-lang-row .lang-pill.active');
  const language = activeLangPill ? activeLangPill.dataset.lang : 'kreyol';

  btn.disabled = true; btn.textContent = 'Création du compte...';
  const { data, error } = await sb.auth.signUp({ email, password });

  if(error){
    setMessage('register-message', error.message, 'error');
    btn.disabled = false; btn.textContent = 'Continuer';
    return;
  }

  if(data.user){
    const { error: profileError } = await sb.from('profiles').insert({
      id: data.user.id, full_name, phone, location, main_crops, farm_size, language
    });
    if(profileError){ console.warn('Erreur profil :', profileError.message); }
  }

  btn.disabled = false; btn.textContent = 'Continuer';

  if(data.session){
    await enterAppWithSession(data.session);
  } else {
    setMessage('register-message', 'Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.', 'success');
    setTimeout(() => showAuthView('login'), 1800);
  }
}

async function handleLoginSubmit(form){
  const btn = document.getElementById('login-submit');
  setMessage('login-message', '', '');
  const email = form.querySelector('#login-email').value.trim();
  const password = form.querySelector('#login-password').value;

  btn.disabled = true; btn.textContent = 'Connexion...';
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.textContent = 'Se connecter';

  if(error){ setMessage('login-message', 'Email ou mot de passe incorrect.', 'error'); return; }
  await enterAppWithSession(data.session);
}

async function handleLogout(){
  await sb.auth.signOut();
  state.currentProfile = null;
  resetWeatherCache();
  state.selectedParcelleId = null;
  stopWeatherAutoRefresh();
  showAuthView('welcome');
}

// --------- Délégation d'événements (les formulaires sont injectés dynamiquement) ---------
document.addEventListener('submit', (e) => {
  if(e.target.id === 'register-form'){ e.preventDefault(); handleRegisterSubmit(e.target); }
  if(e.target.id === 'login-form'){ e.preventDefault(); handleLoginSubmit(e.target); }
});

document.addEventListener('click', (e) => {
  if(e.target.closest('#logout-btn')){ handleLogout(); return; }
  const langPill = e.target.closest('#reg-lang-row .lang-pill');
  if(langPill){
    langPill.parentElement.querySelectorAll('.lang-pill').forEach(p => p.classList.remove('active'));
    langPill.classList.add('active');
  }
});

sb.auth.onAuthStateChange((event) => {
  if(event === 'SIGNED_OUT'){ state.currentProfile = null; showAuthView('welcome'); }
});
