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
  const exp=cap*0.9*pop*rivalF*priceF*formF; const att=Math.min(cap,Math.round(exp*(detail?1:0.92+Math.random()*0.16)));
  return detail?{att,pop,rivalF,priceF,formF,derby,cap,full:att>=cap}:att;
}
function gateIncome(att,price,cap){ const g=att*(price||ticketPrice())/1e6; return Math.round(cap&&att>=cap?g*1.1:g); } // con lleno, un 10 % más (bar, tienda)
function isFull(hm,att){ return !!(hm&&att>=(hm.capacity||20000)); }
// ---- televisión: ofertas al empezar la liga según la posición del año anterior
function tvOffersInit(){
  const me=team(G.team); const lp=G.lastPos&&G.lastPos[me.id]; let pos=lp?lp.pos:(me.positions&&me.positions.length?me.positions[me.positions.length-1]:12); const d1=G.league.endsWith('1'); if(lp&&lp.lg!==G.league) pos=d1?10:3;
  const N=mgrIds(G.league).length; const q=1-(Math.min(pos,N)-1)/Math.max(1,N-1); // 1 = campeón
  const base=Math.round(d1?(500+1100*q):(120+260*q));
  G.tvOffers=[{name:'Canal Plus',kind:'Contrato fijo',fixed:base,winBonus:0,perMatch:0},{name:'TVE',kind:'Contrato con prima por victoria',fixed:Math.round(base*0.7),winBonus:Math.round(base*0.03),perMatch:0},{name:'Antena 3',kind:'Contrato con partidos televisados',fixed:Math.round(base*0.45),winBonus:0,perMatch:Math.round(base*0.05)}];
  G.tv=null;
}
function tvKind(o){ return o.kind||(o.perMatch?'Contrato con partidos televisados':o.winBonus?'Contrato con prima por victoria':'Contrato fijo'); }
function tvIncome(hm,r){ const tv=G.tv; if(!tv) return 0; const N=Math.max(30,calOf(G.league).length); let v=tv.fixed/N; const isHome=hm.id===G.team; const my=isHome?[r.gh,r.ga]:[r.ga,r.gh]; if(my[0]>my[1]) v+=tv.winBonus; if(isHome&&tv.perMatch&&Math.random()<0.5) v+=tv.perMatch; return Math.round(v); }
function scrTvOffers(after){
  const me=team(G.team); const body=h('div',{});
  body.appendChild(h('div',{style:{marginBottom:'6px'}},'Las televisiones presentan sus ofertas por los derechos del '+me.name+' para esta temporada. Elige una:'));
  G.tvOffers.forEach(o=>{ const txtl=o.name+' ('+tvKind(o).toLowerCase()+'): '+fmtNum(o.fixed)+' millones fijos'+(o.winBonus?' + '+fmtNum(o.winBonus)+' M por victoria':'')+(o.perMatch?' + '+fmtNum(o.perMatch)+' M por partido televisado en casa':''); body.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'4px 0'},onclick:()=>{ G.tv=o; G.tvOffers=null; saveGame(); closeDialog(); after&&after(); }},txtl)); });
  dialog('OFERTAS DE TELEVISIÓN',body,[]);
}
// ---- balance semanal: taquilla, televisión y sueldos
function weeklyFinance(hm,aw,r){
  const me=team(G.team); const N=Math.max(30,calOf(G.league).length); const wages=Math.round(me.players.reduce((a,p)=>a+contractFicha(p),0)/N);
  const isHome=hm.id===G.team; const full=isHome&&isFull(hm,r.att); const gate=isHome?gateIncome(r.att,null,hm.capacity):0; const tv=tvIncome(hm,r);
  G.budget=(G.budget||0)+gate+tv-wages; G.lastFin={gate,tv,wages,att:isHome?r.att:0,full};
  G.finLog=(G.finLog||[]).concat([{j:G.jornada,rival:isHome?aw.name:hm.name,home:isHome,att:isHome?r.att:0,full,gate,tv,wages,budget:G.budget}]).slice(-40);
  return G.lastFin;
}
function finOther(label,amount){ // apunte extraordinario (tratamientos, fichajes, ventas) en el balance
  G.finLog=(G.finLog||[]).concat([{j:G.jornada,rival:label,home:false,att:0,gate:0,tv:0,wages:0,other:amount,budget:G.budget}]).slice(-40); }
// ---- pantalla de finanzas
function scrFinanzas(){
  const me=team(G.team); setBg('fondo6'); const s=clearScreen();
  s.appendChild(topbar({team:me,title:'FINANZAS',date:gameDate(),sub:'PRESUPUESTO: '+fmtNum(G.budget)+' MILLONES'}));
  const L=panel(10,68,300,372); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'TAQUILLA'));
  const LS=at(h('div',{class:'scroll'}),0,18,296,352); L.appendChild(LS);
  const nm=nextMatch(); const home=nm&&nm[0]===G.team; const rival=nm?team(nm[0]===G.team?nm[1]:nm[0]):null;
  const blk=(cls,text)=>{ const e=h('div',{class:cls,style:{position:'static',display:'block',margin:'0 10px 6px'}},text); return e; };
  const render=()=>{ LS.innerHTML=''; const price=ticketPrice();
    LS.appendChild(blk('lbl','PRECIO DE LA ENTRADA')).style.marginTop='8px';
    const row=h('div',{class:'navrow',style:{position:'static',display:'flex',alignItems:'center',justifyContent:'space-between',margin:'4px 10px 10px'}}); row.appendChild(btn('−',0,0,40,()=>{ G.ticket=Math.max(300,price-100); saveGame(); render(); },'blue')); const pv=h('div',{class:'f-e4',style:{flex:'1',textAlign:'center'}},fmtNum(price)+' ptas'); row.appendChild(pv); row.appendChild(btn('+',0,0,40,()=>{ G.ticket=Math.min(15000,price+100); saveGame(); render(); },'blue')); row.querySelectorAll('.btn').forEach(b=>{ b.style.position='static'; b.style.width='40px'; b.style.flex='0 0 40px'; }); LS.appendChild(row);
    const d=attendanceModel(me,rival||me,price,true); const lines=['Aforo: '+fmtNum(d.cap)];
    if(rival){ lines.push('Próximo partido: '+(home?'en casa vs ':'fuera vs ')+rival.name+(d.derby&&home?' · ¡MÁXIMO RIVAL!':'')); if(home) lines.push('Asistencia prevista: '+fmtNum(d.att)+(d.full?' · ¡LLENO!':''),'Taquilla prevista: '+fmtNum(gateIncome(d.att,price,d.cap))+' millones'+(d.full?' (+10 % por lleno)':'')); }
    const tx=blk('txt f-p8',lines.join('\n')); tx.style.lineHeight='13px'; LS.appendChild(tx);
    LS.appendChild(blk('lbl','TELEVISIÓN')).style.marginTop='10px'; const tv=G.tv;
    const tvt=blk('txt f-p8',tv?tv.name+' · '+tvKind(tv)+'\n'+fmtNum(tv.fixed)+' M fijos'+(tv.winBonus?' + '+fmtNum(tv.winBonus)+' M por victoria':'')+(tv.perMatch?' + '+fmtNum(tv.perMatch)+' M por partido televisado en casa':''):'Sin contrato de televisión.'); tvt.style.lineHeight='13px'; LS.appendChild(tvt);
    if(G.tvOffers&&!G.tv){ const b=btn('VER OFERTAS DE TV',0,0,200,()=>scrTvOffers(()=>scrFinanzas()),'green'); b.style.position='static'; b.style.display='block'; b.style.margin='0 10px 8px'; LS.appendChild(b); }
    const N=Math.max(30,calOf(G.league).length); const wages=Math.round(me.players.reduce((a,p)=>a+contractFicha(p),0)/N);
    LS.appendChild(blk('lbl','SUELDOS')).style.marginTop='10px'; LS.appendChild(blk('txt f-p8',fmtNum(wages)+' M por jornada ('+fmtNum(wages*N)+' M por temporada).')); };
  render();
  const R=panel(320,68,310,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'BALANCE POR JORNADA'));
  const sc=at(h('div',{class:'scroll'}),0,18,306,350); R.appendChild(sc);
  const log=(G.finLog||[]).slice().reverse();
  if(!log.length) sc.appendChild(txt('Todavía no se ha jugado ninguna jornada.',8,8,290,20,'f-p12'));
  else { const MUI=(typeof UI!=='undefined'&&UI==='mobile'); const concept=x=>x.other!==undefined&&!x.wages&&!x.gate&&!x.tv?x.rival:(x.home?'vs ':'en ')+x.rival; const net=x=>(x.gate||0)+(x.tv||0)-(x.wages||0)+(x.other||0);
    const cols=[{t:'J.',w:24,cls:'c',k:x=>x.j},{t:'CONCEPTO',k:concept},{t:'PÚBL.',w:52,cls:'r',k:x=>x.att?fmtNum(x.att)+(x.full?' ★':''):'-',cell:x=>x.full?'y':''},{t:'TAQ.',w:36,cls:'r',k:x=>x.gate?'+'+x.gate:'-',cell:()=>'g'},{t:'TV',w:32,cls:'r',k:x=>x.tv?'+'+x.tv:'-',cell:()=>'g'},{t:'SUEL.',w:36,cls:'r',k:x=>x.wages?'-'+x.wages:'-',cell:()=>'red'},{t:'OTROS',w:44,cls:'r',k:x=>x.other?(x.other>0?'+':'')+fmtNum(x.other):'-',cell:x=>x.other>0?'g':x.other<0?'red':''},{t:'CAJA',w:44,cls:'r',k:x=>fmtNum(x.budget),cell:()=>'y'}];
    const colsM=[cols[0],cols[1],cols[2],{t:'NETO',w:44,cls:'r',k:x=>(net(x)>0?'+':'')+fmtNum(net(x)),cell:x=>net(x)>=0?'g':'red'},cols[7]];
    sc.appendChild(table(MUI?colsM:cols,log,{})); }
  s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
