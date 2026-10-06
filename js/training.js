// Entrenamientos y estadísticas de jugadores (Liga Manager)
const TRAIN_AREAS=[['fis','FÍSICO',[0,1],'VE y RE'],['fue','FUERZA',[2],'AG'],['tec','TÉCNICA',[3,4,5],'CA, pase y regate'],['rem','ATAQUE',[6,7],'Remate y tiro'],['def','DEFENSA',[8],'Entradas'],['por','PORTEROS',[9],'Portero']];
const TRAIN_MAX=12;
function pkey(p){ return p.id>0?'i'+p.id:'t'+p.team+'x'+p.idx; }
function findByKey(k){ if(k[0]==='i') return DATA.playersById[+k.slice(1)]; const m=/^t(\d+)x(\d+)$/.exec(k); const t=m&&team(+m[1]); return t&&t.players[+m[2]]; }
// Partidas guardadas antes de retirar las bajas: los índices de jugador (alineación, lesiones, traspasos,
// estadísticas, eventos) se convierten del índice original al actual. Se llama nada más cargar G.
function migrateBajas(){
  if(!G||G.bajasVer) return; G.bajasVer=1;
  const maps={}; const mp=tid=>{ if(maps[tid]) return maps[tid]; const t=DATA.teams[tid]; const m={}; if(t) t.players.forEach(p=>{ m[p.idx0===undefined?p.idx:p.idx0]=p.idx; }); return maps[tid]=m; };
  const ix=(tid,i)=>{ const m=mp(tid); return m[i]===undefined?-1:m[i]; };
  const rekey=o=>{ if(!o) return o; const n={}; for(const k in o){ const m=/^(\d+):(\d+)$/.exec(k); if(m){ const j=ix(+m[1],+m[2]); if(j>=0) n[m[1]+':'+j]=o[k]; continue; } const m2=/^t(\d+)x(\d+)$/.exec(k); if(m2){ const j=ix(+m2[1],+m2[2]); if(j>=0) n['t'+m2[1]+'x'+j]=o[k]; continue; } n[k]=o[k]; } return n; };
  if(G.transfers) G.transfers.forEach(x=>{ x.idx=ix(x.from,x.idx); }); if(G.transfers) G.transfers=G.transfers.filter(x=>x.idx>=0);
  if(G.lineup) G.lineup.forEach(l=>{ l.idx=ix(G.team,l.idx); });
  if(G.bench) G.bench=G.bench.map(i=>ix(G.team,i)).filter(i=>i>=0);
  // si un titular era una baja, se regenera la alineación automática (sin el equipo propio aún construido se deja para applyCustomTeam)
  if(G.lineup&&G.lineup.some(l=>l.idx<0)){ const t=DATA.teams[G.team]; if(t&&typeof bestLineup==='function'){ G.lineup=bestLineup(t,G.formation||'4-4-2'); G.bench=null; G.benchSet=false; } else G.lineup=G.lineup.filter(l=>l.idx>=0); }
  G.inj=rekey(G.inj); G.injKind=rekey(G.injKind); G.cards=rekey(G.cards); G.susp=rekey(G.susp); G.mods=rekey(G.mods); G.stats=rekey(G.stats); G.rust=rekey(G.rust); G.inact=rekey(G.inact); G.base=rekey(G.base);
  const ev=e=>{ if(e&&e.player&&e.player.idx!==undefined&&e.player.team!==undefined&&!e.player.name) e.player.idx=ix(e.player.team,e.player.idx); };
  if(G.results) Object.values(G.results).forEach(rs=>rs.forEach(j=>(j||[]).forEach(r=>(r&&r.events||[]).forEach(ev))));
  if(G.cups) Object.values(G.cups).forEach(c=>(c.rounds||[]).forEach(r=>(r.ties||[]).forEach(t=>(t.legs||[]).forEach(l=>(l.events||[]).forEach(ev)))));
}
function migrateGame(){ if(!G) return; const t=team(G.team); if(!G.training) G.training={fis:2,fue:1,tec:2,rem:2,def:2,por:1}; if(!G.mods) G.mods={}; if(!G.stats) G.stats={}; if(!G.inj) G.inj={}; if(!G.transfers) G.transfers=[]; if(!G.contracts) G.contracts={}; if(!G.injKind) G.injKind={}; if(!G.rust) G.rust={}; if(!G.inact) G.inact={}; if(!G.cards) G.cards={}; if(!G.susp) G.susp={}; if(G.week===undefined) G.week=0; if(!G.market) marketInit(); if(G.schedVer!==2&&G.sched){ G.schedVer=2; const done=e=>e.type==='liga'?e.j<G.jornada:(G.cups[e.cup]&&G.cups[e.cup].rounds[e.round]&&G.cups[e.cup].rounds[e.round].ties.every(t=>t.winner)); G.sched=buildSchedule(); let i=G.sched.findIndex(e=>!done(e)); G.step=i<0?G.sched.length:i; } if(G.cups&&G.cups.UEFA){ const r=G.cups.UEFA.rounds[4]; if(r&&r.nlegs===2&&r.ties.every(t=>!t.legs.length)) r.nlegs=1; } if(G.tv===undefined){ tvOffersInit(); if(G.jornada>1){ G.tv=G.tvOffers[0]; G.tvOffers=null; } } if(G.budget===undefined) G.budget=initBudget(t); if(!G.base) snapshotBase(); if(!G.cups){ G.cups=buildCups(); } if(!G.sched){ G.sched=buildSchedule(); G.step=Math.max(0,G.sched.findIndex(e=>e.type==='liga'&&e.j===G.jornada)); } LEAGUE_ORDER.forEach(k=>{ if(!G.results[k]) G.results[k]=[]; }); }
function trainingLoad(){ return Object.values(G.training||{}).reduce((a,b)=>a+b,0); }
function snapshotBase(){ const t=team(G.team); G.base={}; t.players.forEach(p=>G.base[pkey(p)]=p.attrs.slice()); }
function ageFactor(p){ const a=playerAge(p); if(a==='-') return 0.8; return a<=22?1.4:a<=26?1:a<=29?0.7:a<=32?0.4:0.2; }
function declineProb(p){ const a=playerAge(p); if(a==='-'||a<31) return 0; return 0.05*(a-30); }
function applyTraining(){
  const t=team(G.team); const log=[]; G.mods=G.mods||{};
  for(const p of t.players){
    if(isInjured(G.team,p.idx)) continue;
    const k=pkey(p); const mods=G.mods[k]||(G.mods[k]=[0,0,0,0,0,0,0,0,0,0]); let changed=false;
    for(const [area,,idxs] of TRAIN_AREAS){ const L=G.training[area]||0; if(area==='por'&&p.dem!=='POR') continue; if(area!=='por'&&p.dem==='POR'&&area!=='fis') continue;
      for(const i of idxs){ let d=0; if(Math.random()<L*0.05*ageFactor(p)) d=1; if(Math.random()<declineProb(p)) d-=1; if(d&&p.attrs[i]+d>=1&&p.attrs[i]+d<=99){ p.attrs[i]+=d; mods[i]+=d; changed=true; } } }
    if(changed){ const old=p.me; p.me=calcME(p); if(p.me!==old) log.push(p.name+' '+(p.me>old?'sube':'baja')+' a '+p.me); }
  }
  // riesgo por sobrecarga
  if(trainingLoad()>10&&Math.random()<0.1){ const c=t.players.filter(p=>!isInjured(G.team,p.idx)); const p=c[Math.floor(Math.random()*c.length)]; if(p){ const kinds=['Sobrecarga muscular','Sobrecarga gemelos','Contractura cervicales','Estiramiento abductor']; const kind=kinds[Math.floor(Math.random()*kinds.length)]; G.inj[injKey(G.team,p.idx)]=1+Math.floor(Math.random()*2); G.injKind=G.injKind||{}; G.injKind[injKey(G.team,p.idx)]=kind; log.push(p.name+' se lesiona entrenando: '+kind.toLowerCase()); } }
  t._me=undefined; return log;
}
// ---- falta de ritmo: los jugadores que no juegan pierden media poco a poco (no hay mínimos por jugador en la
// base de datos del juego, así que el tope es RUST_MAX puntos por atributo respecto a su valor con entrenamiento).
// Tras RUST_GRACE jornadas sin jugar, cada jornada cada atributo de su demarcación baja 1 punto con probabilidad
// RUST_P; cuando vuelve a jugar recupera 1 punto por atributo con probabilidad RUST_BACK. Los lesionados no cuentan.
const RUST_GRACE=2, RUST_MAX=8, RUST_P=0.25, RUST_BACK=0.5;
function rustIdx(p){ return p.dem==='POR'?[0,1,2,3,9]:[0,1,2,3,4,5,6,7,8]; }
function rustOf(p){ return (G&&G.rust&&G.rust[pkey(p)])||[0,0,0,0,0,0,0,0,0,0]; }
function rustTotal(p){ return rustOf(p).reduce((a,b)=>a+b,0); }
function inactWeeks(p){ return (G&&G.inact&&G.inact[pkey(p)])||0; }
function applyRust(){
  const t=team(G.team); const log=[]; G.rust=G.rust||{}; G.inact=G.inact||{}; const wk=G.week||0;
  for(const p of t.players){
    const k=pkey(p); if(isInjured(G.team,p.idx)) continue;
    const played=!!(G.stats&&G.stats[k]&&G.stats[k].last===wk); const old=p.me; const r=G.rust[k]||(G.rust[k]=[0,0,0,0,0,0,0,0,0,0]);
    if(played){ G.inact[k]=0; if(r.some(x=>x>0)){ for(const i of rustIdx(p)){ if(r[i]>0&&Math.random()<RUST_BACK){ r[i]--; p.attrs[i]=Math.min(99,p.attrs[i]+1); } } } }
    else { G.inact[k]=(G.inact[k]||0)+1; if(G.inact[k]>RUST_GRACE){ for(const i of rustIdx(p)){ if(r[i]<RUST_MAX&&p.attrs[i]>1&&Math.random()<RUST_P){ r[i]++; p.attrs[i]--; } } } }
    if(r.every(x=>x===0)) delete G.rust[k];
    p.me=calcME(p); if(p.me<old) log.push(p.name+' pierde ritmo ('+G.inact[k]+' jornadas sin jugar) y baja a '+p.me); else if(p.me>old) log.push(p.name+' recupera ritmo y sube a '+p.me);
  }
  G.week=wk+1; t._me=undefined; return log;
}
function applyMods(){ if(!G) return; G.mods=G.mods||{}; G.rust=G.rust||{}; const keys=new Set([...Object.keys(G.mods),...Object.keys(G.rust)]); for(const k of keys){ const p=findByKey(k); if(!p) continue; const m=G.mods[k]||[0,0,0,0,0,0,0,0,0,0], r=G.rust[k]||[0,0,0,0,0,0,0,0,0,0]; for(let i=0;i<10;i++){ p.attrs[i]=Math.max(1,Math.min(99,p.attrs[i]+m[i]-r[i])); } p.me=calcME(p); } Object.values(DATA.teams).forEach(t=>t._me=undefined); }
function deltaME(p){ const b=G.base&&G.base[pkey(p)]; if(!b) return 0; const q=Object.assign({},p,{attrs:b}); return p.me-calcME(q); }
function scrEntrenamiento(){
  const t=team(G.team); setBg('fondo4'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'ENTRENAMIENTO',date:gameDate(),sub:'CARGA DE TRABAJO: '+trainingLoad()+' / '+TRAIN_MAX}));
  const L=panel(10,68,250,372); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'PLAN SEMANAL'));
  const render=()=>{ L.querySelectorAll('.tr').forEach(e=>e.remove()); const sub=s.querySelector('.topbar .sub'); if(sub) sub.textContent='CARGA DE TRABAJO: '+trainingLoad()+' / '+TRAIN_MAX;
    const MUI=(typeof UI!=='undefined'&&UI==='mobile');
    TRAIN_AREAS.forEach((a,i)=>{ const y=26+i*40; const v=G.training[a[0]]||0;
      if(MUI){ // versión móvil: fila en columna con controles grandes
        const dec=btn('−',0,0,48,()=>{ if(v>0){ G.training[a[0]]=v-1; saveGame(); render(); } },'blue'); const inc=btn('+',0,0,48,()=>{ if(v<4&&trainingLoad()<TRAIN_MAX){ G.training[a[0]]=v+1; saveGame(); render(); } },'green');
        const row=h('div',{class:'tr trm'},h('div',{class:'trh'},h('span',{class:'f-e5',style:{color:'#ffe24a',letterSpacing:'1px'}},a[1]),h('span',{class:'f-m8',style:{color:'#9fb4e8',marginLeft:'8px'}},a[3])),
          h('div',{class:'trc'},dec,h('div',{class:'bar'},h('i',{style:{width:(v*25)+'%'}})),h('span',{class:'trv'},String(v)),inc));
        row.style.top=y+'px'; L.appendChild(row); return; }
      const row=at(h('div',{class:'tr'}),0,y,246,40);
      row.appendChild(lbl(a[1],10,2)); const d=txt(a[3],10,16,150,12,'f-m8'); d.style.whiteSpace='nowrap'; row.appendChild(d);
      row.appendChild(btn('-',164,4,22,()=>{ if(v>0){ G.training[a[0]]=v-1; saveGame(); render(); } },'blue'));
      row.appendChild(btn('+',218,4,22,()=>{ if(v<4&&trainingLoad()<TRAIN_MAX){ G.training[a[0]]=v+1; saveGame(); render(); } },'blue'));
      row.appendChild(at(h('div',{class:'bar'},h('i',{style:{width:(v*25)+'%'}})),188,10,28,9));
      row.appendChild(txt(String(v),196,22,20,12,'f-con'));
      L.appendChild(row); });
    const tot=trainingLoad(); const w=at(h('div',{class:'tr'}),0,270,246,96);
    w.appendChild(txt('Carga total: '+tot+' / '+TRAIN_MAX,10,0,230,12,'f-p8'));
    if(tot>10){ const al=txt('¡Sobrecarga! Más lesiones.',10,14,230,12,'f-p8'); al.style.color='#ff8080'; w.appendChild(al); }
    const n1=txt('Se aplica tras cada jornada.',10,34,230,12,'f-m8'); w.appendChild(n1);
    const n2=txt('Los jóvenes mejoran más; desde los 31 años se baja.',10,46,230,24,'f-m8'); n2.style.lineHeight='11px'; w.appendChild(n2); L.appendChild(w); };
  render();
  const R=panel(270,68,360,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'EVOLUCIÓN DE LA PLANTILLA'));
  const sc=at(h('div',{class:'scroll'}),0,18,356,352); R.appendChild(sc);
  const ps=t.players.slice().sort((a,b)=>b.me-a.me);
  sc.appendChild(table([{t:'Nº',w:22,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',k:p=>p.name},{t:'ED',w:26,cls:'c',k:p=>playerAge(p)},{t:'VE',w:24,cls:'r',k:p=>p.attrs[0]},{t:'RE',w:24,cls:'r',k:p=>p.attrs[1]},{t:'AG',w:24,cls:'r',k:p=>p.attrs[2]},{t:'CA',w:24,cls:'r',k:p=>p.attrs[3]},{t:'ME',w:26,cls:'r',k:p=>p.me,cell:()=>'y'},{t:'EVOL.',w:40,cls:'r',k:p=>{const d=deltaME(p); return d>0?'+'+d:d<0?String(d):'=';},cell:p=>{const d=deltaME(p); return d>0?'g':d<0?'grey':'';}}],ps,{onRow:p=>scrFicha(G.team,p.idx,()=>scrEntrenamiento())}));
  s.appendChild(btn('ESTADÍSTICAS',10,446,130,()=>scrEstadisticas(),'blue','ico_golea'));
  s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
// ---- estadísticas
function statsRecord(hm,aw,lh,la,r){
  G.stats=G.stats||{};
  const S=p=>{ const k=pkey(p); return G.stats[k]||(G.stats[k]={pj:0,min:0,g:0,ta:0,tr:0,t:p.team}); };
  const wk=G.week||0; lh.forEach(l=>{ const s=S(hm.players[l.idx]); s.pj++; s.min+=90; s.t=hm.id; s.last=wk; }); la.forEach(l=>{ const s=S(aw.players[l.idx]); s.pj++; s.min+=90; s.t=aw.id; s.last=wk; });
  for(const e of r.events){ const p=e.player.name?e.player:team(e.player.team).players[e.player.idx]; if(!p) continue; const s=S(p);
    if(e.type==='goal') s.g++; else if(e.type==='yellow') s.ta++; else if(e.type==='red'){ s.tr++; s.min-=Math.max(0,90-e.min); } }
}
function statOf(p){ return (G.stats&&G.stats[pkey(p)])||{pj:0,min:0,g:0,ta:0,tr:0}; }
function scrEstadisticas(state){
  state=state||{tab:'equipo'}; const t=team(G.team); setBg('fondo4'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'ESTADÍSTICAS',date:gameDate(),sub:'TEMPORADA 96-97'}));
  const P=panel(10,68,440,372); s.appendChild(P);
  const sc=at(h('div',{class:'scroll'}),0,18,436,352); P.appendChild(sc);
  if(state.tab==='equipo'){ P.appendChild(h('div',{class:'hdr'},t.name.toUpperCase()));
    const ps=t.players.slice().sort((a,b)=>statOf(b).min-statOf(a).min||b.me-a.me);
    sc.appendChild(table([{t:'Nº',w:22,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',k:p=>p.name},{t:'DEM',w:32,cls:'c',k:p=>p.dem},{t:'PJ',w:28,cls:'r',k:p=>statOf(p).pj},{t:'MIN',w:40,cls:'r',k:p=>statOf(p).min},{t:'GOL',w:32,cls:'r',k:p=>statOf(p).g,cell:()=>'y'},{t:'TA',w:28,cls:'r',k:p=>statOf(p).ta},{t:'TR',w:28,cls:'r',k:p=>statOf(p).tr},{t:'ME',w:28,cls:'r',k:p=>p.me}],ps,{onRow:p=>scrFicha(G.team,p.idx,()=>scrEstadisticas(state))})); }
  else { const field=state.tab==='goles'?'g':state.tab==='ta'?'ta':'tr'; P.appendChild(h('div',{class:'hdr'},state.tab==='goles'?'GOLEADORES (TODAS LAS COMPETICIONES)':state.tab==='ta'?'TARJETAS AMARILLAS':'EXPULSIONES'));
    const rows=Object.entries(G.stats||{}).map(([k,s])=>({p:findByKey(k),s})).filter(r=>r.p&&r.s[field]>0).sort((a,b)=>b.s[field]-a.s[field]||a.s.min-b.s.min).slice(0,60);
    sc.appendChild(table([{t:'POS',w:30,cls:'c',k:(r,i)=>i+1},{t:'JUGADOR',k:r=>r.p.name},{t:'EQUIPO',k:r=>team(r.s.t||r.p.team).name},{t:'PJ',w:28,cls:'r',k:r=>r.s.pj},{t:state.tab==='goles'?'GOLES':state.tab==='ta'?'TA':'TR',w:50,cls:'r',k:r=>r.s[field],cell:()=>'y'}],rows,{rowClass:r=>(r.s.t||r.p.team)===G.team?'me':'',onRow:r=>scrFicha(r.p.team,r.p.idx,()=>scrEstadisticas(state))})); }
  const R=panel(460,68,170,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'VER'));
  [['MI EQUIPO','equipo'],['GOLEADORES','goles'],['AMARILLAS','ta'],['EXPULSADOS','tr']].forEach((x,i)=>R.appendChild(btn(x[0],10,26+i*26,150,()=>scrEstadisticas({tab:x[1]}),state.tab===x[1]?'green':'blue')));
  R.appendChild(btn('ENTRENAMIENTO',10,160,150,()=>scrEntrenamiento(),'blue'));
  R.appendChild(txt('Partidos, minutos, goles y tarjetas de liga y copas de todos los equipos de la partida.',10,200,150,60,'f-p8'));
  R.appendChild(btn('VOLVER',10,330,150,()=>scrOficina(),'blue','ico_volver'));
}
