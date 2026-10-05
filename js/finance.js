// Economía del club: taquilla (precio de las entradas, popularidad, rival), contratos de televisión y balance
const DERBIES=[['Real Madrid','Barcelona'],['Real Madrid','At. Madrid'],['Sevilla','Betis'],['Athletic','Real Sociedad'],['Barcelona','Espanyol'],['Deportivo','Celta'],['Oviedo','Sporting'],['Valencia','Levante'],['Zaragoza','Osasuna'],['Rayo','At. Madrid'],['Hércules','Elche'],['Las Palmas','Tenerife'],['Liverpool','Everton'],['Manchester U.','Manchester C'],['Arsenal','Tottenham H'],['Chelsea','Tottenham H'],['Newcastle Utd','Sunderland'],['Aston Villa','Birmingham C'],['Inter','Milan'],['Roma','Lazio'],['Juventus','Torino'],['Genoa','Sampdoria'],['Bolonia','Fiorentina'],['Nápoles','Roma']];
const TICKET_REF={ESP1:2500,ESP2:1500,ENG1:3000,ENG2:2000,ITA1:3000,ITA2:1800};
function ticketRef(){ return TICKET_REF[G.league]||2000; }
function ticketPrice(){ return G.ticket||ticketRef(); }
function isDerby(a,b){ const n=t=>(t.custom&&t.replaced)?team(t.replaced).name:t.name; const x=n(a), y=n(b); return DERBIES.some(d=>(d[0]===x&&d[1]===y)||(d[0]===y&&d[1]===x)); }
function leaguePos(id,lg){ const st=standings(mgrIds(lg||G.league),myResults(lg||G.league)); const i=st.findIndex(x=>x.id===id); return {pos:i<0?st.length:i+1,n:st.length}; }
function recentForm(id){ const rs=myResults().filter(r=>r.home===id||r.away===id).slice(-5); let w=0,l=0; rs.forEach(r=>{ const my=r.home===id?[r.gh,r.ga]:[r.ga,r.gh]; if(my[0]>my[1]) w++; else if(my[0]<my[1]) l++; }); return {w,l}; }
function attendanceModel(hm,aw,price,detail){ // asistencia estimada a un partido en casa del usuario
  price=price||ticketPrice(); const cap=hm.capacity||20000; const me=leaguePos(hm.id), rv=leaguePos(aw.id,aw.league&&aw.league!==G.league?aw.league:G.league);
  const pop=0.55+0.45*(1-(me.pos-1)/Math.max(1,me.n-1));
  const derby=isDerby(hm,aw); const rivalF=1+(rv.pos<=4?0.15:rv.pos<=8?0.05:0)+(derby?0.30:0);
  const priceF=Math.min(1.3,Math.max(0.35,Math.pow(ticketRef()/price,0.7)));
  const f=recentForm(hm.id); const formF=1+0.03*f.w-0.03*f.l;
  const exp=cap*0.85*pop*rivalF*priceF*formF; const att=Math.min(cap,Math.round(exp*(detail?1:0.92+Math.random()*0.16)));
  return detail?{att,pop,rivalF,priceF,formF,derby,cap}:att;
}
function gateIncome(att,price){ return Math.round(att*(price||ticketPrice())/1e6); }
// ---- televisión: ofertas al empezar la liga según la posición del año anterior
function tvOffersInit(){
  const me=team(G.team); const lp=G.lastPos&&G.lastPos[me.id]; let pos=lp?lp.pos:(me.positions&&me.positions.length?me.positions[me.positions.length-1]:12); const d1=G.league.endsWith('1'); if(lp&&lp.lg!==G.league) pos=d1?10:3;
  const N=mgrIds(G.league).length; const q=1-(Math.min(pos,N)-1)/Math.max(1,N-1); // 1 = campeón
  const base=Math.round(d1?(500+1100*q):(120+260*q));
  G.tvOffers=[{name:'Canal Plus',fixed:base,winBonus:0,perMatch:0},{name:'TVE',fixed:Math.round(base*0.7),winBonus:Math.round(base*0.03),perMatch:0},{name:'Antena 3',fixed:Math.round(base*0.45),winBonus:0,perMatch:Math.round(base*0.05)}];
  G.tv=null;
}
function tvIncome(hm,r){ const tv=G.tv; if(!tv) return 0; const N=Math.max(30,calOf(G.league).length); let v=tv.fixed/N; const isHome=hm.id===G.team; const my=isHome?[r.gh,r.ga]:[r.ga,r.gh]; if(my[0]>my[1]) v+=tv.winBonus; if(isHome&&tv.perMatch&&Math.random()<0.5) v+=tv.perMatch; return Math.round(v); }
function scrTvOffers(after){
  const me=team(G.team); const body=h('div',{});
  body.appendChild(h('div',{style:{marginBottom:'6px'}},'Las televisiones presentan sus ofertas por los derechos del '+me.name+' para esta temporada. Elige una:'));
  G.tvOffers.forEach(o=>{ const txtl=o.name+': '+fmtNum(o.fixed)+' millones fijos'+(o.winBonus?' + '+fmtNum(o.winBonus)+' M por victoria':'')+(o.perMatch?' + '+fmtNum(o.perMatch)+' M por partido televisado en casa':''); body.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'4px 0'},onclick:()=>{ G.tv=o; G.tvOffers=null; saveGame(); closeDialog(); after&&after(); }},txtl)); });
  dialog('OFERTAS DE TELEVISIÓN',body,[]);
}
// ---- balance semanal: taquilla, televisión y sueldos
function weeklyFinance(hm,aw,r){
  const me=team(G.team); const N=Math.max(30,calOf(G.league).length); const wages=Math.round(me.players.reduce((a,p)=>a+contractFicha(p),0)/N);
  const isHome=hm.id===G.team; const gate=isHome?gateIncome(r.att):0; const tv=tvIncome(hm,r);
  G.budget=(G.budget||0)+gate+tv-wages; G.lastFin={gate,tv,wages,att:isHome?r.att:0};
  G.finLog=(G.finLog||[]).concat([{j:G.jornada,rival:isHome?aw.name:hm.name,home:isHome,att:isHome?r.att:0,gate,tv,wages,budget:G.budget}]).slice(-40);
  return G.lastFin;
}
// ---- pantalla de finanzas
function scrFinanzas(){
  const me=team(G.team); setBg('fondo6'); const s=clearScreen();
  s.appendChild(topbar({team:me,title:'FINANZAS',date:gameDate(),sub:'PRESUPUESTO: '+fmtNum(G.budget)+' MILLONES'}));
  const L=panel(10,68,300,372); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'TAQUILLA'));
  const nm=nextMatch(); const home=nm&&nm[0]===G.team; const rival=nm?team(nm[0]===G.team?nm[1]:nm[0]):null;
  const render=()=>{ L.querySelectorAll('.fin').forEach(e=>e.remove()); const price=ticketPrice();
    const lb=lbl('PRECIO DE LA ENTRADA',10,24); lb.classList.add('fin'); L.appendChild(lb);
    const row=at(h('div',{class:'fin navrow'}),0,40,296,30); row.appendChild(btn('−',10,0,40,()=>{ G.ticket=Math.max(300,price-100); saveGame(); render(); },'blue')); row.appendChild(txt(fmtNum(price)+' ptas',56,4,180,16,'f-e4')).style.textAlign='center'; row.appendChild(btn('+',246,0,40,()=>{ G.ticket=Math.min(15000,price+100); saveGame(); render(); },'blue')); L.appendChild(row);
    const d=attendanceModel(me,rival||me,price,true);
    const lines=['Aforo: '+fmtNum(d.cap)+' · Referencia: '+fmtNum(ticketRef())+' ptas','Popularidad (posición en la liga): '+Math.round(d.pop*100)+'%','Efecto del precio: '+Math.round(d.priceF*100)+'% · Racha: '+Math.round(d.formF*100)+'%'];
    if(rival){ lines.push('Próximo: '+(home?'en casa vs ':'fuera vs ')+rival.name+(d.derby?' · ¡MÁXIMO RIVAL!':'')); if(home) lines.push('Atractivo del rival: '+Math.round(d.rivalF*100)+'%','Asistencia prevista: '+fmtNum(d.att),'Taquilla prevista: '+fmtNum(gateIncome(d.att,price))+' millones'); }
    const tx=txt(lines.join('\n'),10,76,280,100,'f-m8'); tx.classList.add('fin'); tx.style.lineHeight='13px'; tx.style.fontSize='10px'; tx.style.whiteSpace='pre'; L.appendChild(tx);
    const n2=txt('Subir el precio llena menos el estadio; un equipo arriba en la clasificación, en racha o ante un máximo rival atrae más público.',10,178,280,40,'f-m8'); n2.classList.add('fin'); n2.style.lineHeight='11px'; n2.style.color='#9fb4e8'; L.appendChild(n2); };
  render();
  L.appendChild(lbl('TELEVISIÓN',10,226)); const tv=G.tv; const tvt=txt(tv?tv.name+': '+fmtNum(tv.fixed)+' M fijos'+(tv.winBonus?' + '+fmtNum(tv.winBonus)+' M por victoria':'')+(tv.perMatch?' + '+fmtNum(tv.perMatch)+' M por partido televisado':''):'Sin contrato de televisión.',10,242,280,40,'f-p8'); tvt.style.lineHeight='12px'; L.appendChild(tvt);
  if(G.tvOffers&&!G.tv) L.appendChild(btn('VER OFERTAS DE TV',10,282,200,()=>scrTvOffers(()=>scrFinanzas()),'green'));
  const N=Math.max(30,calOf(G.league).length); const wages=Math.round(me.players.reduce((a,p)=>a+contractFicha(p),0)/N);
  L.appendChild(lbl('SUELDOS',10,314)); L.appendChild(txt(fmtNum(wages)+' M por jornada ('+fmtNum(wages*N)+' M por temporada, '+me.players.length+' jugadores).',10,330,280,30,'f-p8'));
  const R=panel(320,68,310,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'BALANCE POR JORNADA'));
  const sc=at(h('div',{class:'scroll'}),0,18,306,350); R.appendChild(sc);
  const log=(G.finLog||[]).slice().reverse();
  if(!log.length) sc.appendChild(txt('Todavía no se ha jugado ninguna jornada.',8,8,290,20,'f-p12'));
  else sc.appendChild(table([{t:'J.',w:24,cls:'c',k:x=>x.j},{t:'RIVAL',k:x=>(x.home?'vs ':'en ')+x.rival},{t:'PÚBL.',w:46,cls:'r',k:x=>x.att?fmtNum(x.att):'-'},{t:'TAQ.',w:36,cls:'r',k:x=>x.gate?'+'+x.gate:'-',cell:()=>'g'},{t:'TV',w:32,cls:'r',k:x=>x.tv?'+'+x.tv:'-',cell:()=>'g'},{t:'SUEL.',w:36,cls:'r',k:x=>'-'+x.wages,cell:()=>'red'},{t:'CAJA',w:44,cls:'r',k:x=>fmtNum(x.budget),cell:()=>'y'}],log,{}));
  s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
