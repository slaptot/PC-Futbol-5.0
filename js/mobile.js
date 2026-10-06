// Modo móvil: detección, apaisado forzado, adaptación táctil, PWA y exportar/importar partida.
// La web de escritorio no cambia: todo lo de aquí sólo se activa cuando MOBILE es true.
function detectMobile(){
  try{ const q=new URLSearchParams(location.search).get('mobile'); if(q==='1'||q==='0'){ localStorage.setItem('pcf5_mobile',q); } const f=localStorage.getItem('pcf5_mobile'); if(f==='1') return true; if(f==='0') return false; }catch(e){}
  const ua=navigator.userAgent; const touch=navigator.maxTouchPoints>1;
  if(/Android|iPhone|iPod|Mobile|Windows Phone/i.test(ua)) return true;
  if(/iPad/i.test(ua)||(touch&&/Macintosh/.test(ua))) return true; // iPadOS se presenta como Mac
  return touch&&Math.min(screen.width,screen.height)<=900;
}
const MOBILE=detectMobile();
function mobileInit(){
  if(!MOBILE) return;
  document.body.classList.add('mobile');
  // aviso para girar el dispositivo (sólo se ve en vertical, por CSS)
  document.body.appendChild(h('div',{id:'rotate'},h('div',{class:'ico'},'⟳'),h('div',{},'GIRA EL MÓVIL'),h('div',{class:'f-p12'},'PC Fútbol 5.0 se juega en horizontal')));
  // bloquear zoom por doble toque / pellizco y el menú contextual de la pulsación larga
  document.addEventListener('gesturestart',e=>e.preventDefault());
  document.addEventListener('contextmenu',e=>e.preventDefault());
  let lastTouch=0; document.addEventListener('touchend',e=>{ const n=Date.now(); if(n-lastTouch<300&&e.target.closest('#stage')&&!e.target.closest('tr.clk')) e.preventDefault(); lastTouch=n; },{passive:false});
  // intentar fijar el apaisado cuando la app está instalada / a pantalla completa
  const lock=()=>{ try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); }catch(e){} };
  document.addEventListener('touchend',()=>{ if(!document.body.classList.contains('mui')) lock(); },{once:true});
  // reajustar el escenario con el visor visual (barras del navegador en iOS)
  if(window.visualViewport) window.visualViewport.addEventListener('resize',fitStage);
  window.addEventListener('orientationchange',()=>setTimeout(fitStage,250));
}
// ---- precarga de imágenes y fuentes en segundo plano (data/precache.json, generado por tools/build_precache.py)
// Las guarda el service worker en su caché permanente (en todos los modos); sin él, en la caché HTTP del navegador.
async function warmCache(){
  try{ if(navigator.connection&&navigator.connection.saveData) return; }catch(e){}
  let urls; try{ urls=await fetch('data/precache.json').then(r=>r.json()); }catch(e){ return; }
  if(!Array.isArray(urls)||!urls.length) return;
  if('serviceWorker' in navigator&&location.protocol!=='file:'){ try{ const reg=await navigator.serviceWorker.ready; if(reg.active){ reg.active.postMessage({type:'warm',urls}); return; } }catch(e){} }
  const idle=cb=>(window.requestIdleCallback?requestIdleCallback(cb,{timeout:400}):setTimeout(cb,150)); // timeout: también en pestañas sin ratos libres
  let i=0; const next=()=>{ if(i>=urls.length) return; const u=urls[i++]; fetch(u,{priority:'low'}).catch(()=>{}).finally(()=>idle(next)); };
  for(let k=0;k<3;k++) idle(next);
}
// precarga puntual (fotos grandes de una plantilla, etc.): en móvil las guarda el service worker, en escritorio la caché HTTP
function prefetchImgs(urls){
  urls=(urls||[]).filter(Boolean).slice(0,80); if(!urls.length) return;
  try{ if(navigator.connection&&navigator.connection.saveData) return; }catch(e){}
  if('serviceWorker' in navigator&&navigator.serviceWorker.controller){ navigator.serviceWorker.controller.postMessage({type:'warm',urls}); return; }
  const idle=cb=>(window.requestIdleCallback?requestIdleCallback(cb,{timeout:400}):setTimeout(cb,150));
  let i=0; const next=()=>{ if(i>=urls.length) return; fetch(urls[i++],{priority:'low'}).catch(()=>{}).finally(()=>idle(next)); };
  for(let k=0;k<3;k++) idle(next);
}
function prefetchPhotos(players){ prefetchImgs((players||[]).filter(p=>p&&p.id>0).map(p=>'img/fotobig/'+p.id+'.png')); }
// ---- exportar / importar la partida (el almacenamiento del navegador móvil puede borrarse)
function exportSave(){
  const s=localStorage.getItem('pcf5_save'); if(!s) return dialog('EXPORTAR','No hay partida guardada.');
  const blob=new Blob([s],{type:'application/json'}); const url=URL.createObjectURL(blob);
  const g=JSON.parse(s); const name='pcfutbol5-'+(g.custom?g.custom.name:(team(g.team)||{}).name||'partida').replace(/[^\w]+/g,'_')+'-j'+g.jornada+'.json';
  const a=h('a',{href:url,download:name}); document.body.appendChild(a); a.click(); setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); },1000);
}
function importSave(){
  const f=h('input',{type:'file',accept:'.json,application/json',style:{display:'none'}}); document.body.appendChild(f);
  f.onchange=()=>{ const file=f.files[0]; f.remove(); if(!file) return; const fr=new FileReader(); fr.onload=()=>{ try{ const g=JSON.parse(fr.result); if(!g||!g.league||!g.team) throw new Error('formato'); localStorage.setItem('pcf5_save',JSON.stringify(g)); dialog('IMPORTAR','Partida importada. Se reinicia el juego para cargarla.',[{t:'ACEPTAR',f:()=>location.reload()}]); }catch(e){ dialog('IMPORTAR','El archivo no es una partida válida.'); } }; fr.readAsText(file); };
  f.click();
}
