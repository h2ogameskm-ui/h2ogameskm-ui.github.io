// Pip et les Étoiles Perdues : permet de jouer même sans connexion
const CACHE = 'pip-v1';
const FILES = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/couverture.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  // la page du jeu : d'abord internet (pour avoir les mises à jour), sinon la copie gardée
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('/', cp)); return r; }).catch(() => caches.match('/')));
    return;
  }
  // le reste (images, police) : la copie gardée, sinon internet
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque'){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })));
});
