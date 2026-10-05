// Fichajes y lesiones (Liga Manager)
// ---- lesiones
function injKey(tid,idx){ return tid+':'+idx; }
function isInjured(tid,idx){ return !!(G&&G.inj&&G.inj[injKey(tid,idx)]); }
function injuredOf(tid){ if(!G||!G.inj) return []; const t=team(tid); return Object.entries(G.inj).filter(([k])=>k.split(':')[0]==String(tid)).map(([k,w])=>({p:t.players[+k.split(':')[1]],weeks:w})).filter(x=>x.p); }
function applyInjuries(r){ if(!G.inj) G.inj={}; for(const e of r.events){ if(e.type!=='injury') continue; const k=injKey(e.player.team,e.player.idx); G.inj[k]=Math.max(G.inj[k]||0,e.weeks); } }
function decInjuries(){ if(!G.inj) return; for(const k of Object.keys(G.inj)){ G.inj[k]--; if(G.inj[k]<=0) delete G.inj[k]; } }
function lineupHasInjured(){ return G.lineup.some(l=>isInjured(G.team,l.idx)); }
function scrLesionados(back){
  const t=team(G.team); const list=injuredOf(G.team);
  const b=h('div',{});
  if(!list.length) b.appendChild(h('div',{},'No hay jugadores lesionados.'));
  list.sort((x,y)=>y.weeks-x.weeks).forEach(x=>b.appendChild(h('div',{class:'f-con',style:{margin:'2px 0'}},h('img',{src:'img/ui/nuevo_fichaje.png',style:{display:'none'}}),'✚ '+x.p.name+' ('+ROLES_SHORT[x.p.roles[0]]+') · '+x.weeks+(x.weeks===1?' semana':' semanas'))));
  dialog('LESIONADOS · '+t.name.toUpperCase(),b,[{t:'ACEPTAR',f:back}]);
}
// ---- fichajes
function playerValue(p){
  const base=Math.max(5,Math.round(Math.pow(Math.max(0,p.me-45)/10,3)*25));
  const age=playerAge(p); let f=1; if(age!=='-'){ if(age<23) f=1.3; else if(age>33) f=0.4; else if(age>31) f=0.6; else if(age>29) f=0.8; }
  return Math.max(5,Math.round(base*f));
}
function initBudget(t){ return Math.round((t.capacity||15000)/100*3+(t.members||0)/100+(t.league&&t.league.endsWith('1')?300:100)); }
function reindex(t){ t.players.forEach((p,i)=>{ p.idx=i; p.team=t.id; p.me=calcME(p); if(p.id) DATA.playersById[p.id]=p; }); t._me=undefined; }
function moveInj(tid,oldIdx,newTid,newIdx){ if(!G.inj) return; const k=injKey(tid,oldIdx); if(G.inj[k]){ const w=G.inj[k]; delete G.inj[k]; G.inj[injKey(newTid,newIdx)]=w; } }
function doTransfer(fromTid,idx,toTid,price,record){
  const from=team(fromTid), to=team(toTid); const p=from.players[idx]; if(!p) return null;
  // conservar alineación del usuario por identidad
  const myT=team(G.team); const keep=(fromTid===G.team||toTid===G.team)?G.lineup.map(l=>({pl:myT.players[l.idx],role:l.role,x:l.x,y:l.y})):null; const keepB=(keep&&G.bench)?G.bench.map(i=>myT.players[i]).filter(Boolean):null;
  const injList=injuredOf(fromTid).map(x=>({pl:x.p,w:x.weeks})); if(G.inj) Object.keys(G.inj).filter(k=>k.split(':')[0]==String(fromTid)).forEach(k=>delete G.inj[k]);
  from.players.splice(idx,1); to.players.push(p); reindex(from); reindex(to);
  injList.forEach(x=>{ if(G.inj) G.inj[injKey(x.pl.team,x.pl.idx)]=x.w; });
  if(keep){ G.lineup=keep.filter(k=>k.pl.team===G.team).map(k=>({idx:k.pl.idx,role:k.role,x:k.x,y:k.y})); if(keepB) G.bench=keepB.filter(q=>q.team===G.team).map(q=>q.idx); }
  if(record!==false){ G.transfers=G.transfers||[]; G.transfers.push({from:fromTid,idx,to:toTid,price,name:p.name,j:G.jornada}); }
  return p;
}
function applyTransfers(){ if(!G||!G.transfers) return; const tr=G.transfers; G.transfers=[]; const inj=G.inj; G.inj={}; const lu=G.lineup; const bb=G.bench; G.lineup=[]; G.bench=[]; tr.forEach(x=>doTransfer(x.from,x.idx,x.to,x.price,false)); G.transfers=tr; G.inj=inj||{}; G.lineup=lu; G.bench=bb||[]; }
function scrFichajes(state){
  state=state||{}; const me=team(G.team); setBg('fondo6'); const s=clearScreen(); const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  s.appendChild(topbar({team:me,title:'FICHAJES',date:gameDate(),sub:'PRESUPUESTO: '+fmtNum(G.budget)+' MILLONES'}));
  const mode=state.mode||'buy'; const lg=state.lg||'ALL';
  const L=panel(10,68,170,372); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'MERCADO'));
  L.appendChild(btn('COMPRAR',10,22,150,()=>scrFichajes({mode:'buy',lg}),mode==='buy'?'green':'blue'));
  L.appendChild(btn('VENDER',10,44,150,()=>scrFichajes({mode:'sell',lg}),mode==='sell'?'green':'blue'));
  const groups=[['TODAS LAS LIGAS','ALL'],...LEAGUE_ORDER.map(k=>[LEAGUE_SHORT[k],k]),['RESTO EUROPA','EU'],['AMÉRICA','AM']];
  if(mode==='buy'){ groups.forEach((g,i)=>L.appendChild(btn(g[0],10,68+i*21,150,()=>scrFichajes({mode,lg:g[1]}),g[1]===lg?'green':'blue'))); }
  L.appendChild(txt('Presupuesto:\n'+fmtNum(G.budget)+' M ptas.\nPlantilla: '+me.players.length+' jugadores (mín. 16, máx. 30).',10,262,150,70,'f-p8'));
  (MUI?s:L).appendChild(btn('VOLVER',10,MUI?446:340,150,()=>scrOficina(),'blue','ico_volver'));
  const R=panel(190,68,440,372); s.appendChild(R);
  if(mode==='sell'){
    R.appendChild(h('div',{class:'hdr'},'VENDER JUGADORES · '+me.name.toUpperCase()));
    const sc=at(h('div',{class:'scroll'}),0,18,436,350); R.appendChild(sc);
    const ps=me.players.slice().sort((a,b)=>b.me-a.me);
    sc.appendChild(table([{t:'Nº',w:22,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',k:p=>p.name},{t:'ROL',w:80,k:p=>h('span',{class:'f-con8'},ROLES_SHORT[p.roles[0]])},{t:'EDAD',w:34,cls:'c',k:p=>playerAge(p)},{t:'ME',w:28,cls:'r',k:p=>p.me,cell:()=>'y'},{t:'VALOR',w:60,cls:'r',k:p=>fmtNum(playerValue(p))+' M'},{t:'',w:60,cls:'c',k:p=>h('span',{class:'f-e8b',style:{color:'#ff8080'}},'VENDER')}],ps,{onRow:p=>{ if(me.players.length<=16) return dialog('VENDER','No puedes bajar de 16 jugadores.'); if(isInjured(G.team,p.idx)) return dialog('VENDER','Ningún club quiere a un jugador lesionado.'); const price=Math.round(playerValue(p)*(0.75+Math.random()*0.2)); const buyers=Object.values(DATA.teams).filter(t=>t.id!==G.team&&t.league&&t.players.length<30); const buyer=buyers[Math.floor(Math.random()*buyers.length)]; dialog('OFERTA RECIBIDA','El '+buyer.name+' ofrece '+fmtNum(price)+' millones por '+p.name+'. ¿Aceptas?',[{t:'SÍ',cls:'green',f:()=>{ doTransfer(G.team,p.idx,buyer.id,price); G.budget+=price; if(G.contracts) delete G.contracts['i'+p.id]; G.market=(G.market||[]).filter(x=>x.id!==p.id); const e=mkEntry(p,buyer,p.me>=80); e.ask=Math.round(price*1.25); G.market.push(e); saveGame(); dialog('VENTA','Has vendido a '+p.name+' al '+buyer.name+' por '+fmtNum(price)+' millones. Queda en el mercado como transferible del '+buyer.name+'.',[{t:'ACEPTAR',f:()=>scrFichajes(state)}]); }},{t:'NO'}]); }}));
    return;
  }
  const flt=state.lg||'ALL'; const list=marketList(flt).sort((a,b)=>b.p.me-a.p.me);
  R.appendChild(h('div',{class:'hdr'},'MERCADO DE FICHAJES · JORNADA '+G.jornada+' · '+list.length+' JUGADORES'));
  const sc=at(h('div',{class:'scroll'}),0,18,436,350); R.appendChild(sc);
  if(!list.length) sc.appendChild(txt('Ahora mismo no hay jugadores transferibles en este mercado. Cada jornada aparecen nuevos.',8,8,400,30,'f-p12'));
  const tb=table([{t:'JUGADOR',w:84,k:r=>r.p.name},{t:'CLUB',w:60,k:r=>h('span',{class:'f-con8'},r.t.name)},{t:'ROL',w:60,k:r=>h('span',{class:'f-con8'},ROLES_SHORT[r.p.roles[0]])},{t:'ED',w:22,cls:'c',k:r=>playerAge(r.p)},{t:'ME',w:24,cls:'r',k:r=>r.p.me,cell:()=>'y'},{t:'FICHA',w:40,cls:'r',k:r=>fmtNum(r.m.ficha)},{t:'PRECIO',w:46,cls:'r',k:r=>fmtNum(r.m.ask)},{t:'HASTA',w:40,cls:'c',k:r=>'J.'+r.m.until}],list,{rowClass:r=>r.m.star?'me':'',onRow:r=>scrOferta(r,state)}); tb.style.tableLayout='fixed'; sc.appendChild(tb);
}

// ---- mercado de fichajes variable: cada jornada aparecen y desaparecen jugadores transferibles
const MARKET_SIZE=24;
function fichaOf(p){ return Math.max(2,Math.round(playerValue(p)*0.03)); }
function contractFicha(p){ const c=G.contracts&&G.contracts['i'+p.id]; return c?c.ficha:fichaOf(p); }
function marketGroup(t){ if(t.league) return t.league; return t.id>=2800?'AM':'EU'; }
function marketCandidates(){ return Object.values(DATA.teams).filter(t=>t.id!==G.team&&t.players.length>=15&&t.id<9000&&(t.league||t.id>=200)); }
function mkEntry(p,t,star){ const v=playerValue(p); return {t:t.id,id:p.id,until:G.jornada+3+Math.floor(Math.random()*4),ask:Math.round(v*(0.9+Math.random()*0.4)),ficha:Math.round(fichaOf(p)*(0.9+Math.random()*0.3)),star:!!star}; }
function inMarket(id){ return (G.market||[]).some(m=>m.id===id); }
function marketPick(){ // jugador normal: primero la liga (ponderada) y luego un club y un jugador al azar
  const teams=marketCandidates(); const w=[['ESP1',22],['ESP2',12],['ENG1',14],['ENG2',6],['ITA1',14],['ITA2',6],['EU',18],['AM',8]]; const tot=w.reduce((a,x)=>a+x[1],0);
  for(let i=0;i<40;i++){ let r=Math.random()*tot, g=w[0][0]; for(const x of w){ r-=x[1]; if(r<=0){ g=x[0]; break; } }
    const ts=teams.filter(t=>marketGroup(t)===g); if(!ts.length) continue; const t=ts[Math.floor(Math.random()*ts.length)];
    const pool=t.players.filter(p=>p.id&&!inMarket(p.id)&&(p.me<80||Math.random()<0.1)); if(!pool.length) continue;
    return mkEntry(pool[Math.floor(Math.random()*pool.length)],t,false); }
  return null;
}
function marketPickStar(){ // figura de 80 a más de 90, de cualquier liga
  const all=[]; marketCandidates().forEach(t=>t.players.forEach(p=>{ if(p.id&&p.me>=80&&!inMarket(p.id)) all.push({p,t}); })); if(!all.length) return null;
  const r=Math.random(); const min=r<0.15?90:r<0.5?85:80; let pool=all.filter(x=>x.p.me>=min); if(!pool.length) pool=all;
  const x=pool[Math.floor(Math.random()*pool.length)]; return mkEntry(x.p,x.t,true);
}
function marketInit(){ G.market=[]; G.marketStar=G.jornada||1; for(let i=0;i<MARKET_SIZE;i++){ const e=i<2?marketPickStar():marketPick(); if(e) G.market.push(e); } }
function marketTick(){ // tras cada jornada: caducan unos, entran otros y, cada pocas jornadas, una figura
  if(!G.market) return marketInit();
  G.market=G.market.filter(m=>m.until>G.jornada&&marketPlayer(m));
  const n=3+Math.floor(Math.random()*4); for(let i=0;i<n&&G.market.length<MARKET_SIZE+6;i++){ const e=marketPick(); if(e) G.market.push(e); }
  if(G.jornada-(G.marketStar||0)>=3||Math.random()<0.2){ const e=marketPickStar(); if(e){ G.market.push(e); G.marketStar=G.jornada; } }
}
function marketPlayer(m){ const t=team(m.t); if(!t||t.id===G.team) return null; const p=t.players.find(q=>q.id===m.id); return p?{p,t,m}:null; }
function marketList(filter){ return (G.market||[]).map(marketPlayer).filter(Boolean).filter(r=>!filter||filter==='ALL'||marketGroup(r.t)===filter); }
function weeklyFinance(hm,aw,r){ // taquilla del partido en casa y sueldos de la plantilla (ficha anual / jornadas)
  const me=team(G.team); const N=Math.max(30,calOf(G.league).length); const wages=Math.round(me.players.reduce((a,p)=>a+contractFicha(p),0)/N);
  const gate=(hm.id===G.team)?Math.round((r.att||0)*1200/1e6):0; G.budget=(G.budget||0)+gate-wages; G.lastFin={gate,wages}; return G.lastFin;
}
// ---- popup "HACER OFERTA", con los conceptos del juego original
function scrOferta(r,state){
  const p=r.p, T=r.t, me=team(G.team); const v=playerValue(p); const age=playerAge(p);
  const demand={fee:r.m?r.m.ask:Math.round(v*1.1), ficha:r.m?r.m.ficha:fichaOf(p)};
  const o={fee:demand.fee,ficha:demand.ficha,years:3,clause:demand.fee*3,goal:0,casa:false,renov:false,libertad:false};
  const m=$('#modal'); m.innerHTML=''; m.classList.add('on');
  const d=h('div',{class:'dlg offer'},h('h3',{},'HACER OFERTA · '+p.name.toUpperCase()));
  d.appendChild(h('div',{class:'f-p8 offinfo'},T.name+' · '+ROLES[p.roles[0]]+' · '+age+' años · ME '+p.me+'\nEl '+T.name+' pide '+fmtNum(demand.fee)+' millones por el traspaso. El jugador pide una ficha anual de '+fmtNum(demand.ficha)+' millones.'));
  const rows=h('div',{class:'offrows'}); d.appendChild(rows); const tot=h('div',{class:'f-p8 offtot'}); d.appendChild(tot);
  const upds=[]; const upd=()=>{ upds.forEach(f=>f()); tot.textContent='Traspaso '+fmtNum(o.fee)+' M + ficha '+fmtNum(o.ficha)+' M/año × '+o.years+' · Presupuesto: '+fmtNum(G.budget)+' M'; };
  const mkb=(t,f)=>h('div',{class:'btn blue offb',onclick:f},t);
  const num=(label,key,step,min,max,fmt)=>{ const val=h('span',{class:'offval'}); rows.appendChild(h('div',{class:'offrow'},h('span',{class:'offlbl'},label),h('div',{class:'offctl'},mkb('−',()=>{o[key]=Math.max(min,o[key]-step); upd();}),val,mkb('+',()=>{o[key]=Math.min(max,o[key]+step); upd();})))); upds.push(()=>{ val.textContent=fmt?fmt(o[key]):String(o[key]); }); };
  const tog=(label,key)=>{ const b=h('div',{class:'btn blue offt',onclick:()=>{o[key]=!o[key]; upd();}}); rows.appendChild(h('div',{class:'offrow'},h('span',{class:'offlbl'},label),b)); upds.push(()=>{ b.textContent=o[key]?'SÍ':'NO'; b.className='btn offt '+(o[key]?'green':'blue'); }); };
  num('OFERTA AL EQUIPO (M)','fee',Math.max(5,Math.round(demand.fee*0.05)),5,999999,fmtNum);
  num('FICHA ANUAL (M)','ficha',Math.max(1,Math.round(demand.ficha*0.1)),1,99999,fmtNum);
  num('AÑOS DE CONTRATO','years',1,1,5);
  num('CLÁUSULA DE RESCISIÓN (M)','clause',Math.max(10,Math.round(demand.fee*0.25)),0,9999999,fmtNum);
  num('PRIMA POR GOL (M)','goal',1,0,50);
  tog('CASA Y COCHE','casa'); tog('PARTIDOS PARA RENOVACIÓN','renov'); tog('LIBERTAD POR DESCENSO','libertad');
  const bar=h('div',{}); bar.appendChild(h('div',{class:'btn green',onclick:()=>offerResolve(r,o,demand,state)},'HACER OFERTA')); bar.appendChild(h('div',{class:'btn red',onclick:closeDialog},'RECHAZAR')); d.appendChild(bar);
  m.appendChild(h('div',{class:'fade'})); m.appendChild(d); upd();
}
function offerResolve(r,o,demand,state){
  const p=r.p, T=r.t, me=team(G.team);
  if(o.fee>G.budget) return dialog('OFERTA','No tienes suficiente dinero para realizar la oferta.');
  if(me.players.length>=30) return dialog('OFERTA','La plantilla está completa (30 jugadores).');
  if(T.players.length<=14) return dialog('OFERTA','El '+T.name+' no puede vender más jugadores.');
  const again=()=>scrOferta(r,state);
  if(o.fee<demand.fee*(0.92+Math.random()*0.1)){ closeDialog(); return dialog('OFERTA RECHAZADA','El '+T.name+' ha rechazado tu oferta por '+p.name+'. Pide '+fmtNum(demand.fee)+' millones por el traspaso.',[{t:'ACEPTAR',f:again}]); }
  const goals=p.dem==='DEL'?12:p.dem==='MED'?5:1; const age=playerAge(p);
  let score=o.ficha+o.goal*goals*0.8+(o.casa?demand.ficha*0.12:0)+(o.libertad?demand.ficha*0.04:0)+(o.renov?demand.ficha*0.03:0);
  if(age!=='-'){ if(age>=30&&o.years>=3) score+=demand.ficha*0.06; if(age<25&&o.years>=4) score-=demand.ficha*0.04; }
  if(o.clause<demand.fee*1.5) score+=demand.ficha*0.04;
  if(score<demand.ficha*(0.95+Math.random()*0.12)){ closeDialog(); return dialog('OFERTA RECHAZADA',p.name+' ha rechazado tu oferta de contrato: quiere una ficha mayor o mejores condiciones (primas por gol, casa y coche, cláusula más baja…).',[{t:'ACEPTAR',f:again}]); }
  closeDialog(); doTransfer(T.id,p.idx,G.team,o.fee); G.budget-=o.fee; G.contracts=G.contracts||{}; G.contracts['i'+p.id]={ficha:o.ficha,years:o.years,clause:o.clause,goal:o.goal,casa:o.casa,renov:o.renov,libertad:o.libertad,season:G.seasonIdx||0};
  G.market=(G.market||[]).filter(x=>x.id!==p.id); saveGame();
  dialog('FICHAJE','¡'+p.name+' firma por el '+me.name+'! Ficha anual de '+fmtNum(o.ficha)+' millones durante '+o.years+' año'+(o.years>1?'s':'')+', cláusula de rescisión de '+fmtNum(o.clause)+' millones'+(o.goal?', '+o.goal+' M por gol':'')+(o.casa?', casa y coche':'')+'.',[{t:'ACEPTAR',f:()=>scrFichajes(state)}]);
}
