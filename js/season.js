// Fin de temporada: pantallas de campeones, ascensos y descensos, y arranque de la temporada siguiente
function seasonLabel(i){ const y=96+i; return String(y%100).padStart(2,'0')+'-'+String((y+1)%100).padStart(2,'0'); }
function mgrDate(k,j){ const d=new Date(roundDate(k,j)); if(G&&G.seasonIdx) d.setFullYear(d.getFullYear()+G.seasonIdx); return d; }
function mgrIds(k){ return [...new Set(calOf(k).flat().map(m=>m[0]))]; }
function divKeys(lg){ lg=lg||G.league; const sib=SIBLING[lg]; const d1=lg.endsWith('1')?lg:sib; return [d1,SIBLING[d1]]; }
function swapCount(lg){ return league(lg||G.league).country===36?4:3; }
const COUNTRY_D1=['ESP1','ENG1','ITA1'];
function countryOrder(){ const [mine]=divKeys(); return [mine].concat(COUNTRY_D1.filter(k=>k!==mine)); }
function completeLeagues(){ // simula las jornadas que falten en todas las ligas (las de más jornadas que la del usuario)
  let n=0; LEAGUE_ORDER.forEach(k=>{ const N=calOf(k).length; G.results[k]=G.results[k]||[]; for(let j=1;j<=N;j++){ if(!G.results[k][j-1]||(k!==G.league&&!G.results[k][j-1].length)){ G.results[k][j-1]=playJornadaAI(k,j); n++; } } }); if(n) saveGame(); return n; }
function finalTables(d1){ const [a,b]=divKeys(d1||G.league); return {d1:a,d2:b,s1:standings(mgrIds(a),myResults(a)),s2:standings(mgrIds(b),myResults(b))}; }
function roundRobin(ids){ // liga a doble vuelta por el método del círculo, alternando casa y fuera
  const a=shuffle(ids.slice()); if(a.length%2) a.push(null); const n=a.length; const rounds=[]; const last={}, homes={};
  for(let r=0;r<n-1;r++){ const ms=[]; for(let i=0;i<n/2;i++){ let x=a[i], y=a[n-1-i]; if(x===null||y===null) continue;
      // orientación que mejor alterna: el que jugó fuera la última jornada juega en casa
      const sx=(last[x]==='A'?1:last[x]==='H'?-1:0)-(homes[x]||0)*0.01, sy=(last[y]==='A'?1:last[y]==='H'?-1:0)-(homes[y]||0)*0.01;
      if(sy>sx||(sy===sx&&(i+r)%2)) [x,y]=[y,x];
      ms.push([x,y,null,null,null]); last[x]='H'; last[y]='A'; homes[x]=(homes[x]||0)+1; }
    rounds.push(ms); a.splice(1,0,a.pop()); }
  return rounds.concat(rounds.map(ms=>ms.map(m=>[m[1],m[0],null,null,null])));
}
function seasonOver(){ return !!(G&&G.sched&&!curEvent()); }
// ---- pantallas
function scrFinTemporada(i){
  i=i||0; const t=team(G.team); setMusic('manager'); if(i===0) completeLeagues();
  const pages=countryOrder().map(k=>'LIGA:'+k).concat(['PREMIOS','COPA','CE','RECOPA','UEFA','NUEVA']); const k=pages[i]; const isLiga=k.startsWith('LIGA:');
  setBg(isLiga?'fondo0':k==='NUEVA'?'fondo5':k==='PREMIOS'?'fondo4':'fondo3'); const s=clearScreen(); const ft=finalTables(isLiga?k.slice(5):G.league);
  s.appendChild(topbar({team:t,title:'FIN DE TEMPORADA',date:gameDate(),sub:'TEMPORADA '+seasonLabel(G.seasonIdx||0)+' · '+(isLiga?'LIGA '+countryName(league(ft.d1).country).toUpperCase():k==='NUEVA'?'NUEVA TEMPORADA':k==='PREMIOS'?'PICHICHI · ZAMORA · MEJOR ENTRENADOR':cupName(k).toUpperCase())}));
  if(isLiga) pageLiga(s,ft); else if(k==='NUEVA') pageNueva(s,ft); else if(k==='PREMIOS') pagePremios(s); else pageCup(s,k);
  s.appendChild(btn(i<pages.length-1?'SIGUIENTE':'EMPEZAR TEMPORADA '+seasonLabel((G.seasonIdx||0)+1),380,446,250,()=>{ if(i<pages.length-1) scrFinTemporada(i+1); else { startNextSeason(); scrOficina(); } },'green'));
  if(i>0) s.appendChild(btn('ANTERIOR',10,446,100,()=>scrFinTemporada(i-1),'blue','ico_volver'));
}
function champBox(P,id,label,x,y){
  P.appendChild(at(h('img',{src:escImg(id,'big'),style:{maxHeight:'80px',maxWidth:'80px'},onerror:function(){this.src=escImg(id)}}),x,y));
  const lb=txt(label,x+90,y+6,400,16,'f-e5'); lb.style.whiteSpace='nowrap'; P.appendChild(lb); const nm=txt(team(id).name.toUpperCase(),x+90,y+28,400,24,'f-e4'); nm.style.color='#ffe24a'; nm.style.whiteSpace='nowrap'; P.appendChild(nm);
  if(id===G.team){ const w=txt('¡¡TU EQUIPO!!',x+90,y+58,200,16,'f-e5'); w.style.color='#8dff8d'; P.appendChild(w); }
}
function miniStandings(st,n,opts){ opts=opts||{}; const rows=st.slice(0,n).map((x,i)=>({pos:i+1,x}));
  return table([{t:'POS',w:30,cls:'c',k:r=>r.pos},{t:'EQUIPO',k:r=>team(r.x.id).name},{t:'PJ',w:26,cls:'r',k:r=>r.x.pj},{t:'PTS',w:34,cls:'r',k:r=>r.x.pts,cell:()=>'y'}],rows,{rowClass:r=>r.x.id===G.team?'me':(opts.cls&&opts.cls(r.pos))||''}); }
function pageLiga(s,ft){
  const n=swapCount(ft.d1);
  [[ft.d1,ft.s1,10],[ft.d2,ft.s2,322]].forEach(([k,st,x],i)=>{ const P=panel(x,68,308,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},league(k).long.toUpperCase()));
    champBox(P,st[0].id,'CAMPEÓN DE LIGA',10,26);
    const sc=at(h('div',{class:'scroll'}),0,114,304,196); P.appendChild(sc); const N=st.length;
    sc.appendChild(miniStandings(st,N,{cls:p=>i===0?(p>N-n?'red':''):(p<=n?'green':'')}));
    const note=i===0?'Descienden: '+st.slice(-n).map(x=>team(x.id).name).join(', '):'Ascienden: '+st.slice(0,n).map(x=>team(x.id).name).join(', ');
    const tx=txt(note,8,316,292,50,'f-p8'); tx.style.lineHeight='11px'; tx.style.color=i===0?'#ff8a60':'#8dff8d'; P.appendChild(tx); });
}
function pageCup(s,k){
  const c=G.cups[k]; const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},cupName(k).toUpperCase()+' '+seasonLabel(G.seasonIdx||0)));
  if(!c||!c.winner){ P.appendChild(txt('Competición sin terminar.',10,30,400,20,'f-p12')); return; }
  champBox(P,c.winner,'CAMPEÓN DE '+cupName(k).toUpperCase(),20,30);
  const fin=c.rounds[c.rounds.length-1]; if(fin){ P.appendChild(lbl('FINAL',10,128)); const sc=at(h('div',{class:'scroll'}),0,142,616,60); P.appendChild(sc); sc.appendChild(tieTable(fin,true)); }
  // trayectoria del usuario
  let path='Tu equipo no participó en esta competición.';
  if(c.teams.includes(G.team)){ let last=null; c.rounds.forEach((r,ri)=>{ const tie=r.ties.find(x=>x.a===G.team||x.b===G.team); if(tie) last={ri,tie}; });
    if(c.winner===G.team) path='¡¡Tu equipo es el campeón!!'; else if(last) path='Tu equipo cayó en '+CUP_DEFS[k].rounds[last.ri].toLowerCase()+' ante '+team(last.tie.winner).name+'.'; }
  const tx=txt(path,10,214,600,20,'f-p12'); tx.style.color=c.winner===G.team?'#8dff8d':'#fff'; P.appendChild(tx);
  // cuadro de semifinales si existe
  const semi=c.rounds[c.rounds.length-2]; if(semi){ P.appendChild(lbl('SEMIFINALES',10,240)); const sc2=at(h('div',{class:'scroll'}),0,254,616,100); P.appendChild(sc2); sc2.appendChild(tieTable(semi,true)); }
}
function nextSeasonPlan(ft){
  const me=G.team; const n=swapCount(); const in1=ft.s1.some(x=>x.id===me); const st=in1?ft.s1:ft.s2; const pos=st.findIndex(x=>x.id===me)+1;
  let lg=in1?ft.d1:ft.d2, move='Se mantiene en '+league(lg).name+'.';
  if(in1&&pos>st.length-n){ lg=ft.d2; move='¡DESCIENDE a '+league(ft.d2).name+'!'; } else if(!in1&&pos<=n){ lg=ft.d1; move='¡ASCIENDE a '+league(ft.d1).name+'!'; }
  const won=Object.keys(G.cups).filter(k=>G.cups[k].winner===me);
  let europe='No juega competición europea.'; const d1champ=in1&&pos===1;
  if(d1champ||won.includes('CE')) europe='Jugará la COPA DE EUROPA'+(d1champ?' como campeón de liga.':' como vigente campeón.'); else if(won.includes('COPA')) europe='Jugará la RECOPA DE EUROPA como campeón de copa.'; else if((in1&&pos>=2&&pos<=5)||won.includes('UEFA')) europe='Jugará la COPA DE LA UEFA.';
  const bonus=leaguePrize(in1?ft.d1:ft.d2,pos);
  return {pos,in1,lg,move,europe,bonus,won,st};
}
function pageNueva(s,ft){
  const p=nextSeasonPlan(ft); const t=team(G.team); const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'BALANCE DE LA TEMPORADA '+seasonLabel(G.seasonIdx||0)));
  P.appendChild(at(h('img',{src:escImg(G.team,'big'),style:{maxHeight:'96px',maxWidth:'90px'},onerror:function(){this.src=escImg(G.team)}}),16,30));
  const lines=[t.name+': '+p.pos+'º en '+league(p.in1?ft.d1:ft.d2).long+' ('+p.st[p.pos-1].pts+' puntos).',
    p.won.length?'Títulos: '+p.won.map(k=>cupName(k)).join(', ')+'.':'Sin títulos de copa esta temporada.',
    p.move, p.europe,
    'Premio de la liga por el '+p.pos+'º puesto: '+fmtNum(p.bonus)+' millones (presupuesto: '+fmtNum((G.budget||0)+p.bonus)+'). Los premios de copa ya se cobraron ronda a ronda.',
    'Los jugadores cumplen un año más; los contratos y la plantilla se mantienen.',
    'Se generará un calendario nuevo para '+league(ft.d1).name+' y '+league(ft.d2).name+' con los ascensos y descensos.'];
  const tx=txt(lines.join('\n\n'),170,30,436,300,'f-p12'); tx.style.lineHeight='15px'; P.appendChild(tx);
  P.appendChild(lbl('CAMPEONES '+seasonLabel(G.seasonIdx||0),16,140)); const ch=[[league(ft.d1).name,ft.s1[0].id],[league(ft.d2).name,ft.s2[0].id]].concat(Object.keys(G.cups).map(k=>[cupName(k),G.cups[k].winner]));
  const cl=txt(ch.map(x=>x[0].toUpperCase()+'\n   '+(x[1]?team(x[1]).name:'-')).join('\n'),16,156,150,200,'f-m8'); cl.style.lineHeight='11px'; P.appendChild(cl);
}
// ---- nueva temporada
function startNextSeason(){
  completeLeagues(); const ft=finalTables(); const p=nextSeasonPlan(ft); const me=G.team;
  G.leagueMoves=G.leagueMoves||{}; G.lastPos={}; const champions={};
  COUNTRY_D1.forEach(d1=>{ const f=finalTables(d1); const n=swapCount(f.d1);
    const down=f.s1.slice(-n).map(x=>x.id), up=f.s2.slice(0,n).map(x=>x.id);
    down.forEach(id=>{ team(id).league=f.d2; G.leagueMoves[id]=f.d2; }); up.forEach(id=>{ team(id).league=f.d1; G.leagueMoves[id]=f.d1; });
    f.s1.forEach((x,i)=>G.lastPos[x.id]={lg:f.d1,pos:i+1}); f.s2.forEach((x,i)=>G.lastPos[x.id]={lg:f.d2,pos:i+1});
    champions[f.d1]=f.s1[0].id; champions[f.d2]=f.s2[0].id; });
  G.lastCups={}; Object.keys(G.cups).forEach(k=>G.lastCups[k]=G.cups[k].winner);
  G.history=G.history||[]; G.history.push({season:seasonLabel(G.seasonIdx||0),league:G.league,pos:p.pos,won:p.won,champions:Object.assign(champions,G.lastCups),awards:G.awards||null});
  G.budget=(G.budget||0)+p.bonus; finOther('Premio de liga · '+p.pos+'º puesto',p.bonus); G.league=p.lg; G.seasonIdx=(G.seasonIdx||0)+1; G.season=seasonLabel(G.seasonIdx);
  G.cal=G.cal||{}; LEAGUE_ORDER.forEach(k=>{ G.cal[k]=roundRobin(teamsOfLeague(k).map(t=>t.id)); }); CAL_CACHE={};
  G.jornada=1; G.results={}; LEAGUE_ORDER.forEach(k=>G.results[k]=[]); G.stats={}; G.cards={}; G.susp={}; if(G.emp) empTick(true); G.cups=buildCups(); G.sched=buildSchedule(); G.step=0; G.finLog=[]; tvOffersInit();
  const t=team(me); if(!G.lineup||G.lineup.length!==11||G.lineup.some(l=>!t.players[l.idx])) G.lineup=bestLineup(t,G.formation||'4-4-2'); G.bench=[]; G.benchSet=false;
  saveGame();
}
function applySeasonState(){ // al cargar: ascensos/descensos de temporadas anteriores
  if(!G) return; if(G.seasonIdx===undefined) G.seasonIdx=0;
  if(G.leagueMoves) for(const id in G.leagueMoves){ const tt=team(+id); if(tt) tt.league=G.leagueMoves[id]; }
  CAL_CACHE={};
}

// ---- premios individuales de la temporada: Pichichi, Zamora y mejor entrenador (liga del usuario)
function seasonAwards(){
  if(G.awards&&G.awards.season===(G.seasonIdx||0)) return G.awards;
  const lg=G.league; const ids=mgrIds(lg); const res=myResults(lg); const st=standings(ids,res);
  const top=topScorers(res,1)[0]; const pichichi=top?{team:top.team,idx:top.idx,goals:top.goals}:null;
  // Zamora: portero más utilizado del equipo menos goleado (mín. 60 % de los partidos)
  let zamora=null; const N=calOf(lg).length; const byGc=st.filter(r=>r.pj>=N*0.6).sort((a,b)=>a.gc/Math.max(1,a.pj)-b.gc/Math.max(1,b.pj)||b.pts-a.pts);
  for(const row of byGc){ const t=team(row.id); const gks=t.players.filter(p=>p.dem==='POR').map(p=>({p,s:G.stats&&G.stats[pkey(p)]})).filter(x=>x.s&&x.s.pj>=row.pj*0.6).sort((a,b)=>b.s.pj-a.s.pj); if(gks.length){ zamora={team:t.id,idx:gks[0].p.idx,gc:row.gc,pj:gks[0].s.pj,coef:(row.gc/Math.max(1,row.pj)).toFixed(2)}; break; } }
  // Mejor entrenador: mayor mejora respecto a la posición esperada por la media de la plantilla
  const exp=ids.map(id=>({id,me:teamME(team(id))})).sort((a,b)=>b.me-a.me); let coach=null;
  st.forEach((row,i)=>{ const e=exp.findIndex(x=>x.id===row.id); const gain=e-i; if(!coach||gain>coach.gain||(gain===coach.gain&&i<coach.pos)) coach={team:row.id,gain,pos:i+1,exp:e+1}; });
  G.awards={season:G.seasonIdx||0,lg,pichichi,zamora,coach};
  // prima de 50 M por cada premio que gane tu club
  let bonus=0; [pichichi,zamora,coach].forEach(a=>{ if(a&&a.team===G.team) bonus+=50; }); if(bonus){ G.budget=(G.budget||0)+bonus; finOther('Premios individuales',bonus); }
  saveGame(); return G.awards;
}
function pagePremios(s){
  const a=seasonAwards(); const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'PREMIOS DE LA TEMPORADA · '+league(a.lg).long.toUpperCase()));
  const card=(x,title,imgSrc,name,sub,detail,mine)=>{ const b=at(h('div',{class:'award'+(mine?' mine':'')}),x,26,196,300);
    b.appendChild(h('div',{class:'f-e5 at'},title)); b.appendChild(h('img',{class:'aph',src:imgSrc,onerror:function(){this.src='img/ui/foto_general.png';this.classList.add('gen');}}));
    b.appendChild(h('div',{class:'f-e4 nm'},name)); b.appendChild(h('div',{class:'f-con8 sb'},sub)); b.appendChild(h('div',{class:'f-p8 dt'},detail)); if(mine) b.appendChild(h('div',{class:'f-e5 mn'},'¡TU EQUIPO! +50 M')); return b; };
  if(a.pichichi){ const t=team(a.pichichi.team), p=t.players[a.pichichi.idx]; P.appendChild(card(10,'PICHICHI','img/fotobig/'+p.id+'.png',p?p.name:'-',t.name,a.pichichi.goals+' goles · máximo goleador de la liga',t.id===G.team)); }
  if(a.zamora){ const t=team(a.zamora.team), p=t.players[a.zamora.idx]; P.appendChild(card(212,'ZAMORA','img/fotobig/'+p.id+'.png',p?p.name:'-',t.name,a.zamora.gc+' goles en contra en '+a.zamora.pj+' partidos ('+a.zamora.coef+' por partido)',t.id===G.team)); }
  if(a.coach){ const t=team(a.coach.team); P.appendChild(card(414,'MEJOR ENTRENADOR',coachImg(t),t.coach.name,t.name,a.coach.pos+'º en la liga con la '+a.coach.exp+'ª mejor plantilla',t.id===G.team)); }
  if(!a.pichichi&&!a.zamora) P.appendChild(txt('Sin datos suficientes esta temporada.',10,40,400,20,'f-p12'));
}
