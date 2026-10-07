function go(name,arg){
  closeDialog();
  switch(name){
    case 'menu': return scrMenu();
    case 'instrucciones': return scrInstrucciones();
    case 'historia': return scrHistoria();
    case 'dbase': return scrDbase();
    case 'seguimiento': return scrSeguimiento();
    case 'liga': return scrLiga();
    case 'amistoso': return scrAmistoso();
    case 'buscar': return scrBuscar();
  }
}
(async function boot(){
  mobileInit(); fitStage();
  // service worker en todos los modos: caché de la aplicación, imágenes y datos; instalación como app; avisos push
  if('serviceWorker' in navigator&&location.protocol!=='file:') navigator.serviceWorker.register('sw.js').catch(()=>{});
  const splash=document.getElementById('splash');
  const splashOff=()=>{ if(!splash||splash.dataset.off) return; splash.dataset.off=1; splash.classList.add('out'); setTimeout(()=>splash.remove(),500); };
  if(!MOBILE&&splash) splash.remove(); else if(splash){ setTimeout(()=>splash.classList.add('go'),200); setTimeout(splashOff,12000); }
  { const s0=clearScreen(); setBg('fondo7'); }
  // el splash tapa los diálogos: si hay que pedir la contraseña o elegir versión, se retira antes
  if((typeof authPending==='function'&&authPending())||(typeof muiPending==='function'&&muiPending())) splashOff();
  await authGate(); await muiDecide();
  const s=clearScreen(); setBg('fondo7');
  s.appendChild(at(h('div',{class:'f-e4',style:{color:'#ffe24a',textShadow:'1px 1px 0 #000'}},'CARGANDO DATOS...'),340,420));
  // todas las fuentes del juego se cargan antes de mostrar el menú (si no, cada pantalla nueva cambiaba de tipografía al llegar su fuente)
  const fontsReady=Promise.race([Promise.all([...document.fonts].map(f=>f.load().catch(()=>{}))), new Promise(r=>setTimeout(r,8000))]);
  try { await loadData(); await fontsReady; } catch(e){ s.appendChild(txt('Error cargando datos: '+e.message+'\nAbre la web desde un servidor HTTP (no file://).',30,440,580,30)); splashOff(); return; }
  audioInit(); if(UI==='mobile') muiInit(); else { document.body.classList.add('rot'); muiBarDesktop(); }
  if(typeof pushInit==='function') pushInit();
  splashOff();
  go('menu');
  if(typeof warmCache==='function') setTimeout(warmCache,1500);
})();
