// =========================================================
// KILTIVE AI — Point d'entrée
// 1) Injecte les composants persistants (icônes, sidebar, topbar, bottomnav)
// 2) Démarre l'authentification (qui affichera la bonne vue)
// =========================================================
import { checkExistingSession } from './auth.js';
import './modal.js'; // enregistre les écouteurs de la fenêtre modale

async function loadComponent(path, mountId){
  const res = await fetch(path);
  const html = await res.text();
  document.getElementById(mountId).innerHTML = html;
}

async function bootstrap(){
  await Promise.all([
    loadComponent('components/icons.html', 'icons-root'),
    loadComponent('components/sidebar.html', 'sidebar-root'),
    loadComponent('components/topbar.html', 'topbar-root'),
    loadComponent('components/bottomnav.html', 'bottomnav-root'),
    loadComponent('components/modal.html', 'modal-root'),
  ]);

  // Le tiroir mobile réutilise le contenu de la sidebar (marque + navigation)
  const drawer = document.getElementById('drawer');
  const sidebarBrand = document.querySelector('.sidebar-brand');
  const sidebarNav = document.getElementById('sidebar-nav');
  if(drawer && sidebarBrand && sidebarNav){
    drawer.innerHTML = sidebarBrand.outerHTML + '<nav class="sidebar-nav">' + sidebarNav.innerHTML + '</nav>';
  }

  await checkExistingSession();

  const loader = document.getElementById('boot-loader');
  if(loader) loader.classList.add('hidden');
}

bootstrap();
