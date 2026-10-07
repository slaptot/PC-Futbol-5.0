// LIGA MANAGER (seis ligas: España, Inglaterra, Italia)
let G=null; // partida
function saveGame(){ if(G) localStorage.setItem('pcf5_save',JSON.stringify(G)); }
function loadGame(){ try{ const s=localStorage.getItem('pcf5_save'); const g=s?JSON.parse(s):null; return (g&&g.league&&DATA.leagues[g.league]&&(team(g.team)||(g.custom&&g.team===CUSTOM_ID)))?g:null; }catch(e){ return null; } }
function newGame(tid){
  const t=team(tid); const lg=t.league;
  G={team:tid,league:lg,jornada:1,formation:'4-4-2',lineup:bestLineup(t,'4-4-2'),results:{},season:'96-97'}; if(typeof retiredTeam==='function') retiredTeam();
  LEAGUE_ORDER.forEach(k=>G.results[k]=[]);
  G.cups=buildCups(); G.sched=buildSchedule(); G.step=0; G.budget=initBudget(t); G.inj={}; G.transfers=[]; G.training={fis:2,fue:1,tec:2,rem:2,def:2,por:1}; G.mods={}; G.stats={}; G.contracts={}; G.schedVer=2; snapshotBase(); marketInit(); tvOffersInit();
  saveGame();
}
function gameDate(){ return eventDate(curEvent()); }
function calOf(k){ return (G&&G.cal&&G.cal[k])?G.cal[k]:calAliased(k); }
function myResults(k){ return (G.results[k||G.league]||[]).flat().filter(Boolean); }
function nextMatch(){ const cal=calOf(G.league); if(G.jornada>cal.length) return null; return cal[G.jornada-1].find(m=>m[0]===G.team||m[1]===G.team); }
function refFor(hm){ return DATA.referees[(G.jornada*7+hm.id)%DATA.referees.length]; }

function scrLiga(){
  const saved=loadGame();
  if(saved){ const st=team(saved.team); const sname=st?st.name:(saved.custom&&saved.custom.name)||'Equipo propio'; dialog('LIGA MANAGER','Hay una partida guardada: '+sname+' ('+league(saved.league).name+'), jornada '+saved.jornada+'.',[{t:'CONTINUAR',cls:'green',f:()=>{G=saved; migrateBajas(); applyCustomTeam(); if(typeof applyYouth==='function') applyYouth(); if(typeof applyGenerated==='function') applyGenerated(); applySeasonState(); applyTransfers(); applyMods(); migrateGame(); saveGame(); if(typeof prefetchPhotos==='function') setTimeout(()=>prefetchPhotos(team(G.team).players),2000); scrOficina();}},{t:'NUEVA PARTIDA',cls:'red',f:()=>{ if(customActive()){ localStorage.removeItem('pcf5_save'); location.reload(); return; } scrSelectTeam(); }}]); return; }
  scrSelectTeam();
}
function scrSelectTeam(state){
  setMusic('manager');
  state=state||{lg:'ESP1'}; const lg=state.lg; setBg('seleccion_fondo'); const s=clearScreen();
  s.appendChild(topbar({title:'ELIGE TU EQUIPO',right:league(lg).name}));
  const teams=teamsOfLeague(lg); let sel=state.sel||teams[0].id; const MUI=(typeof UI!=='undefined'&&UI==='mobile'); let picked=!MUI||!!state.sel; let elegir=null;
  if(MUI){ const LP=panel(10,40,620,30); s.appendChild(LP); LEAGUE_ORDER.forEach((k,i)=>LP.appendChild(btn(LEAGUE_SHORT[k],10+i*104,0,100,()=>scrSelectTeam({lg:k}),k===lg?'green':'blue'))); }
  const P=panel(10,70,340,340); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},league(lg).long.toUpperCase()+' 96-97'));
  const grid=at(h('div',{class:'teamlist'}),4,22,332,310); P.appendChild(grid);
  const render=()=>{ grid.innerHTML=''; teams.forEach(t=>grid.appendChild(h('div',{class:t.id===sel?'sel':'',onclick:()=>{sel=t.id; picked=true; render(); info(); if(MUI){ if(elegir) elegir.classList.remove('dis'); requestAnimationFrame(()=>window.scrollTo({top:I.getBoundingClientRect().top+window.scrollY-64,behavior:'smooth'})); }}},h('img',{src:escImg(t.id,'ridi')}),t.name))); };
  const I=panel(360,70,270,340); s.appendChild(I);
  const info=()=>{ const t=team(sel); I.innerHTML=''; I.appendChild(h('div',{class:'hdr'},t.name.toUpperCase()));
    I.appendChild(at(h('img',{src:escImg(sel,'big'),style:{maxHeight:'80px',maxWidth:'80px'},onerror:function(){this.src=escImg(sel)}}),12,26));
    I.appendChild(at(h('img',{src:'img/cam/'+sel+'.png',style:{width:'73px',height:'38px'},onerror:function(){this.style.display='none'}}),180,30));
    const st=standingsAll(t);
    { const it=txt([t.full,'Estadio: '+t.stadium+' ('+fmtNum(t.capacity)+')','Fundado en '+t.founded,'Entrenador: '+t.coach.name,'Presidente: '+(t.president||'-'),'Media '+st.me+' · '+t.players.length+' jugadores · 95-96: '+(t.positions&&t.positions.length?posName(t):'-')].join('\n'),12,116,250,130,'f-p8'); it.style.lineHeight='12px'; it.style.overflow='hidden'; I.appendChild(it); }
    I.appendChild(at(h('img',{src:campoImg(t),style:{width:'108px',height:'76px'},onerror:function(){this.style.display='none'}}),12,250));
    if(!MUI) I.appendChild(btn('ELEGIR',150,300,110,()=>{ newGame(sel); scrOficina(); },'green'));
  };
  render(); info();
  if(!MUI) LEAGUE_ORDER.forEach((k,i)=>s.appendChild(btn(LEAGUE_SHORT[k],10+i*104,420,100,()=>scrSelectTeam({lg:k}),k===lg?'green':'blue')));
  if(MUI){ elegir=btn('ELEGIR',200,446,120,()=>{ if(!picked) return; newGame(sel); scrOficina(); },'green'+(picked?'':' dis')); s.appendChild(elegir); }
  s.appendChild(btn('CREAR EQUIPO',10,446,140,()=>scrCrearEquipo({st:{name:'',league:lg,replaced:null,picked:[],filter:'POR',q:''}}),'green'));
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
function posName(t){ const p=t.positions[t.positions.length-1]; return p>=100?'2ª B':p+'º'; }
function standingsAll(t){ const l=bestLineup(t,'4-4-2'); const me=Math.round(l.reduce((a,x)=>a+t.players[x.idx].me,0)/Math.max(1,l.length)); return {me}; }

// ---- oficina (menú del manager)
function scrOficina(){
  setMusic('manager');
  const t=team(G.team); setBg('fondo0'); const s=clearScreen();
  const ev=curEvent(); const fin=!ev; const nm=(ev&&ev.type==='liga')?nextMatch():null;
  s.appendChild(topbar({team:t,title:'LIGA MANAGER',date:gameDate(),sub:fin?'TEMPORADA FINALIZADA':eventLabel(ev)+' · '+league(G.league).name.toUpperCase()}));
  const P=panel(10,70,300,370); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},ev&&ev.type==='cup'?cupName(ev.cup).toUpperCase():'PRÓXIMO PARTIDO'));
  const ms=G.lineup.length===11&&!lineupHasInjured();
  if(ev&&ev.type==='cup'){ const c=G.cups[ev.cup]; const inCup=userInCup(ev.cup); const round=c.rounds[ev.round];
    const mine=round&&round.ties.find(x=>x.a===G.team||x.b===G.team);
    if(inCup){ P.appendChild(txt(CUP_DEFS[ev.cup].rounds[ev.round]+(mine?'':' · SORTEO PENDIENTE'),8,30,284,16,'f-e5'));
      if(mine){ const riv=mine.a===G.team?mine.b:mine.a; const rt=team(riv); P.appendChild(at(h('img',{src:escImg(rt.id),style:{height:'64px'}}),120,52)); P.appendChild(txt('Rival: '+rt.name+'\n'+(round.venue?'FINAL en el '+team(round.venue).stadium+' (campo neutral)\nEntrada: '+fmtNum(round.price)+' ptas · taquilla al 50 %':(round.nlegs>1?'Eliminatoria a doble partido · '+(mine.legs.length?'VUELTA':'IDA')+(tieLeg(mine,mine.legs.length,2)[0]===G.team?' en casa':' fuera')+(mine.legs.length?'\nIda: '+team(mine.legs[0].home).name+' '+mine.legs[0].gh+'-'+mine.legs[0].ga+' '+team(mine.legs[0].away).name:''):'Partido único')),8,124,284,44,'f-p12')); }
      else P.appendChild(txt('Tu equipo sigue en la competición. El sorteo se hará al jugar la ronda.',8,60,284,40,'f-p12'));
    } else P.appendChild(txt('Tu equipo no participa en esta ronda. Se simulará la eliminatoria del resto de equipos.',8,40,284,40,'f-p12'));
    P.appendChild(btn(ms?'JUGAR '+CUP_DEFS[ev.cup].rounds[ev.round]+(mine&&round.nlegs>1&&!mine.winner?(mine.legs.length?' · VUELTA':' · IDA'):''):(G.lineup.some(l=>isInjured(G.team,l.idx))?'LESIONADOS EN EL ONCE':lineupHasInjured()?'SANCIONADOS EN EL ONCE':'ALINEACIÓN INCOMPLETA'),40,230,220,()=>ms?playCupEvent(ev):scrAlineacion(),ms?'green':'red','icono_balon_de_la_b'));
  } else if(nm){ const hm=team(nm[0]), aw=team(nm[1]);
    if(typeof UI!=='undefined'&&UI==='mobile'){ P.appendChild(h('div',{class:'nextm',style:{top:'30px'}},h('div',{class:'side'},h('img',{src:escImg(hm.id)}),h('div',{class:'nm'},hm.name)),h('div',{class:'vs f-e1'},'-'),h('div',{class:'side'},h('img',{src:escImg(aw.id)}),h('div',{class:'nm'},aw.name)))); }
    else {
    P.appendChild(at(h('img',{src:escImg(hm.id),style:{height:'64px'}}),30,30)); P.appendChild(at(h('img',{src:escImg(aw.id),style:{height:'64px'}}),210,30));
    P.appendChild(txt(hm.name,8,100,110,16,'f-e5')); P.appendChild(txt(aw.name,190,100,110,16,'f-e5'));
    P.appendChild(txt('-',140,56,20,20,'f-e1')); }
    { const et=txt('Estadio: '+hm.stadium+'\nAforo: '+fmtNum(hm.capacity)+'\nÁrbitro: '+refName(refFor(hm)),8,122,284,36,'f-p8'); et.style.lineHeight='11px'; P.appendChild(et); }
    const st=standings(mgrIds(G.league),myResults()); const pos=st.findIndex(x=>x.id===G.team)+1; const rp=st.findIndex(x=>x.id===(nm[0]===G.team?nm[1]:nm[0]))+1;
    P.appendChild(txt('Clasificación: tu equipo '+pos+'º · rival '+rp+'º.',8,160,284,12,'f-p8'));
    // informe del asistente (empleado): botón que abre un diálogo con el once probable del rival
    if(typeof empStars==='function'&&empStars('asistente')>0){ const rv=team(nm[0]===G.team?nm[1]:nm[0]); P.appendChild(btn('INFORME DEL RIVAL',40,184,220,()=>{ const st=empStars('asistente'); const bl=bestLineup(rv,'4-4-2'); const ps=bl.map(l=>rv.players[l.idx]); const best=ps.slice().sort((a,b)=>b.me-a.me).slice(0,st>=3?3:1);
      const lastR=(G.results[rv.league]||G.results[G.league]||[]).slice(-5).flat().filter(r=>r&&(r.home===rv.id||r.away===rv.id)).map(r=>team(r.home).name+' '+r.gh+'-'+r.ga+' '+team(r.away).name);
      const b=h('div',{}); b.appendChild(h('div',{style:{marginBottom:'4px'}},'Once probable del '+rv.name+' (4-4-2), media '+lineupME(rv,bl)+'.')); b.appendChild(h('div',{style:{marginBottom:'4px'}},'Jugadores clave: '+best.map(p=>p.name+' ('+p.me+', '+ROLES_SHORT[p.roles[0]]+')').join(', ')+'.'));
      if(st>=2) b.appendChild(h('div',{style:{marginBottom:'4px'}},'Portero: '+(ps.find(p=>p.dem==='POR')||{name:'-'}).name+' · Defensa media '+Math.round(ps.filter(p=>p.dem==='DEF').reduce((a,p)=>a+p.me,0)/Math.max(1,ps.filter(p=>p.dem==='DEF').length))+' · Ataque media '+Math.round(ps.filter(p=>p.dem==='DEL').reduce((a,p)=>a+p.me,0)/Math.max(1,ps.filter(p=>p.dem==='DEL').length))+'.'));
      if(st>=4&&lastR.length) b.appendChild(h('div',{},'Últimos resultados: '+lastR.join(' · ')+'.'));
      if(st<5) b.appendChild(h('div',{class:'f-m8',style:{marginTop:'6px',color:'#9fb4e8'}},'Un asistente con más estrellas da más detalles.'));
      dialog('INFORME DEL ASISTENTE',b,[{t:'ACEPTAR'}]); },'blue','lupa')); }
    P.appendChild(btn(ms?'JUGAR JORNADA '+G.jornada:(G.lineup.some(l=>isInjured(G.team,l.idx))?'LESIONADOS EN EL ONCE':lineupHasInjured()?'SANCIONADOS EN EL ONCE':'ALINEACIÓN INCOMPLETA'),40,230,220,()=>ms?scrPartido():scrAlineacion(),ms?'green':'red','icono_balon_de_la_b'));
  } else { P.appendChild(txt('La temporada ha terminado. Repasa los campeones, los ascensos y descensos y empieza la siguiente.',8,30,284,60,'f-p12')); P.appendChild(btn('FIN DE TEMPORADA',40,230,220,()=>scrFinTemporada(0),'green','ico_liga')); }
  const last=(G.results[G.league]||[]).slice(-5).flat().filter(r=>r&&(r.home===G.team||r.away===G.team));
  P.appendChild(lbl('ÚLTIMOS RESULTADOS',8,268));
  last.forEach((r,i)=>P.appendChild(txt(team(r.home).name+' '+r.gh+' - '+r.ga+' '+team(r.away).name,8,284+i*14,284,14,'f-con')));
  const M=panel(320,70,310,370); s.appendChild(M); M.appendChild(h('div',{class:'hdr'},'OFICINA'));
  const sib=SIBLING[G.league];
  // oficina agrupada: PARTIDO · PLANTILLA · CLUB · COMPETICIÓN · PARTIDA, dentro de un bloque con scroll
  const rival=nm?team(nm[0]===G.team?nm[1]:nm[0]):null;
  const save=()=>{saveGame(); if(MOBILE) dialog('GUARDAR','Partida guardada en el navegador. En el móvil conviene exportarla a un archivo de vez en cuando: el navegador puede borrar el almacenamiento.',[{t:'ACEPTAR'},{t:'EXPORTAR',cls:'green',f:exportSave},{t:'IMPORTAR',cls:'blue',f:importSave}]); else dialog('GUARDAR','Partida guardada en el navegador.');};
  const nueva=()=>dialog('NUEVA PARTIDA','¿Abandonar la partida actual?',[{t:'SÍ',cls:'red',f:()=>{localStorage.removeItem('pcf5_save'); if(customActive()||G.leagueMoves){ location.reload(); return; } scrSelectTeam();}},{t:'NO'}]);
  const groups=[
    ['PARTIDO',[['ALINEACIÓN',()=>scrAlineacion(),'ico_alineacion'],['TÁCTICA',()=>scrTactica(),'ico_terreno'],['VER RIVAL',()=>rival?scrDbTeam(rival.id,{back:()=>scrOficina()}):scrClasif({lg:sib}),'lupa']]],
    ['PLANTILLA',[['ENTRENAR',()=>scrEntrenamiento(),'ico_terreno'],['LESIONADOS',()=>scrLesionados(()=>scrOficina()),'ico_incidencias'],['FICHAJES',()=>scrFichajes(),'nuevo_fichaje'],['JÓVENES PROMESAS',()=>scrJuveniles(),'ico_alineacion']]],
    ['CLUB',[['FINANZAS',()=>scrFinanzas(),'ico_entrada'],['EMPLEADOS',()=>scrEmpleados(),'ico_salaprensa'],['CLUB Y ESTADIO',()=>scrDbTeam(G.team,{back:()=>scrOficina()}),'ico_estadio']]],
    ['COMPETICIÓN',[['CLASIFICACIÓN',()=>scrClasif(),'ico_liga'],['CALENDARIO',()=>scrCalendario(),'calendario'],['COMPETICIONES',()=>scrCompeticiones(),'ico_coparey'],['ESTADÍSTICAS',()=>scrEstadisticas(),'ico_golea'],['GOLEADORES',()=>scrGoleadores(),'ico_golea'],['INFO',()=>infoClub(),'ayuda0']]],
  ];
  const box=at(h('div',{class:'scroll'}),0,18,306,312); box.style.overflow='hidden'; M.appendChild(box); let y=4;
  // PARTIDA: fila fija al pie del panel (escritorio); en móvil fluye tras los grupos
  const row=[['GUARDAR',save,'blue'],['OPCIONES',()=>scrOpciones(),'blue'],['NUEVA',nueva,'red'],['MENÚ',()=>{saveGame(); go('menu');},'blue']];
  { const L=lbl('PARTIDA',16,334); L.style.color='#ffe24a'; M.appendChild(L); row.forEach((it,i)=>M.appendChild(btn(it[0],82+i*54,332,52,it[1],it[2]))); }
  groups.forEach(g=>{ const L=lbl(g[0],16,y); L.style.color='#ffe24a'; L.style.fontSize='12px'; box.appendChild(L); y+=13;
    g[1].forEach((it,i)=>{ box.appendChild(btn(it[0],16+(i%2)*140,y+Math.floor(i/2)*24,130,it[1],it[3]||'blue',it[2])); }); y+=Math.ceil(g[1].length/2)*24+3; });
  // INFO (grupo COMPETICIÓN): resumen del club en un diálogo
  function infoClub(){ const nS=typeof suspendedOf==='function'?suspendedOf(G.team).length:0; const b=h('div',{}); const line=(k,v)=>b.appendChild(h('div',{class:'injrow'},h('span',{},k),h('span',{style:{color:'#ffe24a'}},v)));
    line('Club',t.name+' · '+league(G.league).long+' '+(G.season||'96-97')); line('Presupuesto',fmtNum(G.budget||0)+' millones'); line('Lesionados',String(injuredOf(G.team).length)); line('Sancionados',String(nS));
    if(typeof teamMoral==='function'){ line('Moral del equipo',teamMoral(t)+' ('+moralText(teamMoral(t))+')'); line('Estado de forma',teamForma(t)+' ('+formaText(teamForma(t))+')'); }
    if(G.emp&&typeof empWagesWeek==='function') line('Empleados',Object.keys(G.emp.hired).length+'/8 · '+fmtNum(empWagesWeek())+' M por jornada');
    if(G.youth&&typeof youthState==='function') line('Jóvenes promesas',G.youth.squad.length+' en formación'+(G.youth.search?' · ojeador buscando':'')+(G.youth.found&&G.youth.found.length?' · '+G.youth.found.length+' informes':''));
    line('Plantilla',t.players.length+' jugadores · media '+lineupME(t,G.lineup)); if(G.tv&&typeof tvKind==='function') line('Televisión',tvKind(G.tv));
    dialog('INFORMACIÓN DEL CLUB',b,[{t:'CERRAR'}]); }
  if(G.seasonNews&&G.seasonNews.length){ const n=G.seasonNews; G.seasonNews=null; saveGame(); setTimeout(()=>dialog('PLANTILLA · NUEVA TEMPORADA',n.join('<br><br>'),[{t:'ACEPTAR',f:()=>scrOficina()}]),50); return; }
  if(G.tvOffers&&!G.tv&&!fin) setTimeout(()=>scrTvOffers(()=>scrOficina()),50);
}
// ---- clasificación
function scrClasif(state){
  state=state||{}; const lg=state.lg||G.league; const t=team(G.team); setBg('fondo0'); const s=clearScreen();
  const results=myResults(lg); const st=standings(mgrIds(lg),results);
  s.appendChild(topbar({team:t,title:'CLASIFICACIÓN',date:gameDate(),sub:league(lg).long.toUpperCase()+' · JORNADA '+Math.max(1,G.jornada-1)}));
  const P=panel(10,68,440,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},league(lg).long.toUpperCase()));
  const sc=at(h('div',{class:'scroll'}),0,18,436,352); P.appendChild(sc);
  sc.appendChild(standingsTable(st,G.team,{onRow:r=>scrDbTeam(r.id,{back:()=>scrClasif(state)})}));
  const R=panel(460,68,170,372); s.appendChild(R);
  R.appendChild(at(h('img',{src:escImg(G.team,'big'),style:{maxHeight:'96px',maxWidth:'90px'},onerror:function(){this.src=escImg(G.team)}}),40,14));
  const sib=SIBLING[G.league];
  LEAGUE_ORDER.forEach((k,i)=>R.appendChild(btn(LEAGUE_SHORT[k],14,118+i*22,140,()=>scrClasif({lg:k}),lg===k?'green':'blue')));
  R.appendChild(btn('GOLEADORES',14,258,140,()=>scrGoleadores(),'blue','ico_golea'));
  R.appendChild(btn('CALENDARIO',14,282,140,()=>scrCalendario({lg}),'blue','calendario'));
  const me=st.find(x=>x.id===G.team); if(me&&lg===G.league) { const pt=txt((st.indexOf(me)+1)+'º · '+me.pts+' ptos · '+me.gf+'-'+me.gc,14,308,140,14,'f-m8'); pt.style.whiteSpace='nowrap'; pt.style.overflow='hidden'; pt.style.textAlign='center'; pt.style.color='#ffe24a'; pt.style.fontFamily='micro8'; pt.style.fontSize='10px'; pt.style.lineHeight='12px'; R.appendChild(pt); }
  R.appendChild(btn('VOLVER',14,338,140,()=>scrOficina(),'blue','ico_volver'));
}
function scrGoleadores(){
  const t=team(G.team); setBg('fondo0'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'GOLEADORES',date:gameDate(),sub:league(G.league).long.toUpperCase()}));
  const P=panel(10,68,440,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'MÁXIMOS GOLEADORES'));
  const sc=at(h('div',{class:'scroll'}),0,18,436,352); P.appendChild(sc);
  const top=topScorers(myResults(),40);
  sc.appendChild(table([{t:'POS',w:30,cls:'c',k:(r,i)=>i+1},{t:'',w:36,k:r=>h('img',{src:'img/foto/'+team(r.team).players[r.idx].id+'.png',style:{width:'32px',height:'32px'},onerror:function(){this.style.visibility='hidden'}})},{t:'JUGADOR',k:r=>team(r.team).players[r.idx].name},{t:'EQUIPO',k:r=>team(r.team).name},{t:'GOLES',w:50,cls:'r',k:r=>r.goals,cell:()=>'y'}],top,{rowClass:r=>r.team===G.team?'me':'',onRow:r=>scrFicha(r.team,r.idx,()=>scrGoleadores())}));
  s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
// ---- calendario
function scrCalendario(state){
  state=state||{}; const t=team(G.team); const lg=state.lg||G.league; const cal=calOf(lg); const j=state.j||Math.min(G.jornada,cal.length);
  setBg('fondo0'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'CALENDARIO',date:mgrDate(lg,j),sub:'JORNADA '+j+' · '+league(lg).long.toUpperCase()}));
  const P=panel(10,68,440,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'JORNADA '+j+(j<G.jornada?' - RESULTADOS':' - PARTIDOS')));
  const res=(G.results[lg]||[])[j-1]||[];
  const rows=cal[j-1].map((m,i)=>{const r=res[i]; return {h:team(m[0]),a:team(m[1]),r};});
  const sc=at(h('div',{class:'scroll'}),0,20,436,340); P.appendChild(sc);
  sc.appendChild(table([{t:'',w:16,k:r=>h('img',{src:escImg(r.h.id,'ridi'),style:{height:'14px'}})},{t:'LOCAL',k:r=>r.h.name},{t:'',w:50,cls:'c',k:r=>r.r?r.r.gh+' - '+r.r.ga:'-',cell:()=>'y'},{t:'VISITANTE',k:r=>r.a.name},{t:'',w:16,k:r=>h('img',{src:escImg(r.a.id,'ridi'),style:{height:'14px'}})},{t:'',w:60,cls:'c',k:r=>r.r&&r.r.events?'VER':'',cell:()=>'grey'}],rows,{rowClass:r=>(r.h.id===G.team||r.a.id===G.team)?'me':'',onRow:r=>r.r&&r.r.events&&scrResumen(r.r,()=>scrCalendario(state))}));
  const R=panel(460,68,170,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'JORNADAS'));
  R.appendChild(btn('<',14,30,40,()=>scrCalendario({lg,j:Math.max(1,j-1)}),'blue')); R.appendChild(btn('>',112,30,40,()=>scrCalendario({lg,j:Math.min(cal.length,j+1)}),'blue'));
  { const jn=txt(String(j),54,32,58,16,'f-e4'); jn.style.textAlign='center'; R.appendChild(jn); } R.appendChild(btn('ACTUAL',14,58,140,()=>scrCalendario({lg}),'blue'));
  const sib=SIBLING[G.league]; const other=lg===G.league?sib:G.league;
  R.appendChild(btn(league(other).name,14,100,140,()=>scrCalendario({lg:other}),'blue','ico_liga'));
  R.appendChild(btn('VOLVER',14,330,140,()=>scrOficina(),'blue','ico_volver'));
}
function scrResumen(r, back){
  const hm=team(r.home), aw=team(r.away); setBg('fondo3'); const s=clearScreen();
  s.appendChild(topbar({team:team(G.team),title:'RESUMEN',date:gameDate(),sub:hm.name+' '+r.gh+' - '+r.ga+' '+aw.name}));
  const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},hm.name.toUpperCase()+' '+r.gh+' - '+r.ga+' '+aw.name.toUpperCase()));
  P.appendChild(at(h('img',{src:escImg(hm.id),style:{height:'64px'}}),20,30)); P.appendChild(at(h('img',{src:escImg(aw.id),style:{height:'64px'}}),530,30));
  P.appendChild(txt('Estadio: '+hm.stadium+'   Espectadores: '+fmtNum(r.att||0),100,40,420,16,'f-p12'));
  const ev=at(h('div',{class:'scroll'}),20,100,580,260); P.appendChild(ev);
  if(!r.events.length) ev.appendChild(h('div',{class:'ev'},'Sin incidencias destacables.'));
  r.events.forEach(e=>ev.appendChild(eventLine(e,hm,aw)));
  s.appendChild(btn('VOLVER',540,446,90,back,'blue','ico_volver'));
}
function eventLine(e,hm,aw){
  const tn=(e.side==='H'?hm:aw).name; const po=e.player.name?e.player:(team(e.player.team)||{players:[]}).players[e.player.idx]; const p=po?po.name:'?';
  // foto en miniatura del jugador (img/foto, precargada); si no hay, se oculta
  const ph=po&&po.id>0?h('img',{class:'evph',src:'img/foto/'+po.id+'.png',alt:'',onerror:function(){ this.style.display='none'; }}):null;
  const line=(cls,text)=>{ const d=h('div',{class:'ev '+cls}); if(ph) d.appendChild(ph); d.appendChild(h('span',{},text)); return d; };
  if(e.type==='goal') return line('goal',"⚽ "+e.min+"' GOL de "+p+" ("+tn+")  "+e.score[0]+"-"+e.score[1]);
  const line2=(cls,ico,text)=>{ const d=line(cls,text); d.insertBefore(icoImg(ico,12),d.lastChild); return d; };
  if(e.type==='injury') return line2('red','ico_lesion',e.min+"' Lesionado "+p+" ("+tn+")"+(e.kind?': '+e.kind.toLowerCase():'')+" · "+e.weeks+(e.weeks===1?' semana':' semanas'));
  if(e.type==='sub') return line('sub',"⇄ "+e.min+"' Cambio ("+tn+"): entra "+p+" por "+(e.out&&e.out.name||'?'));
  if(e.type==='yellow') return line2('card','tarjeta_amar',e.min+"' Tarjeta amarilla a "+p+" ("+tn+")");
  return line2('red',e.direct?'tarjeta_roja':'tarjeta2_amar',e.min+"' EXPULSADO "+p+" ("+tn+")"+(e.direct?' (roja directa)':' (doble amarilla)'));
}
// ---- alineación
function ensureBench(){
  const t=team(G.team); const inL=i=>G.lineup.some(l=>l.idx===i);
  const fresh=!G.bench; if(fresh) G.bench=[];
  G.bench=G.bench.filter(i=>t.players[i]&&!inL(i)&&!isOut(G.team,i));
  if((fresh||!G.benchSet)&&G.bench.length<7){ const others=t.players.filter(p=>!inL(p.idx)&&!G.bench.includes(p.idx)&&!isOut(G.team,p.idx)).sort((a,b)=>(['POR','DEF','MED','DEL'].indexOf(a.dem)-['POR','DEF','MED','DEL'].indexOf(b.dem))||b.me-a.me); while(G.bench.length<7&&others.length) G.bench.push(others.shift().idx); }
}
function scrAlineacion(state){
  state=state||{}; const t=team(G.team); setBg('fondo2'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'ALINEACIÓN',date:gameDate(),sub:'PRETEMPORADA · PREPARACIÓN'}));
  ensureBench();
  let sel=state.sel!==undefined?state.sel:(G.lineup[0]?G.lineup[0].idx:0); let pend=null; let lastClk={idx:null,t:0};
  const inL=i=>G.lineup.findIndex(l=>l.idx===i);
  const slotOf=i=>{ const k=inL(i); if(k>=0) return {type:'tit',k}; if(G.bench.includes(i)) return {type:'bench'}; return {type:'none'}; };
  const place=(i,slot,prev)=>{ // coloca al jugador i en el hueco slot (que ocupaba prev)
    if(slot.type==='tit'){ G.lineup[slot.k]={idx:i,role:G.lineup[slot.k].role,x:G.lineup[slot.k].x,y:G.lineup[slot.k].y}; G.bench=G.bench.filter(x=>x!==i); }
    else if(slot.type==='bench'){ G.bench=G.bench.map(x=>x===prev?i:x); if(!G.bench.includes(i)) G.bench.push(i); }
    else { G.bench=G.bench.filter(x=>x!==i); }
  };
  const swapPlayers=(a,b)=>{ if(a===b) return false; const sa=slotOf(a), sb=slotOf(b);
    if(sa.type==='none'&&sb.type==='none') return false;
    if((sb.type!=='none'&&isOut(G.team,a))||(sa.type!=='none'&&isOut(G.team,b))){ dialog('CAMBIO','Un lesionado o sancionado no puede ser titular ni convocado.'); return false; }
    if(sa.type==='tit'&&sb.type==='tit'){ const ia=G.lineup[sa.k].idx; G.lineup[sa.k].idx=G.lineup[sb.k].idx; G.lineup[sb.k].idx=ia; return true; }
    const lineupBak=G.lineup.map(l=>Object.assign({},l)), benchBak=G.bench.slice();
    // b toma el hueco de a, a toma el hueco de b
    const sbench=G.bench.slice();
    if(sa.type==='tit'){ G.lineup[sa.k].idx=b; } if(sb.type==='tit'){ G.lineup[sb.k].idx=a; }
    let nb=sbench.filter(x=>x!==a&&x!==b);
    if(sa.type==='bench') nb.push(b); if(sb.type==='bench') nb.push(a);
    G.bench=nb.slice(0,7); G.benchSet=true; return true; };
  const MUI=(typeof UI!=='undefined'&&UI==='mobile'); let T=null, subBtn=null, ctxBtn=null; if(MUI){ T=panel(6,66,452,240); s.appendChild(T); }
  const P=panel(6,MUI?320:66,452,374); s.appendChild(P);
  const sc=at(h('div',{class:'scroll'}),0,0,448,370); P.appendChild(sc);
  const order=(a,b)=>(['POR','DEF','MED','DEL'].indexOf(a.dem)-['POR','DEF','MED','DEL'].indexOf(b.dem))||b.me-a.me;
  const markPend=p=>{ if(isOut(G.team,p.idx)) return; pend=(pend===p.idx)?null:p.idx; sel=p.idx; build(); side(); };
  const build=()=>{ const st0=sc.scrollTop; sc.innerHTML=''; ensureBench();
    const tit=G.lineup.map(l=>t.players[l.idx]); const conv=G.bench.map(i=>t.players[i]).sort(order);
    const les=t.players.filter(p=>inL(p.idx)<0&&!G.bench.includes(p.idx)&&isInjured(G.team,p.idx));
    const san=t.players.filter(p=>inL(p.idx)<0&&!G.bench.includes(p.idx)&&!isInjured(G.team,p.idx)&&isSuspended(G.team,p.idx,nextComp()));
    const noconv=t.players.filter(p=>inL(p.idx)<0&&!G.bench.includes(p.idx)&&!isOut(G.team,p.idx)).sort(order);
    const rows=[{__group:'TITULARES ('+tit.length+'/11)'},...tit,{__group:'JUGADORES CONVOCADOS ('+conv.length+'/7)'},...conv,{__group:'JUGADORES NO CONVOCADOS'},...noconv,...(les.length?[{__group:'LESIONADOS'},...les]:[]),...(san.length?[{__group:'SANCIONADOS ('+(nextComp()==='C'?'COPA':'LIGA')+')'},...san]:[])];
    // POS / ROL: puesto en el once (verde; naranja con ↓ si pierde media) o demarcación natural (+ si domina varias); lesión o sanción
    const posRol={t:'POS / ROL',w:MUI?90:110,k:p=>{const l=inL(p.idx); const w=G.inj&&G.inj[injKey(G.team,p.idx)]; if(w) return h('span',{class:'f-con8',style:{color:'#ff8a60'}},icoImg('ico_lesion',12),' '+w+(w===1?' SEMANA':' SEMANAS')); const sn=suspOf(G.team,p.idx,nextComp()); if(sn) return h('span',{class:'f-con8',style:{color:'#ff8a60'}},icoImg(suspIco(G.team,p.idx,nextComp()),12),' SANC. '+sn+(sn===1?' PART.':' PART.')); if(l>=0){ const bad=rolePenalty(p,G.lineup[l].role); return h('span',{class:'f-con8',style:{color:bad?'#ff8a60':'#8dff8d'}},ROLES_SHORT[G.lineup[l].role]+(bad?' ↓':'')); } return h('span',{class:'f-con8',style:{color:'#9fb4e8'}},ROLES_SHORT[p.roles[0]]+(p.roles.length>1?' +':''));}};
    const fotoCol={t:'',w:MUI?24:18,cls:'c',k:p=>p.id>0?h('img',{class:'alph',src:'img/foto/'+p.id+'.png',alt:'',onerror:function(){ this.style.visibility='hidden'; }}):''};
    const colsFull=[{t:'Nº',w:18,cls:'c',k:p=>p.dorsal||''},fotoCol,{t:'JUGADOR',w:132,k:p=>p.name},{t:'EN',w:18,cls:'c',k:p=>isInjured(G.team,p.idx)?icoImg('ico_lesion',11,'Lesionado'):isSuspended(G.team,p.idx,nextComp())?icoImg(suspIco(G.team,p.idx,nextComp()),11,'Sancionado'):99,cell:p=>isOut(G.team,p.idx)?'grey':'g'},{t:'VE',w:20,cls:'r',k:p=>p.attrs[0]},{t:'RE',w:20,cls:'r',k:p=>p.attrs[1]},{t:'AG',w:20,cls:'r',k:p=>p.attrs[2]},{t:'CA',w:20,cls:'r',k:p=>p.attrs[3]},{t:'ME',w:22,cls:'r',k:p=>p.me,cell:()=>'y'},posRol];
    const colsM=[colsFull[0],colsFull[1],colsFull[2],colsFull[8],posRol];
    sc.appendChild(table(MUI?colsM:colsFull,rows,{rowClass:p=>(p.idx===pend?'pend ':'')+(p.idx===sel?'sel ':'')+(isInjured(G.team,p.idx)?'les':isSuspended(G.team,p.idx,nextComp())?'san':''),onRow:p=>{ const now=Date.now(); const dbl=(lastClk.idx===p.idx&&now-lastClk.t<450); lastClk={idx:p.idx,t:now};
      if(dbl){ lastClk={idx:null,t:0}; markPend(p); return; }
      if(pend!==null&&p.idx!==pend){ if(swapPlayers(pend,p.idx)){ sel=p.idx; } pend=null; saveGame(); build(); side(); return; }
      sel=p.idx; build(); side(); },onRowDbl:markPend})); sc.scrollTop=st0;
    if(pend!==null) sc.prepend(h('div',{class:'f-e5',style:{position:'sticky',top:0,background:'#9a5a10',color:'#fff',padding:'2px 6px',letterSpacing:'1px',zIndex:2}},'CAMBIO: '+t.players[pend].name.toUpperCase()+' · pulsa su destino'));
  };
  const R=MUI?null:panel(464,66,170,374); if(R) s.appendChild(R);
  const refresh=()=>{ saveGame(); build(); side(); };
  const dotClick=x=>()=>{ if(pend!==null&&x.idx!==pend){ if(swapPlayers(pend,x.idx)) sel=x.idx; pend=null; saveGame(); build(); side(); return; } sel=x.idx; build(); side(); };
  const sideM=()=>{ // versión móvil: campo pequeño arriba, lista debajo, botones fijos abajo
    T.innerHTML=''; const p=t.players[sel];
    T.appendChild(h('div',{class:'hdr'},'TÁCTICA '+G.formation+' · MEDIA '+lineupME(t,G.lineup)));
    const pl=G.lineup.map(x=>{const rp=slotPos(x); const q=t.players[x.idx]; return {x:rp[0],y:rp[1],n:q.dorsal||'',title:q.name,cls:(rolePenalty(q,x.role)?'bad ':'')+(x.idx===sel?'sel':''),onclick:dotClick(x)};});
    const pc=pitch(0,20,230,140,pl); pc.querySelectorAll('.dot').forEach(d=>{d.style.transform='translate(-7px,-7px)';}); T.appendChild(pc);
    const info=txt((p?(p.dorsal?p.dorsal+' ':'')+p.name+' · ME '+p.me+' · '+ROLES_SHORT[p.roles[0]]+(typeof moralLine==='function'?' · '+moralLine(p).toLowerCase():''):'')+'\n'+(pend!==null?'CAMBIO: '+t.players[pend].name+' · pulsa su destino en la lista o en el campo':'Doble toque o pulsación larga en un jugador para cambiarlo'),0,166,440,30,'f-p8'); info.style.color=pend!==null?'#ffd080':'#9fb4e8'; T.appendChild(info);
    T.appendChild(btn('TÁCTICA',0,200,140,()=>scrTactica(),'blue','ico_terreno'));
    T.appendChild(btn('LESIONADOS',150,200,140,()=>scrLesionados(()=>scrAlineacion({sel})),'blue','ico_incidencias'));
    if(subBtn) subBtn.textContent=pend!==null?'CANCELAR CAMBIO':'SUSTITUIR';
    if(ctxBtn){ const l=inL(sel), inB=G.bench.includes(sel), inj=isOut(G.team,sel); let label, cls='blue', f=null;
      if(l>=0){ label='QUITAR DEL ONCE'; cls='red'; f=()=>{ G.lineup.splice(l,1); if(G.bench.length<7) G.bench.push(sel); G.benchSet=true; refresh(); }; }
      else if(inj){ label=outLabel(G.team,sel); cls='dis'; }
      else if(G.lineup.length<11){ label='PONER TITULAR'; cls='green'; f=()=>{ const r0=p.roles[0]; G.lineup.push({idx:sel,role:r0,x:ROLE_POS[r0][0],y:ROLE_POS[r0][1]}); G.bench=G.bench.filter(i=>i!==sel); refresh(); }; }
      else if(inB){ label='DESCONVOCAR'; cls='red'; f=()=>{ G.bench=G.bench.filter(i=>i!==sel); G.benchSet=true; refresh(); }; }
      else { label='CONVOCAR'; f=()=>{ if(G.bench.length>=7) return dialog('CONVOCATORIA','Ya hay 7 convocados. Desconvoca a otro primero.'); G.bench.push(sel); G.benchSet=true; refresh(); }; }
      ctxBtn.textContent=label; ctxBtn.className='btn '+cls; ctxBtn.onclick=f; }
  };
  const pickDialog=(title,cands,f)=>{ const b=h('div',{class:'scroll',style:{maxHeight:'250px'}}); cands.forEach(p=>b.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'2px 0'},onclick:()=>{closeDialog(); f(p);}},(p.dorsal?p.dorsal+' ':'')+p.name+' ('+ROLES_SHORT[p.roles[0]]+')'))); dialog(title,b,[{t:'CANCELAR'}]); };
  const side=()=>{ if(MUI){ sideM(); return; } R.innerHTML=''; const p=t.players[sel]; const l=inL(sel); const inB=G.bench.includes(sel); const inj=isInjured(G.team,sel);
    R.appendChild(btn('PARÁMETROS',10,8,150,null,'green')); R.appendChild(btn('ESTADÍSTICAS',10,30,150,()=>scrEstadisticas(),'blue'));
    R.appendChild(lbl('MEDIA EQUIPO',10,58)); R.appendChild(txt(String(lineupME(t,G.lineup)),130,56,30,16,'f-e4'));
    { const nm=txt(p.name,10,74,150,14,'f-e5'); nm.style.whiteSpace='nowrap'; nm.style.overflow='hidden'; nm.style.textOverflow='ellipsis'; R.appendChild(nm); const fm=txt(typeof moralLine==='function'?moralLine(p):'',10,87,150,10,'f-m8'); fm.style.fontFamily='micro8'; fm.style.fontSize='8px'; fm.style.color='#9fd0ff'; R.appendChild(fm); }
    PARAM_NAMES.forEach((n,i)=>{ const v=p.attrs[PARAM_IDX[i]]; const x=10+(i%2)*78, y=98+Math.floor(i/2)*30; const L=lbl(n,x,y); L.style.fontFamily='micro8'; L.style.fontSize='10px'; R.appendChild(L); R.appendChild(txt(String(v),x,y+11,30,12,'f-con')); R.appendChild(at(h('div',{class:'bar'},h('i',{style:{width:v+'%'}})),x+26,y+12,46,8)); });
    const pl=G.lineup.map(x=>{const rp=slotPos(x); const q=t.players[x.idx]; return {x:rp[0],y:rp[1],n:q.dorsal||'',cls:(rolePenalty(q,x.role)?'bad ':'')+(x.idx===sel?'sel':'')};});
    const pc=pitch(14,188,142,90,pl); pc.querySelectorAll('.dot').forEach(d=>{d.style.width='11px';d.style.height='11px';d.style.fontSize='8px';d.style.lineHeight='9px';d.style.transform='translate(-6px,-6px)';}); R.appendChild(pc);
    const subs=t.players.filter(q=>inL(q.idx)<0&&!isOut(G.team,q.idx)).sort(order);
    if(l>=0){
      R.appendChild(btn('SUSTITUIR...',10,282,150,()=>pickDialog('ENTRA POR '+p.name.toUpperCase(),subs,q=>{ G.lineup[l]={idx:q.idx,role:G.lineup[l].role,x:G.lineup[l].x,y:G.lineup[l].y}; G.bench=G.bench.filter(i=>i!==q.idx); if(G.bench.length<7) G.bench.push(sel); sel=q.idx; refresh(); }),'green'));
      R.appendChild(btn('QUITAR DEL ONCE',10,304,150,()=>{ G.lineup.splice(l,1); if(G.bench.length<7) G.bench.push(sel); refresh(); },'red'));
    } else if(inj){ R.appendChild(btn(outLabel(G.team,sel),10,282,150,null,'red')); }
    else {
      if(G.lineup.length<11) R.appendChild(btn('PONER TITULAR',10,282,150,()=>{ const r0=p.roles[0]; G.lineup.push({idx:sel,role:r0,x:ROLE_POS[r0][0],y:ROLE_POS[r0][1]}); G.bench=G.bench.filter(i=>i!==sel); refresh(); },'green'));
      else R.appendChild(btn('SUSTITUIR A...',10,282,150,()=>pickDialog(p.name.toUpperCase()+' ENTRA POR...',G.lineup.map(x=>t.players[x.idx]),q=>{ const k=inL(q.idx); G.lineup[k]={idx:sel,role:G.lineup[k].role,x:G.lineup[k].x,y:G.lineup[k].y}; G.bench=G.bench.filter(i=>i!==sel); if(G.bench.length<7) G.bench.push(q.idx); refresh(); }),'green'));
      if(inB) R.appendChild(btn('DESCONVOCAR',10,304,150,()=>{ G.bench=G.bench.filter(i=>i!==sel); G.benchSet=true; refresh(); },'red'));
      else R.appendChild(btn('CONVOCAR',10,304,150,()=>{ if(G.bench.length>=7) return dialog('CONVOCATORIA','Ya hay 7 convocados. Desconvoca a otro primero.'); G.bench.push(sel); G.benchSet=true; refresh(); },'blue'));
    }
    R.appendChild(btn('AUTOMÁTICA',10,326,150,()=>{G.lineup=bestLineup(t,G.formation); G.bench=null; G.benchSet=false; refresh();},'blue','ico_alineacion'));
    [['LESIONADOS',10,()=>scrLesionados(()=>scrAlineacion({sel}))],['TÁCTICA',86,()=>scrTactica()]].forEach(b=>{ const e=btn(b[0],b[1],348,74,b[2],'blue'); R.appendChild(e); });
  };
  if(MUI){
    s.appendChild(btn('VOLVER',10,446,90,()=>scrOficina(),'blue','ico_volver'));
    subBtn=btn('SUSTITUIR',110,446,120,()=>{ if(pend!==null){ pend=null; build(); side(); return; } const p=t.players[sel]; if(!p) return; if(isOut(G.team,sel)) return dialog('CAMBIO','Un lesionado o sancionado no puede ser titular ni convocado.'); markPend(p); },'green'); s.appendChild(subBtn);
    ctxBtn=btn('QUITAR DEL ONCE',240,446,120,null,'red'); s.appendChild(ctxBtn);
    s.appendChild(btn('AUTOMÁTICA',370,446,120,()=>{G.lineup=bestLineup(t,G.formation); G.bench=null; G.benchSet=false; refresh();},'blue','ico_alineacion'));
  } else s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
  build(); side();
}
// ---- táctica
function scrTactica(){
  const t=team(G.team); setBg('fondo2'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'TÁCTICA',date:gameDate(),sub:'FORMACIÓN '+G.formation}));
  let sel=0; const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  const roleDialog=p=>{ const own=p.roles, others=Object.keys(ROLES).map(Number).filter(r=>!own.includes(r));
    const body=h('div',{class:'scroll',style:{maxHeight:'60vh'}});
    const mk=(r,ok)=>h('div',{class:'btn '+(r===p.role?'green':ok?'blue':''),style:{position:'relative',display:'flex',width:'100%',margin:'3px 0',boxSizing:'border-box'},onclick:()=>{ G.lineup[p.li].role=r; saveGame(); closeDialog(); build(); draw(); }},(ok?'★ ':'')+ROLES[r]+(r===p.role?' (actual)':''));
    body.appendChild(h('div',{class:'f-m8',style:{color:'#8dff8d',margin:'2px 0 4px'}},'Demarcaciones que domina (★)')); own.forEach(r=>body.appendChild(mk(r,true)));
    body.appendChild(h('div',{class:'f-m8',style:{color:'#ff8a60',margin:'8px 0 4px'}},'Fuera de posición (baja su media)')); others.forEach(r=>body.appendChild(mk(r,false)));
    dialog('DEMARCACIÓN DE '+p.name.toUpperCase(),body,[{t:'CANCELAR'}]); };
  const P=panel(6,66,452,200); s.appendChild(P);
  const sc=at(h('div',{class:'scroll'}),0,0,448,196); P.appendChild(sc);
  const build=()=>{ const st0=sc.scrollTop; sc.innerHTML=''; const rows=G.lineup.map((l,i)=>Object.assign({li:i,role:l.role},t.players[l.idx]));
    sc.appendChild(table([{t:'Nº',w:22,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',w:120,k:p=>p.name},{t:'VE',w:24,cls:'r',k:p=>p.attrs[0]},{t:'RE',w:24,cls:'r',k:p=>p.attrs[1]},{t:'AG',w:24,cls:'r',k:p=>p.attrs[2]},{t:'CA',w:24,cls:'r',k:p=>p.attrs[3]},{t:'ME',w:30,cls:'r',k:p=>{const e=effME(p,p.role); return e<p.me?e+'↓':e;},cell:p=>rolePenalty(p,p.role)?'red':'y'},{t:'ROL',k:p=>{ if(MUI){ const ok=p.roles.includes(p.role); return h('span',{class:'f-con8',style:{color:ok?'#8dff8d':'#ff8a60'}},(ok?'★ ':'')+ROLES_SHORT[p.role]+' ▾'); } const own=p.roles, others=Object.keys(ROLES).map(Number).filter(r=>!own.includes(r)); const se=h('select',{class:'select',style:{position:'static',width:'150px',height:'16px',fontSize:'13px',fontFamily:'futcon8',color:own.includes(p.role)?'#0a7a0a':'#b03000'},onchange:ev=>{G.lineup[p.li].role=+ev.target.value; saveGame(); build(); draw();}},[...own.map(r=>h('option',{class:'ok',value:r,selected:r===p.role?'selected':null},'★ '+ROLES[r])),...others.map(r=>h('option',{class:'no',value:r,selected:r===p.role?'selected':null},ROLES[r]))]); se.onclick=ev=>ev.stopPropagation(); return se; }},{t:'DEM',w:30,cls:'c',k:p=>ROLE_DEM[p.role]}],rows,{rowClass:p=>p.li===sel?'sel':'',onRow:p=>{sel=p.li; build(); draw(); if(MUI) roleDialog(p);}}));
    sc.scrollTop=st0; };
  const L=panel(6,272,170,168); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'FORMACIONES'));
  Object.keys(FORMATIONS).forEach((f,i)=>L.appendChild(btn(f,8+(i%2)*80,22+Math.floor(i/2)*24,74,()=>{G.formation=f; G.lineup=bestLineup(t,f); saveGame(); build(); draw(); L.querySelectorAll('.btn').forEach(b=>b.className='btn '+(b.textContent===f?'green':'blue'));},f===G.formation?'green':'blue')));
  L.appendChild(btn('AUTOMÁTICA',8,118,154,()=>{G.lineup=bestLineup(t,G.formation); saveGame(); build(); draw();},'blue'));
  const C=panel(182,272,276,168); s.appendChild(C); C.appendChild(h('div',{class:'hdr'},t.name));
  let pc=null;
  const draw=()=>{ if(pc) pc.remove(); const pl=G.lineup.map((l,i)=>{const rp=slotPos(l); const p=t.players[l.idx]; return {x:rp[0],y:rp[1],n:p.dorsal||i+1,cls:(rolePenalty(p,l.role)?'bad ':'')+(i===sel?'sel':''),title:p.name+(rolePenalty(p,l.role)?' (fuera de posición)':''),onclick:()=>{sel=i; build(); draw();}};}); pc=pitch(6,22,262,140,pl); C.appendChild(pc); C.querySelector('.hdr').textContent=t.name+' · MEDIA '+lineupME(t,G.lineup); };
  const R=panel(464,66,170,374); s.appendChild(R);
  R.appendChild(btn('PARÁM.',10,8,70,()=>scrAlineacion(),'blue')); R.appendChild(btn('ENTREN.',86,8,74,()=>scrEntrenamiento(),'blue'));
  R.appendChild(txt(MUI?'Pulsa un jugador para elegir su demarcación: las que domina van con ★ en verde. Fuera de ellas su media baja (↓, naranja en el campo).':'Pulsa un jugador y cambia su ROL en la lista: las demarcaciones que domina van con ★ en verde. Fuera de ellas su media baja (↓, naranja en el campo): poco en su misma línea, más al cambiar de línea y mucho en la portería.',10,40,150,120,'f-p8'));
  R.appendChild(btn('VER RIVAL',10,250,150,()=>{const nm=nextMatch(); if(nm) scrDbTeam(nm[0]===G.team?nm[1]:nm[0],{back:()=>scrTactica()});},'blue','lupa'));
  R.appendChild(btn('ALINEACIÓN',10,280,150,()=>scrAlineacion(),'blue','ico_alineacion'));
  R.appendChild(btn('VOLVER',10,340,150,()=>scrOficina(),'blue','ico_volver'));
  build(); draw();
}
// ---- partido
function slimEvents(ev){ return ev.filter(e=>e.type==='goal'||e.type==='injury').map(e=>({min:e.min,type:e.type,side:e.side,score:e.score,weeks:e.weeks,kind:e.kind,player:{team:e.player.team,idx:e.player.idx}})); }
function playJornadaAI(lg, j){
  const cal=calOf(lg); if(j>cal.length) return []; const res=[];
  for(const m of cal[j-1]){ const hm=team(m[0]), aw=team(m[1]); if(lg===G.league&&(m[0]===G.team||m[1]===G.team)){ res.push(null); continue; }
    const lh=bestLineup(hm,'4-4-2','L'), la=bestLineup(aw,'4-4-2','L'); const r=simulateMatch(hm,aw,lh,la); applyInjuries(r); statsRecord(hm,aw,lh,la,r); applyCards(hm,aw,r,'L'); r.events=slimEvents(r.events); res.push(r); }
  return res;
}
function scrMatchLive(hm,aw,lh,la,opts){
  const t=team(G.team); const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  const mySide=hm.id===G.team?'H':aw.id===G.team?'A':null; if(mySide&&typeof ensureBench==='function') ensureBench();
  const S=matchSim(hm,aw,lh,la,{full:opts.att&&!opts.neutral?isFull(hm,opts.att):false,neutral:!!opts.neutral,ai:{H:mySide!=='H',A:mySide!=='A'},comp:opts.comp||'L'});
  const r={att:opts.att||Math.min(hm.capacity||20000,Math.round((hm.capacity||20000)*(0.45+rnd()*0.5)))}; // el resultado completo se rellena al acabar
  setBg('fondo8'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:opts.title||'PARTIDO',date:gameDate(),sub:opts.sub||''}));
  const plNow=()=>[...S.lh.map(l=>{const rp=slotPos(l); return {x:rp[0]/2,y:rp[1],n:hm.players[l.idx].dorsal||'',cls:''};}),...S.la.map(l=>{const rp=slotPos(l); return {x:100-rp[0]/2,y:100-rp[1],n:aw.players[l.idx].dorsal||'',cls:'rival'};})]; const pl=plNow(); let pitchEl=null;
  let score, clock, ev, P, H;
  if(MUI){ // móvil: equipos y marcador arriba, campo, y debajo el relato del partido
    H=panel(10,68,620,80); s.appendChild(H);
    score=h('div',{class:'f-e1 mlsc'},'0 - 0'); clock=h('div',{class:'f-e4 mlck'},"0'");
    H.appendChild(h('div',{class:'mlh'},h('img',{src:escImg(hm.id)}),h('div',{class:'mln'},hm.name),h('div',{class:'mls'},score,clock),h('div',{class:'mln'},aw.name),h('img',{src:escImg(aw.id)})));
    const F=panel(10,160,620,230); s.appendChild(F); pitchEl=pitch(0,0,330,200,pl); F.appendChild(pitchEl);
    const E=panel(10,400,620,200); s.appendChild(E); E.appendChild(h('div',{class:'hdr'},'EL PARTIDO · '+fmtNum(r.att)+' espectadores'+(!opts.neutral&&isFull(hm,r.att)?' · ¡LLENO!':'')+' · Árbitro: '+refName(refFor(hm))));
    ev=h('div',{class:'scroll mlev'}); E.appendChild(ev);
  } else {
    P=panel(10,68,620,372); s.appendChild(P);
    P.appendChild(at(h('img',{src:escImg(hm.id),style:{height:'64px'}}),30,14)); P.appendChild(at(h('img',{src:escImg(aw.id),style:{height:'64px'}}),530,14));
    P.appendChild(txt(hm.name,100,20,160,18,'f-e4')); P.appendChild(txt(aw.name,360,20,160,18,'f-e4')).style.textAlign='right';
    score=txt('0 - 0',260,10,100,30,'f-e1'); score.style.textAlign='center'; score.style.color='#ffe24a'; P.appendChild(score);
    clock=txt("0'",280,44,60,16,'f-e4'); clock.style.textAlign='center'; P.appendChild(clock);
    P.appendChild(at(h('img',{src:'img/cam/'+hm.id+'.png',style:{width:'73px',height:'38px'},onerror:function(){this.style.display='none'}}),100,44));
    P.appendChild(at(h('img',{src:'img/cam/'+aw.id+'.png',style:{width:'73px',height:'38px'},onerror:function(){this.style.display='none'}}),447,44));
    ev=at(h('div',{class:'scroll'}),20,96,360,250); P.appendChild(ev);
    pitchEl=pitch(392,96,218,140,pl); P.appendChild(pitchEl);
    P.appendChild(txt('Espectadores: '+fmtNum(r.att)+(!opts.neutral&&isFull(hm,r.att)?' (¡lleno!)':'')+'\nÁrbitro: '+refName(refFor(hm)),392,244,218,40,'f-p8'));
  }
  let min=0, gh=0, ga=0, ei=0, timer=null, speed=matchSpeed(), finished=false, subBtn=null;
  const redrawPitch=()=>{ if(!pitchEl) return; const np=MUI?pitch(0,0,330,200,plNow()):pitch(392,96,218,140,plNow()); pitchEl.replaceWith(np); pitchEl=np; };
  const pause=()=>{ if(timer){ clearInterval(timer); timer=null; } }; const resume=()=>{ if(!finished&&!timer) timer=setInterval(tick,speed); };
  const showEvents=()=>{ while(ei<S.events.length){ const e=S.events[ei++]; if(e.type==='goal'){ gh=e.score[0]; ga=e.score[1]; score.textContent=gh+' - '+ga; } if(e.type==='sub'||e.type==='red') redrawPitch(); ev.appendChild(eventLine(e,hm,aw)); ev.scrollTop=1e6; if(mySide&&e.side===mySide&&e.type==='injury'&&!finished){ pause(); dialog('LESIONADO',e.player.name+' se ha lesionado ('+(e.kind||'').toLowerCase()+'). Puede seguir en el campo a medio rendimiento o ser sustituido.',[{t:'SUSTITUIR',cls:'green',f:()=>subFlow(e.player.idx)},{t:'SEGUIR',f:resume}]); return; } } };
  // sustitución del usuario: quién sale (del once) y quién entra (del banquillo convocado), máximo 3
  const subFlow=outIdx=>{ if(!mySide||finished) return; pause(); const l=mySide==='H'?S.lh:S.la; if(S.nsubs[mySide]>=3){ dialog('CAMBIO','Ya has hecho los tres cambios.',[{t:'ACEPTAR',f:resume}]); return; }
    const inOnce=new Set(l.map(x=>x.idx)); const bench=(G.bench||[]).filter(i=>t.players[i]&&!inOnce.has(i)&&!S.used[mySide].has(i)&&!isOut(G.team,i));
    if(!bench.length){ dialog('CAMBIO','No quedan jugadores convocados en el banquillo.',[{t:'ACEPTAR',f:resume}]); return; }
    const pick=(title,cands,f)=>{ const b=h('div',{class:'scroll',style:{maxHeight:'250px'}}); cands.forEach(p=>b.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'2px 0'},onclick:()=>{closeDialog(); f(p);}},(p.dorsal?p.dorsal+' ':'')+p.name+' ('+ROLES_SHORT[p.roles[0]]+') · ME '+p.me+(S.hurt[mySide].has(p.idx)?' · lesionado':'')))); dialog(title,b,[{t:'CANCELAR',f:resume}]); };
    const chooseIn=po=>pick('ENTRA POR '+po.name.toUpperCase()+' ('+ROLES_SHORT[l.find(x=>x.idx===po.idx).role]+')',bench.map(i=>t.players[i]),pi=>{ S.sub(mySide,po.idx,pi.idx); if(subBtn) subBtn.textContent='CAMBIO '+S.nsubs[mySide]+'/3'; showEvents(); resume(); });
    if(outIdx!==undefined&&inOnce.has(outIdx)) chooseIn(t.players[outIdx]); else pick('¿QUIÉN SALE? ('+S.nsubs[mySide]+'/3 cambios)',l.map(x=>t.players[x.idx]),chooseIn); };
  const finish=()=>{ if(finished) return; finished=true; clearInterval(timer); timer=null; closeDialog(); while(!S.done) S.step(); Object.assign(r,S.result(),{att:r.att}); min=90; clock.textContent="90'"; score.textContent=r.gh+' - '+r.ga; while(ei<r.events.length){ const e=r.events[ei++]; ev.appendChild(eventLine(e,hm,aw)); } redrawPitch(); ev.scrollTop=1e6; if(subBtn) subBtn.remove();
    const isHome=hm.id===G.team; const my=isHome?[r.gh,r.ga]:[r.ga,r.gh]; const msg=my[0]>my[1]?'¡VICTORIA!':my[0]<my[1]?'DERROTA':'EMPATE';
    if(MUI){ const m=h('div',{class:'f-e4 mlmsg'},msg); H.appendChild(m); s.appendChild(btn('CONTINUAR',240,446,120,()=>opts.after(r),'green')); }
    else { P.appendChild(txt(msg,392,356,218,16,'f-e4')).style.textAlign='center'; P.appendChild(btn('CONTINUAR',392,300,218,()=>opts.after(r),'green')); }
  };
  const tick=()=>{ if(finished) return; S.step(); min=S.m; clock.textContent=min+"'"; showEvents(); if(S.done) finish(); };
  timer=setInterval(tick,speed);
  const host=MUI?s:P;
  let spKey=matchSpeedKey(); const spBtn=btn('VEL. '+SPEEDS[spKey][1],20,350,100,()=>{ spKey=nextSpeedKey(spKey); setMatchSpeed(spKey); speed=SPEEDS[spKey][0]; spBtn.textContent='VEL. '+SPEEDS[spKey][1]; if(timer){ clearInterval(timer); timer=setInterval(tick,speed); } },'blue'); host.appendChild(spBtn);
  host.appendChild(btn('FINALIZAR',130,350,100,()=>{ if(!finished) finish(); },'red'));
  if(mySide){ subBtn=btn('CAMBIO 0/3',240,350,120,()=>subFlow(),'green'); host.appendChild(subBtn); }
}
function scrPartido(){
  const nm=nextMatch(); if(!nm) return scrOficina();
  const hm=team(nm[0]), aw=team(nm[1]); const isHome=nm[0]===G.team;
  const lh=isHome?G.lineup:bestLineup(hm,'4-4-2'), la=isHome?bestLineup(aw,'4-4-2'):G.lineup;
  scrMatchLive(hm,aw,lh,la,{title:'PARTIDO',sub:'JORNADA '+G.jornada+' · '+hm.stadium,att:isHome?attendanceModel(hm,aw):null,after:r=>{
    const res=playJornadaAI(G.league,G.jornada); const cal=calOf(G.league); const mi=cal[G.jornada-1].findIndex(m=>m[0]===nm[0]); const rr=Object.assign({},r,{events:slimEvents(r.events)}); res[mi]=rr; G.results[G.league][G.jornada-1]=res;
    LEAGUE_ORDER.forEach(k=>{ if(k!==G.league&&G.jornada<=calOf(k).length) G.results[k][G.jornada-1]=playJornadaAI(k,G.jornada); });
    applyInjuries(r); statsRecord(hm,aw,lh,la,r); const sanc=applyCards(hm,aw,r,'L'); if(typeof moralAfterMatch==='function'){ moralAfterMatch(hm,aw,r); moralWeekly(); } decInjuries(); weeklyFinance(hm,aw,r); const log=sanc.concat(applyTraining(),applyRust()); const j=G.jornada; G.jornada++; G.step++; marketTick(); if(G.youthLog&&G.youthLog.length){ log.push(...G.youthLog); G.youthLog=null; } saveGame(); if(log.length) dialog(sanc.length?'SANCIONES · ENTRENAMIENTO':'ENTRENAMIENTO',log.slice(0,12).join('\n').replace(/\n/g,'<br>'),[{t:'ACEPTAR',f:()=>scrCalendario({j})}]); else scrCalendario({j});
  }});
}
// ---- amistoso
function scrAmistoso(state){
  setMusic('manager');
  state=state||{}; setBg('fondo5'); const s=clearScreen();
  s.appendChild(topbar({title:'PARTIDO AMISTOSO',right:'Elige dos equipos'}));
  const all=Object.values(DATA.teams).filter(t=>t.id<9000&&t.players.length>=11).sort((a,b)=>((a.league?0:1)-(b.league?0:1))||(a.nat-b.nat)||a.name.localeCompare(b.name));
  let A=state.a||4, B=state.b||1;
  const mk=(x,title,get,set)=>{ const P=panel(x,70,300,340); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},title)); const sc=at(h('div',{class:'scroll'}),0,18,296,318); P.appendChild(sc); const grid=h('div',{class:'teamlist',style:{position:'static',padding:'4px'}}); sc.appendChild(grid);
    const render=()=>{ grid.innerHTML=''; all.forEach(t=>grid.appendChild(h('div',{class:t.id===get()?'sel':'',onclick:()=>{set(t.id); render();}},h('img',{src:escImg(t.id,'ridi')}),t.name))); }; render(); };
  mk(10,'EQUIPO LOCAL',()=>A,v=>A=v); mk(330,'EQUIPO VISITANTE',()=>B,v=>B=v);
  s.appendChild(btn('JUGAR',280,420,120,()=>{ if(A===B) return dialog('AMISTOSO','Elige dos equipos distintos.'); const hm=team(A), aw=team(B); const r=simulateMatch(hm,aw,bestLineup(hm,'4-4-2'),bestLineup(aw,'4-4-2')); r.events=r.events.map(e=>({min:e.min,type:e.type,side:e.side,score:e.score,player:{team:e.player.team,idx:e.player.idx}})); const saveG=G; G={team:A,league:'ESP1',jornada:1,results:{},sched:[{type:'liga',j:1}],step:0}; scrResumen(r,()=>{G=saveG; scrAmistoso({a:A,b:B});}); },'green'));
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
function refName(r){ const w=r.name.split(' '); const up=w.filter(x=>x===x.toUpperCase()&&x.length>2); return up.length?up.map(x=>x[0]+x.slice(1).toLowerCase()).join(' '):r.name; }

// ---- opciones: velocidad del partido en directo
function scrOpciones(){
  const cur=matchSpeedKey(); const b=h('div',{});
  b.appendChild(h('div',{style:{marginBottom:'6px'}},'Velocidad del partido en directo (también se cambia durante el partido con el botón VEL.):'));
  Object.keys(SPEEDS).forEach(k=>b.appendChild(h('div',{class:'btn '+(k===cur?'green':'blue'),style:{position:'relative',display:'block',margin:'3px 0'},onclick:()=>{ setMatchSpeed(k); closeDialog(); scrOpciones(); }},SPEEDS[k][1]+(k==='rapida'?' (la de siempre)':k==='lenta'?' (unos 30 segundos por partido)':' (unos 15 segundos)'))));
  dialog('OPCIONES',b,[{t:'CERRAR'}]);
}
// ---- competiciones: copa nacional y europea del club, con su estado
function scrCompeticiones(){
  const b=h('div',{}); const btns=[];
  const state=k=>{ const c=G.cups[k]; if(!c) return null; if(!c.teams.includes(G.team)) return null; if(c.winner===G.team) return '¡Campeón!'; if(c.winner) return 'Eliminado · campeón '+team(c.winner).name;
    let last=-1; c.rounds.forEach((r,i)=>{ if(r.ties.some(t=>t.a===G.team||t.b===G.team)) last=i; }); if(last<0) return 'Pendiente de sorteo';
    const tie=c.rounds[last].ties.find(t=>t.a===G.team||t.b===G.team); if(tie.winner&&tie.winner!==G.team) return 'Eliminado en '+c.rounds[last].name.toLowerCase();
    const next=c.rounds[last+1]; return (tie.winner?'Clasificado para la siguiente ronda':'En juego: '+c.rounds[last].name.toLowerCase())+(next&&!next.ties.some(t=>t.a===G.team||t.b===G.team)?'':''); };
  ['COPA','CE','RECOPA','UEFA'].forEach(k=>{ const st=state(k); if(!st) return; b.appendChild(h('div',{class:'injrow'},h('span',{},cupName(k)),h('span',{style:{color:'#ffe24a'}},st))); btns.push({t:cupName(k).toUpperCase(),cls:'blue',f:()=>scrCopa(k)}); });
  if(!btns.length) b.appendChild(h('div',{},'Tu equipo no participa en ninguna copa esta temporada.'));
  btns.push({t:'CERRAR'}); dialog('COMPETICIONES',b,btns);
}
