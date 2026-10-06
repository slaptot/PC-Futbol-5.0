// Service worker (se registra en todos los modos): caché del "shell", precarga y recursos bajo demanda.
const V='pcf5-v4';
const SHELL=['./','./index.html','./css/style.css','./manifest.json',
  './js/data.js','./js/engine.js','./js/ui.js','./js/screens.js','./js/manager.js','./js/cups.js','./js/market.js','./js/empleados.js','./js/finance.js','./js/training.js','./js/audio.js','./js/search.js','./js/print.js','./js/custom.js','./js/season.js','./js/mobile.js','./js/auth.js','./js/mui.js','./js/push.js','./js/app.js','./img/icon-192.png','./img/icon-512.png'];
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()).then(()=>{ fetch('./data/precache.json').then(r=>r.json()).then(warm).catch(()=>{}); })); });
// precarga: guarda en caché lo que falte de la lista (4 descargas a la vez) y avisa a las ventanas al terminar
async function warm(list){ const c=await caches.open(V); const urls=list.map(u=>new URL(u,self.registration.scope).href); let i=0;
  const worker=async()=>{ while(i<urls.length){ const u=urls[i++]; try{ if(await c.match(u)) continue; const res=await fetch(u); if(res.ok) await c.put(u,res); }catch(err){} } };
  await Promise.all([worker(),worker(),worker(),worker()]); const cs=await self.clients.matchAll({type:'window'}); cs.forEach(cl=>cl.postMessage({type:'warm-done',n:urls.length})); }
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  const lazy=/\/(img|data|snd|fonts)\//.test(u.pathname)&&!/precache\.json$/.test(u.pathname);
  if(lazy){ // cache-first: imágenes, datos, música y fuentes no cambian
    e.respondWith(caches.open(V).then(async c=>{ const hit=await c.match(r); if(hit) return hit; const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }));
  } else { // network-first: html/js/css, con copia en caché para funcionar sin conexión
    e.respondWith(caches.open(V).then(async c=>{ try{ const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }catch(err){ const hit=await c.match(r); if(hit) return hit; throw err; } }));
  }
});

// ---- precarga en segundo plano: la página manda la lista (data/precache.json) y se guarda lo que falte
self.addEventListener('message',e=>{ const d=e.data||{}; if(d.type!=='warm'||!Array.isArray(d.urls)) return;
  e.waitUntil(warm(d.urls)); });
// ---- avisos push: notificación del sistema + alerta dentro del juego
self.addEventListener('push',e=>{ let d={}; try{ d=e.data?e.data.json():{}; }catch(err){ d={body:e.data?e.data.text():''}; } const title=d.title||'PC Fútbol 5.0';
  e.waitUntil((async()=>{ const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true}); cs.forEach(c=>c.postMessage({type:'aviso',data:d}));
    await self.registration.showNotification(title,{body:d.body||'',icon:'img/icon-192.png',badge:'img/icon-192.png',data:d,tag:d.tag||'pcf5'}); })()); });
self.addEventListener('notificationclick',e=>{ e.notification.close(); const d=e.notification.data||{}; const url=new URL('./index.html',self.registration.scope).href+'?aviso='+encodeURIComponent(JSON.stringify(d));
  e.waitUntil((async()=>{ const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true}); if(cs.length){ cs[0].focus(); cs[0].postMessage({type:'aviso',data:d}); } else await self.clients.openWindow(url); })()); });
