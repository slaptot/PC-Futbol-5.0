// Jóvenes promesas (juveniles), como en el juego original: con un OJEADOR contratado se encarga una búsqueda
// por demarcación; tras 10-20 jornadas (menos con más estrellas) devuelve candidatos que se pueden fichar.
// Los juveniles entrenan en la plantilla de jóvenes promesas (más deprisa con ENTRENADOR DE JUVENILES) hasta
// su tope de juvenil (potencial − 8); entonces el entrenador avisa y se pueden PROMOCIONAR al primer equipo,
// donde siguen creciendo con el entrenamiento normal hasta su potencial (que no está en la base de datos del
// juego: los juveniles se generan, como hacía el original con las listas NOMBRES/APELLIDO).
const YOUTH_DEMS=[['POR','Portero',[1]],['DEF','Defensa',[2,3,4,5,6]],['MED','Centrocampista',[7,8,10,11,15,18]],['DEL','Delantero',[9,12,13,14,16,17]]];
function youthState(){ if(!G.youth) G.youth={search:null,found:[],squad:[],promoted:[],seq:1}; return G.youth; }
function youthCap(p){ return Math.max(1,(p.pot||70)-8); }
function youthIdx(p){ return p.dem==='POR'?[0,1,2,3,9]:[0,1,2,3,4,5,6,7,8]; }
// candidato: perfil copiado de un jugador real de la misma demarcación y escalado a su nivel inicial
function youthNew(dem){
  const stars=empStars('ojeador'); const Y=youthState(); const roles=YOUTH_DEMS.find(d=>d[0]===dem)[2];
  const pool=Object.values(DATA.teams).filter(t=>t.id<9000).flatMap(t=>t.players).filter(p=>p.dem===dem&&p.me>=55&&p.me<=78&&!p.youth);
  const tpl=pool[Math.floor(Math.random()*pool.length)];
  const pot=Math.min(95,Math.round(58+Math.random()*16+stars*3+(Math.random()<0.15*stars?8:0)));
  const startME=Math.max(35,pot-16-Math.floor(Math.random()*10)); const f=startME/Math.max(1,tpl.me);
  const attrs=tpl.attrs.map(a=>Math.max(5,Math.min(99,Math.round(a*f*(0.9+Math.random()*0.2)))));
  const year=1996+(G.seasonIdx||0); const age=16+Math.floor(Math.random()*3);
  const p={id:900000+(Y.seq++),name:'',full:'',roles:[roles[Math.floor(Math.random()*roles.length)]],country:(league(G.league)||{}).country||22,c2:1,f1:99,f2:2,f3:3,f4:0,
    birth:[1+Math.floor(Math.random()*28),1+Math.floor(Math.random()*12),year-age],height:168+Math.floor(Math.random()*22),weight:60+Math.floor(Math.random()*18),attrs,dem,pot,youth:true,joined:G.jornada};
  const nm=empName().split(' '); p.name=nm[nm.length-1]; p.full=empName(); p.me=calcME(p); return p;
}
// por jornada: avanza la búsqueda, entrena a los juveniles y avisa de los preparados
function youthTick(){
  const Y=youthState(); const log=[]; const j=G.jornada||1;
  if(Y.search){ if(!empStars('ojeador')){ Y.search=null; log.push('Sin ojeador, la búsqueda de juveniles se ha cancelado.'); }
    else if(j>=Y.search.end){ const st=empStars('ojeador'); const n=Math.random()<0.1?0:1+Math.floor(Math.random()*Math.min(3,1+st/2)); const dem=Y.search.dem; Y.search=null;
      if(!n) log.push('El Ojeador ha terminado su búsqueda sin encontrar ningún jugador con las características requeridas.');
      else { for(let i=0;i<n;i++) Y.found.push(youthNew(dem)); log.push('El Ojeador ya tiene informes sobre '+(n===1?'un futbolista interesante':n+' futbolistas interesantes')+' ('+YOUTH_DEMS.find(d=>d[0]===dem)[1].toLowerCase()+'). Míralos en JÓVENES PROMESAS.'); } } }
  const st=empStars('juveniles'); const pr=0.08+0.07*st; // 5 estrellas: unas 25-30 jornadas hasta el tope; sin entrenador, muy lento
  Y.squad.forEach(p=>{ const cap=youthCap(p); let up=false; for(const i of youthIdx(p)){ if(p.attrs[i]<cap&&Math.random()<pr){ p.attrs[i]++; up=true; } } if(up) p.me=calcME(p);
    const ready=youthIdx(p).every(i=>p.attrs[i]>=cap-2); if(ready&&!p.ready){ p.ready=true; log.push('El entrenador de los Juveniles te comunica que '+p.name+' ya está preparado para ascender a la primera plantilla.'); } });
  return log;
}
function youthHire(p){ const Y=youthState(); const ficha=2+Math.round(p.me/20); if(Y.squad.length>=10) return dialog('JÓVENES PROMESAS','La plantilla de jóvenes promesas está completa (10 jugadores).');
  dialog('CONTRATAR JUVENIL',p.full+'<br>'+YOUTH_DEMS.find(d=>d[0]===p.dem)[1]+' · '+playerAge(p)+' años · ME '+p.me+'<br>Ficha: '+fmtNum(ficha)+' millones por temporada.',[{t:'CONTRATAR',cls:'green',f:()=>{ if(Math.random()<0.1){ Y.found=Y.found.filter(x=>x!==p); dialog('JÓVENES PROMESAS','El juvenil '+p.name+' ha rechazado tu oferta de contrato.',[{t:'ACEPTAR',f:scrJuveniles}]); return; }
    Y.found=Y.found.filter(x=>x!==p); Y.squad.push(p); G.contracts=G.contracts||{}; G.contracts['i'+p.id]={ficha,years:3}; saveGame(); dialog('JÓVENES PROMESAS',p.name+' se ha incorporado a tu equipo de Juveniles.',[{t:'ACEPTAR',f:scrJuveniles}]); }},{t:'CANCELAR'}]); }
function youthPromote(p){ const Y=youthState(); const t=team(G.team); if(t.players.length>=30) return dialog('PROMOCIONAR','La plantilla está completa (30 jugadores).');
  dialog('PROMOCIONAR','¿Subir a '+p.full+' ('+ROLES_SHORT[p.roles[0]]+', ME '+p.me+') al primer equipo? Seguirá progresando con el entrenamiento'+(p.ready?'.':', aunque aún no está preparado del todo.'),[{t:'PROMOCIONAR',cls:'green',f:()=>{ Y.squad=Y.squad.filter(x=>x!==p); p.base=p.attrs.slice(); youthAdd(p); Y.promoted.push(p); saveGame(); scrJuveniles(); }},{t:'CANCELAR'}]); }
function youthAdd(p){ const t=team(G.team); p.team=t.id; p.idx=t.players.length; p.idx0=undefined; t.players.push(p); DATA.playersById[p.id]=p; t._me=undefined; }
function youthRelease(p){ const Y=youthState(); dialog('DESPEDIR','¿Dar de baja al juvenil '+p.name+'?',[{t:'DESPEDIR',cls:'red',f:()=>{ Y.squad=Y.squad.filter(x=>x!==p); Y.found=Y.found.filter(x=>x!==p); saveGame(); scrJuveniles(); }},{t:'CANCELAR'}]); }
// al cargar la partida: los promocionados vuelven a la plantilla (los datos se recargan del JSON)
function applyYouth(){ if(!G||!G.youth) return; const t=team(G.team); if(!t) return; G.youth.promoted.forEach(p=>{ if(!t.players.some(x=>x.id===p.id)){ if(p.base) p.attrs=p.base.slice(); p.me=calcME(p); youthAdd(p); } }); }
function youthSearchStart(dem){ const Y=youthState(); const st=empStars('ojeador'); const len=20-2*st+Math.floor(Math.random()*5)-2; Y.search={dem,start:G.jornada,end:G.jornada+Math.max(6,len)}; saveGame(); scrJuveniles(); }
function youthStars(p){ const pot=p.pot||70; return pot>=88?5:pot>=80?4:pot>=72?3:pot>=64?2:1; }
function scrJuveniles(){
  const Y=youthState(); const t=team(G.team); setBg('fondo6'); const s=clearScreen(); const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  s.appendChild(topbar({team:t,title:'JÓVENES PROMESAS',date:gameDate(),sub:'OJEADOR: '+(empStars('ojeador')?empStars('ojeador')+' ESTRELLAS':'SIN CONTRATAR')+' · ENT. JUVENILES: '+(empStars('juveniles')?empStars('juveniles')+' ESTRELLAS':'SIN CONTRATAR')}));
  const S=panel(10,68,620,120); s.appendChild(S); S.appendChild(h('div',{class:'hdr'},'BÚSQUEDA DEL OJEADOR'));
  const st=empStars('ojeador');
  if(!st) S.appendChild(txt('Necesitas contratar un Ojeador para buscar jugadores juveniles (pantalla EMPLEADOS).',10,26,600,30,'f-p12'));
  else if(Y.search){ const left=Math.max(0,Y.search.end-(G.jornada||1)); S.appendChild(txt('El Ojeador está buscando '+YOUTH_DEMS.find(d=>d[0]===Y.search.dem)[1].toLowerCase()+'s con las características requeridas.\nCapacidad de búsqueda: '+st+' estrellas · le quedan unas '+left+' jornadas.',10,26,600,34,'f-p12')); }
  else { S.appendChild(txt('El Ojeador está libre. Elige qué demarcación debe buscar (tarda entre 10 y 20 jornadas, menos con más estrellas).',10,26,600,30,'f-p12'));
    YOUTH_DEMS.forEach((d,i)=>S.appendChild(btn(d[1].toUpperCase(),10+i*150,62,140,()=>youthSearchStart(d[0]),'green'))); }
  if(Y.found.length){ const F=at(h('div',{class:'scroll',style:{maxHeight:'40px'}}),10,86,600,32); S.appendChild(F); F.appendChild(h('div',{class:'f-e5',style:{color:'#ffe24a'}},'INFORMES: '+Y.found.map(p=>p.name+' ('+ROLES_SHORT[p.roles[0]]+', '+playerAge(p)+' años, ME '+p.me+')').join(' · ')+' · pulsa en la lista para contratar')); }
  const P=panel(10,196,620,244); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'PLANTILLA DE JÓVENES PROMESAS ('+Y.squad.length+'/10)'));
  const sc=at(h('div',{class:'scroll'}),0,20,616,220); P.appendChild(sc);
  const rows=[]; if(Y.found.length){ rows.push({__group:'INFORMES DEL OJEADOR · pulsa para contratar'}); Y.found.forEach(p=>rows.push({p,found:true})); } rows.push({__group:'JUVENILES EN FORMACIÓN · pulsa para promocionar o dar de baja'}); Y.squad.forEach(p=>rows.push({p}));
  if(!Y.squad.length&&!Y.found.length) rows.push({__group:'No hay juveniles. El Ojeador encuentra candidatos y el Entrenador de Juveniles los hace progresar.'});
  const cols=[{t:'JUGADOR',w:MUI?110:150,k:x=>x.p.name},{t:'EDAD',w:34,cls:'c',k:x=>playerAge(x.p)},{t:'ROL',w:MUI?70:90,k:x=>h('span',{class:'f-con8'},ROLES_SHORT[x.p.roles[0]])},{t:'ME',w:28,cls:'r',k:x=>x.p.me,cell:()=>'y'},{t:'TOPE JUV.',w:60,cls:'r',k:x=>youthCap(x.p)},{t:'PROYECCIÓN',w:74,cls:'c',k:x=>empStarsEl(youthStars(x.p))},{t:'ESTADO',w:MUI?80:110,k:x=>h('span',{class:'f-con8',style:{color:x.found?'#9fb4e8':x.p.ready?'#8dff8d':'#fff'}},x.found?'INFORME':x.p.ready?'PREPARADO':'EN FORMACIÓN')}];
  sc.appendChild(table(cols,rows,{rowClass:x=>x.p.ready&&!x.found?'hired':'',onRow:x=>x.found?youthHire(x.p):dialog(x.p.full.toUpperCase(),ROLES_SHORT[x.p.roles[0]]+' · '+playerAge(x.p)+' años · ME '+x.p.me+' (tope como juvenil '+youthCap(x.p)+')'+(x.p.ready?'<br>Preparado para ascender.':'<br>Sigue en formación.'),[{t:'PROMOCIONAR',cls:'green',f:()=>youthPromote(x.p)},{t:'DAR DE BAJA',cls:'red',f:()=>youthRelease(x.p)},{t:'CERRAR'}])}));
  s.appendChild(btn('EMPLEADOS',430,446,100,()=>scrEmpleados(),'blue')); s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
