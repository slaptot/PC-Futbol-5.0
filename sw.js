// Service worker (solo se registra en modo móvil): caché del "shell" y de los recursos bajo demanda.
const V='pcf5-v1';
const SHELL=['./','./index.html','./css/style.css','./manifest.json',
  './js/data.js','./js/engine.js','./js/ui.js','./js/screens.js','./js/manager.js','./js/cups.js','./js/market.js','./js/training.js','./js/audio.js','./js/search.js','./js/print.js','./js/custom.js','./js/mobile.js','./js/auth.js','./js/app.js'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  const lazy=/\/(img|data|snd|fonts)\//.test(u.pathname);
  if(lazy){ // cache-first: imágenes, datos, música y fuentes no cambian
    e.respondWith(caches.open(V).then(async c=>{ const hit=await c.match(r); if(hit) return hit; const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }));
  } else { // network-first: html/js/css, con copia en caché para funcionar sin conexión
    e.respondWith(caches.open(V).then(async c=>{ try{ const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }catch(err){ const hit=await c.match(r); if(hit) return hit; throw err; } }));
  }
});
