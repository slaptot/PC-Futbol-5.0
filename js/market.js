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
  state=state||{}; const me=team(G.team); setBg('fondo6'); const s=clearScreen();
  s.appendChild(topbar({team:me,title:'FICHAJES',date:gameDate(),sub:'PRESUPUESTO: '+fmtNum(G.budget)+' MILLONES'}));
  const mode=state.mode||'buy'; const lg=state.lg||G.league;
  const L=panel(10,68,170,372); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'MERCADO'));
  L.appendChild(btn('COMPRAR',10,22,150,()=>scrFichajes({mode:'buy',lg}),mode==='buy'?'green':'blue'));
  L.appendChild(btn('VENDER',10,44,150,()=>scrFichajes({mode:'sell',lg}),mode==='sell'?'green':'blue'));
  const groups=[...LEAGUE_ORDER.map(k=>[LEAGUE_SHORT[k],k]),['RESTO EUROPA','EU'],['AMÉRICA','AM']];
  if(mode==='buy'){ groups.forEach((g,i)=>L.appendChild(btn(g[0],10,78+i*22,150,()=>scrFichajes({mode,lg:g[1]}),g[1]===lg?'green':'blue'))); }
  L.appendChild(txt('Presupuesto:\n'+fmtNum(G.budget)+' M ptas.\nPlantilla: '+me.players.length+' jugadores (mín. 16, máx. 30).',10,262,150,70,'f-p8'));
  L.appendChild(btn('VOLVER',10,340,150,()=>scrOficina(),'blue','ico_volver'));
  const R=panel(190,68,440,372); s.appendChild(R);
  if(mode==='sell'){
    R.appendChild(h('div',{class:'hdr'},'VENDER JUGADORES · '+me.name.toUpperCase()));
    const sc=at(h('div',{class:'scroll'}),0,18,436,350); R.appendChild(sc);
    const ps=me.players.slice().sort((a,b)=>b.me-a.me);
    sc.appendChild(table([{t:'Nº',w:22,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',k:p=>p.name},{t:'ROL',w:80,k:p=>h('span',{class:'f-con8'},ROLES_SHORT[p.roles[0]])},{t:'EDAD',w:34,cls:'c',k:p=>playerAge(p)},{t:'ME',w:28,cls:'r',k:p=>p.me,cell:()=>'y'},{t:'VALOR',w:60,cls:'r',k:p=>fmtNum(playerValue(p))+' M'},{t:'',w:60,cls:'c',k:p=>h('span',{class:'f-e8b',style:{color:'#ff8080'}},'VENDER')}],ps,{onRow:p=>{ if(me.players.length<=16) return dialog('VENDER','No puedes bajar de 16 jugadores.'); if(isInjured(G.team,p.idx)) return dialog('VENDER','Ningún club quiere a un jugador lesionado.'); const price=Math.round(playerValue(p)*(0.75+Math.random()*0.2)); const buyers=Object.values(DATA.teams).filter(t=>t.id!==G.team&&t.league&&t.players.length<30); const buyer=buyers[Math.floor(Math.random()*buyers.length)]; dialog('OFERTA RECIBIDA','El '+buyer.name+' ofrece '+fmtNum(price)+' millones por '+p.name+'. ¿Aceptas?',[{t:'SÍ',cls:'green',f:()=>{ doTransfer(G.team,p.idx,buyer.id,price); G.budget+=price; saveGame(); scrFichajes(state); }},{t:'NO'}]); }}));
    return;
  }
  let teams; if(lg==='EU') teams=Object.values(DATA.teams).filter(t=>!t.league&&t.id<2800&&t.id>=200&&t.players.length>=14); else if(lg==='AM') teams=Object.values(DATA.teams).filter(t=>t.id>=2800&&t.id<9000); else teams=teamsOfLeague(lg);
  teams=teams.filter(t=>t.id!==G.team).sort((a,b)=>a.name.localeCompare(b.name)); const sel=state.team||0; const T=sel?team(sel):null;
  R.appendChild(h('div',{class:'hdr'},'COMPRAR · '+(T?T.name.toUpperCase():'TODOS LOS CLUBES')));
  const tl=at(h('div',{class:'scroll',style:{borderRight:'1px solid #3a4f9f'}}),0,18,100,350); R.appendChild(tl);
  const item=(name,id)=>h('div',{class:'f-con8',style:{padding:'1px 4px',cursor:'pointer',whiteSpace:'nowrap',overflow:'hidden',background:id===sel?'#2d49b8':'',color:id===sel?'#ffe24a':'#fff'},onclick:()=>scrFichajes({mode,lg,team:id})},name);
  tl.appendChild(h('div',{class:'f-e8b',style:{color:'#ffe24a',padding:'2px 4px'}},'CLUBES')); tl.appendChild(item('Todos',0)); teams.forEach(t=>tl.appendChild(item(t.name,t.id)));
  const sc=at(h('div',{class:'scroll'}),102,18,334,350); R.appendChild(sc);
  const ps=(T?T.players.map(p=>({p,t:T})):teams.flatMap(t=>t.players.map(p=>({p,t})))).sort((a,b)=>b.p.me-a.p.me).slice(0,T?999:150);
  const tb=table([{t:'JUGADOR',w:86,k:r=>r.p.name},{t:'CLUB',w:60,k:r=>h('span',{class:'f-con8'},r.t.name)},{t:'ROL',w:62,k:r=>h('span',{class:'f-con8'},ROLES_SHORT[r.p.roles[0]])},{t:'ED',w:22,cls:'c',k:r=>playerAge(r.p)},{t:'ME',w:24,cls:'r',k:r=>r.p.me,cell:()=>'y'},{t:'VALOR',w:44,cls:'r',k:r=>fmtNum(playerValue(r.p))}],ps,{onRow:r=>{ const p=r.p, T=r.t; if(me.players.length>=30) return dialog('FICHAR','La plantilla está completa (30 jugadores).'); if(T.players.length<=14) return dialog('FICHAR','El '+T.name+' no puede vender más jugadores.'); const ask=Math.round(playerValue(p)*(1+Math.random()*0.35)); dialog('FICHAR A '+p.name.toUpperCase(),'El '+T.name+' pide '+fmtNum(ask)+' millones de pesetas por '+p.name+' (ME '+p.me+', '+playerAge(p)+' años, '+ROLES[p.roles[0]]+').\nTu presupuesto: '+fmtNum(G.budget)+' M.',[{t:'PAGAR',cls:'green',f:()=>{ if(ask>G.budget) return dialog('FICHAR','No tienes presupuesto suficiente.'); doTransfer(T.id,p.idx,G.team,ask); G.budget-=ask; saveGame(); dialog('FICHAJE','¡'+p.name+' es nuevo jugador del '+me.name+'!',[{t:'ACEPTAR',f:()=>scrFichajes(state)}]); }},{t:'CANCELAR'}]); }}); tb.style.tableLayout='fixed'; sc.appendChild(tb);
}
