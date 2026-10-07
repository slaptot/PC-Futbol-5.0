// Estadio y servicios, siguiendo la pantalla del juego original (GRADAS, PARKING, SERVICIOS, EQUIPAMIENTO,
// CÉSPED y VALLAS PUBLICITARIAS): obras con coste y semanas que empiezan al terminar la jornada, aforo
// ampliable, servicios que dan ingresos por espectador y público, equipamiento con efectos, césped que se
// desgasta y se replanta, y derechos de vallas cobrados al empezar la temporada.
const STAD_SERV=[['wc','Lavabos-W.C.',[20,40,80],['1 W.C.','10 W.C.','40 W.C.','80 W.C.'],3],['cafes','Cafeterías',[30,60,120],['1 cafetería','5 cafeterías','10 cafeterías','20 cafeterías'],12],['shops','Tiendas del club',[50,100,200],['Ninguna','1 tienda','5 tiendas','10 tiendas'],20]];
const STAD_PARK=[['Sin parking','500 plazas','2.000 plazas','5.000 plazas'],[60,120,200]];
const STAD_EQ=[['scoreboard','Marcadores electrónicos',80,'+0,5 % de público'],['lights','Focos-iluminación',120,'+1 % de público'],['heating','Calefacción del césped',150,'el césped se desgasta la mitad y hay un 5 % menos de lesiones en casa'],['dressing','Vestuarios',100,'+5 % de progreso en el entrenamiento'],['medical','Enfermería-U.C.I.',90,'las lesiones duran un 10 % menos']];
function stadium(){ if(!G.stadium){ const t=team(G.team); G.stadium={base:t.capacity||20000,extra:0,parking:0,wc:0,cafes:0,shops:0,eq:{},pitch:90,works:[],adsSeason:-1}; } return G.stadium; }
function applyStadium(){ if(!G||!G.stadium) return; const t=team(G.team); if(!t) return; if(!G.stadium.base) G.stadium.base=t.capacity||20000; t.capacity=G.stadium.base+(G.stadium.extra||0); }
function stadLevelCount(){ const S=stadium(); return S.parking+S.wc+S.cafes+S.shops; }
function stadAttFactor(){ if(!G||!G.stadium) return 1; const S=G.stadium; return 1+0.01*stadLevelCount()+(S.eq.scoreboard?0.005:0)+(S.eq.lights?0.01:0)+(S.pitch<45?-0.02:0); }
function stadServicesIncome(att){ if(!G||!G.stadium) return 0; const S=G.stadium; const ptas=S.wc*3+S.cafes*12+S.shops*20; return Math.round(att*ptas/1e6); } // millones
function stadInjuryFactor(home){ if(!G||!G.stadium) return 1; const S=G.stadium; let f=S.eq.medical?0.9:1; if(home){ if(S.eq.heating) f*=0.95; if(S.pitch<60) f*=1+(60-S.pitch)/100; } return f; }
function stadPitchText(v){ return v>=85?'ÓPTIMO':v>=65?'BUENO':v>=45?'REGULAR':v>=25?'MALO':'IMPRACTICABLE'; }
function stadStartWork(type,label,cost,weeks,apply){ const S=stadium(); if((G.budget||0)<cost) return dialog('OBRAS','No tienes presupuesto para esta obra ('+fmtNum(cost)+' millones).'); if(S.works.some(w=>w.type===type)) return dialog('OBRAS','Ya hay una obra de ese tipo en marcha.');
  dialog('REMODELACIÓN',label+'<br>Precio: '+fmtNum(cost)+' millones · '+weeks+' semanas.<br>Las obras comenzarán cuando termine la jornada actual.',[{t:'ACEPTAR',cls:'green',f:()=>{ G.budget-=cost; finOther('Obras: '+label,-cost); S.works.push({type,label,end:(G.jornada||1)+weeks,data:apply}); saveGame(); scrEstadio(); }},{t:'CANCELAR'}]); }
function stadiumTick(){ // tras cada jornada: obras terminadas, césped y vallas
  const S=stadium(); const j=G.jornada||1; const news=[]; const t=team(G.team);
  S.works=S.works.filter(w=>{ if(j<w.end) return true; const d=w.data||{};
    if(w.type==='cap'){ S.extra+=d.n; applyStadium(); news.push('Las obras para la ampliación del aforo han terminado: '+t.stadium+' tiene ahora '+fmtNum(t.capacity)+' plazas.'); }
    else if(w.type==='parking'){ S.parking=d.level; news.push('Las obras para la ampliación del parking han terminado ('+STAD_PARK[0][S.parking]+').'); }
    else if(w.type==='serv'){ S[d.key]=d.level; news.push('Las obras para la ampliación de los establecimientos del estadio han terminado ('+d.label+').'); }
    else if(w.type==='eq'){ S.eq[d.key]=true; news.push('Las obras para la mejora del equipamiento han terminado ('+d.label+').'); }
    else if(w.type==='pitch'){ S.pitch=100; news.push('Se ha replantado el césped del estadio.'); }
    return false; });
  S.pitch=Math.min(100,S.pitch+(S.eq.heating?2:1)+(typeof empStars==='function'?empStars('cesped'):0)); // recupera 1 (2 con calefacción) más 1 por estrella del Cuidador
  if(S.adsSeason!==(G.seasonIdx||0)&&j>=1){ S.adsSeason=G.seasonIdx||0; const ads=Math.round((t.capacity||20000)/1000*(league(G.league).country===22?7:8)); G.budget=(G.budget||0)+ads; finOther('Vallas publicitarias (temporada)',ads); news.push('Has vendido los derechos de publicidad en vallas por lo que queda de temporada: '+fmtNum(ads)+' millones.'); }
  if(news.length){ G.seasonNews=(G.seasonNews||[]).concat(news); }
}
// desgaste tras un partido en casa: 4 puntos (2 con calefacción) más azar, reducido un 20 % por cada estrella del Cuidador del césped (con 5 no se desgasta)
function stadiumAfterHome(){ const S=stadium(); const st=typeof empStars==='function'?empStars('cesped'):0; const wear=Math.round(((S.eq.heating?2:4)+Math.floor(Math.random()*3))*Math.max(0,1-0.2*st)); S.pitch=Math.max(0,S.pitch-wear); if(S.pitch<25&&!S.works.some(w=>w.type==='pitch')) G.seasonNews=(G.seasonNews||[]).concat(['El césped de '+team(G.team).stadium+' está impracticable: conviene replantarlo (ESTADIO).']); }
function scrEstadio(){
  const S=stadium(); const t=team(G.team); setBg('fondo6'); const s=clearScreen(); const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  s.appendChild(topbar({team:t,title:'ESTADIO',date:gameDate(),sub:t.stadium.toUpperCase()+' · AFORO '+fmtNum(t.capacity)}));
  const L=panel(10,68,300,372); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'INSTALACIONES'));
  const rows=[['GRADAS',fmtNum(t.capacity)+' plazas'+(S.extra?' ('+fmtNum(S.base)+' + '+fmtNum(S.extra)+')':'')],['PARKING',STAD_PARK[0][S.parking]],...STAD_SERV.map(sv=>[sv[1].toUpperCase(),sv[3][S[sv[0]]]]),['EQUIPAMIENTO',STAD_EQ.filter(e=>S.eq[e[0]]).map(e=>e[1]).join(', ')||'Básico'],['CÉSPED',stadPitchText(S.pitch)+' ('+S.pitch+' %)'+(typeof empStars==='function'&&empStars('cesped')?' · cuidador '+empStars('cesped')+'★':' · sin cuidador')],['VALLAS',S.adsSeason===(G.seasonIdx||0)?'vendidas esta temporada':'pendiente de vender']];
  const sc=at(h('div',{class:'scroll'}),0,20,296,220); L.appendChild(sc); rows.forEach(r=>sc.appendChild(h('div',{class:'injrow'},h('span',{},r[0]),h('span',{style:{color:'#ffe24a',textAlign:'right'}},r[1]))));
  const W=at(h('div',{class:'scroll',style:{maxHeight:'110px'}}),0,244,296,110); L.appendChild(W); W.appendChild(h('div',{class:'f-e5',style:{color:'#ffe24a',padding:'2px 6px'}},'OBRAS EN CURSO'));
  if(!S.works.length) W.appendChild(h('div',{class:'f-p8',style:{padding:'0 6px'}},'Ninguna.')); S.works.forEach(w=>W.appendChild(h('div',{class:'injrow'},h('span',{},w.label),h('span',{style:{color:'#9fd0ff'}},Math.max(0,w.end-(G.jornada||1))+' sem.'))));
  const R=panel(320,68,310,372); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'REMODELAR · PRESUPUESTO '+fmtNum(G.budget||0)+' M'));
  const acts=[
    ['AUMENTAR AFORO',()=>{ const b=h('div',{}); [2000,5000,10000].forEach(n=>{ const cost=Math.round(n/1000*100), weeks=Math.max(4,Math.round(n/2000)*4); b.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'3px 0'},onclick:()=>{ closeDialog(); stadStartWork('cap','Ampliación del aforo en '+fmtNum(n)+' plazas',cost,weeks,{n}); }},'+'+fmtNum(n)+' PLAZAS · '+fmtNum(cost)+' M · '+weeks+' semanas')); }); dialog('GRADAS',b,[{t:'CANCELAR'}]); }],
    ['PARKING',()=>{ const lv=S.parking; if(lv>=3) return dialog('PARKING','El parking ya tiene el tamaño máximo.'); stadStartWork('parking','Ampliación del parking a '+STAD_PARK[0][lv+1],STAD_PARK[1][lv],3,{level:lv+1}); }],
    ['SERVICIOS',()=>{ const b=h('div',{}); STAD_SERV.forEach(sv=>{ const lv=S[sv[0]]; b.appendChild(h('div',{class:'btn blue',style:{position:'relative',display:'block',margin:'3px 0'},onclick:()=>{ closeDialog(); if(lv>=3) return dialog('SERVICIOS',sv[1]+': ya está al máximo.'); stadStartWork('serv',sv[1]+': '+sv[3][lv+1],sv[2][lv],2,{key:sv[0],level:lv+1,label:sv[3][lv+1]}); }},sv[1].toUpperCase()+' · '+sv[3][lv]+(lv<3?' → '+sv[3][lv+1]+' · '+fmtNum(sv[2][lv])+' M':' (máximo)'))); }); b.appendChild(h('div',{class:'f-p8',style:{marginTop:'4px'}},'Cada nivel atrae un 1 % más de público e ingresa por espectador: W.C. 3, cafeterías 12 y tiendas 20 pesetas por nivel.')); dialog('SERVICIOS',b,[{t:'CANCELAR'}]); }],
    ['EQUIPAMIENTO',()=>{ const b=h('div',{}); STAD_EQ.forEach(e=>{ const has=!!S.eq[e[0]]; b.appendChild(h('div',{class:'btn '+(has?'green':'blue'),style:{position:'relative',display:'block',margin:'3px 0'},onclick:()=>{ closeDialog(); if(has) return dialog('EQUIPAMIENTO',e[1]+': ya instalado.'); stadStartWork('eq',e[1],e[2],3,{key:e[0],label:e[1]}); }},e[1].toUpperCase()+(has?' · instalado':' · '+fmtNum(e[2])+' M · '+e[3]))); }); dialog('EQUIPAMIENTO',b,[{t:'CANCELAR'}]); }],
    ['REPLANTAR CÉSPED',()=>stadStartWork('pitch','Replantar el césped',40,1,{})],
    ['FICHA DEL CLUB',()=>scrDbTeam(G.team,{back:()=>scrEstadio()})]];
  acts.forEach((a,i)=>R.appendChild(btn(a[0],16,30+i*30,278,a[1],i===5?'blue':'green')));
  R.appendChild(txt('El césped se desgasta con cada partido en casa; el Cuidador del césped (EMPLEADOS) lo reduce un 20 % por estrella y acelera la recuperación, y la calefacción lo protege. En mal estado aumenta las lesiones y resta público. Las obras empiezan al terminar la jornada.',16,216,278,70,'f-p8'));
  s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
