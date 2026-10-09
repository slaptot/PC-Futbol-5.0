// Motor de partidos y clasificación
function rnd(){ return Math.random(); }
function pick(arr, w){ let s=0; for(let i=0;i<arr.length;i++) s+=w[i]; let r=rnd()*s; for(let i=0;i<arr.length;i++){ r-=w[i]; if(r<=0) return arr[i]; } return arr[arr.length-1]; }

// Devuelve los 11 titulares (índices) por defecto para un equipo según formación
const FORMATIONS = {
  '4-4-2':[[1,6,50],[2,24,86],[6,24,62],[5,24,38],[3,24,14],[7,50,86],[15,46,60],[10,50,38],[11,50,14],[9,78,64],[9,78,36]],
  '4-3-3':[[1,6,50],[2,24,86],[6,24,62],[5,24,38],[3,24,14],[15,42,50],[8,54,72],[18,54,28],[12,76,86],[9,84,50],[14,76,14]],
  '3-5-2':[[1,6,50],[6,24,72],[4,17,50],[5,24,28],[7,50,88],[15,40,62],[10,46,38],[11,50,12],[13,64,50],[9,80,64],[9,80,36]],
  '5-3-2':[[1,6,50],[2,28,90],[6,22,68],[4,15,50],[5,22,32],[3,28,10],[15,44,50],[8,54,74],[18,54,26],[9,80,62],[9,80,38]],
  '4-2-3-1':[[1,6,50],[2,24,86],[6,24,62],[5,24,38],[3,24,14],[15,40,62],[10,40,38],[16,62,82],[13,64,50],[17,62,18],[9,84,50]],
  '5-4-1':[[1,6,50],[2,28,90],[6,22,68],[4,15,50],[5,22,32],[3,28,10],[7,50,86],[15,46,60],[10,50,38],[11,50,14],[9,82,50]],
  '3-4-3':[[1,6,50],[6,24,72],[4,17,50],[5,24,28],[7,50,86],[15,46,60],[10,50,38],[11,50,14],[12,76,86],[9,84,50],[14,76,14]],
  '3-2-3-2':[[1,6,50],[6,24,72],[4,17,50],[5,24,28],[15,46,62],[15,46,38],[12,62,84],[13,66,50],[14,62,16],[9,82,64],[9,82,36]],
  '4-1-3-2':[[1,6,50],[2,24,86],[6,24,62],[5,24,38],[3,24,14],[15,38,50],[7,56,84],[10,56,50],[11,56,16],[9,80,64],[9,80,36]],
};
// esquema de cada club de 1ª división según la previa de la temporada 96-97 (ROBIN0.DBC, «Sistema de juego»).
// Los demás clubes juegan con 4-4-2, que es el que dan por supuesto los textos cuando no dicen otro.
const TEAM_FORMATION={'Barcelona':'4-2-3-1','Deportivo':'5-4-1','Zaragoza':'4-4-2','Real Madrid':'4-4-2','Athletic':'3-2-3-2',
  'Sevilla':'4-4-2','Valencia':'5-3-2','Racing':'4-4-2','Oviedo':'4-2-3-1','Tenerife':'4-4-2','Real Sociedad':'4-4-2',
  'At. Madrid':'4-4-2','Sporting':'4-4-2','Celta':'4-4-2','Logroñés':'4-4-2','Valladolid':'5-3-2','Espanyol':'4-4-2',
  'Betis':'4-4-2','Compostela':'4-4-2','Rayo':'4-4-2','Hércules':'4-1-3-2','Extremadura':'4-4-2'};
// esquema habitual de un club (en una partida nueva o de un equipo propio, el del club que ocupa)
function clubFormation(t){ const c=t&&t.custom?team(t.replaced):t; return (c&&TEAM_FORMATION[c.name])||'4-4-2'; }
// esquema con el que juega un equipo: el que elige el usuario para el suyo, el del club para los demás
function teamFormation(t){ if(t&&typeof G!=='undefined'&&G&&t.id===G.team&&G.formation) return G.formation; return clubFormation(t); }
function bestLineup(t, formation, comp){
  const slots = FORMATIONS[formation||'4-4-2'];
  const used = new Set(); const lineup=[];
  for (const [r,x,y] of slots){
    const dem = ROLE_DEM[r];
    const cands = t.players.map((p,i)=>i).filter(i=>!used.has(i)&&!(typeof isInjured==='function'&&isInjured(t.id,i))&&!(typeof isSuspended==='function'&&isSuspended(t.id,i,comp||'L'))).sort((a,b)=>{
      const pa=t.players[a], pb=t.players[b];
      const sa=(pa.roles.includes(r)?200:0)+(pa.dem===dem?100:0)+pa.me, sb=(pb.roles.includes(r)?200:0)+(pb.dem===dem?100:0)+pb.me;
      return sb-sa;
    });
    if(!cands.length) break;
    used.add(cands[0]); lineup.push({idx:cands[0], role:r, x, y});
  }
  return lineup;
}
function slotPos(l){ return (l.x!==undefined)?[l.x,l.y]:ROLE_POS[l.role]; }
function squadStrength(t, lineup, hurt){
  const P = i=>t.players[i];
  const F = l=>{ const p=P(l.idx); return effME(p,l.role)/Math.max(1,p.me)*(hurt&&hurt.has(l.idx)?0.5:1)*(typeof playerFormFactor==='function'?playerFormFactor(t,p):1); };
  const gk = lineup.filter(l=>ROLE_DEM[l.role]==='POR').map(l=>P(l.idx).attrs[9]*F(l));
  const def = lineup.filter(l=>ROLE_DEM[l.role]==='DEF').map(l=>{const a=P(l.idx).attrs; return (a[8]*0.5+a[2]*0.2+a[1]*0.15+a[0]*0.15)*F(l);});
  const mid = lineup.filter(l=>ROLE_DEM[l.role]==='MED').map(l=>{const a=P(l.idx).attrs; return (a[4]*0.4+a[5]*0.2+a[3]*0.2+a[1]*0.2)*F(l);});
  const att = lineup.filter(l=>ROLE_DEM[l.role]==='DEL').map(l=>{const a=P(l.idx).attrs; return (a[6]*0.35+a[7]*0.3+a[5]*0.2+a[0]*0.15)*F(l);});
  const avg = x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:45; const clamp=(v,lo)=>Math.max(lo,Math.min(99,v));
  const D=avg(def), M=avg(mid), A=avg(att);
  // cada línea pesa según cuántos jugadores tiene (un 4-4-2 vale 1,0; con uno menos en una línea baja)
  const fD=0.85+0.0375*def.length, fM=0.85+0.0375*mid.length, fA=0.80+0.10*att.length;
  return {gk:clamp(avg(gk),35), def:clamp((0.7*D*fD+0.3*M*fM),30), mid:clamp((0.8*M*fM+0.1*D*fD+0.1*A*fA),30), att:clamp((0.7*A*fA+0.3*M*fM),30)};
}
// Lesiones del juego original (MANAGER.EXE): [nombre, semanas mín, semanas máx, peso, coste de curación en millones]
const INJURIES=[['Gripe',1,1,14,3],['Gastroenteritis',1,1,8,3],['Sobrecarga muscular',1,2,14,6],['Sobrecarga gemelos',1,2,8,6],['Contractura cervicales',1,2,6,8],['Estiramiento abductor',2,3,7,12],['Esguince de tobillo',2,3,10,15],['Conmoción cerebral',1,2,3,10],['Rotura fibrilar',3,4,8,25],['Desgarro muscular',3,5,6,35],['Fractura huesos de la nariz',3,4,3,30],['Distensión de ligamentos',4,6,5,45],['Esguince de rodilla',4,6,4,50],['Rotura de menisco',8,12,2,120],['Fractura tibia y peroné',16,24,1,250],['Rotura tendón de Aquiles',20,28,1,300],['Rotura de ligamentos',24,32,1,400]];
function randomInjury(){ const tot=INJURIES.reduce((a,x)=>a+x[3],0); let r=Math.random()*tot; for(const x of INJURIES){ r-=x[3]; if(r<=0) return {kind:x[0],weeks:x[1]+Math.floor(Math.random()*(x[2]-x[1]+1))}; } const x=INJURIES[0]; return {kind:x[0],weeks:x[1]}; }
function injuryCost(kind,weeks){ const x=INJURIES.find(i=>i[0]===kind); if(!x) return Math.max(5,(weeks||1)*10); return x[4]; }
// Simulación minuto a minuto con estado: permite sustituciones (máximo 3 por equipo) durante el partido.
// Los expulsados dejan el equipo con uno menos (menos ataque y defensa); los lesionados que siguen en el campo
// rinden a la mitad hasta que se les sustituye. ai:{H,A} = el equipo lo lleva la máquina (sustituye lesionados solo).
function matchSim(home, away, lh, la, opts){
  opts=opts||{};
  const S={home,away,lh:lh.map(l=>Object.assign({},l)),la:la.map(l=>Object.assign({},l)),m:0,gh:0,ga:0,events:[],subs:[],done:false,
    yellows:new Set(),hurt:{H:new Set(),A:new Set()},used:{H:new Set(),A:new Set()},nsubs:{H:0,A:0},minutes:{},ai:opts.ai||{H:true,A:true},full:!!opts.full,neutral:!!opts.neutral};
  const start={}; S.lh.forEach(l=>start['H:'+l.idx]=0); S.la.forEach(l=>start['A:'+l.idx]=0);
  const ends={}; // minuto de salida (expulsión o sustitución)
  let C=null;
  const calc=()=>{ const sh=squadStrength(home,S.lh,S.hurt.H), sa=squadStrength(away,S.la,S.hurt.A); const nh=S.lh.length/11, na=S.la.length/11;
    // goles esperados por partido: ataque contra defensa (exp. 1,8), centro del campo (0,8), portero rival (0,7),
    // ventaja de campo (1,6 local / 1,15 visitante; 1,35 en campo neutral) y jugadores en el campo (uno menos: −13 % propio, +10 % rival)
    const expH=(S.neutral?1.35:1.6)*Math.pow(sh.att/sa.def,1.8)*Math.pow(sh.mid/sa.mid,0.8)*Math.pow(72/sa.gk,0.7)*Math.pow(nh,1.5)*Math.pow(1/na,1.1);
    const expA=(S.neutral?1.35:1.15)*Math.pow(sa.att/sh.def,1.8)*Math.pow(sa.mid/sh.mid,0.8)*Math.pow(72/sh.gk,0.7)*Math.pow(na,1.5)*Math.pow(1/nh,1.1);
    const scorers=(t,l)=>{ let c=l.filter(x=>ROLE_DEM[x.role]!=='POR'); if(!c.length) c=l.length?l:t.players.map((p,i)=>({idx:i,role:9})); const w=c.map(x=>{const p=t.players[x.idx]; const d=ROLE_DEM[x.role]; return (d==='DEL'?5:d==='MED'?2:0.6)*(p.attrs[6]+p.attrs[7])/100;}); return ()=>t.players[pick(c,w).idx]; };
    const cardable=(t,l)=>{ let c=l.filter(x=>ROLE_DEM[x.role]!=='POR'); if(!c.length) c=l.length?l:t.players.map((p,i)=>({idx:i,role:9})); const w=c.map(x=>t.players[x.idx].attrs[2]/100); return ()=>t.players[pick(c,w).idx]; };
    C={expH,expA,scH:scorers(home,S.lh),scA:scorers(away,S.la),cdH:cardable(home,S.lh),cdA:cardable(away,S.la)}; };
  const side=x=>x==='H'?{t:home,l:S.lh}:{t:away,l:S.la};
  // banquillo de la máquina: mejores no alineados, no lesionados ni sancionados, misma línea si es posible
  const aiBench=(sd,role)=>{ const {t,l}=side(sd); const inL=new Set(l.map(x=>x.idx)); const cands=t.players.map((p,i)=>i).filter(i=>!inL.has(i)&&!S.used[sd].has(i)&&!(typeof isInjured==='function'&&isInjured(t.id,i))&&!(typeof isSuspended==='function'&&isSuspended(t.id,i,opts.comp||'L')));
    const same=cands.filter(i=>ROLE_DEM[t.players[i].roles[0]]===ROLE_DEM[role]); const pool=same.length?same:cands; if(!pool.length) return -1; return pool.sort((a,b)=>effME(t.players[b],role)-effME(t.players[a],role))[0]; };
  S.sub=(sd,outIdx,inIdx)=>{ const {t,l}=side(sd); const k=l.findIndex(x=>x.idx===outIdx); if(k<0||S.nsubs[sd]>=3||S.done||inIdx<0) return false; if(l.some(x=>x.idx===inIdx)) return false;
    l[k]={idx:inIdx,role:l[k].role,x:l[k].x,y:l[k].y}; S.hurt[sd].delete(outIdx); S.used[sd].add(inIdx); S.nsubs[sd]++; ends[sd+':'+outIdx]=S.m; start[sd+':'+inIdx]=S.m;
    S.subs.push({min:S.m,side:sd,out:outIdx,in:inIdx}); S.events.push({min:S.m,type:'sub',side:sd,player:t.players[inIdx],out:t.players[outIdx]}); C=null; return true; };
  S.step=()=>{ if(S.done) return; if(!C) calc(); const m=++S.m; const boost=(S.full&&m>80&&S.gh<=S.ga)?1.15:1;
    if(rnd()<C.expH*boost/90){ S.gh++; S.events.push({min:m,type:'goal',side:'H',player:C.scH(),score:[S.gh,S.ga]}); }
    if(rnd()<C.expA/90){ S.ga++; S.events.push({min:m,type:'goal',side:'A',player:C.scA(),score:[S.gh,S.ga]}); }
    const sendOff=(sd,p,direct)=>{ S.events.push(Object.assign({min:m,type:'red',side:sd,player:p},direct?{direct:true}:{})); const l=side(sd).l; const k=l.findIndex(x=>x.idx===p.idx); if(k>=0) l.splice(k,1); S.hurt[sd].delete(p.idx); ends[sd+':'+p.idx]=m; C=null; };
    if(rnd()<0.035){ const sd=rnd()<0.5?'H':'A'; const p=(sd==='H'?C.cdH:C.cdA)(); const k=sd+p.idx; if(S.yellows.has(k)){ S.yellows.delete(k); sendOff(sd,p,false); } else { S.yellows.add(k); S.events.push({min:m,type:'yellow',side:sd,player:p}); } }
    if(!S.done&&rnd()<0.0007){ if(!C) calc(); const sd=rnd()<0.5?'H':'A'; const p=(sd==='H'?C.cdH:C.cdA)(); sendOff(sd,p,true); }
    if(rnd()<0.0018){ const sd=rnd()<0.5?'H':'A'; const {t,l}=side(sd); if(l.length){ const x=l[Math.floor(rnd()*l.length)]; const p=t.players[x.idx]; if(!S.events.some(e=>e.type==='injury'&&e.player===p)){ const inj=randomInjury(); S.events.push({min:m,type:'injury',side:sd,player:p,weeks:inj.weeks,kind:inj.kind}); S.hurt[sd].add(p.idx); C=null;
      if(S.ai[sd]) S.sub(sd,p.idx,aiBench(sd,x.role)); } } }
    if(m>=90){ S.done=true; }
  };
  S.result=()=>{ const minutes={}; for(const k in start){ minutes[k]=Math.max(0,(ends[k]!==undefined?ends[k]:90)-start[k]); }
    return {home:home.id, away:away.id, gh:S.gh, ga:S.ga, events:S.events, subs:S.subs, minutes, att:Math.min(home.capacity||20000, Math.round((home.capacity||20000)*(0.45+rnd()*0.5)))}; };
  return S;
}
function simulateMatch(home, away, lh, la, opts){
  const S=matchSim(home,away,lh,la,Object.assign({ai:{H:true,A:true}},opts||{})); while(!S.done) S.step(); return S.result();
}
function standings(teamIds, results){
  const S={}; teamIds.forEach(id=>S[id]={id,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0});
  for(const r of results){ if(!r) continue; const h=S[r.home], a=S[r.away]; if(!h||!a) continue;
    h.pj++; a.pj++; h.gf+=r.gh; h.gc+=r.ga; a.gf+=r.ga; a.gc+=r.gh;
    if(r.gh>r.ga){h.pg++;a.pp++;h.pts+=3;} else if(r.gh<r.ga){a.pg++;h.pp++;a.pts+=3;} else {h.pe++;a.pe++;h.pts++;a.pts++;} }
  return Object.values(S).sort((x,y)=>y.pts-x.pts||(y.gf-y.gc)-(x.gf-x.gc)||y.gf-x.gf||team(x.id).name.localeCompare(team(y.id).name));
}
function topScorers(results, n){
  const G={};
  for(const r of results){ if(!r||!r.events) continue; for(const e of r.events){ if(e.type!=='goal') continue; const k=e.player.team+':'+e.player.idx; G[k]=(G[k]||0)+1; } }
  return Object.entries(G).map(([k,g])=>{const [t,i]=k.split(':'); return {team:+t, idx:+i, goals:g};}).sort((a,b)=>b.goals-a.goals).slice(0,n||20);
}
