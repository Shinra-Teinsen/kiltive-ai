// =========================================================
// KILTIVE AI — Météo réelle (Open-Meteo, sans clé API)
// =========================================================
import { state } from './state.js';

const WEATHER_REFRESH_MS = 10 * 60 * 1000; // 10 minutes

function getBrowserLocation(){
  return new Promise((resolve, reject) => {
    if(!navigator.geolocation){ reject(new Error('no geoloc')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'gps' }),
      () => reject(new Error('denied')),
      { timeout: 6000 }
    );
  });
}

async function geocodeLocation(text){
  const city = (text || '').split(',')[0].trim();
  if(!city) throw new Error('no location text');
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`);
  const json = await res.json();
  if(!json.results || !json.results.length) throw new Error('city not found');
  const r = json.results[0];
  return { lat: r.latitude, lon: r.longitude, source: 'profil', label: r.name };
}

async function resolveCoords(){
  try{
    return await getBrowserLocation();
  }catch(e){
    if(state.currentProfile && state.currentProfile.location){
      try{ return await geocodeLocation(state.currentProfile.location); }
      catch(e2){ /* échec géocodage -> fallback plus bas */ }
    }
    return { lat: 18.5944, lon: -72.3074, source: 'défaut', label: 'Port-au-Prince' };
  }
}

function weatherCodeInfo(code){
  if([0].includes(code)) return { icon:'i-sun', label:'Ensoleillé' };
  if([1,2].includes(code)) return { icon:'i-sun', label:'Peu nuageux' };
  if([3].includes(code)) return { icon:'i-cloud', label:'Couvert' };
  if([45,48].includes(code)) return { icon:'i-cloud', label:'Brumeux' };
  if([51,53,55,61,63,65,80,81,82].includes(code)) return { icon:'i-cloud-rain', label:'Pluvieux' };
  if([95,96,99].includes(code)) return { icon:'i-warning', label:'Orageux' };
  return { icon:'i-cloud', label:'Variable' };
}

function frenchDayLabel(dateStr, index){
  if(index === 0) return "Aujourd'hui";
  const d = new Date(dateStr + 'T12:00:00');
  const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return label.charAt(0).toUpperCase() + label.slice(1).replace('.', '');
}

function buildWeatherTips(data){
  const current = data.current;
  const tips = [];
  const rainProbTomorrow = data.daily.precipitation_probability_max[1];
  const rainProbToday = data.daily.precipitation_probability_max[0];
  if(rainProbTomorrow >= 50){
    tips.push({icon:'i-cloud-rain', warn:true, title:'Pluie probable demain', sub:`${rainProbTomorrow}% de risque — évitez l'engrais aujourd'hui`});
  }
  if(rainProbToday < 30){
    tips.push({icon:'i-droplet', warn:false, title:'Arrosez tôt le matin', sub:'Peu de pluie prévue aujourd\'hui'});
  } else {
    tips.push({icon:'i-cloud-rain', warn:true, title:'Reportez l\'arrosage', sub:`${rainProbToday}% de risque de pluie aujourd'hui`});
  }
  if(current.wind_speed_10m >= 25){
    tips.push({icon:'i-wind', warn:true, title:'Vent soutenu', sub:`${Math.round(current.wind_speed_10m)} km/h — protégez les jeunes plants`});
  }
  if(current.temperature_2m >= 32){
    tips.push({icon:'i-sun', warn:true, title:'Forte chaleur', sub:`${Math.round(current.temperature_2m)}°C — pensez à pailler le sol`});
  }
  if(!tips.length){
    tips.push({icon:'i-check', warn:false, title:'Conditions stables', sub:'Rien de particulier à signaler aujourd\'hui'});
  }
  return tips;
}

export async function loadWeatherWidgets(){
  const noteEl = document.getElementById('weather-source-note');
  const tipsEl = document.getElementById('accueil-weather-tips');
  if(!noteEl || !tipsEl) return; // le panneau Accueil n'est pas affiché actuellement
  try{
    if(!state.cachedCoords){ state.cachedCoords = await resolveCoords(); }
    const coords = state.cachedCoords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&daily=weather_code,precipitation_probability_max,temperature_2m_max` +
      `&forecast_days=5&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    state.lastWeatherData = data;
    state.lastWeatherCoords = coords;

    const current = data.current;
    const info = weatherCodeInfo(current.weather_code);

    const pill = document.querySelector('.weather-pill');
    if(pill){
      pill.querySelector('svg use').setAttribute('href', '#' + info.icon);
      pill.querySelector('b').textContent = Math.round(current.temperature_2m) + '°C';
      pill.querySelector('span').textContent = info.label;
    }

    const tips = buildWeatherTips(data);
    tipsEl.innerHTML = tips.slice(0, 2).map(t => `
      <div class="mini-row">
        <div class="mini-ic ${t.warn ? 'warn' : ''}"><svg class="icon sm"><use href="#${t.icon}"/></svg></div>
        <div class="mini-txt"><b>${t.title}</b><span>${t.sub}</span></div>
      </div>`).join('');

    noteEl.textContent = `Météo en direct — ${coords.label || (state.currentProfile && state.currentProfile.location) || 'votre position'} · mise à jour ${new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}`;
    state.lastWeatherFetch = Date.now();

    const meteoTemp = document.getElementById('meteo-temp');
    if(meteoTemp) renderFullWeatherPage();
  }catch(e){
    console.warn('Erreur météo :', e);
    noteEl.textContent = "Météo indisponible pour le moment.";
    tipsEl.innerHTML = `<div class="empty-state">Impossible de charger la météo. Vérifiez votre connexion.</div>`;
  }
}

export function maybeRefreshWeather(){
  if(!state.lastWeatherFetch || (Date.now() - state.lastWeatherFetch > WEATHER_REFRESH_MS)){
    loadWeatherWidgets();
  }
}

// --------- Page Météo complète (réutilise les données déjà chargées) ---------
export async function renderFullWeatherPage(){
  if(!document.getElementById('meteo-temp')) return; // page pas affichée
  if(!state.lastWeatherData){ await loadWeatherWidgets(); }
  if(!state.lastWeatherData) return;

  const data = state.lastWeatherData;
  const coords = state.lastWeatherCoords;
  const current = data.current;
  const info = weatherCodeInfo(current.weather_code);

  document.getElementById('meteo-loc').innerHTML =
    `<svg class="icon sm"><use href="#i-pin"/></svg>${coords.label || (state.currentProfile && state.currentProfile.location) || 'Votre position'}`;
  document.getElementById('meteo-temp').innerHTML =
    `<svg class="icon lg"><use href="#${info.icon}"/></svg>${Math.round(current.temperature_2m)}°C`;
  document.getElementById('meteo-desc').textContent =
    `${info.label}, ressenti ${Math.round(current.apparent_temperature)}°C`;

  document.getElementById('meteo-forecast-row').innerHTML = data.daily.time.map((date, i) => {
    const dinfo = weatherCodeInfo(data.daily.weather_code[i]);
    return `<div class="fday">${frenchDayLabel(date, i)}<svg class="icon sm"><use href="#${dinfo.icon}"/></svg>${Math.round(data.daily.temperature_2m_max[i])}°</div>`;
  }).join('');

  const rainZone = document.getElementById('meteo-rain-alert-zone');
  const rainProbTomorrow = data.daily.precipitation_probability_max[1];
  if(rainProbTomorrow >= 50){
    rainZone.innerHTML = `
      <div class="rain-alert">
        <svg class="icon"><use href="#i-cloud-rain"/></svg>
        <p><b>Alerte pluie</b>${rainProbTomorrow}% de risque de pluie demain (${frenchDayLabel(data.daily.time[1],1)}). Évitez l'engrais aujourd'hui.</p>
      </div>`;
  } else {
    rainZone.innerHTML = '';
  }

  const tips = buildWeatherTips(data);
  document.getElementById('meteo-reco-list').innerHTML = tips.map(t => `
    <div class="reco-card"><div class="mini-ic ${t.warn ? 'warn' : ''}"><svg class="icon sm"><use href="#${t.icon}"/></svg></div><div class="mini-txt"><b>${t.title}</b><span>${t.sub}</span></div></div>`).join('');
}

// --------- Cycle de vie (démarré/arrêté par auth.js à la connexion/déconnexion) ---------
export function startWeatherAutoRefresh(){
  stopWeatherAutoRefresh();
  state.weatherIntervalId = setInterval(() => loadWeatherWidgets(), WEATHER_REFRESH_MS);
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

export function stopWeatherAutoRefresh(){
  if(state.weatherIntervalId){ clearInterval(state.weatherIntervalId); state.weatherIntervalId = null; }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}

export function resetWeatherCache(){
  state.cachedCoords = null;
  state.lastWeatherData = null;
  state.lastWeatherFetch = 0;
}

function handleVisibilityChange(){
  if(document.visibilityState === 'visible'){ maybeRefreshWeather(); }
}
