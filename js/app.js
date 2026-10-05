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
  { const s0=clearScreen(); setBg('fondo7'); } await authGate();
  const s=clearScreen(); setBg('fondo7');
  s.appendChild(at(h('div',{class:'f-e4',style:{color:'#ffe24a',textShadow:'1px 1px 0 #000'}},'CARGANDO DATOS...'),340,420));
  try { await loadData(); } catch(e){ s.appendChild(txt('Error cargando datos: '+e.message+'\nAbre la web desde un servidor HTTP (no file://).',30,440,580,30)); return; }
  audioInit();
  go('menu');
})();
