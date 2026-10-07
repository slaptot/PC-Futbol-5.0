// Ofertas de otros clubes por los jugadores del club propio. Cada jornada puede llegar una (más probable por
// los mejores); se aceptan o rechazan en la oficina. Si un club paga la cláusula de rescisión, el jugador se va
// sin poder evitarlo ("ha sido contratado por…"), como en el original. Las ofertas caducan a las dos jornadas.
function clauseOf(p){ const c=contractOf(p); if(!c.clause) c.clause=Math.max(10,Math.round(playerValue(p)*3)); return c.clause; }
function offersTick(){
  G.offersIn=(G.offersIn||[]).filter(o=>o.until>=G.jornada); const me=team(G.team); const j=G.jornada||1; const N=Math.max(30,calOf(G.league).length);
  if(j>N-3||me.players.length<=16) return; // sin ofertas en las últimas jornadas ni con la plantilla justa
  const cands=me.players.filter(p=>p.id>0&&!G.offersIn.some(o=>o.id===p.id)&&!isInjured(G.team,p.idx)); if(!cands.length) return;
  const pChance=0.22; if(Math.random()>pChance) return;
  const w=cands.map(p=>Math.pow(Math.max(1,p.me-50),3)*(playerAge(p)!=='-'&&playerAge(p)>=32?0.3:1)); const p=pick(cands,w);
  const clubs=Object.values(DATA.teams).filter(t=>t.league&&t.id!==G.team&&t.id<9000&&t.players.length<29&&teamME(t)>=p.me-8); if(!clubs.length) return;
  const club=clubs[Math.floor(Math.random()*clubs.length)]; const value=playerValue(p); const clause=clauseOf(p);
  let fee=Math.round(value*(0.85+Math.random()*0.6)); let byClause=false;
  if(p.me>=84&&teamME(club)>=p.me-3&&Math.random()<0.12&&clause<=value*3.5){ fee=clause; byClause=true; }
  G.offersIn.push({id:p.id,name:p.name,from:club.id,fee,until:j+2,clause:byClause});
}
function offerText(o){ const p=DATA.playersById[o.id]; const club=team(o.from); if(!p||!club) return ''; return 'El '+club.name+' ofrece '+fmtNum(o.fee)+' millones por '+p.name+' (ME '+p.me+', '+playerAge(p)+' años, valor '+fmtNum(playerValue(p))+' M, cláusula '+fmtNum(clauseOf(p))+' M).'; }
function offerAccept(o){ const me=team(G.team); const p=me.players.find(x=>x.id===o.id); const club=team(o.from); G.offersIn=(G.offersIn||[]).filter(x=>x!==o); if(!p||!club) return;
  doTransfer(G.team,p.idx,club.id,o.fee,true); G.budget=(G.budget||0)+o.fee; finOther('Venta '+p.name+' al '+club.name,o.fee); delete G.contracts['i'+p.id]; me._me=undefined;
  if(G.lineup.length<11){ G.lineup=bestLineup(me,G.formation||'4-4-2'); G.bench=null; G.benchSet=false; } saveGame(); }
function offerReject(o){ G.offersIn=(G.offersIn||[]).filter(x=>x!==o); const p=DATA.playersById[o.id]; if(p&&typeof setMoral==='function'&&o.fee>playerValue(p)*1.2) setMoral(p,moralOf(p)-4); saveGame(); }
// diálogo de ofertas pendientes (oficina); las de cláusula se ejecutan solas
function scrOfertasIn(after){
  const list=G.offersIn||[]; if(!list.length){ if(after) after(); return; }
  const o=list[0]; const p=DATA.playersById[o.id]; const club=team(o.from); if(!p||!club||p.team!==G.team){ G.offersIn=list.slice(1); return scrOfertasIn(after); }
  if(o.clause){ offerAccept(o); return dialog('CLÁUSULA DE RESCISIÓN',p.name+' ha sido contratado por el '+club.name+' al pagar su cláusula de rescisión: '+fmtNum(o.fee)+' millones ingresados.',[{t:'ACEPTAR',f:()=>scrOfertasIn(after)}]); }
  dialog('OFERTA POR '+p.name.toUpperCase(),offerText(o)+'<br>Si aceptas, el jugador se marcha ahora y el dinero entra en el presupuesto.',[{t:'ACEPTAR',cls:'green',f:()=>{ offerAccept(o); dialog('VENTA',p.name+' ha sido traspasado al '+club.name+' por '+fmtNum(o.fee)+' millones.',[{t:'ACEPTAR',f:()=>scrOfertasIn(after)}]); }},{t:'RECHAZAR',cls:'red',f:()=>{ offerReject(o); scrOfertasIn(after); }},{t:'MÁS TARDE',f:after}]);
}
