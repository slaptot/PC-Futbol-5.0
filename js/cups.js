// Copas nacionales y competiciones europeas (Liga Manager)
// 'at' son fracciones de la liga: la Copa termina a final de temporada (junio) y las europeas en mayo
const CUP_DEFS={
  COPA:{rounds:['DIECISEISAVOS','OCTAVOS','CUARTOS','SEMIFINALES','FINAL'],legs:[2,2,2,2,1],at:[0.14,0.30,0.48,0.70,0.96],size:32},
  CE:{name:'Copa de Europa',rounds:['OCTAVOS','CUARTOS','SEMIFINALES','FINAL'],legs:[2,2,2,1],at:[0.10,0.38,0.64,0.88],size:16},
  RECOPA:{name:'Recopa de Europa',rounds:['OCTAVOS','CUARTOS','SEMIFINALES','FINAL'],legs:[2,2,2,1],at:[0.12,0.41,0.67,0.86],size:16},
  UEFA:{name:'Copa de la UEFA',rounds:['DIECISEISAVOS','OCTAVOS','CUARTOS','SEMIFINALES','FINAL'],legs:[2,2,2,2,1],at:[0.07,0.22,0.43,0.62,0.90],size:32},
};
function cupAfter(k){ const N=calOf(G.league).length; const d=CUP_DEFS[k]; const out=[]; let last=0; d.at.forEach(f=>{ let j=Math.max(last+1,Math.round(f*N)); if(j>N) j=N; out.push(j); last=j; }); return out; }
const CUP_NAMES={22:'Copa del Rey',30:'FA Cup',36:'Coppa Italia'};
function cupName(k){ return k==='COPA'?(CUP_NAMES[league(G.league).country]||'Copa'):CUP_DEFS[k].name; }
function teamME(t){ if(t._me===undefined){ const l=bestLineup(t,'4-4-2'); t._me=l.length>=11?lineupME(t,l):0; } return t._me; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const k=Math.floor(Math.random()*(i+1)); [a[i],a[k]]=[a[k],a[i]]; } return a; }
function buildCups(){
  const me=team(G.team); const country=league(G.league).country; const sib=SIBLING[G.league];
  const cups={};
  // copa nacional: 1ª completa + mejores de 2ª hasta 32
  const d1=teamsOfLeague(G.league.endsWith('1')?G.league:sib), d2=teamsOfLeague(G.league.endsWith('1')?sib:G.league);
  let nat=[...d1]; const extra=d2.filter(t=>!nat.includes(t)).sort((a,b)=>teamME(b)-teamME(a)); nat=nat.concat(extra.slice(0,32-nat.length)).slice(0,32);
  if(!nat.includes(me)){ nat[nat.length-1]=me; }
  cups.COPA=mkCup('COPA',nat.map(t=>t.id));
  // europeas: mejor equipo por país (excluido el del usuario), por media
  const foreign=Object.values(DATA.teams).filter(t=>t.id<2800&&t.nat!==country&&t.players.length>=14&&!(t.nat===22&&!t.league)&&!(t.nat===30&&!t.league)&&!(t.nat===36&&!t.league));
  const byCountry={}; foreign.forEach(t=>{ (byCountry[t.nat]=byCountry[t.nat]||[]).push(t); });
  const lpOf=t=>{ const lp=G.lastPos&&G.lastPos[t.id]; return lp&&lp.lg.endsWith('1')?lp.pos:999; };
  Object.values(byCountry).forEach(a=>a.sort((x,y)=>lpOf(x)-lpOf(y)||teamME(y)-teamME(x)));
  const pick=(rank)=>Object.values(byCountry).map(a=>a[rank]).filter(Boolean).sort((x,y)=>teamME(y)-teamME(x));
  const lp=G.lastPos&&G.lastPos[me.id]; const pos=lp?(lp.lg===G.league&&G.league.endsWith('1')?lp.pos:99):(me.positions&&me.positions.length?me.positions[me.positions.length-1]:99);
  const lc=G.lastCups||{}; const champ=pos===1||lc.CE===me.id, recopa=!champ&&lc.COPA===me.id, uefa=!champ&&!recopa&&((pos>=2&&pos<=5)||lc.UEFA===me.id);
  const own=teamsOfLeague(divKeys(G.league)[0]).filter(t=>t.id!==me.id).sort((a,b)=>lpOf(a)-lpOf(b)||teamME(b)-teamME(a));
  let ce=pick(0).slice(0,15); ce.push(champ?me:own[0]); cups.CE=mkCup('CE',shuffle(ce.map(t=>t.id)));
  let rc=pick(2).slice(0,recopa?15:16); if(recopa) rc.push(me); cups.RECOPA=mkCup('RECOPA',shuffle(rc.map(t=>t.id)));
  let uf=pick(1).concat(pick(3)).slice(0,uefa?29:30); if(uefa) uf.push(me); uf=uf.concat(own.slice(1,3)); cups.UEFA=mkCup('UEFA',shuffle(uf.slice(0,32).map(t=>t.id)));
  return cups;
}
function mkCup(k,ids){ return {key:k,teams:ids,rounds:[],alive:ids.slice(),winner:null}; }
function buildSchedule(){
  const N=calOf(G.league).length; const ev=[];
  for(let j=1;j<=N;j++){ ev.push({type:'liga',j});
    for(const k of Object.keys(G.cups)){ const d=CUP_DEFS[k]; const after=cupAfter(k); after.forEach((aj,ri)=>{ if(aj===j&&ri<d.rounds.length) ev.push({type:'cup',cup:k,round:ri}); }); } }
  for(const k of Object.keys(G.cups)){ const d=CUP_DEFS[k]; cupAfter(k).forEach((j,ri)=>{ if(j>N&&ri<d.rounds.length) ev.push({type:'cup',cup:k,round:ri}); }); }
  return ev;
}
function curEvent(){ return G.sched&&G.sched[G.step]; }
function eventLabel(e){ if(!e) return 'TEMPORADA FINALIZADA'; if(e.type==='liga') return 'JORNADA '+e.j; const d=CUP_DEFS[e.cup]; return cupName(e.cup).toUpperCase()+' · '+d.rounds[e.round]; }
function eventDate(e){ if(!e) return mgrDate(G.league,calOf(G.league).length); if(e.type==='liga') return mgrDate(G.league,e.j); const j=Math.min(cupAfter(e.cup)[e.round],calOf(G.league).length); const d=new Date(mgrDate(G.league,j)); d.setDate(d.getDate()+3); return d; }
function userInCup(k){ const c=G.cups[k]; return c.alive.includes(G.team); }
function drawRound(c,ri){
  const d=CUP_DEFS[c.key]; const ids=shuffle(c.alive.slice()); const ties=[];
  for(let i=0;i+1<ids.length;i+=2) ties.push({a:ids[i],b:ids[i+1],legs:[],winner:null});
  if(ids.length%2) ties.push({a:ids[ids.length-1],b:null,legs:[],winner:ids[ids.length-1]});
  c.rounds[ri]={name:d.rounds[ri],nlegs:d.legs[ri],ties}; if(ri===d.rounds.length-1&&ties.length===1&&ties[0].b){ const v=finalVenue(c.key,ids); if(v){ c.rounds[ri].venue=v.id; c.rounds[ri].price=finalPrice(ids); } } return c.rounds[ri];
}
function tieLeg(tie,leg,nlegs){ // devuelve [home,away]
  if(nlegs===1) return [tie.a,tie.b];
  return leg===0?[tie.a,tie.b]:[tie.b,tie.a];
}
function resolveTie(tie){
  if(tie.winner) return tie.winner;
  let ga=0,gb=0,awayA=0,awayB=0;
  tie.legs.forEach((l,i)=>{ if(l.home===tie.a){ ga+=l.gh; gb+=l.ga; awayB+=l.ga; } else { gb+=l.gh; ga+=l.ga; awayA+=l.ga; } });
  tie.agg=[ga,gb];
  if(ga>gb) tie.winner=tie.a; else if(gb>ga) tie.winner=tie.b;
  else if(tie.legs.length>1&&awayA!==awayB){ tie.winner=awayA>awayB?tie.a:tie.b; tie.away=true; }
  else { tie.pen=true; tie.winner=Math.random()<0.5?tie.a:tie.b; }
  return tie.winner;
}
function simLeg(tie,leg,nlegs,live,after){
  const [hid,aid]=tieLeg(tie,leg,nlegs); const hm=team(hid), aw=team(aid);
  const lh=hid===G.team?G.lineup:bestLineup(hm,'4-4-2','C'), la=aid===G.team?G.lineup:bestLineup(aw,'4-4-2','C');
  if(live){ const round=G.cups[G.curCup].rounds[G.curRound]; const venue=round&&round.venue?team(round.venue):null;
    scrMatchLive(hm,aw,lh,la,{title:cupName(G.curCup).toUpperCase(),sub:CUP_DEFS[G.curCup].rounds[G.curRound]+(nlegs>1?(leg===0?' · IDA':' · VUELTA'):'')+' · '+(venue?venue.stadium+' (campo neutral)':hm.stadium),att:venue?finalAttendance(venue,[hid,aid]):(hid===G.team?attendanceModel(hm,aw):null),neutral:!!venue,comp:'C',after:r=>{ applyInjuries(r); statsRecord(hm,aw,lh,la,r); G.pendingSanc=applyCards(hm,aw,r,'C'); if(venue) finalFinance(G.curCup,round,r); else cupMatchFinance(hm,aw,r); tie.legs.push(Object.assign({home:hid,away:aid},r,{events:slimEvents(r.events)})); after(); }}); return; }
  const r=simulateMatch(hm,aw,lh,la,{comp:'C'}); applyInjuries(r); statsRecord(hm,aw,lh,la,r); applyCards(hm,aw,r,'C'); tie.legs.push({home:hid,away:aid,gh:r.gh,ga:r.ga,att:r.att,events:slimEvents(r.events)}); after();
}
function playCupEvent(e,drawn){
  const c=G.cups[e.cup]; const fresh=!c.rounds[e.round]; const round=c.rounds[e.round]||drawRound(c,e.round);
  // tras el sorteo se vuelve a la oficina: así se puede preparar la alineación antes de la ida (la final no se sortea: solo quedan dos)
  if(fresh&&!drawn&&userInCup(e.cup)&&round.ties.length>1){ saveGame(); scrSorteo(e.cup,e.round,()=>{ saveGame(); scrOficina(); }); return; }
  G.curCup=e.cup; G.curRound=e.round;
  const mine=round.ties.find(t=>t.a===G.team||t.b===G.team);
  const leg=mine?mine.legs.length:round.nlegs; // próxima manga del usuario (0 ida, 1 vuelta)
  // los demás juegan la misma manga que el usuario (o toda la eliminatoria si el usuario no participa)
  for(const t of round.ties){ if(t===mine||t.winner) continue; for(let l=t.legs.length;l<=Math.min(leg,round.nlegs-1);l++) simLeg(t,l,round.nlegs,false,()=>{}); if(t.legs.length>=round.nlegs) resolveTie(t); }
  const finishRound=()=>{ if(mine) resolveTie(mine); decInjuries(); c.alive=round.ties.map(t=>t.winner); if(c.alive.length===1){ c.winner=c.alive[0]; } if(c.alive.length===2&&!c.rounds[e.round+1]&&e.round+1<CUP_DEFS[e.cup].rounds.length) drawRound(c,e.round+1); /* la final queda fijada (sede y entrada) al acabar las semifinales */ if(mine&&!mine.awarded){ mine.awarded=true; awardCupRound(e.cup,e.round,c.winner===G.team); } G.step++; saveGame(); scrCupResult(e.cup,e.round); };
  if(!mine||mine.winner){ finishRound(); return; }
  // una manga por pulsación de JUGAR: tras la ida se vuelve a la oficina y se puede cambiar la alineación
  simLeg(mine,leg,round.nlegs,true,()=>{ if(leg+1>=round.nlegs) finishRound(); else { decInjuries(); saveGame(); scrCupResult(e.cup,e.round); } });
}
function scrCupResult(k,ri){
  const c=G.cups[k]; const round=c.rounds[ri];
  if(c.winner&&ri===c.rounds.length-1&&!c.finalShown){ c.finalShown=true; saveGame(); return scrFinalCopa(k,()=>scrCupResult(k,ri)); } const t=team(G.team); setBg('fondo3'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:cupName(k).toUpperCase(),date:gameDate(),sub:round.name}));
  const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},round.name+' · RESULTADOS'));
  const sc=at(h('div',{class:'scroll'}),0,20,616,312); P.appendChild(sc);
  sc.appendChild(tieTable(round,true));
  const mine=round.ties.find(x=>x.a===G.team||x.b===G.team);
  let msg=''; if(mine&&!mine.winner){ const l=mine.legs[0]; msg=l?'Ida: '+team(l.home).name+' '+l.gh+'-'+l.ga+' '+team(l.away).name+'. La vuelta se juega al pulsar JUGAR en la oficina.':''; } else if(mine){ msg=mine.winner===G.team?'¡Tu equipo pasa a la siguiente ronda!':'Tu equipo queda eliminado.'; if(c.winner===G.team) msg='¡¡CAMPEÓN DE '+cupName(k).toUpperCase()+'!!'; }
  else if(c.winner) msg='Campeón: '+team(c.winner).name;
  P.appendChild(txt(msg,10,340,400,20,'f-e4'));
  P.appendChild(btn('CONTINUAR',480,338,130,()=>scrOficina(),'green'));
  if(G.pendingSanc&&G.pendingSanc.length){ const l=G.pendingSanc; G.pendingSanc=null; saveGame(); dialog('SANCIONES',l.join('<br>')); }
}
function tieTable(round,showLegs){
  const rows=round.ties.map(tie=>({tie}));
  return table([{t:'',w:16,k:r=>h('img',{src:escImg(r.tie.a,'ridi'),style:{height:'14px'}})},{t:'EQUIPO',k:r=>team(r.tie.a).name},{t:'IDA',w:46,cls:'c',k:r=>legStr(r.tie,0)},{t:'VTA',w:46,cls:'c',k:r=>round.nlegs>1?legStr(r.tie,1):''},{t:'EQUIPO',k:r=>r.tie.b?team(r.tie.b).name:'(exento)'},{t:'',w:16,k:r=>r.tie.b?h('img',{src:escImg(r.tie.b,'ridi'),style:{height:'14px'}}):''},{t:'PASA',w:110,k:r=>r.tie.winner?team(r.tie.winner).name+(r.tie.pen?' (pen.)':r.tie.away?' (g.f.)':''):'',cell:()=>'y'}],rows,{rowClass:r=>(r.tie.a===G.team||r.tie.b===G.team)?'me':''});
}
function legStr(tie,i){ const l=tie.legs[i]; if(!l) return '-'; return l.home===tie.a?l.gh+'-'+l.ga:l.ga+'-'+l.gh; }
function scrCopa(k){
  const c=G.cups[k]; const t=team(G.team); setBg('fondo5'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:cupName(k).toUpperCase(),date:gameDate(),sub:c.winner?'CAMPEÓN: '+team(c.winner).name.toUpperCase():(userInCup(k)?'TU EQUIPO SIGUE EN COMPETICIÓN':'TU EQUIPO NO PARTICIPA / ELIMINADO')}));
  const P=panel(10,68,440,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'CUADRO DE ELIMINATORIAS'));
  const sc=at(h('div',{class:'scroll'}),0,20,436,350); P.appendChild(sc);
  if(!c.rounds.length) sc.appendChild(txt('El sorteo se realizará antes de la primera eliminatoria.',8,8,420,20,'f-p12'));
  c.rounds.forEach(r=>{ sc.appendChild(h('div',{class:'f-e5',style:{color:'#ffe24a',padding:'4px 4px 2px',letterSpacing:'1px'}},r.name)); sc.appendChild(tieTable(r,true)); });
  const R=panel(460,68,170,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'COMPETICIONES'));
  Object.keys(G.cups).forEach((kk,i)=>R.appendChild(btn(cupName(kk).toUpperCase(),10,26+i*26,150,()=>scrCopa(kk),kk===k?'green':'blue')));
  R.appendChild(txt('Participantes: '+c.teams.length+'\nEliminatorias a doble partido; la final, a partido único.',10,140,150,80,'f-p8'));
  const nxt=G.sched.slice(G.step).find(e=>e.type==='cup'&&e.cup===k); R.appendChild(txt(nxt?'Próxima ronda: '+CUP_DEFS[k].rounds[nxt.round]+' (tras la jornada '+cupAfter(k)[nxt.round]+')':'Competición finalizada.',10,230,150,60,'f-p8'));
  R.appendChild(btn('VOLVER',10,330,150,()=>scrOficina(),'blue','ico_volver'));
}

// ---- sorteo de una ronda con el bombo del juego
const SORTEO_IMG={COPA:'copa',CE:'ce',RECOPA:'recopa',UEFA:'uefa'};
function scrSorteo(k,ri,after){
  const c=G.cups[k]; const round=c.rounds[ri]; const t=team(G.team); setBg('fondo5'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'SORTEO',date:gameDate(),sub:cupName(k).toUpperCase()+' · '+round.name}));
  const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'SORTEO DE '+round.name+' · '+cupName(k).toUpperCase()));
  const L=at(h('div',{class:'sorteo-izq'}),0,20,200,350); P.appendChild(L);
  const bombo=h('img',{class:'bombo girando',src:'img/sorteo/bombo.png',alt:''}); L.appendChild(bombo);
  const bola=h('div',{class:'bola'},''); L.appendChild(bola);
  const trofeo=h('img',{class:'trofeo',src:'img/sorteo/'+(SORTEO_IMG[k]||'copa')+'.png',onerror:function(){this.style.display='none'}}); L.appendChild(trofeo);
  const R=at(h('div',{class:'scroll sorteo-der'}),200,20,416,310); P.appendChild(R);
  const list=h('div',{class:'sorteo-lista'}); R.appendChild(list);
  const ties=round.ties; const seq=[]; ties.forEach((tie,i)=>{ seq.push({i,id:tie.a,side:0}); if(tie.b) seq.push({i,id:tie.b,side:1}); });
  const rows=ties.map((tie,i)=>{ const me=tie.a===G.team||tie.b===G.team; const r=h('div',{class:'sorteo-tie'+(me?' me':'')},h('span',{class:'sa'},'…'),h('span',{class:'vs'},'-'),h('span',{class:'sb'},tie.b?'…':'(exento)')); list.appendChild(r); return r; });
  let pos=0, timer=null, done=false;
  const cont=btn('CONTINUAR',480,338,130,()=>{ if(!done) return; after(); },'green'); cont.classList.add('dis'); P.appendChild(cont);
  const skip=btn('SALTAR',340,338,130,()=>{ finishAll(); },'blue'); P.appendChild(skip);
  const place=(x,anim)=>{ const tm=team(x.id); const r=rows[x.i]; const cell=r.querySelector(x.side?'.sb':'.sa'); cell.innerHTML=''; cell.appendChild(h('img',{src:escImg(x.id,'ridi'),style:{height:'14px',marginRight:'4px'}})); cell.appendChild(document.createTextNode(tm.name)); if(anim){ bola.textContent=tm.name; bola.classList.remove('pop'); void bola.offsetWidth; bola.classList.add('pop'); if(typeof playSfx==='function') playSfx('bote'); } r.scrollIntoView({block:'nearest'}); };
  const finishAll=()=>{ if(done) return; clearInterval(timer); timer=null; while(pos<seq.length){ place(seq[pos++],false); } finish(); };
  const finish=()=>{ done=true; bombo.classList.remove('girando'); cont.classList.remove('dis'); skip.style.display='none'; bola.textContent=''; };
  timer=setInterval(()=>{ if(pos>=seq.length){ clearInterval(timer); finish(); return; } place(seq[pos++],true); },260);
  L.appendChild(h('div',{class:'f-m8 sorteo-nota'},'El bombo decide los emparejamientos de '+round.name.toLowerCase()+(round.nlegs>1?' (ida y vuelta)':' (partido único)')+'.'));
}

// ---- pantalla de la final: campeón y finalista
function scrFinalCopa(k,after){
  const c=G.cups[k]; const fin=c.rounds[c.rounds.length-1]; const tie=fin.ties[0]; const champ=c.winner; const runner=tie.a===champ?tie.b:tie.a;
  const t=team(G.team); setBg('fondo3'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'FINAL',date:gameDate(),sub:cupName(k).toUpperCase()+' '+seasonLabel(G.seasonIdx||0)}));
  const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'FINAL DE '+cupName(k).toUpperCase()+' · '+(champ===G.team?'¡¡CAMPEONES!!':'CAMPEÓN: '+team(champ).name.toUpperCase())));
  P.appendChild(at(h('img',{class:'trofeo final-trofeo',src:'img/sorteo/'+(SORTEO_IMG[k]||'copa')+'.png',onerror:function(){this.style.display='none'}}),274,26));
  const side=(id,label,x,isChamp)=>{ const b=at(h('div',{class:'finalside'+(isChamp?' champ':'')}),x,40,200,230);
    b.appendChild(h('img',{class:'esc',src:escImg(id,'big'),onerror:function(){this.src=escImg(id)}}));
    b.appendChild(h('div',{class:'f-e5 lab'},label)); b.appendChild(h('div',{class:'f-e4 nm'},team(id).name.toUpperCase()));
    if(id===G.team) b.appendChild(h('div',{class:'f-e5 mine'},'TU EQUIPO')); return b; };
  P.appendChild(side(champ,'CAMPEÓN',40,true)); P.appendChild(side(runner,'FINALISTA',380,false));
  const res=tie.legs.map(l=>team(l.home).name+' '+l.gh+' - '+l.ga+' '+team(l.away).name).join('\n')+(tie.pen?'\n(decidida en los penaltis)':tie.away?'\n(valor doble de los goles fuera)':'')+(fin.venue?'\nEstadio: '+team(fin.venue).stadium+' ('+team(fin.venue).name+')':'');
  const rt=txt(res,220,150,200,60,'f-p12'); rt.style.textAlign='center'; rt.style.lineHeight='15px'; P.appendChild(rt);
  const msg=champ===G.team?'¡¡Tu equipo gana '+cupName(k)+' y levanta el trofeo!!':runner===G.team?'Tu equipo cae en la final. ¡Cerca estuvo!':team(champ).name+' se proclama campeón de '+cupName(k)+' ante el '+team(runner).name+'.';
  const mt=txt(msg,20,286,580,40,'f-e4'); mt.style.textAlign='center'; mt.style.color=champ===G.team?'#8dff8d':'#ffe24a'; P.appendChild(mt);
  if(champ===G.team&&typeof playSfx==='function') playSfx('intro');
  P.appendChild(btn('CONTINUAR',245,330,130,after,'green'));
}

// ---- finales en campo neutral: sede al azar (no de un finalista), precio según los finalistas y taquilla al 50 %
function finalVenue(k,ids){ const country=league(G.league).country; const cands=Object.values(DATA.teams).filter(t=>!ids.includes(t.id)&&t.id!==G.team&&(t.capacity||0)>=35000&&t.id<9000&&(k==='COPA'?(t.league&&league(t.league).country===country):(t.id<2800))); if(!cands.length) return null; return cands[Math.floor(Math.random()*cands.length)]; }
function finalPrice(ids){ const me=ids.reduce((a,id)=>a+teamME(team(id)),0)/ids.length; return Math.max(2000,Math.round((3000+(me-70)*120)/100)*100); }
function finalAttendance(venue,ids){ const me=ids.reduce((a,id)=>a+teamME(team(id)),0)/ids.length; const f=Math.min(1,0.8+(me-70)*0.012); return Math.round((venue.capacity||40000)*f*(0.95+Math.random()*0.05)); }
function finalFinance(k,round,r){ const v=team(round.venue); const tie=round.ties[0]; if(tie.a!==G.team&&tie.b!==G.team) return; const gate=Math.round(r.att*(round.price||3000)/1e6*0.5); const rival=team(tie.a===G.team?tie.b:tie.a); G.budget=(G.budget||0)+gate; G.finLog=(G.finLog||[]).concat([{j:G.jornada,rival:'Final '+cupName(k)+' vs '+rival.name+' ('+v.stadium+', 50 %)',home:true,att:r.att,full:r.att>=(v.capacity||0),gate,tv:0,wages:0,budget:G.budget}]).slice(-40); }
