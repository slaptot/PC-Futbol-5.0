// Equipo propio: creación con jugadores elegidos de la base de datos
const CUSTOM_ID=9999;
function customActive(){ return !!(DATA.teams[CUSTOM_ID]); }
function pidOf(p){ return p.id>0?p.id:null; }
function buildCustomTeam(def){ // def: {name, league, replaced, players:[[tid,pid]]}
  if(DATA.teams[CUSTOM_ID]) removeCustomTeam();
  const rep=team(def.replaced); const t={id:CUSTOM_ID,name:def.name};
  Object.assign(t,{full:def.name,stadium:def.stadium||rep.stadium,nat:league(def.league).country,capacity:def.capacity||rep.capacity,width:rep.width,length:rep.length,founded:1996,div:rep.div,league:def.league,long:false,
    coach:{id:0,name:'Tú mismo',full:'',photo:def.photo||null},campoId:def.campo||def.replaced,coach2:[],members:rep.members||0,president:'',positions:[],seasons:0,hist:null,players:[],custom:true,replaced:def.replaced});
  DATA.teams[CUSTOM_ID]=t;
  rep._league=rep.league; rep.league=null;
  const moved=[];
  for(const [tid,pid] of def.players){ const src=team(tid); if(!src) continue; const i=src.players.findIndex(p=>p.id===pid); if(i<0) continue; const p=src.players.splice(i,1)[0]; t.players.push(p); moved.push([tid,pid]); reindex(src); }
  reindex(t); t._me=undefined; def.players=moved;
  // alias en calendarios del manager
  CAL_ALIAS[def.replaced]=CUSTOM_ID; CAL_CACHE={};
  return t;
}
function removeCustomTeam(){
  const t=DATA.teams[CUSTOM_ID]; if(!t) return;
  const rep=team(t.replaced); if(rep&&rep._league!==undefined){ rep.league=rep._league; delete rep._league; }
  // devolver jugadores a sus clubes de origen
  if(G&&G.custom){ for(const [tid,pid] of G.custom.players){ const p=t.players.find(x=>x.id===pid); const src=team(tid); if(p&&src){ src.players.push(p); reindex(src); } } }
  delete DATA.teams[CUSTOM_ID]; delete CAL_ALIAS[t.replaced]; CAL_CACHE={};
}
const CAL_ALIAS={}; let CAL_CACHE={};
function calAliased(k){ if(!Object.keys(CAL_ALIAS).length) return league(k).rounds; if(CAL_CACHE[k]) return CAL_CACHE[k]; const m=id=>CAL_ALIAS[id]||id; CAL_CACHE[k]=league(k).rounds.map(r=>r.map(x=>[m(x[0]),m(x[1]),x[2],x[3],x[4]])); return CAL_CACHE[k]; }
function applyCustomTeam(){ if(G&&G.custom&&!DATA.teams[CUSTOM_ID]) buildCustomTeam(G.custom); }
// ---- media de un equipo con la misma fórmula que la ficha del club (los 11 mejores en 4-4-2)
function squadMetric(players,f){ const l=bestLineup({id:-1,players},f||'4-4-2'); return l.length?Math.round(l.reduce((a,x)=>a+players[x.idx].me,0)/l.length):0; }
// equipo al azar con el mismo número de jugadores por demarcación que el club sustituido y una media igual a la suya
// o hasta 4 puntos superior (nunca inferior: el aleatorio no puede salir peor que el club que sustituye).
// Los jugadores son de otros clubes de la base de datos; se parte de una selección al azar y se cambian jugadores
// de la misma demarcación mientras la media se acerca al objetivo.
function randomSquadFor(replacedId){
  const club=team(replacedId); const f=clubFormation(club); const target=standingsAll(club).me;
  const need={POR:0,DEF:0,MED:0,DEL:0}; club.players.forEach(p=>{ if(need[p.dem]!==undefined) need[p.dem]++; });
  const tot=()=>need.POR+need.DEF+need.MED+need.DEL;
  while(tot()>25){ const k=['DEL','MED','DEF'].filter(x=>need[x]>1).sort((a,b)=>need[b]-need[a])[0]; if(!k) break; need[k]--; }
  while(tot()<16) need.DEL++;
  need.POR=Math.min(3,Math.max(2,need.POR)); // siempre entre 2 y 3 porteros, aunque el club tenga más o menos
  const pool={POR:[],DEF:[],MED:[],DEL:[]};
  // ningún jugador por debajo de la media más baja del club sustituido
  const floor=Math.min(...club.players.filter(p=>p.me>0).map(p=>p.me)); // se ignoran registros vacíos (media 0)
  for(const t of Object.values(DATA.teams)){ if(t.id>=9000||t.custom||t.id===replacedId) continue; for(const p of t.players){ if(!p.id||!pool[p.dem]||p.me<floor) continue; pool[p.dem].push({t,p}); } }
  const shuffle=a=>a.map(x=>[Math.random(),x]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  const groups=['POR','DEF','MED','DEL'];
  let best=null;
  const ok=d=>d>=0&&d<=4; const dist=d=>d<0?-d:d>4?d-4:0;
  for(let attempt=0;attempt<30&&!(best&&ok(best.d));attempt++){
    const sel={}; groups.forEach(g=>sel[g]=shuffle(pool[g]).slice(0,need[g]));
    const all=()=>groups.flatMap(g=>sel[g]);
    let d=squadMetric(all().map(e=>e.p),f)-target;
    for(let it=0;it<1500&&!ok(d);it++){
      const g=groups[Math.floor(Math.random()*groups.length)]; if(!sel[g].length) continue;
      const i=Math.floor(Math.random()*sel[g].length); const cand=pool[g][Math.floor(Math.random()*pool[g].length)];
      if(sel[g].includes(cand)) continue;
      const old=sel[g][i]; sel[g][i]=cand; const nd=squadMetric(all().map(e=>e.p),f)-target;
      if(dist(nd)<=dist(d)||Math.random()<0.02) d=nd; else sel[g][i]=old;
    }
    if(!best||dist(d)<dist(best.d)||(dist(d)===dist(best.d)&&d<best.d)) best={picks:all(),d};
  }
  return {club,target,best};
}
// ---- pantalla de creación
function scrCrearEquipo(state){
  state=state||{}; setMusic('manager'); setBg('seleccion_fondo'); const s=clearScreen();
  const st=state.st||(state.st={name:'',league:'ESP1',replaced:null,picked:[],filter:'POR',q:''});
  if(!st.replaced||!team(st.replaced)||team(st.replaced).league!==st.league){ const ts=teamsOfLeague(st.league).sort((a,b)=>teamME(a)-teamME(b)); st.replaced=ts[0].id; }
  s.appendChild(topbar({title:'CREAR EQUIPO',right:league(st.league).name}));
  const T=panel(10,66,620,80); s.appendChild(T);
  T.appendChild(lbl('NOMBRE',8,4)); const inp=at(h('input',{class:'select',type:'text',value:st.name,placeholder:'Nombre del equipo',style:{width:'190px',height:'20px',fontFamily:'futcon12',fontSize:'15px',padding:'0 4px',outline:'none'}}),8,18); inp.oninput=()=>st.name=inp.value; T.appendChild(inp);
  T.appendChild(lbl('LIGA',210,4)); const sl=at(h('select',{class:'select',style:{width:'120px',height:'20px'},onchange:ev=>{st.league=ev.target.value; st.replaced=null; scrCrearEquipo({st});}},LEAGUE_ORDER.map(k=>h('option',{value:k,selected:k===st.league?'selected':null},league(k).name))),210,18); T.appendChild(sl);
  T.appendChild(lbl('OCUPA LA PLAZA DE',340,4)); const sr=at(h('select',{class:'select',style:{width:'150px',height:'20px'},onchange:ev=>{st.replaced=+ev.target.value; scrCrearEquipo({st});}},teamsOfLeague(st.league).map(t=>h('option',{value:t.id,selected:t.id===st.replaced?'selected':null},t.name))),340,18); T.appendChild(sr);
  T.appendChild(lbl('ENTRENADOR',496,4));
  T.appendChild(btn('HACER FOTO',496,18,94,()=>scrFotoEntrenador(photo=>{ st.photo=photo; scrCrearEquipo({st}); }),'green'));
  T.appendChild(at(h('img',{src:st.photo||'img/ui/foto_general.png',style:{width:'22px',height:'32px',objectFit:'cover',border:'1px solid #000',background:'#fff'}}),594,8));
  const rep=team(st.replaced);
  T.appendChild(lbl('ESTADIO',8,42)); const ist=at(h('input',{class:'select',type:'text',value:st.stadium||'',placeholder:rep.stadium,style:{width:'190px',height:'20px',fontFamily:'futcon12',fontSize:'15px',padding:'0 4px',outline:'none'}}),8,56); ist.oninput=()=>st.stadium=ist.value; T.appendChild(ist);
  T.appendChild(lbl('AFORO',210,42)); const ica=at(h('input',{class:'select',type:'text',value:st.capacity||'',placeholder:String(rep.capacity),style:{width:'80px',height:'20px',fontFamily:'futcon12',fontSize:'15px',padding:'0 4px',outline:'none'}}),210,56); ica.oninput=()=>st.capacity=ica.value.replace(/\D/g,''); T.appendChild(ica);
  T.appendChild(lbl('FOTO DEL CAMPO',300,42)); T.appendChild(btn('ELEGIR CAMPO',300,56,110,()=>scrElegirCampo(st.campo||st.replaced,id=>{ st.campo=id; scrCrearEquipo({st}); }),'green'));
  T.appendChild(at(h('img',{src:'img/campo/'+(st.campo||st.replaced)+'.png',style:{width:'54px',height:'30px',border:'1px solid #000',background:'#000'},onerror:function(){this.style.visibility='hidden'}}),416,46));
  { const n=txt('Datos del club sustituido.',478,44,138,34,'f-m8'); n.style.lineHeight='11px'; T.appendChild(n); }
  // selector de jugadores
  const L=panel(10,152,370,288); s.appendChild(L); L.appendChild(h('div',{class:'hdr'},'JUGADORES DE LA BASE DE DATOS'));
  const groups=[['POR','PORTEROS'],['DEF','DEFENSAS'],['MED','MEDIOS'],['DEL','DELANTEROS']];
  groups.forEach((g,i)=>L.appendChild(btn(g[1],6+i*90,22,86,()=>{st.filter=g[0]; scrCrearEquipo({st});},st.filter===g[0]?'green':'blue')));
  const q=at(h('input',{class:'select',type:'text',value:st.q,placeholder:'Buscar nombre o club…',style:{width:'358px',height:'18px',fontFamily:'futcon8',fontSize:'13px',padding:'0 4px',outline:'none'}}),6,46); q.oninput=()=>{st.q=q.value; renderList();}; L.appendChild(q);
  const list=at(h('div',{class:'scroll'}),0,68,366,218); L.appendChild(list);
  const pickedSet=()=>new Set(st.picked.map(x=>x[1]));
  const renderList=()=>{ const st0=list.scrollTop; list.innerHTML=''; const nq=normTxt(st.q.trim()); const ps=pickedSet(); const rows=[];
    for(const t of Object.values(DATA.teams)){ if(t.id>=9000||t.custom) continue; for(const p of t.players){ if(!p.id||p.dem!==st.filter||ps.has(p.id)) continue; if(nq&&!normTxt(p.name+' '+t.name).includes(nq)) continue; rows.push({p,t}); } }
    rows.sort((a,b)=>b.p.me-a.p.me); const shown=rows.slice(0,120); if(rows.length>shown.length) shown.push({__group:'… '+(rows.length-shown.length)+' MÁS · USA EL BUSCADOR PARA AFINAR'});
    list.appendChild(table([{t:'JUGADOR',w:110,k:r=>r.p.name},{t:'CLUB',w:90,k:r=>h('span',{class:'f-con8'},r.t.name)},{t:'',w:18,k:r=>h('img',{src:'img/band/'+r.p.country+'.png',style:{width:'14px',height:'10px'}})},{t:'ED',w:26,cls:'c',k:r=>playerAge(r.p)},{t:'ROL',w:70,k:r=>h('span',{class:'f-con8'},ROLES_SHORT[r.p.roles[0]])},{t:'ME',w:28,cls:'r',k:r=>r.p.me,cell:()=>'y'}],shown,{onRow:r=>{ if(st.picked.length>=25) return dialog('EQUIPO','Máximo 25 jugadores.'); st.picked.push([r.t.id,r.p.id,r.p.name,r.p.dem,r.p.me,r.p]); renderList(); renderSquad(); }}));
    list.scrollTop=st0; };
  const R=panel(390,152,240,288); s.appendChild(R);
  const squad=at(h('div',{class:'scroll'}),0,18,236,200); R.appendChild(squad);
  const renderSquad=()=>{ R.querySelector('.hdr')?.remove(); R.insertBefore(h('div',{class:'hdr'},'MI PLANTILLA ('+st.picked.length+'/25)'),R.firstChild); squad.innerHTML='';
    const order={POR:0,DEF:1,MED:2,DEL:3}; const rows=st.picked.slice().sort((a,b)=>order[a[3]]-order[b[3]]||b[4]-a[4]);
    squad.appendChild(table([{t:'JUGADOR',k:r=>r[2]},{t:'DEM',w:34,cls:'c',k:r=>r[3]},{t:'ME',w:28,cls:'r',k:r=>r[4],cell:()=>'y'},{t:'',w:20,cls:'c',k:()=>h('span',{style:{color:'#ff8a60'}},'✕')}],rows,{onRow:r=>{ st.picked=st.picked.filter(x=>x[1]!==r[1]); renderList(); renderSquad(); }}));
    const c={POR:0,DEF:0,MED:0,DEL:0}; st.picked.forEach(x=>c[x[3]]++); const me=st.picked.length?squadMetric(st.picked.map(x=>x[5]),clubFormation(team(st.replaced))):0;
    const info=R.querySelector('.cinfo'); if(info) info.remove(); R.appendChild(at(h('div',{class:'cinfo f-m8',style:{lineHeight:'10px'}},'POR '+c.POR+' · DEF '+c.DEF+' · MED '+c.MED+' · DEL '+c.DEL,h('br'),'Media '+me+(st.ref?' · '+st.ref+' '+st.refMedia:'')),6,219,228,20)); };
  R.appendChild(btn('ALEATORIO',8,240,224,()=>{ const club=team(st.replaced); const run=()=>{ const r=randomSquadFor(st.replaced); if(!r.best) return; st.picked=r.best.picks.map(e=>[e.t.id,e.p.id,e.p.name,e.p.dem,e.p.me,e.p]); st.ref=club.name; st.refMedia=r.target; if(!(r.best.d>=0&&r.best.d<=4)) dialog('ALEATORIO','No se ha podido igualar la media del club (diferencia '+r.best.d+'). Se ha dejado la selección más cercana.'); renderList(); renderSquad(); };
    if(st.picked.length) return dialog('ALEATORIO','Se sustituirá la plantilla elegida por un equipo al azar con la estructura y la media de '+club.name+' ('+standingsAll(club).me+').',[{t:'GENERAR',cls:'green',f:run},{t:'CANCELAR'}]); run(); },'blue'));
  R.appendChild(btn('CREAR Y EMPEZAR',8,262,224,()=>{ const name=st.name.trim(); if(name.length<2) return dialog('EQUIPO','Escribe el nombre del equipo.'); if(st.picked.length<16) return dialog('EQUIPO','Necesitas al menos 16 jugadores.'); const c={POR:0}; st.picked.forEach(x=>c[x[3]]=(c[x[3]]||0)+1); if((c.POR||0)<2) return dialog('EQUIPO','Elige al menos dos porteros.');
    const def={name,league:st.league,replaced:st.replaced,players:st.picked.map(x=>[x[0],x[1]]),photo:st.photo||null,stadium:(st.stadium||'').trim()||null,capacity:parseInt(st.capacity)||null,campo:st.campo||null}; buildCustomTeam(def); newGame(CUSTOM_ID); G.custom=def; saveGame(); scrOficina(); },'green'));
  renderList(); renderSquad();
  s.appendChild(btn('VOLVER',540,446,90,()=>scrSelectTeam({lg:st.league,sel:st.replaced}),'blue','ico_volver'));
  setTimeout(()=>inp.focus(),50);
}

// ---- foto del entrenador (cámara del ordenador o archivo), tamaño de las fotos del juego (124x182)
function scrFotoEntrenador(cb){
  const W=124,H=182; let stream=null, shot=null;
  const m=$('#modal'); m.innerHTML=''; m.classList.add('on');
  const video=h('video',{autoplay:'',playsinline:'',muted:'',style:{width:'200px',height:'150px',background:'#000',objectFit:'cover',transform:'scaleX(-1)',border:'1px solid #000'}});
  const canvas=h('canvas',{width:W,height:H,style:{width:'62px',height:'91px',border:'1px solid #000',background:'#fff'}});
  const msg=h('div',{class:'f-m8',style:{marginTop:'6px',minHeight:'12px'}},'Iniciando la cámara…');
  const file=h('input',{type:'file',accept:'image/*',style:{display:'none'}});
  const d=h('div',{class:'dlg'},h('h3',{},'FOTO DEL ENTRENADOR'),h('div',{style:{display:'flex',gap:'12px',alignItems:'center'}},video,h('div',{class:'f-m8',style:{textAlign:'center'}},'FOTO',h('br'),canvas)),msg,file);
  const ctx=canvas.getContext('2d');
  const drawCover=(src,sw,sh,mirror)=>{ const r=W/H; let cw=sw,ch=sh; if(sw/sh>r) cw=sh*r; else ch=sw/r; const sx=(sw-cw)/2, sy=(sh-ch)/2; ctx.save(); if(mirror){ ctx.translate(W,0); ctx.scale(-1,1); } ctx.drawImage(src,sx,sy,cw,ch,0,0,W,H); ctx.restore(); shot=canvas.toDataURL('image/jpeg',0.85); use.classList.remove('dis'); msg.textContent='Foto lista. Pulsa USAR FOTO o vuelve a capturar.'; };
  const stop=()=>{ if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } };
  const close=()=>{ stop(); closeDialog(); };
  const bar=h('div',{});
  const mk=(t,cls,f)=>{ const b=h('div',{class:'btn '+cls,onclick:()=>{ if(b.classList.contains('dis')) return; f(); }},t); bar.appendChild(b); return b; };
  const cap=mk('CAPTURAR','green',()=>{ if(!stream||!video.videoWidth) return; drawCover(video,video.videoWidth,video.videoHeight,true); });
  mk('ARCHIVO…','blue',()=>file.click());
  const use=mk('USAR FOTO','green',()=>{ if(!shot) return; const r=shot; close(); cb(r); }); use.classList.add('dis');
  mk('CANCELAR','red',close);
  file.onchange=()=>{ const f=file.files[0]; if(!f) return; const img=new Image(); img.onload=()=>{ drawCover(img,img.naturalWidth,img.naturalHeight,false); URL.revokeObjectURL(img.src); }; img.src=URL.createObjectURL(f); };
  d.appendChild(bar); m.appendChild(h('div',{class:'fade'})); m.appendChild(d);
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false}).then(st=>{ stream=st; video.srcObject=st; msg.textContent='Colócate frente a la cámara y pulsa CAPTURAR.'; }).catch(e=>{ msg.textContent='No se pudo usar la cámara ('+(e.name||e)+'). Puedes elegir un archivo.'; cap.classList.add('dis'); });
  } else { msg.textContent='Este navegador no permite usar la cámara. Puedes elegir un archivo.'; cap.classList.add('dis'); }
}

// ---- editar nombre, estadio y aforo del equipo propio (desde la pantalla Club del manager)
function scrEditarEquipo(t, cb){
  const mk=(v,ph)=>h('input',{class:'ed',type:'text',value:v||'',placeholder:ph||''});
  const iname=mk(t.name,'Nombre del equipo'), ist=mk(t.stadium,'Estadio'), ica=mk(String(t.capacity||''),'Aforo');
  const L=t=>h('div',{class:'lbl',style:{position:'static'}},t); const body=h('div',{},L('NOMBRE DEL EQUIPO'),iname,L('ESTADIO'),ist,L('AFORO'),ica);
  dialog('DATOS DEL CLUB',body,[{t:'GUARDAR',cls:'green',f:()=>{ const n=iname.value.trim(), e=ist.value.trim(), c=parseInt(ica.value.replace(/\D/g,''));
    if(n.length>=2){ t.name=n; t.full=n; } if(e) t.stadium=e; if(c>0) t.capacity=c;
    if(G&&G.custom){ G.custom.name=t.name; G.custom.stadium=t.stadium; G.custom.capacity=t.capacity; saveGame(); }
    cb&&cb(); }},{t:'CANCELAR',cls:'red'}]);
  setTimeout(()=>iname.focus(),50);
}

// ---- elegir la foto del campo entre los estadios del juego
function scrElegirCampo(cur, cb){
  const m=$('#modal'); m.innerHTML=''; m.classList.add('on');
  const d=h('div',{class:'dlg',style:{left:'40px',top:'40px',width:'536px'}},h('h3',{},'ELIGE LA FOTO DEL CAMPO'));
  const grid=h('div',{class:'scroll',style:{height:'330px',display:'flex',flexWrap:'wrap',gap:'6px',alignContent:'flex-start'}});
  const items=CAMPO_IDS.map(id=>team(id)).filter(Boolean).sort((a,b)=>(LEAGUE_ORDER.indexOf(a.league)+99*(a.league?0:1))-(LEAGUE_ORDER.indexOf(b.league)+99*(b.league?0:1))||a.name.localeCompare(b.name));
  for(const t of items){ const it=h('div',{style:{width:'94px',textAlign:'center',cursor:'pointer',padding:'3px',border:'2px solid '+(t.id===cur?'#ffe24a':'transparent')},onclick:()=>{ closeDialog(); cb(t.id); }},
      h('img',{src:'img/campo/'+t.id+'.png',loading:'lazy',style:{width:'88px',height:'48px',display:'block',margin:'0 auto',border:'1px solid #000'}}),h('div',{class:'f-m8',style:{marginTop:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},t.stadium),h('div',{class:'f-m8',style:{color:'#9fb4e8'}},t.name));
    grid.appendChild(it); }
  d.appendChild(grid); const bar=h('div',{}); bar.appendChild(h('div',{class:'btn red',onclick:closeDialog},'CANCELAR')); d.appendChild(bar);
  m.appendChild(h('div',{class:'fade'})); m.appendChild(d);
}
