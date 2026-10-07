// Contratos y fin de temporada de la plantilla, como en el juego original: los contratos tienen temporadas
// restantes; al terminar la temporada los que vencen se renuevan (o el jugador causa baja), la cláusula de
// "partidos para renovación" renueva sola, la "libertad por descenso" deja salir al jugador si el club baja, y
// los veteranos se retiran (en todos los clubes; los de la máquina reciben un canterano generado en su lugar).
const RETIRED_ID=9998;
function retiredTeam(){ if(!DATA.teams[RETIRED_ID]) DATA.teams[RETIRED_ID]={id:RETIRED_ID,name:'Retirados',full:'Jugadores retirados',stadium:'-',nat:0,capacity:0,players:[],bajas:[],hidden:true}; return DATA.teams[RETIRED_ID]; }
function contractOf(p){ G.contracts=G.contracts||{}; const k='i'+p.id; if(!G.contracts[k]) G.contracts[k]={ficha:fichaOf(p),years:1+((p.id*7+3)%4)}; return G.contracts[k]; }
function contractsInit(){ const t=team(G.team); if(t) t.players.forEach(p=>{ if(p.id>0) contractOf(p); }); }
function contractEnds(p){ const c=contractOf(p); return seasonLabel((G.seasonIdx||0)+Math.max(0,c.years-1)); }
function renewDemand(p,years){ const base=Math.max(contractFicha(p),fichaOf(p)); const age=playerAge(p); const f=(age!=='-'&&age>=31)?0.9:(age!=='-'&&age<=23)?1.1:1; return Math.round(base*f*(1+0.06*Math.max(0,years-2))*(1.02+0.08*Math.random())); }
function renewDialog(p,back){
  const c=contractOf(p); const b=h('div',{}); b.appendChild(h('div',{style:{marginBottom:'6px'}},p.full||p.name+' · '+playerAge(p)+' años · ME '+p.me+'<br>Contrato actual: '+fmtNum(c.ficha)+' M por temporada, termina en '+contractEnds(p)+'.<br>Elige cuántas temporadas quieres ampliar:'));
  [1,2,3,4].forEach(y=>{ const d=renewDemand(p,y); b.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'3px 0'},onclick:()=>{ closeDialog(); const m=typeof moralOf==='function'?moralOf(p):70; const refuse=Math.random()<(m<50?0.4:0.08);
    if(refuse){ dialog('RENOVACIÓN',p.name+' ha rechazado tu oferta de renovación.',[{t:'ACEPTAR',f:back}]); return; }
    c.ficha=d; c.years+=y; if(typeof setMoral==='function') setMoral(p,moralOf(p)+5); saveGame(); dialog('RENOVACIÓN',p.name+' ha renovado su contrato: '+fmtNum(d)+' M por temporada hasta '+contractEnds(p)+'.',[{t:'ACEPTAR',f:back}]); }},'+'+y+(y===1?' TEMPORADA':' TEMPORADAS')+' · pide '+fmtNum(d)+' M/temp.')); });
  dialog('RENOVAR A '+p.name.toUpperCase(),b,[{t:'CANCELAR',f:back}]);
}
// pantalla de contratos (modo CONTRATOS de Fichajes)
function contractsTable(R,me,MUI,state){
  R.appendChild(h('div',{class:'hdr'},'CONTRATOS · '+me.name.toUpperCase()));
  const sc=at(h('div',{class:'scroll'}),0,18,436,350); R.appendChild(sc);
  const ps=me.players.filter(p=>p.id>0).slice().sort((a,b)=>contractOf(a).years-contractOf(b).years||b.me-a.me);
  const cols=[{t:'Nº',w:22,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',k:p=>p.name},{t:'ED',w:26,cls:'c',k:p=>playerAge(p)},{t:'ME',w:28,cls:'r',k:p=>p.me,cell:()=>'y'},{t:'FICHA',w:46,cls:'r',k:p=>fmtNum(contractOf(p).ficha)},{t:'HASTA',w:50,cls:'c',k:p=>h('span',{style:{color:contractOf(p).years<=1?'#ff8a60':'#fff'}},contractEnds(p))},{t:'CLÁUS.',w:46,cls:'c',k:p=>h('span',{class:'f-con8',title:'R: partidos para renovación · L: libertad por descenso'},(contractOf(p).renov?'R ':'')+(contractOf(p).libertad?'L':''))},{t:'',w:60,cls:'c',k:p=>h('span',{class:'f-con8',style:{color:'#8dff8d'}},'RENOVAR')}];
  const colsM=[cols[0],cols[1],cols[3],cols[4],cols[5],cols[7]];
  sc.appendChild(table(MUI?colsM:cols,ps,{rowClass:p=>contractOf(p).years<=1?'san':'',onRow:p=>renewDialog(p,()=>scrFichajes(state))}));
}
// canterano generado para un club de la máquina (sustituye a un retirado)
function genYoung(t,dem){
  G.genSeq=G.genSeq||1; const roles=YOUTH_DEMS.find(d=>d[0]===dem)[2]; const pool=Object.values(DATA.teams).filter(x=>x.id<9000).flatMap(x=>x.players).filter(p=>p.dem===dem&&p.me>=55&&p.me<=75&&!p.youth&&!p.gen);
  const tpl=pool[Math.floor(Math.random()*pool.length)]; const pot=Math.min(92,Math.round(66+Math.random()*18)); const me0=Math.max(45,pot-10-Math.floor(Math.random()*10)); const f=me0/Math.max(1,tpl.me);
  const year=1996+(G.seasonIdx||0); const age=18+Math.floor(Math.random()*4); const c=String(t.nat||22); const L=DATA.names&&DATA.names[c]; const nm=L&&L.n?L.n[Math.floor(Math.random()*L.n.length)]:'Juan', ap=L&&L.a?L.a[Math.floor(Math.random()*L.a.length)]:'García';
  const p={id:800000+(G.genSeq++),name:ap,full:nm+' '+ap,roles:[roles[Math.floor(Math.random()*roles.length)]],country:t.nat||22,c2:1,f1:99,f2:2,f3:3,f4:0,birth:[1+Math.floor(Math.random()*28),1+Math.floor(Math.random()*12),year-age],height:170+Math.floor(Math.random()*20),weight:62+Math.floor(Math.random()*16),attrs:tpl.attrs.map(a=>Math.max(5,Math.min(99,Math.round(a*f*(0.9+Math.random()*0.2))))),dem,pot,gen:true};
  p.me=calcME(p); return p;
}
function genAdd(t,p){ p.team=t.id; p.idx=t.players.length; t.players.push(p); DATA.playersById[p.id]=p; t._me=undefined; }
function applyGenerated(){ retiredTeam(); if(!G||!G.generated) return; G.generated.forEach(g=>{ const t=team(g.t); if(t&&!t.players.some(x=>x.id===g.p.id)){ g.p.me=calcME(g.p); genAdd(t,g.p); } }); }
// fin de temporada: retiradas en todos los clubes y contratos del club propio
function seasonSquadEnd(plan){
  retiredTeam(); const news=[]; const me=team(G.team); const relegated=/DESCIENDE/.test(plan&&plan.move||''); G.generated=G.generated||[];
  for(const t of Object.values(DATA.teams)){ if(t.id>=9000||t.custom) continue;
    for(const p of t.players.slice()){ const a=playerAge(p); if(a==='-'||a<33) continue; const pr=a>=36?0.75:a===35?0.5:a===34?0.3:0.15; if(Math.random()>=pr) continue;
      if(t.id===G.team) news.push(p.name+' se retira del fútbol a los '+a+' años.');
      doTransfer(t.id,p.idx,RETIRED_ID,0,true);
      if(t.id!==G.team&&t.players.length<24){ const y=genYoung(t,p.dem); genAdd(t,y); G.generated.push({t:t.id,p:y}); } } }
  const dests=Object.values(DATA.teams).filter(t=>t.league&&t.id!==G.team&&t.players.length<28);
  for(const p of me.players.slice()){ if(!(p.id>0)) continue; const c=contractOf(p); const pj=typeof statOf==='function'?statOf(p).pj:0;
    if(c.renov&&pj>=25){ c.years+=1; news.push(p.name+' ha jugado '+pj+' partidos esta temporada, por lo que su contrato se renueva automáticamente por un año.'); }
    c.years-=1; let why=null;
    if(relegated&&c.libertad) why='según lo estipulado en su contrato, ha abandonado el equipo con la carta de libertad al haber descendido';
    else if(c.years<=0) why='ha causado baja al no haber sido renovado';
    if(!why) continue;
    const dest=dests[Math.floor(Math.random()*dests.length)]; if(!dest) continue; doTransfer(G.team,p.idx,dest.id,0,true); delete G.contracts['i'+p.id]; news.push(p.name+' '+why+' (ficha por el '+dest.name+').'); }
  me._me=undefined; if(G.lineup.length<11){ G.lineup=bestLineup(me,G.formation||'4-4-2'); G.bench=null; G.benchSet=false; }
  G.seasonNews=news; return news;
}
