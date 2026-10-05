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
};
function bestLineup(t, formation){
  const slots = FORMATIONS[formation||'4-4-2'];
  const used = new Set(); const lineup=[];
  for (const [r,x,y] of slots){
    const dem = ROLE_DEM[r];
    const cands = t.players.map((p,i)=>i).filter(i=>!used.has(i)&&!(typeof isInjured==='function'&&isInjured(t.id,i))).sort((a,b)=>{
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
function squadStrength(t, lineup){
  const P = i=>t.players[i];
  const F = l=>{ const p=P(l.idx); return effME(p,l.role)/Math.max(1,p.me); };
  const gk = lineup.filter(l=>ROLE_DEM[l.role]==='POR').map(l=>P(l.idx).attrs[9]*F(l));
  const def = lineup.filter(l=>ROLE_DEM[l.role]==='DEF').map(l=>{const a=P(l.idx).attrs; return (a[8]*0.5+a[2]*0.2+a[1]*0.15+a[0]*0.15)*F(l);});
  const mid = lineup.filter(l=>ROLE_DEM[l.role]==='MED').map(l=>{const a=P(l.idx).attrs; return (a[4]*0.4+a[5]*0.2+a[3]*0.2+a[1]*0.2)*F(l);});
  const att = lineup.filter(l=>ROLE_DEM[l.role]==='DEL').map(l=>{const a=P(l.idx).attrs; return (a[6]*0.35+a[7]*0.3+a[5]*0.2+a[0]*0.15)*F(l);});
  const avg = x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:50;
  return {gk:avg(gk), def:avg(def)*(0.85+0.03*def.length), mid:avg(mid)*(0.85+0.03*mid.length), att:avg(att)*(0.8+0.07*att.length)};
}
function simulateMatch(home, away, lh, la, opts){
  opts=opts||{};
  const sh=squadStrength(home,lh), sa=squadStrength(away,la);
  const expH = 1.5*Math.pow(sh.att/sa.def,2.4)*Math.pow(sh.mid/sa.mid,0.9)*Math.pow(72/sa.gk,0.8);
  const expA = 1.15*Math.pow(sa.att/sh.def,2.4)*Math.pow(sa.mid/sh.mid,0.9)*Math.pow(72/sh.gk,0.8);
  const events=[]; let gh=0, ga=0;
  const scorers = (t,l)=>{ let c=l.filter(x=>ROLE_DEM[x.role]!=='POR'); if(!c.length) c=l.length?l:t.players.map((p,i)=>({idx:i,role:9})); const w=c.map(x=>{const p=t.players[x.idx]; const d=ROLE_DEM[x.role]; return (d==='DEL'?5:d==='MED'?2:0.6)*(p.attrs[6]+p.attrs[7])/100;}); return ()=>t.players[pick(c,w).idx]; };
  const scH=scorers(home,lh), scA=scorers(away,la);
  const cardable = (t,l)=>{ let c=l.filter(x=>ROLE_DEM[x.role]!=='POR'); if(!c.length) c=l.length?l:t.players.map((p,i)=>({idx:i,role:9})); const w=c.map(x=>t.players[x.idx].attrs[2]/100); return ()=>t.players[pick(c,w).idx]; };
  const cdH=cardable(home,lh), cdA=cardable(away,la);
  const yellows=new Set();
  for(let m=1;m<=90;m++){
    if(rnd()<expH/90){ gh++; events.push({min:m,type:'goal',side:'H',player:scH(),score:[gh,ga]}); }
    if(rnd()<expA/90){ ga++; events.push({min:m,type:'goal',side:'A',player:scA(),score:[gh,ga]}); }
    if(rnd()<0.035){ const side=rnd()<0.5?'H':'A'; const p=(side==='H'?cdH:cdA)(); const k=side+p.idx;
      if(yellows.has(k)){ events.push({min:m,type:'red',side,player:p}); yellows.delete(k);} else { yellows.add(k); events.push({min:m,type:'yellow',side,player:p}); } }
    if(rnd()<0.0007){ const side=rnd()<0.5?'H':'A'; const p=(side==='H'?cdH:cdA)(); events.push({min:m,type:'red',side,player:p}); }
    if(rnd()<0.0018){ const side=rnd()<0.5?'H':'A'; const l=side==='H'?lh:la; const x=l[Math.floor(rnd()*l.length)]; const p=(side==='H'?home:away).players[x.idx]; const w=rnd()<0.55?1:rnd()<0.6?2:rnd()<0.6?3:3+Math.floor(rnd()*6); if(!events.some(e=>e.type==='injury'&&e.player===p)) events.push({min:m,type:'injury',side,player:p,weeks:w}); }
  }
  return {home:home.id, away:away.id, gh, ga, events, att:Math.min(home.capacity||20000, Math.round((home.capacity||20000)*(0.45+rnd()*0.5)))};
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
