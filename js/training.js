// Entrenamientos y estadísticas de jugadores (Liga Manager)
const TRAIN_AREAS=[['fis','FÍSICO',[0,1],'VE y RE'],['fue','FUERZA',[2],'AG'],['tec','TÉCNICA',[3,4,5],'CA, pase y regate'],['rem','ATAQUE',[6,7],'Remate y tiro'],['def','DEFENSA',[8],'Entradas'],['por','PORTEROS',[9],'Portero']];
const TRAIN_MAX=12;
function pkey(p){ return p.id>0?'i'+p.id:'t'+p.team+'x'+p.idx; }
function findByKey(k){ if(k[0]==='i') return DATA.playersById[+k.slice(1)]; const m=/^t(\d+)x(\d+)$/.exec(k); const t=m&&team(+m[1]); return t&&t.players[+m[2]]; }
function migrateGame(){ if(!G) return; const t=team(G.team); if(!G.training) G.training={fis:2,fue:1,tec:2,rem:2,def:2,por:1}; if(!G.mods) G.mods={}; if(!G.stats) G.stats={}; if(!G.inj) G.inj={}; if(!G.transfers) G.transfers=[]; if(!G.contracts) G.contracts={}; if(!G.market) marketInit(); if(G.tv===undefined){ tvOffersInit(); if(G.jornada>1){ G.tv=G.tvOffers[0]; G.tvOffers=null; } } if(G.budget===undefined) G.budget=initBudget(t); if(!G.base) snapshotBase(); if(!G.cups){ G.cups=buildCups(); } if(!G.sched){ G.sched=buildSchedule(); G.step=Math.max(0,G.sched.findIndex(e=>e.type==='liga'&&e.j===G.jornada)); } LEAGUE_ORDER.forEach(k=>{ if(!G.results[k]) G.results[k]=[]; }); }
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
  if(trainingLoad()>10&&Math.random()<0.1){ const c=t.players.filter(p=>!isInjured(G.team,p.idx)); const p=c[Math.floor(Math.random()*c.length)]; if(p){ G.inj[injKey(G.team,p.idx)]=1+Math.floor(Math.random()*2); log.push(p.name+' se lesiona entrenando'); } }
  t._me=undefined; return log;
}
function applyMods(){ if(!G||!G.mods) return; for(const k in G.mods){ const p=findByKey(k); if(!p) continue; const m=G.mods[k]; for(let i=0;i<10;i++){ p.attrs[i]=Math.max(1,Math.min(99,p.attrs[i]+m[i])); } p.me=calcME(p); } Object.values(DATA.teams).forEach(t=>t._me=undefined); }
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
  lh.forEach(l=>{ const s=S(hm.players[l.idx]); s.pj++; s.min+=90; s.t=hm.id; }); la.forEach(l=>{ const s=S(aw.players[l.idx]); s.pj++; s.min+=90; s.t=aw.id; });
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
