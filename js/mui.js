// Versión móvil ("mui"): las mismas pantallas, remaquetadas en vertical para el dedo.
// Se elige al detectar un móvil (diálogo) o con ?ui=mobile / ?ui=desktop; la elección se recuerda
// y se puede cambiar desde la barra inferior (ESCRITORIO) o desde la barra de audio (MÓVIL).
let UI='desktop';
function uiPref(){ try{ const q=new URLSearchParams(location.search).get('ui'); if(q==='mobile'||q==='desktop') localStorage.setItem('pcf5_ui',q); return localStorage.getItem('pcf5_ui'); }catch(e){ return null; } }
function setUI(u){ try{ localStorage.setItem('pcf5_ui',u); }catch(e){} if(u!==UI) location.reload(); }
function muiPending(){ const p=uiPref(); return MOBILE&&p!=='mobile'&&p!=='desktop'; }
function muiDecide(){
  const p=uiPref(); if(p==='mobile'||p==='desktop'){ UI=p; return Promise.resolve(); }
  if(!MOBILE) return Promise.resolve();
  return new Promise(res=>{ dialog('VERSIÓN MÓVIL','Estás en un móvil o tableta. ¿Qué versión quieres usar?<br><br><b>Versión móvil</b>: pantallas en vertical, adaptadas al dedo.<br><b>Escritorio</b>: el juego original a 640x480, en horizontal.<br><br>Podrás cambiar de versión en cualquier momento desde la barra inferior.',
    [{t:'VERSIÓN MÓVIL',cls:'green',f:()=>{ try{ localStorage.setItem('pcf5_ui','mobile'); }catch(e){} location.reload(); }},{t:'ESCRITORIO',cls:'blue',f:()=>{ try{ localStorage.setItem('pcf5_ui','desktop'); }catch(e){} UI='desktop'; res(); }}]); });
}
function muiInit(){ // se llama tras audioInit cuando UI==='mobile'
  document.documentElement.classList.add('mui'); document.body.classList.add('mui');
  const bar=h('div',{id:'mbar'},h('div',{id:'mact'}),h('div',{class:'mrow'}));
  document.body.appendChild(bar); const row=bar.querySelector('.mrow');
  const ab=document.getElementById('audiobar'); if(ab) row.appendChild(ab);
  row.appendChild(h('div',{class:'abtn',onclick:()=>scrAvisos()},'🔔 AVISOS'));
  row.appendChild(h('div',{class:'abtn',onclick:()=>setUI('desktop')},'⇄ ESCRITORIO'));
  const scr=document.getElementById('screen'); let pend=false;
  new MutationObserver(()=>{ if(pend) return; pend=true; setTimeout(()=>{ pend=false; muiReflow(scr); },0); }).observe(scr,{childList:true,subtree:true});
  const _cs=clearScreen; clearScreen=function(){ const s=_cs(); const a=document.getElementById('mact'); if(a) a.innerHTML=''; window.scrollTo(0,0); return s; };
  fitStage();
}
function muiBarDesktop(){ // botón para pasar a la versión móvil desde el escritorio en un móvil
  if(!MOBILE||UI!=='desktop') return; const ab=document.getElementById('audiobar'); if(ab){ ab.appendChild(h('div',{class:'abtn',onclick:()=>scrAvisos()},'🔔')); ab.appendChild(h('div',{class:'abtn',onclick:()=>setUI('mobile')},'⇄ MÓVIL')); }
}
function muiPos(el){ const t=parseFloat(el.style.top), l=parseFloat(el.style.left); return [isNaN(t)?1e9:t, isNaN(l)?1e9:l]; }
function muiSort(c){ const kids=[...c.children]; const ord=kids.map((k,i)=>({k,i,p:muiPos(k),hdr:(k.classList.contains('hdr')||k.classList.contains('topbar'))?0:1}));
  ord.sort((a,b)=>a.hdr-b.hdr||Math.floor(a.p[0]/10)-Math.floor(b.p[0]/10)||a.p[1]-b.p[1]||a.i-b.i); ord.forEach(o=>c.appendChild(o.k)); }
function muiReflow(root){
  if(!root.dataset.m){ root.dataset.m=1; } muiSort(root);
  root.querySelectorAll('.panel').forEach(p=>{ if(p.dataset.m) return; p.dataset.m=1; muiSort(p); muiNavRow(p); });
  // botones sueltos de la pantalla (VOLVER, IMPRIMIR…) a la barra inferior
  const act=document.getElementById('mact'); [...root.children].forEach(el=>{ if(el.classList.contains('btn')&&!el.dataset.m){ el.dataset.m=1; act.appendChild(el); } });
  // menú principal: los textos están en la imagen de fondo; en móvil se escriben
  root.querySelectorAll('.menu-item').forEach(el=>{ if(el.dataset.m) return; el.dataset.m=1; el.textContent=el.title.replace(' (no disponible)',''); });
  root.querySelectorAll('.hot').forEach(el=>{ if(el.dataset.m) return; el.dataset.m=1; el.textContent=el.title||''; });
}

// botones < y > con el número entre ellos: una sola fila alineada
function muiNavRow(c){
  const kids=[...c.children]; const i=kids.findIndex(k=>k.classList.contains('btn')&&k.textContent.trim()==='<'); if(i<0) return;
  const j=kids.findIndex((k,idx)=>idx>i&&k.classList.contains('btn')&&k.textContent.trim()==='>'); if(j<0||j-i>3) return;
  const wrap=h('div',{class:'navrow'}); c.insertBefore(wrap,kids[i]); kids.slice(i,j+1).forEach(k=>wrap.appendChild(k));
}
