// Pretemporada: amistosos y campamento antes de la primera jornada de cada temporada (partida nueva y
// nueva temporada). Y selección de equipo en el mapa de Europa, como en el juego original:
// país → división → equipo. Se usa para elegir tu club y para elegir el rival de cada amistoso.
const PRE_MAX=5; // partidos de pretemporada como el original: 4 de preparación y el de presentación (quinto, en casa y con precio); no cuentan para la liga
// precio del partido de presentación: lo paga el club al rival según su media ME (20 M con 60, 60 M con 85; mínimo 10, máximo 80)
function preFee(t){ const me=standingsAll(t).me; return Math.round(Math.min(80,Math.max(10,20+(me-60)*40/25))); }
const PRE_CAMPS={
  descanso:{name:'Descanso',desc:'Una semana de vacaciones: +10 de moral a toda la plantilla. No entrena.'},
  normal:{name:'Trabajo normal',desc:'Una semana de entrenamiento con el plan actual y +5 de forma.'},
  intenso:{name:'Intensivo',desc:'Dos semanas de entrenamiento con el plan actual, +10 de forma y -8 de moral. Más riesgo de lesiones si la carga es alta.'}};
// países del mapa (img/ui/mapa_europa.png, 300x220): código de país de la base de datos, zona de pulsación en % y divisiones
const MAP_COUNTRIES=[
  {k:'ESP',code:22,name:'ESPAÑA',lgs:['ESP1','ESP2'],x:4,y:64,w:21,h:24},
  {k:'ENG',code:30,name:'INGLATERRA',lgs:['ENG1','ENG2'],x:15,y:28,w:14,h:24},
  {k:'ITA',code:36,name:'ITALIA',lgs:['ITA1','ITA2'],x:35,y:66,w:12,h:28}];
// ---- torneos de verano de algunos clubes (de conocimiento general, no de los archivos del juego). Si el club tiene
// torneo, su partido es el último de la pretemporada, en casa, contra un invitado sorteado de la lista.
const TROFEOS={
  'Real Madrid':{name:'Trofeo Santiago Bernabéu',pool:['Manchester U.','Bayern M.','Milan','Juventus','Inter','Ajax']},
  'Barcelona':{name:'Trofeo Joan Gamper',pool:['Manchester U.','Arsenal','Milan','Parma','Bayern M.']},
  'Deportivo':{name:'Trofeo Teresa Herrera',pool:['Borussia D.','Oporto','Bayern M.','Ajax']},
  'Cádiz':{name:'Trofeo Carranza',pool:['Sevilla','Betis','Real Madrid','Barcelona']},
  'Valencia':{name:'Trofeo Naranja',pool:['Atalanta','Parma','Fiorentina','Bayern M.']}};
// trofeo del club para esta pretemporada: rival sorteado de los invitados (siempre distinto del propio club)
function preTrofeoFor(){
  const me=team(G.team); const tr=me&&TROFEOS[me.name]; if(!tr) return null;
  const pool=tr.pool.map(n=>Object.values(DATA.teams).find(t=>t.name===n)).filter(t=>t&&t.id!==G.team);
  if(!pool.length) return null; const rv=pool[Math.floor(Math.random()*pool.length)];
  return {name:tr.name,rival:rv.id,home:true,trofeo:true,played:false,pres:true};
}
function preInit(){ G.pre={on:true,max:PRE_MAX,games:[],plan:[],started:false,camp:null,balance:null,trofeo:preTrofeoFor()}; }
function preLeft(){ const pr=G.pre||{}; return PRE_MAX-(pr.games||[]).length-(pr.plan||[]).length-(pr.trofeo&&!pr.trofeo.played?1:0); }
function countryOfLg(lg){ const c=league(lg).country; return MAP_COUNTRIES.find(m=>m.code===c)||null; }

// ---- mapa de Europa: país (pulsando en el mapa) → división → equipo
// state: {country (k), onPick(id) para amistosos, exclude (id a quitar de la lista), back() para VOLVER}
function scrMapa(state){
  state=state||{}; const rival=!!state.onPick; setMusic('manager'); setBg('seleccion_fondo'); const s=clearScreen();
  s.appendChild(topbar({title:rival?'ELIGE RIVAL':'ELIGE PAÍS',right:rival?'PRETEMPORADA':curSeasonLabel()}));
  let country=state.country?MAP_COUNTRIES.find(m=>m.k===state.country):null;
  const box=at(h('div',{class:'mapbox'}),10,70,480,352); s.appendChild(box);
  box.appendChild(h('img',{class:'mapimg',src:'img/ui/mapa_europa.png',alt:'Mapa de Europa',draggable:'false'}));
  const hot={};
  MAP_COUNTRIES.forEach(c=>{ const d=h('div',{class:'mzona',title:c.name,style:{left:c.x+'%',top:c.y+'%',width:c.w+'%',height:c.h+'%'},onclick:()=>{ country=c; render(); }},h('img',{class:'mbandera',src:'img/band/'+c.code+'.png',alt:''}),h('span',{class:'f-p8 mnom'},c.name)); box.appendChild(d); hot[c.k]=d; });
  const P=panel(500,70,130,352); s.appendChild(P);
  const render=()=>{ MAP_COUNTRIES.forEach(c=>hot[c.k].classList.toggle('sel',!!country&&c.k===country.k));
    P.innerHTML=''; P.appendChild(h('div',{class:'hdr'},country?country.name:(rival?'RIVAL':'PAÍS')));
    if(!country){ const tx=txt('Pulsa un país en el mapa para ver sus divisiones.',8,36,114,80,'f-p8'); tx.style.lineHeight='12px'; P.appendChild(tx); return; }
    P.appendChild(at(h('img',{src:'img/band/'+country.code+'.png',style:{width:'56px',height:'40px'}}),37,34));
    P.appendChild(txt(country.name,8,84,114,16,'f-e5'));
    country.lgs.forEach((lg,i)=>P.appendChild(btn(LEAGUE_SHORT[lg],6,130+i*34,118,()=>scrSelectTeam(Object.assign({},state,{lg,back:()=>scrMapa(Object.assign({},state,{country:country.k}))})),'blue')));
  };
  if(rival){ s.appendChild(btn('RESTO EUROPA',10,446,150,()=>scrPaises(Object.assign({},state,{cont:'EU',back:()=>scrMapa(state)})),'blue')); s.appendChild(btn('AMÉRICA',170,446,110,()=>scrPaises(Object.assign({},state,{cont:'AM',back:()=>scrMapa(state)})),'blue')); }
  s.appendChild(btn('VOLVER',540,446,90,()=>state.back?state.back():go('menu'),'blue','ico_volver'));
  render();
}

// ---- pretemporada: primero se planifican los amistosos (hasta PRE_MAX, rival y campo); después se juegan en orden
// y, al terminar, el balance de victorias y derrotas mejora o empeora la plantilla antes de la liga
function preRivalOf(x){ return x.rival!==undefined?x.rival:(x.home?x.a:x.h); }
// ---- pretemporada en la oficina: panel "PRETEMPORADA" en lugar de "PRÓXIMO PARTIDO"
// Filas: amistosos jugados, planificados y, si el club tiene torneo, el trofeo siempre como último partido
function preOficinaPanel(P){
  const pr=G.pre, started=!!pr.started, plan=pr.plan||[], games=pr.games||[], tr=pr.trofeo&&!pr.trofeo.played?pr.trofeo:null;
  const tx=txt(started?'Juega los amistosos planificados'+(tr?' y el trofeo del club':'')+'. Al terminar, el balance mejora o empeora la plantilla antes de la liga.':'Planifica hasta 4 amistosos y el partido de presentación (en casa, con precio)'+(tr?'. El trofeo del club hace de presentación':'')+'. Después empieza la pretemporada.',8,28,284,60,'f-p8'); tx.style.lineHeight='12px'; P.appendChild(tx);
  P.appendChild(btn('PLANIFICAR',16,96,130,()=>scrPreAmistoso(),(!started&&preLeft()>0)?'blue':'blue dis','icono_balon_de_la_b'));
  P.appendChild(btn('CAMPAMENTO',154,96,130,()=>scrCampamento(),pr.camp?'blue dis':'blue','ico_terreno'));
  P.appendChild(lbl('AMISTOSOS',8,122));
  const rows=[...games.map(g=>({g})),...plan.map(p=>({p})),...(tr?[{t:tr}]:[])];
  for(let i=0;i<PRE_MAX;i++){ const y=142+i*20, row=rows[i];
    if(!row){ const t=txt((i+1)+'. Pendiente',8,y+2,284,15,'f-con'); t.style.color='#9fb4e8'; P.appendChild(t); continue; }
    if(row.g){ const g=row.g; const mine=g.home?g.gh>g.ga:g.ga>g.gh; const name=g.torneo?g.torneo:preName(g.h)+' · '+preName(g.a);
      const b=btn((i+1)+'. '+name+' '+g.gh+'-'+g.ga,8,y,284,()=>{},'blue'); b.style.pointerEvents='none'; b.style.overflow='hidden'; b.style.whiteSpace='nowrap';
      b.style.color=g.gh===g.ga?'#ffe24a':mine?'#8dff8d':'#ff8a60'; P.appendChild(b); }
    else if(row.p){ const it=row.p; const pres=it.pres||i===PRE_MAX-1; const b=btn(pres?(i+1)+'. Presentación · '+preName(it.rival)+' · '+fmtNum(preFee(team(it.rival)))+' M':(i+1)+'. '+preName(it.rival)+' · '+(it.home?'en casa':'fuera'),8,y,284,()=>{ if(!started) removePlanned(it); },'blue');
      if(started){ b.style.pointerEvents='none'; b.style.opacity='0.85'; } P.appendChild(b); }
    else { const it=row.t; const b=btn((i+1)+'. Presentación · '+preName(it.rival)+' · '+fmtNum(preFee(team(it.rival)))+' M',8,y,284,()=>{},'blue'); b.style.pointerEvents='none'; b.style.overflow='hidden'; b.style.whiteSpace='nowrap'; b.style.color='#ffe24a'; P.appendChild(b); } }
  P.appendChild(txt('Campamento: '+(pr.camp?PRE_CAMPS[pr.camp].name:'sin elegir'),8,246,284,14,'f-p8'));
  if(!started&&preLeft()>0) P.appendChild(btn('PLANIFICAR AUTO',40,266,220,()=>preAutoPlan(),'blue','icono_balon_de_la_b'));
  if(!started) P.appendChild(btn('EMPEZAR PRETEMPORADA',40,300,220,()=>preStart(),'green','ico_liga'));
  else if(plan.length) P.appendChild(btn('JUGAR AMISTOSO',40,300,220,()=>playNextPre(),'green','icono_balon_de_la_b'));
  else if(tr) P.appendChild(btn('JUGAR EL TROFEO',40,300,220,()=>playNextPre(),'green','ico_liga'));
  else P.appendChild(btn('EMPEZAR LIGA',40,300,220,()=>preEnd(),'green','ico_liga'));
}

// nombre abreviado para que el resultado quepa en una línea del panel
function preName(id){ const n=team(id).name; return n.length>11?n.slice(0,10).trimEnd()+'.':n; }
function removePlanned(it){ G.pre.plan=G.pre.plan.filter(x=>x!==it); saveGame(); scrOficina(); }
function preStart(){ G.pre.started=true; saveGame(); scrOficina(); }
function preEnd(){ if(!G.pre.balance) G.pre.balance=preBalance(); G.pre.on=false; saveGame();
  const b=G.pre.balance; if(!(G.pre.games||[]).length) return scrOficina();
  dialog('PRETEMPORADA','Balance: '+b.W+' victorias, '+b.D+' empates y '+b.L+' derrotas.<br>'+(b.dir>0?'La plantilla mejora':b.dir<0?'La plantilla empeora':'La plantilla no cambia')+': '+b.up+' atributos suben y '+b.down+' bajan.',[{t:'EMPEZAR LIGA',cls:'green',f:()=>scrOficina()}]); }

// balance: W frente a L decide la dirección (mejora si gana más de lo que pierde); P, con el nivel del rival y el campo,
// decide cuántos intentos hay (un intento por punto entero, máximo 3). Cada intento: cada jugador con 45 minutos o más
// en la mitad de los amistosos tiene un 50 % de subir o bajar un atributo de su demarcación.
function preBalance(){
  const me=team(G.team), games=G.pre.games||[]; const b={W:0,D:0,L:0,P:0,dir:0,n:0,up:0,down:0};
  if(!games.length) return b;
  const myME=standingsAll(me).me;
  games.forEach(g=>{ const D=Math.max(-1,Math.min(1,(standingsAll(team(preRivalOf(g))).me-myME)/10));
    const mine=g.home?g.gh:g.ga, theirs=g.home?g.ga:g.gh; const r=mine>theirs?1:mine<theirs?-1:0;
    if(r>0) b.W++; else if(r<0) b.L++; else b.D++;
    let w=r>0?1+0.5*D:r<0?1-0.5*D:1; if(r>0&&!g.home) w+=0.2; if(r<0&&g.home) w+=0.2;
    b.P+=r*w; });
  b.P=Math.max(-3,Math.min(3,b.P)); b.dir=b.W>b.L?1:b.W<b.L?-1:0; b.n=b.dir?Math.floor(Math.abs(b.P)):0;
  const need=Math.ceil(games.length/2); const cnt={}; games.forEach(g=>(g.pl||[]).forEach(k=>cnt[k]=(cnt[k]||0)+1));
  const elig=me.players.filter(p=>(cnt[pkey(p)]||0)>=need);
  G.mods=G.mods||{};
  for(let k=0;k<b.n;k++) elig.forEach(p=>{ if(Math.random()<0.5) return; const idx=rustIdx(p), i=idx[Math.floor(Math.random()*idx.length)];
    const mods=G.mods[pkey(p)]||(G.mods[pkey(p)]=[0,0,0,0,0,0,0,0,0,0]);
    if(b.dir>0){ if(p.attrs[i]<99&&(!p.pot||p.attrs[i]<p.pot)){ p.attrs[i]++; mods[i]++; b.up++; } }
    else if(p.attrs[i]>1){ p.attrs[i]--; mods[i]--; b.down++; }
    p.me=calcME(p); });
  me._me=undefined; return b;
}

// planificación automática: rivales de la misma división o de la contigua, repartidos por nivel (media ME) y
// ordenados de menor a mayor importancia; el más fuerte se juega en casa (más fácil que fuera) y los demás alternan
function preAutoPlan(){
  const pr=G.pre; const n=preLeft(); if(!pr||n<=0) return;
  const used=new Set([...(pr.games||[]),...(pr.plan||[]),...(pr.trofeo&&!pr.trofeo.played?[pr.trofeo]:[])].map(x=>preRivalOf(x)));
  const lgs=[G.league,SIBLING[G.league]];
  const cand=lgs.flatMap(k=>teamsOfLeague(k)).filter(t=>t.id!==G.team&&!t.custom&&!used.has(t.id)).map(t=>({t,me:standingsAll(t).me}));
  if(!cand.length) return;
  cand.sort((a,b)=>a.me-b.me);
  const picks=[]; const k=Math.min(n,cand.length);
  for(let i=0;i<k;i++){ const idx=Math.floor((i+0.5)*cand.length/k); picks.push(cand[idx].t); }
  const uniq=[...new Map(picks.map(t=>[t.id,t])).values()]; // por si el reparto repite un equipo
  uniq.sort((a,b)=>standingsAll(a).me-standingsAll(b).me);
  uniq.forEach((rv,i)=>{ const idx=(pr.games||[]).length+pr.plan.length; const pres=idx===PRE_MAX-1; const home=pres||((uniq.length-1-i)%2===0); pr.plan.push({rival:rv.id,home,pres}); });
  saveGame(); scrOficina();
}
// ---- amistoso planificado: elegir rival en el mapa y campo (no se puede repetir rival ni pasar de PRE_MAX)
function scrPreAmistoso(){
  if(!G.pre||!G.pre.on||G.pre.started||preLeft()<=0) return;
  scrMapa({onPick:id=>preVenue(id),exclude:G.team,back:()=>scrOficina()});
}
function preVenue(id){ const rv=team(id);
  if([...(G.pre.games||[]),...(G.pre.plan||[]),...(G.pre.trofeo&&!G.pre.trofeo.played?[G.pre.trofeo]:[])].some(x=>preRivalOf(x)===id)) return dialog('AMISTOSO','Ya tienes un amistoso planificado con '+rv.name+'.',[{t:'ACEPTAR',f:()=>scrOficina()}]);
  const idx=(G.pre.games||[]).length+(G.pre.plan||[]).length;
  if(idx===PRE_MAX-1) return dialog('PARTIDO DE PRESENTACIÓN','Rival: '+rv.name+'. Se juega en casa, ante la afición. Cuesta '+fmtNum(preFee(rv))+' millones que pagas al club.',[{t:'JUGAR',cls:'green',f:()=>{ G.pre.plan.push({rival:id,home:true,pres:true}); saveGame(); scrOficina(); }},{t:'CANCELAR',f:()=>scrOficina()}]);
  dialog('AMISTOSO DE PRETEMPORADA','Rival: '+rv.name+'. ¿Dónde se juega?',[{t:'EN CASA',cls:'green',f:()=>{ G.pre.plan.push({rival:id,home:true}); saveGame(); scrOficina(); }},{t:'FUERA',cls:'blue',f:()=>{ G.pre.plan.push({rival:id,home:false}); saveGame(); scrOficina(); }},{t:'CANCELAR',f:()=>scrOficina()}]); }
// juega el siguiente amistoso planificado, en directo
function playNextPre(){ const it=G.pre.plan[0]||(G.pre.trofeo&&!G.pre.trofeo.played?G.pre.trofeo:null); if(!it) return scrOficina(); const hid=it.home?G.team:it.rival, aid=it.home?it.rival:G.team; prePlay(hid,aid,it); }
function prePlay(hid,aid,it){ const hm=team(hid), aw=team(aid);
  if(!(G.lineup.length===11&&!lineupHasInjured())) return dialog('ALINEACIÓN','Antes de jugar necesitas un once completo y sin lesionados ni sancionados.',[{t:'ACEPTAR',f:()=>scrAlineacion()}]);
  const lh=hid===G.team?G.lineup:bestLineup(hm,teamFormation(hm)), la=aid===G.team?G.lineup:bestLineup(aw,teamFormation(aw));
  scrMatchLive(hm,aw,lh,la,{title:'AMISTOSO',sub:'PRETEMPORADA · '+hm.stadium,att:attendanceModel(hm,aw),after:r=>preAfter(hm,aw,r,it)});
}
// tras el amistoso: taquilla al 50 % si es en casa, forma para quien jugó y recupera parte del ritmo perdido;
// se guardan los jugadores con 45 minutos o más para el balance
function preAfter(hm,aw,r,it){ const home=hm.id===G.team, mine=home?'H':'A', t=team(G.team);
  const pl=t.players.filter(p=>((r.minutes&&r.minutes[mine+':'+p.idx])||0)>=45).map(p=>pkey(p));
  G.pre.games.push({h:hm.id,a:aw.id,gh:r.gh,ga:r.ga,home,pl,torneo:it&&it.trofeo?it.name:undefined}); if(it&&it.trofeo) it.played=true;
  if(it&&it.trofeo&&r.gh>r.ga){ ensurePalmares(); G.palmares.push({season:seasonLabel(G.seasonIdx||0),tipo:'Trofeo',nombre:it.name}); }
  G.pre.plan=G.pre.plan.filter(x=>x!==it);
  if(home){ const gate=Math.round(gateIncome(r.att,null,hm.capacity)*0.5); G.budget=(G.budget||0)+gate; finOther('Amistoso de pretemporada · '+aw.name,gate); }
  if(it&&it.pres){ const rvT=home?aw:hm, fee=preFee(rvT); G.budget=(G.budget||0)-fee; finOther('Partido de presentación · '+rvT.name,-fee); }
  t.players.forEach(p=>{ const min=(r.minutes&&r.minutes[mine+':'+p.idx])||0; if(min>0){ setForma(p,formaOf(p)+(min>=60?3:1)); preRustRelief(p); } });
  t._me=undefined; saveGame(); scrOficina();
}
function preRustRelief(p){ const k=pkey(p), rr=G.rust&&G.rust[k]; if(!rr||!rr.some(x=>x>0)) return; let ch=false;
  for(const i of rustIdx(p)){ if(rr[i]>0&&Math.random()<0.5){ rr[i]--; p.attrs[i]=Math.min(99,p.attrs[i]+1); ch=true; } }
  if(rr.every(x=>x===0)) delete G.rust[k]; if(ch) p.me=calcME(p); }

// ---- campamento: una sola vez por pretemporada
function scrCampamento(){
  if(G.pre.camp) return dialog('CAMPAMENTO','Ya has preparado la temporada con el campamento '+PRE_CAMPS[G.pre.camp].name.toLowerCase()+'.',[{t:'ACEPTAR'}]);
  const body=Object.keys(PRE_CAMPS).map(k=>'<b>'+PRE_CAMPS[k].name+':</b> '+PRE_CAMPS[k].desc).join('<br><br>');
  dialog('CAMPAMENTO','Elige cómo preparar la plantilla antes de la liga. Solo puedes elegir una vez.<br><br>'+body,[{t:'DESCANSO',cls:'blue',f:()=>applyCamp('descanso')},{t:'NORMAL',cls:'blue',f:()=>applyCamp('normal')},{t:'INTENSIVO',cls:'red',f:()=>applyCamp('intenso')},{t:'CANCELAR'}]);
}
function applyCamp(k){
  const t=team(G.team); let log=[];
  if(k==='descanso') t.players.forEach(p=>setMoral(p,moralOf(p)+10));
  else { const weeks=k==='intenso'?2:1; for(let w=0;w<weeks;w++) log=log.concat(applyTraining());
    t.players.forEach(p=>{ setForma(p,formaOf(p)+(k==='intenso'?10:5)); if(k==='intenso') setMoral(p,moralOf(p)-8); }); }
  t._me=undefined; G.pre.camp=k; saveGame();
  dialog('CAMPAMENTO',PRE_CAMPS[k].name+' completado.'+(log.length?'<br>'+log.slice(0,12).join('<br>'):''),[{t:'ACEPTAR',f:()=>scrOficina()}]);
}

// ---- resto de Europa y América: países con clubes en la base de datos pero sin liga propia.
// Se eligen solo como rival de un amistoso (no como equipo propio: la partida necesita una liga).
// Los clubes con id 9001-9013 son de Argentina; los ids 9900 en adelante son equipos especiales (estrellas,
// juveniles, jugadores libres) y el 9999 es el equipo propio: no se listan.
const PAISES_EU=[24,2,27,45,47,12,18,26,31,54,46,53,19,5,29,55,20,32,48,49,44,50,11,17,58,21,56,15,23,33,35,40,62,38,42,77];
const PAISES_AM=[10,3,14,16,57,64];
function teamsOfNat(code){ return Object.values(DATA.teams).filter(t=>t.nat===code&&t.id<9900&&t.id!==CUSTOM_ID).sort((a,b)=>a.name.localeCompare(b.name)); }

// lista de países de un continente (state.cont 'EU' | 'AM'); al elegir uno, la lista de sus clubes
function scrPaises(state){
  state=state||{}; const eu=state.cont!=='AM', codes=eu?PAISES_EU:PAISES_AM; setBg('seleccion_fondo'); const s=clearScreen();
  s.appendChild(topbar({title:'ELIGE RIVAL',right:eu?'EUROPA':'AMÉRICA'}));
  const P=panel(10,70,620,350); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},eu?'RESTO DE EUROPA':'AMÉRICA'));
  const grid=at(h('div',{class:'teamlist paises'}),8,22,604,320); P.appendChild(grid);
  codes.map(c=>({c,n:teamsOfNat(c).length})).filter(x=>x.n>0).sort((a,b)=>countryName(a.c).localeCompare(countryName(b.c))).forEach(x=>grid.appendChild(h('div',{onclick:()=>scrSelectTeam(Object.assign({},state,{nat:x.c,lg:null,sel:null,back:()=>scrPaises(state)}))},h('img',{src:'img/band/'+x.c+'.png'}),countryName(x.c)+' ('+x.n+')')));
  s.appendChild(btn('VOLVER',540,446,90,()=>state.back?state.back():scrMapa(),'blue','ico_volver'));
}
