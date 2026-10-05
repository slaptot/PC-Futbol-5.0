// LIGA MANAGER (seis ligas: España, Inglaterra, Italia)
let G=null; // partida
function saveGame(){ if(G) localStorage.setItem('pcf5_save',JSON.stringify(G)); }
function loadGame(){ try{ const s=localStorage.getItem('pcf5_save'); const g=s?JSON.parse(s):null; return (g&&g.league&&DATA.leagues[g.league]&&(team(g.team)||(g.custom&&g.team===CUSTOM_ID)))?g:null; }catch(e){ return null; } }
function newGame(tid){
  const t=team(tid); const lg=t.league;
  G={team:tid,league:lg,jornada:1,formation:'4-4-2',lineup:bestLineup(t,'4-4-2'),results:{},season:'96-97'};
  LEAGUE_ORDER.forEach(k=>G.results[k]=[]);
  G.cups=buildCups(); G.sched=buildSchedule(); G.step=0; G.budget=initBudget(t); G.inj={}; G.transfers=[]; G.training={fis:2,fue:1,tec:2,rem:2,def:2,por:1}; G.mods={}; G.stats={}; G.contracts={}; snapshotBase(); marketInit(); tvOffersInit();
  saveGame();
}
function gameDate(){ return eventDate(curEvent()); }
function calOf(k){ return (G&&G.cal&&G.cal[k])?G.cal[k]:calAliased(k); }
function myResults(k){ return (G.results[k||G.league]||[]).flat().filter(Boolean); }
function nextMatch(){ const cal=calOf(G.league); if(G.jornada>cal.length) return null; return cal[G.jornada-1].find(m=>m[0]===G.team||m[1]===G.team); }
function refFor(hm){ return DATA.referees[(G.jornada*7+hm.id)%DATA.referees.length]; }

function scrLiga(){
  const saved=loadGame();
  if(saved){ const st=team(saved.team); const sname=st?st.name:(saved.custom&&saved.custom.name)||'Equipo propio'; dialog('LIGA MANAGER','Hay una partida guardada: '+sname+' ('+league(saved.league).name+'), jornada '+saved.jornada+'.',[{t:'CONTINUAR',cls:'green',f:()=>{G=saved; applyCustomTeam(); applySeasonState(); applyTransfers(); applyMods(); migrateGame(); saveGame(); scrOficina();}},{t:'NUEVA PARTIDA',cls:'red',f:()=>{ if(customActive()){ localStorage.removeItem('pcf5_save'); location.reload(); return; } scrSelectTeam(); }}]); return; }
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
      if(mine){ const riv=mine.a===G.team?mine.b:mine.a; const rt=team(riv); P.appendChild(at(h('img',{src:escImg(rt.id),style:{height:'64px'}}),120,52)); P.appendChild(txt('Rival: '+rt.name+'\n'+(round.nlegs>1?'Eliminatoria a doble partido':'Partido único'),8,124,284,30,'f-p12')); }
      else P.appendChild(txt('Tu equipo sigue en la competición. El sorteo se hará al jugar la ronda.',8,60,284,40,'f-p12'));
    } else P.appendChild(txt('Tu equipo no participa en esta ronda. Se simulará la eliminatoria del resto de equipos.',8,40,284,40,'f-p12'));
    P.appendChild(btn(ms?'JUGAR '+CUP_DEFS[ev.cup].rounds[ev.round]:(lineupHasInjured()?'LESIONADOS EN EL ONCE':'ALINEACIÓN INCOMPLETA'),40,230,220,()=>ms?playCupEvent(ev):scrAlineacion(),ms?'green':'red','icono_balon_de_la_b'));
  } else if(nm){ const hm=team(nm[0]), aw=team(nm[1]);
    if(typeof UI!=='undefined'&&UI==='mobile'){ P.appendChild(h('div',{class:'nextm',style:{top:'30px'}},h('div',{class:'side'},h('img',{src:escImg(hm.id)}),h('div',{class:'nm'},hm.name)),h('div',{class:'vs f-e1'},'-'),h('div',{class:'side'},h('img',{src:escImg(aw.id)}),h('div',{class:'nm'},aw.name)))); }
    else {
    P.appendChild(at(h('img',{src:escImg(hm.id),style:{height:'64px'}}),30,30)); P.appendChild(at(h('img',{src:escImg(aw.id),style:{height:'64px'}}),210,30));
    P.appendChild(txt(hm.name,8,100,110,16,'f-e5')); P.appendChild(txt(aw.name,190,100,110,16,'f-e5'));
    P.appendChild(txt('-',140,56,20,20,'f-e1')); }
    P.appendChild(txt('Estadio: '+hm.stadium+'\nAforo: '+fmtNum(hm.capacity)+'\nÁrbitro: '+refName(refFor(hm)),8,124,284,50,'f-p12'));
    const st=standings(mgrIds(G.league),myResults()); const pos=st.findIndex(x=>x.id===G.team)+1; const rp=st.findIndex(x=>x.id===(nm[0]===G.team?nm[1]:nm[0]))+1;
    P.appendChild(txt('Tu equipo es '+pos+'º en la clasificación.\nEl rival es '+rp+'º.',8,178,284,30,'f-p12'));
    P.appendChild(btn(ms?'JUGAR JORNADA '+G.jornada:(lineupHasInjured()?'LESIONADOS EN EL ONCE':'ALINEACIÓN INCOMPLETA'),40,230,220,()=>ms?scrPartido():scrAlineacion(),ms?'green':'red','icono_balon_de_la_b'));
  } else { P.appendChild(txt('La temporada ha terminado. Repasa los campeones, los ascensos y descensos y empieza la siguiente.',8,30,284,60,'f-p12')); P.appendChild(btn('FIN DE TEMPORADA',40,230,220,()=>scrFinTemporada(0),'green','ico_liga')); }
  const last=(G.results[G.league]||[]).slice(-5).flat().filter(r=>r&&(r.home===G.team||r.away===G.team));
  P.appendChild(lbl('ÚLTIMOS RESULTADOS',8,268));
  last.forEach((r,i)=>P.appendChild(txt(team(r.home).name+' '+r.gh+' - '+r.ga+' '+team(r.away).name,8,284+i*14,284,14,'f-con')));
  const M=panel(320,70,310,370); s.appendChild(M); M.appendChild(h('div',{class:'hdr'},'OFICINA'));
  const sib=SIBLING[G.league];
  const items=[['CLASIFICACIÓN',()=>scrClasif(),'ico_liga'],['CALENDARIO',()=>scrCalendario(),'calendario'],['ALINEACIÓN',()=>scrAlineacion(),'ico_alineacion'],['TÁCTICA',()=>scrTactica(),'ico_terreno'],['ENTRENAR',()=>scrEntrenamiento(),'ico_terreno'],['ESTADÍSTICAS',()=>scrEstadisticas(),'ico_golea'],['CLUB',()=>scrDbTeam(G.team,{back:()=>scrOficina()}),'ico_estadio'],['GOLEADORES',()=>scrGoleadores(),'ico_golea'],[cupName('COPA').toUpperCase(),()=>scrCopa('COPA'),'ico_coparey'],['EUROPA',()=>scrCopa(userInCup('CE')?'CE':userInCup('UEFA')?'UEFA':'CE'),'ico_uefa'],['FICHAJES',()=>scrFichajes(),'nuevo_fichaje'],['LESIONADOS',()=>scrLesionados(()=>scrOficina()),'ico_incidencias'],['FINANZAS',()=>scrFinanzas(),'ico_entrada']];
  items.forEach((it,i)=>M.appendChild(btn(it[0],20+(i%2)*140,24+Math.floor(i/2)*27,130,it[1],'blue',it[2])));
  M.appendChild(btn(league(sib).name.toUpperCase()+' / VER RIVAL',160,186,130,()=>nm?scrDbTeam(nm[0]===G.team?nm[1]:nm[0],{back:()=>scrOficina()}):scrClasif({lg:sib}),'blue','lupa'));
  M.appendChild(btn('GUARDAR PARTIDA',20,216,270,()=>{saveGame(); if(MOBILE) dialog('GUARDAR','Partida guardada en el navegador. En el móvil conviene exportarla a un archivo de vez en cuando: el navegador puede borrar el almacenamiento.',[{t:'ACEPTAR'},{t:'EXPORTAR',cls:'green',f:exportSave},{t:'IMPORTAR',cls:'blue',f:importSave}]); else dialog('GUARDAR','Partida guardada en el navegador.');},'blue'));
  M.appendChild(btn('NUEVA PARTIDA',20,240,270,()=>dialog('NUEVA PARTIDA','¿Abandonar la partida actual?',[{t:'SÍ',cls:'red',f:()=>{localStorage.removeItem('pcf5_save'); if(customActive()||G.leagueMoves){ location.reload(); return; } scrSelectTeam();}},{t:'NO'}]),'red'));
  M.appendChild(btn('MENÚ PRINCIPAL',20,264,270,()=>{saveGame(); go('menu');},'blue','ico_volver'));
  M.appendChild(txt('Presupuesto: '+fmtNum(G.budget||0)+' millones · Lesionados: '+injuredOf(G.team).length+'\nDirige al '+t.name+' en la '+league(G.league).long+' '+(G.season||'96-97')+'.',20,292,270,60,'f-p8'));
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
  const me=st.find(x=>x.id===G.team); if(me&&lg===G.league) R.appendChild(txt('Posición: '+(st.indexOf(me)+1)+'º · '+me.pts+' puntos · '+me.gf+'-'+me.gc,14,312,140,40,'f-p8'));
  R.appendChild(btn('VOLVER',14,330,140,()=>scrOficina(),'blue','ico_volver'));
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
  R.appendChild(txt(String(j),60,32,46,16,'f-e4')); R.appendChild(btn('ACTUAL',14,58,140,()=>scrCalendario({lg}),'blue'));
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
  const tn=(e.side==='H'?hm:aw).name; const p=e.player.name||team(e.player.team).players[e.player.idx].name;
  if(e.type==='goal') return h('div',{class:'ev goal'},"⚽ "+e.min+"' GOL de "+p+" ("+tn+")  "+e.score[0]+"-"+e.score[1]);
  if(e.type==='injury') return h('div',{class:'ev red'},"✚ "+e.min+"' Lesionado "+p+" ("+tn+") · "+e.weeks+(e.weeks===1?' semana':' semanas'));
  if(e.type==='yellow') return h('div',{class:'ev card'},"▮ "+e.min+"' Tarjeta amarilla a "+p+" ("+tn+")");
  return h('div',{class:'ev red'},"▮ "+e.min+"' EXPULSADO "+p+" ("+tn+")");
}
// ---- alineación
function ensureBench(){
  const t=team(G.team); const inL=i=>G.lineup.some(l=>l.idx===i);
  const fresh=!G.bench; if(fresh) G.bench=[];
  G.bench=G.bench.filter(i=>t.players[i]&&!inL(i)&&!isInjured(G.team,i));
  if((fresh||!G.benchSet)&&G.bench.length<7){ const others=t.players.filter(p=>!inL(p.idx)&&!G.bench.includes(p.idx)&&!isInjured(G.team,p.idx)).sort((a,b)=>(['POR','DEF','MED','DEL'].indexOf(a.dem)-['POR','DEF','MED','DEL'].indexOf(b.dem))||b.me-a.me); while(G.bench.length<7&&others.length) G.bench.push(others.shift().idx); }
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
    if((sb.type!=='none'&&isInjured(G.team,a))||(sa.type!=='none'&&isInjured(G.team,b))){ dialog('CAMBIO','Un lesionado no puede ser titular ni convocado.'); return false; }
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
  const markPend=p=>{ if(isInjured(G.team,p.idx)) return; pend=(pend===p.idx)?null:p.idx; sel=p.idx; build(); side(); };
  const build=()=>{ const st0=sc.scrollTop; sc.innerHTML=''; ensureBench();
    const tit=G.lineup.map(l=>t.players[l.idx]); const conv=G.bench.map(i=>t.players[i]).sort(order);
    const les=t.players.filter(p=>inL(p.idx)<0&&!G.bench.includes(p.idx)&&isInjured(G.team,p.idx));
    const noconv=t.players.filter(p=>inL(p.idx)<0&&!G.bench.includes(p.idx)&&!isInjured(G.team,p.idx)).sort(order);
    const rows=[{__group:'TITULARES ('+tit.length+'/11)'},...tit,{__group:'JUGADORES CONVOCADOS ('+conv.length+'/7)'},...conv,{__group:'JUGADORES NO CONVOCADOS'},...noconv,...(les.length?[{__group:'LESIONADOS'},...les]:[])];
    const colsFull=[{t:'Nº',w:18,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',w:80,k:p=>p.name},{t:'EN',w:18,cls:'r',k:p=>isInjured(G.team,p.idx)?'LES':99,cell:p=>isInjured(G.team,p.idx)?'grey':'g'},{t:'VE',w:20,cls:'r',k:p=>p.attrs[0]},{t:'RE',w:20,cls:'r',k:p=>p.attrs[1]},{t:'AG',w:20,cls:'r',k:p=>p.attrs[2]},{t:'CA',w:20,cls:'r',k:p=>p.attrs[3]},{t:'ME',w:22,cls:'r',k:p=>p.me,cell:()=>'y'},{t:'ROL',w:76,k:p=>h('span',{class:'f-con8'},ROLES_SHORT[p.roles[0]]+(p.roles.length>1?' +':''))},{t:'POS',w:76,k:p=>{const l=inL(p.idx); const w=G.inj&&G.inj[injKey(G.team,p.idx)]; if(w) return h('span',{class:'f-con8',style:{color:'#ff8a60'}},'✚ '+w+(w===1?' SEMANA':' SEMANAS')); if(l<0) return h('span',{class:'f-con8 grey'},'-'); const bad=rolePenalty(p,G.lineup[l].role); return h('span',{class:'f-con8',style:bad?{color:'#ff8a60'}:{color:'#8dff8d'}},ROLES_SHORT[G.lineup[l].role]+(bad?' ↓':''));}},{t:'DEM',w:32,cls:'c',k:p=>p.dem}];
    const colsM=[colsFull[0],colsFull[1],colsFull[7],{t:'POS / ROL',w:90,k:p=>{const l=inL(p.idx); const w=G.inj&&G.inj[injKey(G.team,p.idx)]; if(w) return h('span',{class:'f-con8',style:{color:'#ff8a60'}},'✚ '+w+(w===1?' SEM.':' SEM.')); if(l>=0){ const bad=rolePenalty(p,G.lineup[l].role); return h('span',{class:'f-con8',style:{color:bad?'#ff8a60':'#8dff8d'}},ROLES_SHORT[G.lineup[l].role]+(bad?' ↓':'')); } return h('span',{class:'f-con8',style:{color:'#9fb4e8'}},ROLES_SHORT[p.roles[0]]+(p.roles.length>1?' +':''));}},colsFull[10]];
    sc.appendChild(table(MUI?colsM:colsFull,rows,{rowClass:p=>(p.idx===pend?'pend ':'')+(p.idx===sel?'sel':''),onRow:p=>{ const now=Date.now(); const dbl=(lastClk.idx===p.idx&&now-lastClk.t<450); lastClk={idx:p.idx,t:now};
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
    const info=txt((p?(p.dorsal?p.dorsal+' ':'')+p.name+' · ME '+p.me+' · '+ROLES_SHORT[p.roles[0]]:'')+'\n'+(pend!==null?'CAMBIO: '+t.players[pend].name+' · pulsa su destino en la lista o en el campo':'Doble toque o pulsación larga en un jugador para cambiarlo'),0,166,440,30,'f-p8'); info.style.color=pend!==null?'#ffd080':'#9fb4e8'; T.appendChild(info);
    T.appendChild(btn('TÁCTICA',0,200,140,()=>scrTactica(),'blue','ico_terreno'));
    T.appendChild(btn('LESIONADOS',150,200,140,()=>scrLesionados(()=>scrAlineacion({sel})),'blue','ico_incidencias'));
    if(subBtn) subBtn.textContent=pend!==null?'CANCELAR CAMBIO':'SUSTITUIR';
    if(ctxBtn){ const l=inL(sel), inB=G.bench.includes(sel), inj=isInjured(G.team,sel); let label, cls='blue', f=null;
      if(l>=0){ label='QUITAR DEL ONCE'; cls='red'; f=()=>{ G.lineup.splice(l,1); if(G.bench.length<7) G.bench.push(sel); G.benchSet=true; refresh(); }; }
      else if(inj){ label='LESIONADO'; cls='dis'; }
      else if(G.lineup.length<11){ label='PONER TITULAR'; cls='green'; f=()=>{ const r0=p.roles[0]; G.lineup.push({idx:sel,role:r0,x:ROLE_POS[r0][0],y:ROLE_POS[r0][1]}); G.bench=G.bench.filter(i=>i!==sel); refresh(); }; }
      else if(inB){ label='DESCONVOCAR'; cls='red'; f=()=>{ G.bench=G.bench.filter(i=>i!==sel); G.benchSet=true; refresh(); }; }
      else { label='CONVOCAR'; f=()=>{ if(G.bench.length>=7) return dialog('CONVOCATORIA','Ya hay 7 convocados. Desconvoca a otro primero.'); G.bench.push(sel); G.benchSet=true; refresh(); }; }
      ctxBtn.textContent=label; ctxBtn.className='btn '+cls; ctxBtn.onclick=f; }
  };
  const pickDialog=(title,cands,f)=>{ const b=h('div',{class:'scroll',style:{maxHeight:'250px'}}); cands.forEach(p=>b.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'2px 0'},onclick:()=>{closeDialog(); f(p);}},(p.dorsal?p.dorsal+' ':'')+p.name+' ('+ROLES_SHORT[p.roles[0]]+')'))); dialog(title,b,[{t:'CANCELAR'}]); };
  const side=()=>{ if(MUI){ sideM(); return; } R.innerHTML=''; const p=t.players[sel]; const l=inL(sel); const inB=G.bench.includes(sel); const inj=isInjured(G.team,sel);
    R.appendChild(btn('PARÁMETROS',10,8,150,null,'green')); R.appendChild(btn('ESTADÍSTICAS',10,30,150,()=>scrEstadisticas(),'blue'));
    R.appendChild(lbl('MEDIA EQUIPO',10,58)); R.appendChild(txt(String(lineupME(t,G.lineup)),130,56,30,16,'f-e4'));
    { const nm=txt(p.name,10,76,150,14,'f-e5'); nm.style.whiteSpace='nowrap'; nm.style.overflow='hidden'; nm.style.textOverflow='ellipsis'; R.appendChild(nm); }
    PARAM_NAMES.forEach((n,i)=>{ const v=p.attrs[PARAM_IDX[i]]; const x=10+(i%2)*78, y=96+Math.floor(i/2)*30; const L=lbl(n,x,y); L.style.fontFamily='micro8'; L.style.fontSize='10px'; R.appendChild(L); R.appendChild(txt(String(v),x,y+11,30,12,'f-con')); R.appendChild(at(h('div',{class:'bar'},h('i',{style:{width:v+'%'}})),x+26,y+12,46,8)); });
    const pl=G.lineup.map(x=>{const rp=slotPos(x); const q=t.players[x.idx]; return {x:rp[0],y:rp[1],n:q.dorsal||'',cls:(rolePenalty(q,x.role)?'bad ':'')+(x.idx===sel?'sel':'')};});
    const pc=pitch(14,186,142,90,pl); pc.querySelectorAll('.dot').forEach(d=>{d.style.width='11px';d.style.height='11px';d.style.fontSize='8px';d.style.lineHeight='9px';d.style.transform='translate(-6px,-6px)';}); R.appendChild(pc);
    const subs=t.players.filter(q=>inL(q.idx)<0&&!isInjured(G.team,q.idx)).sort(order);
    if(l>=0){
      R.appendChild(btn('SUSTITUIR...',10,282,150,()=>pickDialog('ENTRA POR '+p.name.toUpperCase(),subs,q=>{ G.lineup[l]={idx:q.idx,role:G.lineup[l].role,x:G.lineup[l].x,y:G.lineup[l].y}; G.bench=G.bench.filter(i=>i!==q.idx); if(G.bench.length<7) G.bench.push(sel); sel=q.idx; refresh(); }),'green'));
      R.appendChild(btn('QUITAR DEL ONCE',10,304,150,()=>{ G.lineup.splice(l,1); if(G.bench.length<7) G.bench.push(sel); refresh(); },'red'));
    } else if(inj){ R.appendChild(btn('LESIONADO',10,282,150,null,'red')); }
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
    subBtn=btn('SUSTITUIR',110,446,120,()=>{ if(pend!==null){ pend=null; build(); side(); return; } const p=t.players[sel]; if(!p) return; if(isInjured(G.team,sel)) return dialog('CAMBIO','Un lesionado no puede ser titular ni convocado.'); markPend(p); },'green'); s.appendChild(subBtn);
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
function slimEvents(ev){ return ev.filter(e=>e.type==='goal'||e.type==='injury').map(e=>({min:e.min,type:e.type,side:e.side,score:e.score,weeks:e.weeks,player:{team:e.player.team,idx:e.player.idx}})); }
function playJornadaAI(lg, j){
  const cal=calOf(lg); if(j>cal.length) return []; const res=[];
  for(const m of cal[j-1]){ const hm=team(m[0]), aw=team(m[1]); if(lg===G.league&&(m[0]===G.team||m[1]===G.team)){ res.push(null); continue; }
    const lh=bestLineup(hm,'4-4-2'), la=bestLineup(aw,'4-4-2'); const r=simulateMatch(hm,aw,lh,la); applyInjuries(r); statsRecord(hm,aw,lh,la,r); r.events=slimEvents(r.events); res.push(r); }
  return res;
}
function scrMatchLive(hm,aw,lh,la,opts){
  const t=team(G.team); const r=simulateMatch(hm,aw,lh,la,{full:opts.att?isFull(hm,opts.att):false}); if(opts.att) r.att=opts.att; const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  setBg('fondo8'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:opts.title||'PARTIDO',date:gameDate(),sub:opts.sub||''}));
  const pl=[...lh.map(l=>{const rp=slotPos(l); return {x:rp[0]/2,y:rp[1],n:hm.players[l.idx].dorsal||'',cls:''};}),...la.map(l=>{const rp=slotPos(l); return {x:100-rp[0]/2,y:100-rp[1],n:aw.players[l.idx].dorsal||'',cls:'rival'};})];
  let score, clock, ev, P, H;
  if(MUI){ // móvil: equipos y marcador arriba, campo, y debajo el relato del partido
    H=panel(10,68,620,80); s.appendChild(H);
    score=h('div',{class:'f-e1 mlsc'},'0 - 0'); clock=h('div',{class:'f-e4 mlck'},"0'");
    H.appendChild(h('div',{class:'mlh'},h('img',{src:escImg(hm.id)}),h('div',{class:'mln'},hm.name),h('div',{class:'mls'},score,clock),h('div',{class:'mln'},aw.name),h('img',{src:escImg(aw.id)})));
    const F=panel(10,160,620,230); s.appendChild(F); F.appendChild(pitch(0,0,330,200,pl));
    const E=panel(10,400,620,200); s.appendChild(E); E.appendChild(h('div',{class:'hdr'},'EL PARTIDO · '+fmtNum(r.att)+' espectadores'+(isFull(hm,r.att)?' · ¡LLENO!':'')+' · Árbitro: '+refName(refFor(hm))));
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
    P.appendChild(pitch(392,96,218,140,pl));
    P.appendChild(txt('Espectadores: '+fmtNum(r.att)+(isFull(hm,r.att)?' (¡lleno!)':'')+'\nÁrbitro: '+refName(refFor(hm)),392,244,218,40,'f-p8'));
  }
  let min=0, gh=0, ga=0, ei=0, timer=null, speed=60, finished=false;
  const finish=()=>{ if(finished) return; finished=true; clearInterval(timer); timer=null; min=90; clock.textContent="90'"; score.textContent=r.gh+' - '+r.ga; while(ei<r.events.length){ ev.appendChild(eventLine(r.events[ei++],hm,aw)); } ev.scrollTop=1e6;
    const isHome=hm.id===G.team; const my=isHome?[r.gh,r.ga]:[r.ga,r.gh]; const msg=my[0]>my[1]?'¡VICTORIA!':my[0]<my[1]?'DERROTA':'EMPATE';
    if(MUI){ const m=h('div',{class:'f-e4 mlmsg'},msg); H.appendChild(m); s.appendChild(btn('CONTINUAR',240,446,120,()=>opts.after(r),'green')); }
    else { P.appendChild(txt(msg,392,356,218,16,'f-e4')).style.textAlign='center'; P.appendChild(btn('CONTINUAR',392,300,218,()=>opts.after(r),'green')); }
  };
  const tick=()=>{ if(finished) return; min++; clock.textContent=min+"'"; while(ei<r.events.length&&r.events[ei].min<=min){ const e=r.events[ei++]; if(e.type==='goal'){ if(e.side==='H') gh++; else ga++; score.textContent=gh+' - '+ga; } ev.appendChild(eventLine(e,hm,aw)); ev.scrollTop=1e6; } if(min>=90) finish(); };
  timer=setInterval(tick,speed);
  const host=MUI?s:P;
  host.appendChild(btn('RÁPIDO',20,350,100,()=>{clearInterval(timer); timer=setInterval(tick,8);},'blue'));
  host.appendChild(btn('FINALIZAR',130,350,100,()=>{ if(timer) finish(); },'red'));
}
function scrPartido(){
  const nm=nextMatch(); if(!nm) return scrOficina();
  const hm=team(nm[0]), aw=team(nm[1]); const isHome=nm[0]===G.team;
  const lh=isHome?G.lineup:bestLineup(hm,'4-4-2'), la=isHome?bestLineup(aw,'4-4-2'):G.lineup;
  scrMatchLive(hm,aw,lh,la,{title:'PARTIDO',sub:'JORNADA '+G.jornada+' · '+hm.stadium,att:isHome?attendanceModel(hm,aw):null,after:r=>{
    const res=playJornadaAI(G.league,G.jornada); const cal=calOf(G.league); const mi=cal[G.jornada-1].findIndex(m=>m[0]===nm[0]); const rr=Object.assign({},r,{events:slimEvents(r.events)}); res[mi]=rr; G.results[G.league][G.jornada-1]=res;
    LEAGUE_ORDER.forEach(k=>{ if(k!==G.league&&G.jornada<=calOf(k).length) G.results[k][G.jornada-1]=playJornadaAI(k,G.jornada); });
    applyInjuries(r); statsRecord(hm,aw,lh,la,r); decInjuries(); weeklyFinance(hm,aw,r); const log=applyTraining(); const j=G.jornada; G.jornada++; G.step++; marketTick(); saveGame(); if(log.length) dialog('ENTRENAMIENTO',log.slice(0,12).join('\n').replace(/\n/g,'<br>'),[{t:'ACEPTAR',f:()=>scrCalendario({j})}]); else scrCalendario({j});
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
