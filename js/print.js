// Impresión en PDF con la estética del juego
function printDoc(title,body){
  const base=location.href.replace(/[^/]*$/,'');
  const F=n=>"@font-face{font-family:'"+n+"';src:url("+base+"fonts/"+n+".ttf)}";
  const css=[ 'futcon12','futcon8','euroh1','euroh4','euroh5','proman12','proman8','micro8'].map(F).join('')+
   "*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#c9d2e6;font-family:'proman12',Arial,sans-serif;font-size:13px;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:6mm;width:210mm;margin:0 auto}"+
   ".top{height:62px;background:linear-gradient(#5f7fe0,#1b2f88 60%,#0b1650);border:2px solid #000;position:relative;margin-bottom:10px}"+
   ".top .t{position:absolute;left:0;right:0;top:12px;text-align:center;font-family:'euroh1';font-size:30px;color:#ffe24a;text-shadow:2px 2px 0 #000;letter-spacing:2px}"+
   ".top .box{position:absolute;top:6px;background:#e8e8e8;border:2px solid #000;color:#102060;padding:4px 8px;font-family:'euroh5';font-size:13px;line-height:15px}.top .box.l{left:6px;min-width:180px}.top .box.r{right:6px;text-align:center}.top .box small{display:block;font-family:'proman8';font-size:11px;color:#333}"+
   ".panel{background:#0d1a4e;border:2px solid;border-color:#5f78c8 #060c2a #060c2a #5f78c8;margin-bottom:10px;page-break-inside:avoid}.panel .hdr{background:linear-gradient(#d8d8d8,#8c8c8c);color:#000;font-family:'euroh5';font-size:13px;text-align:center;letter-spacing:1px;padding:2px}.panel .in{padding:8px}"+
   ".row{display:flex;gap:12px}.col{flex:1}"+
   "table{border-collapse:collapse;width:100%;font-family:'futcon12';font-size:15px}table.sq{font-family:'futcon8';font-size:13px}table.sq td,table.sq th{padding:1px 3px}th{color:#ffe24a;font-weight:normal;text-align:left;padding:2px 4px;background:#0a1240;border-bottom:1px solid #3a4f9f;white-space:nowrap}td{padding:2px 4px;white-space:nowrap}tr:nth-child(even) td{background:rgba(255,255,255,.06)}td.r,th.r{text-align:right}td.c,th.c{text-align:center}td.y{color:#ffe24a}td.g{color:#8dff8d}"+
   ".lbl{font-family:'euroh5';font-size:13px;color:#ffe24a;letter-spacing:1px;margin-top:6px}.val{font-family:'proman12';font-size:13px}"+
   ".bar{display:inline-block;width:140px;height:9px;background:#071030;border:1px solid #5f78c8;vertical-align:middle;margin-left:6px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#2e55e0,#8fb0ff)}"+
   ".txt{white-space:pre-wrap;line-height:1.35;font-family:'proman12';font-size:13px}.foot{color:#334;font-family:'micro8';font-size:10px;text-align:center;margin-top:6px}img{image-rendering:pixelated}.flag{width:14px;height:10px;vertical-align:middle}"+
   "@page{size:A4;margin:0}";
  const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>'+title+'</title><style>'+css+'</style></head><body>'+body+'<div class="foot">PC FÚTBOL 5.0 · EDICIÓN DE ORO · TEMPORADA 96-97</div><script>window.onload=function(){document.fonts?document.fonts.ready.then(function(){setTimeout(function(){window.print();},300)}):setTimeout(function(){window.print();},800);};</script></body></html>';
  const w=window.open('','_blank'); if(!w){ dialog('IMPRIMIR','El navegador ha bloqueado la ventana emergente. Permítela para imprimir.'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
function pesc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function ptop(title,left,right){ return '<div class="top"><div class="box l">'+left+'</div><div class="t">'+title+'</div><div class="box r">'+right+'</div></div>'; }
function printFicha(t,p,pb){
  const base=location.href.replace(/[^/]*$/,'');
  const names=['VELOCIDAD','RESISTENCIA','AGRESIVIDAD','CALIDAD','PASE','REGATE','REMATE','TIRO','ENTRADAS','PORTERO'];
  const tabs=['PRESENTACIÓN','CARACTERÍSTICAS','PALMARÉS','INTERNACIONAL','OTROS DATOS','TEMPORADA 95-96','TRAYECTORIA'];
  const texts=pb?[...pb.texts,pb.career]:[];
  const rows=[['NOMBRE',p.full||p.name],['EQUIPO',t.name+(t.league?' · '+league(t.league).name:'')],['DORSAL',p.dorsal||'-'],['FECHA NAC.',birthStr(p)+(p.birth[2]?' ('+playerAge(p)+' años)':'')],['LUGAR',p.birthplace||countryName(p.country)],['NACIONALIDAD',countryName(p.country)],['ALTURA / PESO',(p.height?p.height+' cm':'-')+' / '+(p.weight?p.weight+' kg':'-')],['PROCEDENCIA',p.prevclub||'-'],['INTERNACIONAL',p.intl!==undefined?(/^\d+$/.test(p.intl)?p.intl+' veces':p.intl):'-'],['DEMARCACIÓN',p.roles.map(r=>ROLES[r]).join(', ')],['MEDIA',p.me]];
  let b=ptop('FICHA',pesc(t.name)+'<small>'+pesc(t.stadium)+'</small>',pesc(p.name)+'<small>Nº '+(p.dorsal||'-')+'</small>');
  b+='<div class="row"><div class="panel" style="flex:0 0 230px"><div class="hdr">'+pesc(p.name.toUpperCase())+'</div><div class="in"><img src="'+base+'img/fotobig/'+p.id+'.png" style="width:124px;height:182px;border:1px solid #000;float:left;margin:0 8px 6px 0" onerror="this.src=\''+base+'img/foto/'+p.id+'.png\';this.onerror=null"><img src="'+base+'img/bandbig/'+p.country+'.png" style="width:40px;height:28px"><br><img src="'+base+'img/esc/'+t.id+'.png" style="height:56px;margin-top:8px"><div style="clear:both"></div>'+rows.map(r=>'<div class="lbl">'+r[0]+'</div><div class="val">'+pesc(r[1])+'</div>').join('')+'</div></div>';
  b+='<div class="panel col"><div class="hdr">ATRIBUTOS</div><div class="in">'+names.map((n,i)=>'<div class="lbl">'+n+' <span style="color:#fff;font-family:futcon12;font-size:15px;margin-left:6px">'+p.attrs[i]+'</span><span class="bar"><i style="width:'+p.attrs[i]+'%"></i></span></div>').join('')+'</div></div></div>';
  tabs.forEach((n,i)=>{ let tx=texts[i]; if(!tx||tx==='x') return; b+='<div class="panel"><div class="hdr">'+n+'</div><div class="in txt">'+pesc(tx.replace(/\r/g,''))+'</div></div>'; });
  printDoc('Ficha · '+p.name,b);
}
async function printTeam(t){
  const base=location.href.replace(/[^/]*$/,''); const bio=t.long?await loadBio(t.id):null;
  let b=ptop('PLANTILLA',pesc(t.name)+'<small>'+pesc(t.stadium)+'</small>',pesc(t.league?league(t.league).name:countryName(t.nat))+'<small>96-97</small>');
  const lines=[['NOMBRE COMPLETO',t.full],['ESTADIO',t.stadium+' ('+fmtNum(t.capacity)+(t.width?' · '+t.length+'x'+t.width+' m':'')+')'],['FUNDADO EN',t.founded],['PRESIDENTE',t.president||'-'],['SOCIOS',t.members?fmtNum(t.members):'-'],['PATROCINADOR / ROPA',t.sponsor?t.sponsor+' / '+t.kit:'-'],['ENTRENADOR',(t.coach.full||t.coach.name)+(t.coach2&&t.coach2.length?' · 2º: '+t.coach2[0].name:'')]];
  if(t.hist) lines.push(['HISTORIAL EN LIGA',t.hist[0]+' PJ · '+t.hist[1]+' PG · '+t.hist[2]+' PE · '+t.hist[3]+' GF · '+t.hist[4]+' GC'+(t.seasons?' · '+t.seasons+' temporadas':'')]);
  b+='<div class="row"><div class="panel" style="flex:0 0 190px"><div class="hdr">CLUB</div><div class="in" style="text-align:center"><img src="'+base+'img/escbig/'+t.id+'.png" style="max-height:120px;max-width:120px" onerror="this.src=\''+base+'img/esc/'+t.id+'.png\';this.onerror=null"><br><img src="'+base+'img/cam/'+t.id+'.png" style="width:110px;height:57px;margin-top:6px" onerror="this.style.display=\'none\'"><br><img src="'+base+'img/bandbig/'+t.nat+'.png" style="width:40px;height:28px;margin-top:6px"></div></div>';
  b+='<div class="panel col"><div class="hdr">DATOS DEL CLUB</div><div class="in">'+lines.map(l=>'<div class="lbl">'+l[0]+'</div><div class="val">'+pesc(l[1])+'</div>').join('')+'</div></div>';
  b+='<div class="panel" style="flex:0 0 200px"><div class="hdr">ESTADIO / ENTRENADOR</div><div class="in" style="text-align:center"><img src="'+campoImg(t,base)+'" style="width:170px;height:119px" onerror="this.style.display=\'none\'"><br><img src="'+coachImg(t,base)+'" style="width:60px;height:72px;margin-top:6px;object-fit:cover" onerror="this.style.display=\'none\'"><div class="val" style="margin-top:4px">'+pesc(t.coach.full||t.coach.name)+'</div></div></div></div>';
  const ps=t.players.slice().sort((a,b)=>(['POR','DEF','MED','DEL'].indexOf(a.dem)-['POR','DEF','MED','DEL'].indexOf(b.dem))||b.me-a.me);
  b+='<div class="panel"><div class="hdr">PLANTILLA ('+ps.length+' JUGADORES)</div><table class="sq"><tr><th class="c">Nº</th><th>JUGADOR</th><th></th><th class="c">EDAD</th><th>DEMARCACIÓN</th><th class="r">VE</th><th class="r">RE</th><th class="r">AG</th><th class="r">CA</th><th class="r">PASE</th><th class="r">REG</th><th class="r">REM</th><th class="r">TIRO</th><th class="r">ENT</th><th class="r">POR</th><th class="r">ME</th><th class="c">DEM</th></tr>'+
    ps.map(p=>'<tr><td class="c">'+(p.dorsal||'')+'</td><td>'+pesc(p.name)+'</td><td><img class="flag" src="'+base+'img/band/'+p.country+'.png"></td><td class="c">'+playerAge(p)+'</td><td>'+pesc(ROLES_SHORT[p.roles[0]]+(p.roles.length>1?' +':''))+'</td>'+p.attrs.map(a=>'<td class="r">'+a+'</td>').join('')+'<td class="r y">'+p.me+'</td><td class="c">'+p.dem+'</td></tr>').join('')+'</table></div>';
  if(bio&&bio.coach){ const c=bio.coach; const tx=[['PRESENTACIÓN',c.texts[0]],['ESTILO',c.texts[1]],['PALMARÉS',c.texts[2]]]; tx.forEach(x=>{ if(x[1]&&x[1]!=='x') b+='<div class="panel"><div class="hdr">ENTRENADOR · '+x[0]+'</div><div class="in txt">'+pesc(x[1].replace(/\r/g,''))+'</div></div>'; }); }
  printDoc('Plantilla · '+t.name,b);
}

function printCoach(t,bio){
  const base=location.href.replace(/[^/]*$/,''); const c=bio&&bio.coach; const name=t.coach.full||t.coach.name;
  let b=ptop('ENTRENADOR',pesc(t.name)+'<small>'+pesc(t.stadium)+'</small>',pesc(t.coach.name)+'<small>'+pesc(t.league?league(t.league).name:countryName(t.nat))+'</small>');
  b+='<div class="row"><div class="panel" style="flex:0 0 150px"><div class="hdr">FOTO</div><div class="in" style="text-align:center"><img src="'+coachImg(t,base)+'" style="width:80px;height:96px;border:1px solid #000;object-fit:cover" onerror="this.src=\''+base+'img/ui/foto_general.png\';this.onerror=null"><br><img src="'+base+'img/esc/'+t.id+'.png" style="height:56px;margin-top:8px"></div></div>';
  b+='<div class="panel col"><div class="hdr">'+pesc(name.toUpperCase())+'</div><div class="in"><div class="lbl">NOMBRE</div><div class="val">'+pesc(name)+'</div><div class="lbl">EQUIPO</div><div class="val">'+pesc(t.full)+'</div>'+(t.coach2&&t.coach2.length?'<div class="lbl">SEGUNDO ENTRENADOR</div><div class="val">'+pesc(t.coach2[0].full||t.coach2[0].name)+'</div>':'')+'</div></div></div>';
  if(c){ const secs=[['PRESENTACIÓN',c.texts[0]],['ESTILO',c.texts[1]],['PALMARÉS',c.texts[2]],['OTROS DATOS',c.texts[3]],['TEMPORADA 95-96',c.texts[4]],['TRAYECTORIA COMO ENTRENADOR',c.career],['TRAYECTORIA COMO JUGADOR',c.playercareer],['DECLARACIONES',c.quotes]];
    secs.forEach(x=>{ if(x[1]&&x[1]!=='x'&&x[1].trim()) b+='<div class="panel"><div class="hdr">'+x[0]+'</div><div class="in txt">'+pesc(x[1].replace(/\r/g,''))+'</div></div>'; }); }
  else b+='<div class="panel"><div class="hdr">INFORME</div><div class="in txt">Este equipo no dispone de informe del entrenador en la base de datos del juego.</div></div>';
  printDoc('Entrenador · '+name,b);
}
function printRef(r){
  const base=location.href.replace(/[^/]*$/,'');
  let b=ptop('ÁRBITRO','Colegio '+pesc(r.dem)+'<small>1ª División '+(TEST_MODE?'24-25':'96-97')+'</small>',pesc(r.name.split(' ').slice(-2).join(' '))+'<small>'+(r.cat===1?'Primera División':'Segunda División')+'</small>');
  const rows=[['NOMBRE',r.name],['COLEGIO',r.dem],['NACIMIENTO',birthStr({birth:r.birth})+' ('+r.place+')'],['PROFESIÓN',r.prof],['INTERNACIONAL',r.intl],['CATEGORÍA',r.cat===1?'Primera División':'Segunda División']];
  b+='<div class="row"><div class="panel" style="flex:0 0 150px"><div class="hdr">FOTO</div><div class="in" style="text-align:center"><img src="'+base+arbPhoto(r)+'" style="width:80px;height:96px;border:1px solid #000" onerror="this.src=\''+base+'img/ui/foto_general.png\';this.onerror=null"></div></div>';
  b+='<div class="panel col"><div class="hdr">'+pesc(r.name.toUpperCase())+'</div><div class="in">'+rows.map(x=>'<div class="lbl">'+x[0]+'</div><div class="val">'+pesc(x[1])+'</div>').join('')+'</div></div></div>';
  printDoc('Árbitro · '+r.name,b);
}

function printCronica(lg,j,m,c){
  const base=location.href.replace(/[^/]*$/,''); const hm=team(m[0]), aw=team(m[1]);
  const score=(m[2]===null||m[2]===undefined)?'-':m[2]+' - '+m[3];
  let b=ptop('CRÓNICA',pesc(league(lg).long)+'<small>Jornada '+j+'</small>',pesc(hm.name)+' '+score+' '+pesc(aw.name)+'<small>'+(c?c.date[0]+'/'+c.date[1]+'/'+c.date[2]:'')+'</small>');
  b+='<div class="panel"><div class="hdr">'+pesc(hm.name.toUpperCase())+' '+score+' '+pesc(aw.name.toUpperCase())+'</div><div class="in" style="display:flex;align-items:center;gap:16px"><img src="'+base+'img/esc/'+hm.id+'.png" style="height:64px"><div class="col"><div class="lbl">ESTADIO</div><div class="val">'+pesc(hm.stadium)+(c&&c.time&&c.time!=='X'?' · '+pesc(c.time):'')+(c&&c.att?' · '+fmtNum(c.att)+' espectadores':'')+'</div>'+(c&&c.ref&&c.ref!=='X'?'<div class="lbl">ÁRBITRO</div><div class="val">'+pesc(c.ref)+'</div>':'')+(c&&c.pitch&&c.pitch!=='X'?'<div class="lbl">TERRENO / TIEMPO</div><div class="val">'+pesc(c.pitch)+(c.weather&&c.weather!=='X'?' · '+pesc(c.weather):'')+'</div>':'')+'</div><img src="'+base+'img/esc/'+aw.id+'.png" style="height:64px"></div></div>';
  if(!c){ b+='<div class="panel"><div class="hdr">CRÓNICA</div><div class="in txt">Sin crónica disponible para este partido.</div></div>'; printDoc('Crónica',b); return; }
  const ev=[];
  c.goals.forEach(g=>ev.push('<div class="val"><span style="color:#ffe24a">⚽ '+g.min+"'</span> "+pesc(playerName(g.pid))+(g.type==='penalti'?' (p.)':g.type==='pp'?' (p.p.)':'')+' · '+pesc(g.side==='H'?hm.name:aw.name)+'</div>'));
  c.cards.forEach(k=>ev.push('<div class="val" style="color:'+(k.type===1?'#ffb060':'#ff6060')+'">▮ '+(k.type===1?'Amarilla':k.type===2?'Roja':'Roja (2ª amarilla)')+': '+pesc(playerName(k.pid))+' · '+pesc(k.side==='H'?hm.name:aw.name)+'</div>'));
  const lu=side=>{ const L=c.lineup[side]; if(!L.length) return '<div class="val">Sin datos.</div>'; return L.map(l=>{const p=DATA.playersById[l[0]]; return '<div class="val">'+(p&&p.dorsal?p.dorsal+' ':'')+pesc(playerName(l[0]))+(l[1]?' → '+pesc(playerName(l[1]))+" ("+l[2]+"')":'')+'</div>';}).join(''); };
  b+='<div class="row"><div class="panel col"><div class="hdr">GOLES Y TARJETAS</div><div class="in">'+(ev.length?ev.join(''):'<div class="val">Sin incidencias registradas.</div>')+'</div></div>';
  b+='<div class="panel col"><div class="hdr">'+pesc(hm.name.toUpperCase())+'</div><div class="in">'+lu('H')+'</div></div><div class="panel col"><div class="hdr">'+pesc(aw.name.toUpperCase())+'</div><div class="in">'+lu('A')+'</div></div></div>';
  if(c.text) b+='<div class="panel"><div class="hdr">CRÓNICA</div><div class="in txt">'+pesc(c.text)+'</div></div>';
  const qs=[]; for(const side of ['H','A']){ for(const q of c.quotes[side]){ if(q==='X'||q==='X\\') continue; if(q.startsWith('$')) qs.push('<div class="lbl">'+pesc(q.slice(1).replace(/:$/,'').toUpperCase())+'</div>'); else qs.push('<div class="val" style="margin-bottom:4px">'+pesc(q)+'</div>'); } }
  if(qs.length) b+='<div class="panel"><div class="hdr">DECLARACIONES</div><div class="in">'+qs.join('')+'</div></div>';
  printDoc('Crónica · '+hm.name+' - '+aw.name,b);
}
