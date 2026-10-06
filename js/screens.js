// Pantallas generales: menú, base de datos, historia, seguimiento, ficha de jugador
const CREDITS_HTML='Los datos, gráficos, fotografías, música y nombres pertenecen a <b><a href="https://dinamicmultimedia.es/" target="_blank" rel="noopener" style="color:#ffe24a">Dinamic Multimedia</a></b> y han sido obtenidos del juego original <b>PC Fútbol 5.0</b> y de su <b>Edición de Oro</b> (1996-1997).<br><br>Esta web, que se inspira en la estética del juego original, es obra de <b>Alberto Muñoz Fuertes</b> (<a href="mailto:alberto.munoz.fuertes@proton.me" style="color:#8dff8d">alberto.munoz.fuertes@proton.me</a>). No busca beneficio alguno: nace de la nostalgia del juego de su infancia y del deseo de volver a jugarlo con sus ídolos futbolísticos del pasado.';
const MENU_ITEMS=[
  ['INSTRUCCIONES',338,147,150,()=>go('instrucciones')],
  ['HISTORIA',352,168,90,()=>go('historia')],
  ['BASE DE DATOS',360,189,142,()=>go('dbase')],
  ['SEGUIMIENTO',368,210,100,()=>go('seguimiento')],
  ['SEGUIMIENTO MANUAL',368,231,214,()=>go('seguimiento')],
  ['ACTUALIZACION ON LINE',368,252,232,null],
  ['infoFUTBOL',372,273,100,null],
  ['PARTIDO AMISTOSO',362,294,186,()=>go('amistoso')],
  ['LIGA MANAGER',352,315,146,()=>go('liga')],
  ['LIGA PROMANAGER',352,336,180,null],
  ['ProQuinielas',338,357,96,null],
];
function scrMenu(){
  setMusic('menu'); setBg('fondo7'); const s=clearScreen();
  for(const [name,x,y,w,f] of MENU_ITEMS){ const e=at(h('div',{class:'menu-item'+(f?'':' dis'),title:f?name:name+' (no disponible)'}),x,y,w,21); if(f) e.onclick=f; s.appendChild(e); }
  s.appendChild(btn('BUSCAR',20,404,120,()=>go('buscar'),'blue','lupa'));
  s.appendChild(at(h('div',{class:'hot',title:'Salir',onclick:()=>dialog('PC FÚTBOL 5.0','Réplica web del juego original (Dinamic Multimedia, 1996).<br>Datos y gráficos extraídos de la carpeta DBDAT del juego.')}),582,440,40,36));
  s.appendChild(at(h('div',{class:'hot',title:'Acerca de',onclick:()=>dialog('ACERCA DE PC FÚTBOL 5.0 WEB',CREDITS_HTML)}),545,440,30,36));
}
function scrInstrucciones(){ setMusic(AUDIO.ctx==='manager'?'manager':'db');
  setBg('fondo4'); const s=clearScreen();
  s.appendChild(topbar({title:'INSTRUCCIONES'}));
  const p=panel(30,66,580,374); s.appendChild(p);
  const sc=at(h('div',{class:'scroll'}),4,6,572,362); p.appendChild(sc);
  const body=h('div',{class:'txt instr',style:{position:'static',padding:'8px 10px 8px 8px',whiteSpace:'pre-wrap'}},`PC FÚTBOL 5.0 · Temporada 96-97

LIGA MANAGER: elige una liga (España, Inglaterra o Italia) y un equipo, o crea el tuyo propio con jugadores de toda la base de datos, y dirige su temporada. Desde la oficina puedes consultar la CLASIFICACIÓN de las seis ligas, el CALENDARIO, preparar la ALINEACIÓN (un click selecciona; doble click o pulsación larga marca a un jugador para cambiarlo por el siguiente que toques), definir la TÁCTICA sobre el campo (cada jugador domina unas demarcaciones; fuera de ellas baja su media), ENTRENAR por áreas y JUGAR cada jornada. Los jugadores que no juegan pierden ritmo: a partir de la tercera jornada sin jugar su media baja poco a poco (hasta 8 puntos por atributo) y la recuperan al volver a jugar; los lesionados no pierden ritmo. Los partidos se simulan con los atributos reales de los jugadores del juego original (velocidad, resistencia, agresividad, calidad, pase, regate, remate, tiro, entradas y portero), con lesiones de los 17 tipos del juego, tarjetas y sanciones: una expulsión cuesta un partido (dos si es roja directa) y cinco amarillas en liga o tres en copa, otro; los sancionados no pueden alinearse en esa competición. Durante el partido en directo puedes hacer hasta tres cambios con el botón CAMBIO (sale uno del once, entra uno de los convocados); si se lesiona un jugador tuyo, el partido se detiene para que decidas. En EMPLEADOS contratas personal para el club (segundo entrenador, fisioterapeuta, ojeador, asistente…): cada puesto tiene candidatos con estrellas y sueldo que se renuevan cada pocas jornadas, y cada uno aporta una mejora; despedir cuesta el sueldo del resto de la temporada.

COPAS: la Copa nacional (Copa del Rey, FA Cup o Coppa Italia) y las competiciones europeas (Copa de Europa, Recopa y UEFA) se juegan en eliminatorias a doble partido repartidas por toda la temporada, con sorteo de cada ronda en el bombo y finales a partido único en campo neutral. Entras en Europa según la posición del año anterior o como campeón de copa.

FICHAJES: el mercado cambia cada jornada; cada pocas jornadas aparece una figura. Al pulsar un jugador se abre la oferta con los conceptos del juego: oferta al equipo, ficha anual, años de contrato, cláusula de rescisión, prima por gol, casa y coche, partidos para renovación y libertad por descenso. También puedes vender jugadores y curar a los lesionados pagando el tratamiento.

FINANZAS: fija el precio de la entrada (la asistencia depende de tu posición, la racha, el precio y el rival; en los derbis y con lleno se ingresa más), elige una oferta de televisión al empezar cada liga, paga los sueldos cada jornada (el 8 % del valor de mercado de cada jugador) y cobra los premios estipulados por posición en la liga, por ronda de copa y por título. Todo queda en el balance por jornada.

FIN DE TEMPORADA: pantallas de campeones de los tres países, premios Pichichi, Zamora y mejor entrenador, campeones de copa y balance. Después empieza la temporada siguiente con ascensos y descensos, calendarios nuevos y las competiciones europeas que hayas ganado.

BASE DE DATOS: consulta los 645 equipos de la Edición de Oro (España, Inglaterra, Italia, resto de Europa y Sudamérica), sus plantillas, fichas de jugadores con fotos, biografías y trayectorias, entrenadores, estadios y árbitros. En cada plantilla, la columna SIT marca las altas de la temporada 96-97 y los jugadores del filial; las bajas (jugadores que ya habían dejado el club) aparecen al final y no juegan en el manager. El BUSCADOR encuentra cualquier texto: jugadores, equipos, crónicas, declaraciones…

SEGUIMIENTO MANUAL: resultados reales de la temporada 96-97 completa (1ª y 2ª División, Premier League, First Division, Serie A y Serie B) con clasificación por jornada y, en la Liga española, la crónica de cada partido: ficha, goles, tarjetas, alineaciones y declaraciones de los entrenadores.

HISTORIA: todas las clasificaciones de la Liga desde 1928-29 hasta 1995-96 y todas las finales de la Copa del Rey, Copa de Europa, Recopa, UEFA, Supercopas de España y Europa e Intercontinental, con palmarés y rankings históricos.

OTROS: Partido amistoso entre dos equipos cualesquiera; impresión en PDF de fichas, plantillas, entrenadores, árbitros y crónicas; música y efectos originales (interruptores en la barra inferior). En el móvil puedes elegir entre la versión móvil en vertical y la de escritorio, y cambiar en cualquier momento.

La partida de Liga Manager se guarda automáticamente en el navegador; en el móvil conviene exportarla a un archivo desde "Guardar partida".

CRÉDITOS: los datos, gráficos, fotografías, música y nombres pertenecen a Dinamic Multimedia (https://dinamicmultimedia.es/) y han sido obtenidos del juego original PC Fútbol 5.0 y de su Edición de Oro. Esta web, que se inspira en la estética del juego original, es obra de Alberto Muñoz Fuertes (alberto.munoz.fuertes@proton.me) y no busca beneficio alguno, más allá de la nostalgia del juego de su infancia y de poder rejugarlo con sus ídolos futbolísticos del pasado.`);
  sc.appendChild(body);
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
// ---------- HISTORIA ----------
const HIST_TABS=[['LIGA','LIGA','liga_historia'],['COPA DEL REY','COPAREY','coparey_historia'],['COPA DE EUROPA','CE','ligacampeones_histo'],['RECOPA','RECOPA','recopa_historia'],['UEFA','UEFA','uefa_historia'],['SUPERCOPA ESPAÑA','SCESPANA','supercopa_espana_hi'],['SUPERCOPA EUROPA','SCEUROPA','supercopa_europa_hi'],['INTERCONTINENTAL','SCINTERC','intercontinental_hi']];
function scrHistoria(state){
  setMusic(AUDIO.ctx==='manager'?'manager':'db'); state=state||{}; const comp=state.comp||'LIGA';
  if(comp==='LIGA') return scrHistoriaLiga(state);
  setBg('fondo_historia'); const s=clearScreen(); const C=DATA.cups[comp]; const tab=HIST_TABS.find(t=>t[1]===comp);
  const eds=C.editions; const ei=state.i!==undefined?state.i:eds.length-1; const e=eds[ei];
  s.appendChild(topbar({title:'HISTORIA',right:tab[0]}));
  s.appendChild(histTabs(comp));
  const left=panel(10,96,150,344); s.appendChild(left); left.appendChild(h('div',{class:'hdr'},'EDICIONES'));
  const ls=at(h('div',{class:'scroll'}),0,18,146,322); left.appendChild(ls);
  eds.forEach((x,i)=>ls.appendChild(h('div',{class:'f-con8',style:{padding:'1px 4px',cursor:'pointer',whiteSpace:'nowrap',overflow:'hidden',background:i===ei?'#2d49b8':'',color:i===ei?'#ffe24a':'#fff'},onclick:()=>scrHistoria({comp,i})},x.year+'  '+x.winner)));
  const right=panel(170,96,460,344); s.appendChild(right); right.appendChild(h('div',{class:'hdr'},tab[0]+' '+e.year+(comp!=='SCINTERC'&&comp!=='COPAREY'?'-'+String(e.year+1).slice(2):'')));
  right.appendChild(at(h('img',{src:'img/ui/'+tab[2]+'.png',style:{width:'63px',height:'72px'}}),8,24));
  const body=at(h('div',{class:'scroll f-p12',style:{whiteSpace:'pre-wrap',lineHeight:'14px',padding:'2px'}}),80,24,372,312); right.appendChild(body);
  let lines=['CAMPEÓN: '+e.winner,'FINALISTA: '+e.runner];
  if(comp==='COPAREY'){ lines.push('Final: '+e.gh+' - '+e.ga,'',e.text); }
  else if(comp==='CE'){ lines.push('Final: '+e.gh+' - '+e.ga+(e.place?'  ('+e.place+')':''),'','Alineación del campeón: '+e.text); }
  else if(comp==='RECOPA'||comp==='UEFA'){ const sc=e.s; const two=sc[1]!==255&&sc[3]!==255&&(sc[1]||sc[3]||e.type===0); lines.push(two?'Ida: '+e.winner+' '+sc[0]+' - '+sc[2]+' '+e.runner+'\nVuelta: '+e.runner+' '+sc[3]+' - '+sc[1]+' '+e.winner:'Final: '+e.winner+' '+sc[0]+' - '+sc[2]+' '+e.runner); }
  else { e.legs.forEach((l,k)=>{ lines.push((e.legs.length>1?(k===0?'IDA: ':'VUELTA: '):'FINAL: ')+(k===0?e.winner:e.runner)+' '+l.gh+' - '+l.ga+' '+(k===0?e.runner:e.winner),l.stadium+(l.date?' · '+l.date:'')+(l.att?' · '+fmtNum(l.att)+' espectadores':''),l.ref?'Árbitro: '+l.ref:'','',(k===0?e.winner:e.runner)+': '+l.lineups[0],(k===0?e.runner:e.winner)+': '+l.lineups[1],''); }); }
  body.textContent=lines.join('\n');
  const rk=C.ranking||C.champions; 
  s.appendChild(btn('PALMARÉS',10,446,120,()=>{ const b=h('div',{class:'scroll',style:{maxHeight:'300px'}}); if(C.ranking) b.appendChild(table([{t:'EQUIPO',k:r=>r[0]},{t:'PJ',cls:'r',k:r=>r[1]},{t:'PART.',cls:'r',k:r=>r[2]},{t:'PG',cls:'r',k:r=>r[3]},{t:'PE',cls:'r',k:r=>r[4]},{t:'PP',cls:'r',k:r=>r[5]},{t:'GF',cls:'r',k:r=>r[6]},{t:'GC',cls:'r',k:r=>r[7]}],C.ranking)); else { const cnt={}; eds.forEach(x=>cnt[x.winner]=(cnt[x.winner]||0)+1); Object.entries(cnt).sort((a,b)=>b[1]-a[1]).forEach(c=>b.appendChild(h('div',{class:'f-con'},c[1]+'  '+c[0]))); } dialog('PALMARÉS · '+tab[0],b); },'blue','palmares'));
  s.appendChild(btn('<',140,446,30,()=>scrHistoria({comp,i:Math.max(0,ei-1)}),'blue'));
  s.appendChild(btn('>',172,446,30,()=>scrHistoria({comp,i:Math.min(eds.length-1,ei+1)}),'blue'));
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
function histTabs(comp){
  const bar=h('div',{});
  HIST_TABS.forEach((t,i)=>{ const b=btn(t[0],10+i*78,70,76,()=>scrHistoria({comp:t[1]}),t[1]===comp?'green':'blue'); b.style.fontFamily='micro8'; b.style.fontSize='10px'; b.style.letterSpacing='0'; bar.appendChild(b); });
  return bar;
}
function scrHistoriaLiga(state){ setMusic(AUDIO.ctx==='manager'?'manager':'db');
  state=state||{}; setBg('fondo_historia'); const s=clearScreen();
  const seasons=DATA.liga.seasons; const si=state.season!==undefined?state.season:seasons.length-1; const se=seasons[si];
  s.appendChild(topbar({title:'HISTORIA',right:'Liga '+se.year+'-'+String(se.year+1).slice(2)}));
  s.appendChild(histTabs('LIGA'));
  const left=panel(10,96,150,344); s.appendChild(left); left.appendChild(h('div',{class:'hdr'},'TEMPORADAS'));
  const ls=at(h('div',{class:'scroll'}),0,18,146,322); left.appendChild(ls);
  seasons.forEach((x,i)=>{ const w=x.table[0]?x.table[0][0]:''; const e=h('div',{class:'f-con8',style:{padding:'1px 4px',cursor:'pointer',whiteSpace:'nowrap',overflow:'hidden',background:i===si?'#2d49b8':'',color:i===si?'#ffe24a':'#fff'},onclick:()=>scrHistoria({comp:'LIGA',season:i})},x.year+'-'+String(x.year+1).slice(2)+'  '+w); ls.appendChild(e); });
  const right=panel(170,96,460,344); s.appendChild(right); right.appendChild(h('div',{class:'hdr'},'CLASIFICACIÓN FINAL '+se.year+'-'+(se.year+1)));
  const rows=se.table.map((r,i)=>({pos:i+1,name:r[0],pj:r[1],pg:r[2],pe:r[3],gf:r[4],gc:r[5],pp:r[1]-r[2]-r[3],pts:r[2]*2+r[3]}));
  const sc=at(h('div',{class:'scroll'}),0,18,456,322); right.appendChild(sc);
  sc.appendChild(table([{t:'POS',w:34,cls:'c',k:r=>r.pos},{t:'EQUIPO',k:r=>r.name},{t:'PTS',w:36,cls:'r',k:r=>r.pts,cell:()=>'y'},{t:'PJ',w:30,cls:'r',k:r=>r.pj},{t:'PG',w:30,cls:'r',k:r=>r.pg},{t:'PE',w:30,cls:'r',k:r=>r.pe},{t:'PP',w:30,cls:'r',k:r=>r.pp},{t:'GF',w:34,cls:'r',k:r=>r.gf},{t:'GC',w:34,cls:'r',k:r=>r.gc}],rows,{rowClass:r=>r.pos===1?'me':''}));
  s.appendChild(btn('PALMARÉS',10,446,120,()=>{ const b=h('div',{}); DATA.liga.champions.forEach(c=>b.appendChild(h('div',{class:'f-con'},c[1]+'  '+c[0]))); dialog('CAMPEONES DE LIGA (1929-1996)',b); },'blue','palmares'));
  s.appendChild(btn('<',140,446,30,()=>scrHistoria({comp:'LIGA',season:Math.max(0,si-1)}),'blue'));
  s.appendChild(btn('>',172,446,30,()=>scrHistoria({comp:'LIGA',season:Math.min(seasons.length-1,si+1)}),'blue'));
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
// ---------- BASE DE DATOS ----------
function scrDbase(state){ setMusic(AUDIO.ctx==='manager'?'manager':'db');
  state=state||{}; setBg('fondo_dbase'); const s=clearScreen();
  s.appendChild(topbar({title:'BASE DE DATOS',right:Object.keys(DATA.teams).length+' equipos'}));
  const groups=[['1ª DIVISIÓN',t=>t.league==='ESP1'],['2ª DIVISIÓN',t=>t.league==='ESP2'],['RESTO ESPAÑA',t=>!t.league&&t.nat===22&&t.id<9000],['PREMIER LEAGUE',t=>t.league==='ENG1'],['FIRST DIVISION',t=>t.league==='ENG2'],['RESTO INGLATERRA',t=>!t.league&&t.nat===30&&t.id<9000],['SERIE A',t=>t.league==='ITA1'],['SERIE B',t=>t.league==='ITA2'],['RESTO ITALIA',t=>!t.league&&t.nat===36&&t.id<9000],['RESTO EUROPA',t=>!t.league&&![22,30,36].includes(t.nat)&&t.id<2800],['AMÉRICA',t=>t.nat!==22&&t.id>=2800&&t.id<9000],['OTROS',t=>t.id>=9000]];
  const gi=state.group||0;
  const left=panel(10,70,150,370); s.appendChild(left); left.appendChild(h('div',{class:'hdr'},'COMPETICIÓN'));
  groups.forEach((g,i)=>left.appendChild(at(h('div',{class:'f-m8',style:{padding:'4px 4px',cursor:'pointer',background:i===gi?'#2d49b8':'',color:i===gi?'#ffe24a':'#fff',letterSpacing:'1px'},onclick:()=>scrDbase({group:i})},g[0]),0,22+i*20,146,20)));
  left.appendChild(btn('ÁRBITROS',8,300,130,()=>scrArbitros(),'blue','ico_arbitro'));
  left.appendChild(btn('BUSCAR',8,326,130,()=>go('buscar'),'blue','lupa'));
  const right=panel(170,70,460,370); s.appendChild(right); right.appendChild(h('div',{class:'hdr'},groups[gi][0]));
  const teams=Object.values(DATA.teams).filter(groups[gi][1]).sort((a,b)=>(a.nat-b.nat)||a.name.localeCompare(b.name));
  const sc=at(h('div',{class:'scroll'}),0,18,456,348); right.appendChild(sc);
  const grid=h('div',{class:'teamlist',style:{position:'static',padding:'4px',gridTemplateColumns:'repeat(3,1fr)'}}); sc.appendChild(grid);
  teams.forEach(t=>grid.appendChild(h('div',{onclick:()=>scrDbTeam(t.id,{back:()=>scrDbase(state)})},h('img',{src:escImg(t.id,'ridi')}),(t.nat!==22?h('img',{src:'img/band/'+t.nat+'.png',style:{width:'14px',height:'10px'}}):null),t.name)));
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
function scrArbitros(state){ setMusic(AUDIO.ctx==='manager'?'manager':'db');
  state=state||{}; setBg('fondo_dbase'); const s=clearScreen();
  s.appendChild(topbar({title:'ÁRBITROS',right:'1ª División 96-97'}));
  const refs=DATA.referees; const ri=state.i||0; const r=refs[ri];
  const left=panel(10,70,230,370); s.appendChild(left); left.appendChild(h('div',{class:'hdr'},'COLEGIADOS'));
  const ls=at(h('div',{class:'scroll'}),0,18,226,348); left.appendChild(ls);
  refs.forEach((x,i)=>ls.appendChild(h('div',{class:'f-con',style:{padding:'1px 4px',cursor:'pointer',background:i===ri?'#2d49b8':'',color:i===ri?'#ffe24a':'#fff'},onclick:()=>scrArbitros({i})},x.name)));
  const right=panel(250,70,380,370); s.appendChild(right); right.appendChild(h('div',{class:'hdr'},r.name));
  right.appendChild(at(h('div',{class:'ph'},h('img',{src:'img/arb/'+r.id+'.png',style:{width:'80px',height:'96px'},onerror:function(){this.src='img/ui/foto_general.png';this.style.width='80px';this.style.height='96px'}})),12,30,82,98));
  const rows=[['Nombre',r.name],['Colegio',r.dem],['Nacimiento',birthStr({birth:r.birth})+' ('+r.place+')'],['Profesión',r.prof],['Internacional',r.intl],['Categoría',r.cat===1?'Primera División':'Segunda División']];
  rows.forEach((x,i)=>{ right.appendChild(lbl(x[0].toUpperCase(),110,30+i*28)); right.appendChild(txt(String(x[1]),110,43+i*28,260,14,'f-con')); });
  s.appendChild(btn('IMPRIMIR PDF',400,446,130,()=>printRef(r),'blue','ico_impresora'));
  s.appendChild(btn('VOLVER',540,446,90,()=>scrDbase(),'blue','ico_volver'));
}
function scrDbTeam(tid, opts){ setMusic(AUDIO.ctx==='manager'?'manager':'db');
  opts=opts||{}; const t=team(tid); setBg('plantilla_fondo'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'PLANTILLA',right:t.league?league(t.league).name:countryName(t.nat)}));
  // panel info club
  const info=panel(10,66,220,184); s.appendChild(info); info.appendChild(h('div',{class:'hdr'},'CLUB'));
  info.appendChild(at(h('img',{src:escImg(tid,'big'),style:{maxHeight:'64px',maxWidth:'60px'},onerror:function(){this.src=escImg(tid)}}),8,24));
  const lines=[t.full,t.stadium+' ('+fmtNum(t.capacity)+')',(t.width?t.length+'x'+t.width+' m · ':'')+'Fundado en '+t.founded,t.president?'Pres.: '+t.president:'',t.members?'Socios: '+fmtNum(t.members):'',t.sponsor?t.sponsor+' / '+t.kit:''].filter(Boolean);
  const it=txt(lines.join('\n'),76,24,140,156,'f-m8'); it.style.lineHeight='11px'; info.appendChild(it);
  if(t.custom) info.appendChild(btn('EDITAR',6,96,64,()=>scrEditarEquipo(t,()=>scrDbTeam(tid,opts)),'green'));
  const camp=panel(10,256,220,184); s.appendChild(camp); camp.appendChild(h('div',{class:'hdr'},'ESTADIO / ENTRENADOR'));
  camp.appendChild(at(h('img',{src:campoImg(t),style:{width:'130px',height:'91px'},onerror:function(){this.style.display='none'}}),6,22));
  camp.appendChild(at(h('img',{src:coachImg(t),style:{width:'60px',height:'72px',objectFit:'cover'},onerror:function(){this.src='img/ui/foto_general.png';this.style.width='32px';this.style.height='32px'}}),144,22));
  const ct=txt('Entrenador: '+(t.coach.full||t.coach.name)+(t.coach2&&t.coach2.length?'\n2º entrenador: '+t.coach2[0].name:''),6,120,208,24,'f-p8'); ct.style.lineHeight='12px'; camp.appendChild(ct);
  if(t.long) camp.appendChild(btn('BIOGRAFÍA',140,98,70,()=>scrCoachBio(tid,()=>scrDbTeam(tid,opts)),'blue'));
  if(t.custom) camp.appendChild(btn('CAMPO',68,98,68,()=>scrElegirCampo(t.campoId,id=>{ t.campoId=id; if(G&&G.custom){ G.custom.campo=id; saveGame(); } scrDbTeam(tid,opts); }),'green'));
  if(t.custom) camp.appendChild(btn('FOTO',140,98,70,()=>scrFotoEntrenador(photo=>{ t.coach.photo=photo; if(G&&G.custom){ G.custom.photo=photo; saveGame(); } scrDbTeam(tid,opts); }),'green'));
  if(t.hist){ const ht=txt(t.hist[0]+' PJ · '+t.hist[1]+' PG\n'+t.hist[2]+' PE · '+t.hist[3]+' GF\n'+t.hist[4]+' GC'+(t.seasons?' · '+t.seasons+' temp.':''),6,146,210,36,'f-p8'); ht.style.lineHeight='11px'; camp.appendChild(ht); }
  // plantilla
  const pl=panel(238,66,392,374); s.appendChild(pl); pl.appendChild(h('div',{class:'hdr'},'JUGADORES ('+t.players.length+')')); if(typeof prefetchPhotos==='function') setTimeout(()=>prefetchPhotos(t.players.concat(t.bajas||[])),300);
  const sc=at(h('div',{class:'scroll'}),0,18,388,352); pl.appendChild(sc);
  const byDem=(a,b)=>(['POR','DEF','MED','DEL'].indexOf(a.dem)-['POR','DEF','MED','DEL'].indexOf(b.dem))||b.me-a.me; const ps=t.players.slice().sort(byDem); if(t.bajas&&t.bajas.length){ ps.push({__group:'BAJAS 96-97 (ya no están en el club)'}); ps.push(...t.bajas.slice().sort(byDem)); }
  sc.appendChild(table([{t:'Nº',w:24,cls:'c',k:p=>p.dorsal||''},{t:'JUGADOR',k:p=>p.name},{t:'SIT',w:36,cls:'c',k:p=>h('span',{class:'f-m8',style:{color:p.f2===3?'#ff8a60':p.f2===2?'#9fb4e8':'#8fe08f'}},sitLabel(p))},{t:'',w:20,k:p=>h('img',{src:'img/band/'+p.country+'.png',style:{width:'14px',height:'10px'}})},{t:'EDAD',w:34,cls:'c',k:p=>playerAge(p)},{t:'VE',w:26,cls:'r',k:p=>p.attrs[0]},{t:'RE',w:26,cls:'r',k:p=>p.attrs[1]},{t:'AG',w:26,cls:'r',k:p=>p.attrs[2]},{t:'CA',w:26,cls:'r',k:p=>p.attrs[3]},{t:'ME',w:26,cls:'r',k:p=>p.me,cell:()=>'y'},...(opts.back&&typeof contractFicha==='function'&&G?[{t:'FICHA',w:44,cls:'r',k:p=>fmtNum(contractFicha(p))}]:[]),{t:'DEM',w:34,cls:'c',k:p=>p.dem}],ps,{onRow:p=>scrFicha(tid,p,()=>scrDbTeam(tid,opts))}));
  s.appendChild(btn('IMPRIMIR PDF',400,446,130,()=>printTeam(t),'blue','ico_impresora'));
  s.appendChild(btn('VOLVER',540,446,90,opts.back||(()=>scrDbase()),'blue','ico_volver'));
  if(opts.extra) opts.extra(s);
}
async function scrCoachBio(tid, back){
  const t=team(tid); const bio=await loadBio(tid); setBg('fondo_dbase'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'ENTRENADOR',right:t.coach.name}));
  const p=panel(10,66,620,374); s.appendChild(p); p.appendChild(h('div',{class:'hdr'},t.coach.full||t.coach.name));
  p.appendChild(at(h('img',{src:coachImg(t),style:{width:'80px',height:'96px',objectFit:'cover'},onerror:function(){this.style.display='none'}}),8,24));
  const tabs=['PRESENTACIÓN','ESTILO','PALMARÉS','OTROS DATOS','TEMPORADA 95-96','TRAYECTORIA','COMO JUGADOR','DECLARACIONES'];
  const texts=bio?[...bio.coach.texts,bio.coach.career,bio.coach.playercareer,bio.coach.quotes]:[];
  const body=at(h('div',{class:'scroll f-p12',style:{whiteSpace:'pre-wrap',padding:'4px',lineHeight:'14px'}}),100,24,512,342); p.appendChild(body);
  const show=i=>{ body.textContent=(texts[i]||'Sin datos').replace(/\r/g,''); tabEls.forEach((e,j)=>e.className='btn '+(j===i?'green':'blue')); };
  const tabEls=tabs.map((n,i)=>{ const b=btn(n,8,130+i*22,88,()=>show(i),'blue'); b.style.fontSize='10px'; b.style.fontFamily='micro8'; b.style.letterSpacing='0'; p.appendChild(b); return b; });
  show(0);
  s.appendChild(btn('IMPRIMIR PDF',400,446,130,()=>printCoach(t,bio),'blue','ico_impresora'));
  s.appendChild(btn('VOLVER',540,446,90,back,'blue','ico_volver'));
}
async function scrFicha(tid, idx, back){
  const t=team(tid); const p=typeof idx==='object'?idx:t.players[idx]; idx=p.idx; const bio=t.long?await loadBio(tid):null; const pb=bio?bio.players[String(p.idx0===undefined?idx:p.idx0)]:null;
  setBg('fondo_dbase'); const s=clearScreen();
  s.appendChild(topbar({team:t,title:'FICHA',right:p.name}));
  const L=panel(10,66,200,374); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},p.name.toUpperCase()));
  const ph=at(h('div',{class:'ph',style:{background:'#223'}}),6,24,126,184); L.appendChild(ph); if(p.id>0) ph.style.background='#223 url(img/foto/'+p.id+'.png) center/cover no-repeat';
  ph.appendChild(h('img',{src:'img/fotobig/'+p.id+'.png',style:{width:'124px',height:'182px'},onerror:function(){this.src='img/foto/'+p.id+'.png';this.style.width='124px';this.style.height='124px';this.onerror=function(){this.src='img/ui/foto_general.png';this.style.width='64px';this.style.height='64px';this.style.margin='60px 30px'}}}));
  L.appendChild(at(h('img',{src:'img/bandbig/'+p.country+'.png',style:{width:'40px',height:'28px'}}),140,24));
  { const cn=txt(countryName(p.country),138,56,60,24,'f-m8'); cn.style.lineHeight='10px'; cn.style.fontSize='9px'; L.appendChild(cn); }
  L.appendChild(at(h('img',{src:escImg(tid),style:{height:'48px'}}),140,100));
  L.appendChild(txt('Nº '+(p.dorsal||'-'),140,156,50,14,'f-con'));
  const data=[['NOMBRE',p.full||p.name],['FECHA NAC.',birthStr(p)+(p.birth[2]?' ('+playerAge(p)+' años)':'')],['LUGAR',p.birthplace||countryName(p.country)],['ALTURA / PESO',(p.height?p.height+' cm':'-')+' / '+(p.weight?p.weight+' kg':'-')],['PROCEDENCIA',p.prevclub||'-'],['SITUACIÓN 96-97',sitText(p)],['INTERNACIONAL',p.intl!==undefined?(/^\d+$/.test(p.intl)?p.intl+' veces':p.intl):'-'],['DEMARCACIÓN',p.roles.map(r=>ROLES[r]).join(', ')]];
  const info=at(h('div',{class:'scroll'}),4,212,192,158); L.appendChild(info);
  data.forEach(d=>{ info.appendChild(h('div',{class:'f-m8',style:{color:'#ffe24a',letterSpacing:'1px',marginTop:'4px'}},d[0])); info.appendChild(h('div',{class:'f-p8',style:{whiteSpace:'normal',lineHeight:'12px',paddingRight:'4px'}},String(d[1]))); });
  if(typeof UI!=='undefined'&&UI==='mobile'){ // móvil: foto a la izquierda, datos a la derecha
    const kids=[...L.children].filter(e=>!e.classList.contains('hdr')); const ph0=kids[0], flag=kids[1], cn=kids[2], esc=kids[3], num=kids[4];
    const top=h('div',{class:'fichatop'},h('div',{class:'fl'},ph0,h('div',{class:'row'},flag,cn),h('div',{class:'row'},esc,num)),h('div',{class:'fr'},info));
    L.appendChild(top);
  }
  // atributos
  const A=panel(218,66,180,374); s.appendChild(A); A.appendChild(h('div',{class:'hdr'},'ATRIBUTOS'));
  const names=['VELOCIDAD','RESISTENCIA','AGRESIVIDAD','CALIDAD','PASE','REGATE','REMATE','TIRO','ENTRADAS','PORTERO'];
  if(typeof UI!=='undefined'&&UI==='mobile'){ // móvil: atributos en dos columnas
    const g=h('div',{class:'attrgrid'}); names.forEach((n,i)=>g.appendChild(h('div',{class:'attrcell'},h('div',{class:'an'},h('span',{},n),h('span',{class:'av'},String(p.attrs[i]))),h('div',{class:'bar'},h('i',{style:{width:p.attrs[i]+'%'}})))));
    g.appendChild(h('div',{class:'attrcell sum'},h('div',{class:'an'},h('span',{},'MEDIA'),h('span',{class:'av big'},String(p.me)))));
    g.appendChild(h('div',{class:'attrcell sum'},h('div',{class:'an'},h('span',{},'ENERGÍA'),h('span',{class:'av'},'99')),h('div',{class:'an'},h('span',{},'MORAL'),h('span',{class:'av'},'95'))));
    A.appendChild(g);
  } else {
  names.forEach((n,i)=>{ A.appendChild(lbl(n,8,26+i*30)); A.appendChild(txt(String(p.attrs[i]),140,26+i*30,30,14,'f-con')); const b=at(h('div',{class:'bar'},h('i',{style:{width:p.attrs[i]+'%'}})),8,40+i*30,160,9); A.appendChild(b); });
  A.appendChild(lbl('MEDIA',8,326)); A.appendChild(txt(String(p.me),140,324,30,14,'f-e4'));
  A.appendChild(lbl('ENERGÍA',8,342)); A.appendChild(txt('99',140,342,30,14,'f-con'));
  A.appendChild(lbl('MORAL',8,358)); A.appendChild(txt('95',140,358,30,14,'f-con'));
  }
  // textos
  const T=panel(406,66,224,374); s.appendChild(T); T.appendChild(h('div',{class:'hdr'},'INFORME'));
  const tabs=['PRESENTACIÓN','CARACTERÍSTICAS','PALMARÉS','INTERNACIONAL','OTROS DATOS','TEMPORADA 95-96','TRAYECTORIA'];
  const texts=pb?[...pb.texts,pb.career]:[];
  const body=at(h('div',{class:'scroll f-p12',style:{whiteSpace:'pre-wrap',padding:'4px',lineHeight:'14px'}}),0,112,220,258); T.appendChild(body);
  const show=i=>{ let tx=(texts[i]||'Sin datos'); if(tx==='x') tx='Sin datos'; body.textContent=tx.replace(/\r/g,''); tabEls.forEach((e,j)=>e.className='btn '+(j===i?'green':'blue')); };
  const tabEls=tabs.map((n,i)=>{ const b=btn(n,8+(i%2)*106,24+Math.floor(i/2)*22,100,()=>show(i),'blue'); b.style.fontSize='10px'; b.style.fontFamily='micro8'; b.style.letterSpacing='0'; T.appendChild(b); return b; });
  if(!pb){ tabEls.forEach(e=>e.classList.add('dis')); body.textContent='Este equipo no dispone de informes en la base de datos del juego.'; } else show(0);
  s.appendChild(btn('IMPRIMIR PDF',400,446,130,()=>printFicha(t,p,pb),'blue','ico_impresora'));
  s.appendChild(btn('VOLVER',540,446,90,back,'blue','ico_volver'));
}
// ---------- SEGUIMIENTO MANUAL (resultados y crónicas reales 96-97) ----------
function scrSeguimiento(state){ setMusic(AUDIO.ctx==='manager'?'manager':'db');
  state=state||{lg:'ESP1',j:1}; const lg=state.lg||'ESP1'; const L=league(lg); const cal=L.rounds;
  const maxJ=playedRounds(lg); const j=Math.min(state.j||1,maxJ);
  setBg('fondo_segui'); const s=clearScreen();
  s.appendChild(topbar({title:'SEGUIMIENTO',date:roundDate(lg,j),sub:L.long.toUpperCase()+' 96-97 · JORNADA '+j}));
  const st=standings(leagueIds(lg),realResults(lg,j));
  const R=panel(10,66,250,340); s.appendChild(R); R.appendChild(h('div',{class:'hdr'},'RESULTADOS JORNADA '+j));
  const rows=cal[j-1].map((m,i)=>({i,h:team(m[0]),a:team(m[1]),gh:m[2],ga:m[3]}));
  const sc=at(h('div',{class:'scroll'}),0,20,246,290); R.appendChild(sc);
  sc.appendChild(table([{t:'',w:14,k:r=>h('img',{src:escImg(r.h.id,'ridi'),style:{height:'14px'}})},{t:'LOCAL',k:r=>r.h.name},{t:'',w:40,cls:'c',k:r=>r.gh===null||r.gh===undefined?'-':r.gh+' - '+r.ga,cell:()=>'y'},{t:'VISITANTE',k:r=>r.a.name},{t:'',w:14,k:r=>h('img',{src:escImg(r.a.id,'ridi'),style:{height:'14px'}})}],rows,{onRow:r=>scrCronica(lg,j,r.i,()=>scrSeguimiento({lg,j}))}));
  R.appendChild(btn('<',10,314,30,()=>scrSeguimiento({lg,j:Math.max(1,j-1)}),'blue'));
  R.appendChild(btn('>',46,314,30,()=>scrSeguimiento({lg,j:Math.min(maxJ,j+1)}),'blue'));
  if(typeof UI!=='undefined'&&UI==='mobile') R.appendChild(txt('JORNADA '+j,40,314,60,16,'f-e4'));
  const hint=txt('Pulsa un partido para ver la crónica',86,320,160,12,'f-m8'); hint.style.whiteSpace='nowrap'; hint.style.overflow='hidden'; hint.style.fontSize='10px'; R.appendChild(hint);
  const C=panel(268,66,362,340); s.appendChild(C); C.appendChild(h('div',{class:'hdr'},'CLASIFICACIÓN'));
  const sc2=at(h('div',{class:'scroll'}),0,18,358,318); C.appendChild(sc2);
  sc2.appendChild(standingsTable(st,null,{onRow:r=>scrDbTeam(r.id,{back:()=>scrSeguimiento(state)})}));
  LEAGUE_ORDER.forEach((k,i)=>s.appendChild(btn(LEAGUE_SHORT[k],10+i*104,414,100,()=>scrSeguimiento({lg:k,j:1}),k===lg?'green':'blue')));
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
}
async function scrCronica(lg,j,mi,back){
  const m=league(lg).rounds[j-1][mi]; const hm=team(m[0]), aw=team(m[1]);
  const cr=await loadCronica(lg,j); const c=cr?cr.find(x=>x.home===m[0]&&x.away===m[1]):null;
  setBg('fondo_segui'); const s=clearScreen();
  const d=c?new Date(c.date[2],c.date[1]-1,c.date[0]):roundDate(lg,j);
  s.appendChild(topbar({title:'CRÓNICA',date:d,sub:league(lg).long.toUpperCase()+' · JORNADA '+j}));
  const T=panel(10,66,620,74); s.appendChild(T);
  T.appendChild(at(h('img',{src:escImg(hm.id),style:{height:'56px'}}),10,6)); T.appendChild(at(h('img',{src:escImg(aw.id),style:{height:'56px'}}),560,6));
  T.appendChild(txt(hm.name,70,8,200,18,'f-e4')); const an=txt(aw.name,350,8,200,18,'f-e4'); an.style.textAlign='right'; T.appendChild(an);
  const sc=txt((m[2]===null||m[2]===undefined)?'-':m[2]+' - '+m[3],260,6,100,30,'f-e1'); sc.style.textAlign='center'; sc.style.color='#ffe24a'; T.appendChild(sc);
  if(c){ const l1=txt(hm.stadium+(c.time&&c.time!=='X'?' · '+c.time:'')+(c.att?' · '+fmtNum(c.att)+' espectadores':''),70,36,480,12,'f-m8'); l1.style.textAlign='center'; T.appendChild(l1);
    const l2=txt((c.ref&&c.ref!=='X'?'Árbitro: '+c.ref:'')+(c.pitch&&c.pitch!=='X'?' · '+c.pitch:'')+(c.weather&&c.weather!=='X'?' · '+c.weather:''),70,52,480,12,'f-m8'); l2.style.textAlign='center'; T.appendChild(l2); }
  else T.appendChild(txt('Sin crónica disponible para este partido.',70,40,480,12,'f-p8'));
  // goles y tarjetas
  const E=panel(10,146,250,260); s.appendChild(E); E.appendChild(h('div',{class:'hdr'},'GOLES Y TARJETAS'));
  const ev=at(h('div',{class:'scroll'}),4,20,242,240); E.appendChild(ev);
  if(c){ c.goals.forEach(g=>ev.appendChild(h('div',{class:'ev goal'},"⚽ "+g.min+"' "+playerName(g.pid)+(g.type==='penalti'?' (p.)':g.type==='pp'?' (p.p.)':'')+' · '+(g.side==='H'?hm.name:aw.name))));
    c.cards.forEach(k=>ev.appendChild(h('div',{class:'ev '+(k.type===1?'card':'red')},(k.type===1?'▮ Amarilla: ':k.type===2?'▮ ROJA: ':'▮ Roja (2ª amarilla): ')+playerName(k.pid)+' · '+(k.side==='H'?hm.name:aw.name))));
    if(!c.goals.length&&!c.cards.length) ev.appendChild(h('div',{class:'ev'},'Sin incidencias registradas.')); }
  // pestañas: crónica / alineaciones / declaraciones
  const P=panel(268,146,362,260); s.appendChild(P);
  const body=at(h('div',{class:'scroll f-p12',style:{whiteSpace:'pre-wrap',padding:'4px',lineHeight:'14px'}}),0,24,358,234); P.appendChild(body);
  const tabs=[['CRÓNICA',()=>{ body.textContent=c&&c.text?c.text:'Sin crónica.'; }],
    ['ALINEACIONES',()=>{ body.innerHTML=''; if(!c) return body.textContent='Sin datos.'; for(const [side,t] of [['H',hm],['A',aw]]){ body.appendChild(h('div',{class:'f-e5',style:{color:'#ffe24a',margin:'2px 0'}},t.name.toUpperCase())); const L=c.lineup[side]; if(!L.length) body.appendChild(h('div',{},'Sin datos.')); L.forEach(l=>{ const p=DATA.playersById[l[0]]; body.appendChild(h('div',{class:'f-con',style:{cursor:p?'pointer':'default'},onclick:()=>p&&scrFicha(p.team,p.idx,()=>scrCronica(lg,j,mi,back))},(p&&p.dorsal?p.dorsal+' ':'')+playerName(l[0])+(l[1]?'  →  '+playerName(l[1])+" ("+l[2]+"')":''))); }); } }],
    ['DECLARACIONES',()=>{ body.innerHTML=''; if(!c) return body.textContent='Sin datos.'; let any=false; for(const side of ['H','A']){ for(const q of c.quotes[side]){ if(q==='X'||q==='X\\') continue; any=true; if(q.startsWith('$')) body.appendChild(h('div',{class:'f-e5',style:{color:'#ffe24a',margin:'6px 0 2px'}},q.slice(1).replace(/:$/,'').toUpperCase())); else body.appendChild(h('div',{style:{marginBottom:'4px'}},q)); } } if(!any) body.textContent='No hay declaraciones.'; }]];
  const tabEls=tabs.map((tb,i)=>{ const b=btn(tb[0],4+i*118,2,114,()=>{ tb[1](); tabEls.forEach((e,k)=>e.className='btn '+(k===i?'green':'blue')); },'blue'); b.style.fontFamily='micro8'; b.style.fontSize='10px'; b.style.letterSpacing='0'; P.appendChild(b); return b; });
  tabs[0][1](); tabEls[0].className='btn green';
  s.appendChild(btn('VOLVER',540,446,90,back,'blue','ico_volver'));
  s.appendChild(btn('VER '+hm.name.toUpperCase(),10,446,160,()=>scrDbTeam(hm.id,{back:()=>scrCronica(lg,j,mi,back)}),'blue'));
  s.appendChild(btn('VER '+aw.name.toUpperCase(),178,446,160,()=>scrDbTeam(aw.id,{back:()=>scrCronica(lg,j,mi,back)}),'blue'));
  s.appendChild(btn('IMPRIMIR PDF',400,446,130,()=>printCronica(lg,j,m,c),'blue','ico_impresora'));
}
function standingsTable(st, me, opts){
  return table([{t:'POS',w:30,cls:'c',k:(r,i)=>i+1},{t:'',w:16,k:r=>h('img',{src:escImg(r.id,'ridi'),style:{height:'14px'}})},{t:'EQUIPO',k:r=>team(r.id).name},{t:'PTS',w:34,cls:'r',k:r=>r.pts,cell:()=>'y'},{t:'PJ',w:28,cls:'r',k:r=>r.pj},{t:'PG',w:28,cls:'r',k:r=>r.pg},{t:'PE',w:28,cls:'r',k:r=>r.pe},{t:'PP',w:28,cls:'r',k:r=>r.pp},{t:'GF',w:30,cls:'r',k:r=>r.gf},{t:'GC',w:30,cls:'r',k:r=>r.gc}],st,Object.assign({rowClass:r=>r.id===me?'me':''},opts||{}));
}
