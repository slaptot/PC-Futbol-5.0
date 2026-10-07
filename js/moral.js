// Moral y estado de forma de la plantilla propia (0-100), como las casillas MORAL y E. FORMA de la ficha original.
// Moral: sube con victorias, goles y minutos; baja con derrotas, expulsiones y jornadas sin jugar; tiende a 70.
// Forma: sube jugando, baja sin jugar o con lesión; tiende a 60. Ambas influyen un poco en el rendimiento
// (±5 % entre los extremos) y el Psicólogo amortigua los bajones de moral. Los demás equipos usan su racha.
function moralInit(){ G.moral=G.moral||{}; G.forma=G.forma||{}; }
function moralOf(p){ const v=G&&G.moral&&G.moral[pkey(p)]; return v===undefined?70:v; }
function formaOf(p){ const v=G&&G.forma&&G.forma[pkey(p)]; return v===undefined?60:v; }
function setMoral(p,v){ moralInit(); G.moral[pkey(p)]=Math.max(0,Math.min(100,Math.round(v))); }
function setForma(p,v){ moralInit(); G.forma[pkey(p)]=Math.max(0,Math.min(100,Math.round(v))); }
function moralText(v){ return v>=85?'Eufórico':v>=70?'Bien':v>=50?'Normal':v>=30?'Bajo':'Hundido'; }
function formaText(v){ return v>=85?'Excelente':v>=65?'Buena':v>=45?'Normal':'Mala'; }
function teamMoral(t){ t=t||team(G.team); return Math.round(t.players.reduce((a,p)=>a+moralOf(p),0)/Math.max(1,t.players.length)); }
function teamForma(t){ t=t||team(G.team); return Math.round(t.players.reduce((a,p)=>a+formaOf(p),0)/Math.max(1,t.players.length)); }
// factor de rendimiento usado por la simulación (squadStrength)
function playerFormFactor(t,p){
  if(!G) return 1;
  if(t.id===G.team) return 1+(formaOf(p)-60)/600+(moralOf(p)-70)/800;
  try{ const f=recentForm(t.id); return 1+(f.w-f.l)*0.01; }catch(e){ return 1; }
}
// tras un partido del club propio (liga o copa)
function moralAfterMatch(hm,aw,r){
  const t=team(G.team); const mine=hm.id===G.team?'H':aw.id===G.team?'A':null; if(!mine||!r) return;
  const my=mine==='H'?[r.gh,r.ga]:[r.ga,r.gh]; const res=my[0]>my[1]?1:my[0]<my[1]?-1:0; const psy=typeof empStars==='function'?empStars('psicologo'):0;
  t.players.forEach(p=>{ const k=mine+':'+p.idx; const min=(r.minutes&&r.minutes[k])||0; let dm=0, df=0;
    if(min>0){ dm+=res>0?6:res<0?-6:1; df+=2+Math.round(min/30); } else if(!isInjured(G.team,p.idx)){ dm-=2; df-=3; }
    (r.events||[]).forEach(e=>{ if(e.side!==mine) return; const q=e.player&&e.player.name?e.player:t.players[e.player.idx]; if(q!==p) return; if(e.type==='goal') dm+=3; else if(e.type==='red') dm-=4; else if(e.type==='injury') df-=25; });
    if(dm<0) dm=Math.round(dm*(1-0.1*psy)); df+=Math.round((Math.random()-0.5)*6);
    setMoral(p,moralOf(p)+dm); setForma(p,formaOf(p)+df); });
}
// cada jornada: tendencia a la media; los lesionados pierden forma
function moralWeekly(){
  const t=team(G.team); const psy=typeof empStars==='function'?empStars('psicologo'):0;
  t.players.forEach(p=>{ let m=moralOf(p); m+=(70-m)*0.08+0.5*psy; let f=formaOf(p); if(isInjured(G.team,p.idx)) f=Math.min(f,35); else f+=(60-f)*0.1; setMoral(p,m); setForma(p,f); });
}
function moralLine(p){ const m=moralOf(p), f=formaOf(p); return 'FORMA '+f+' ('+formaText(f)+') · MORAL '+m+' ('+moralText(m)+')'; }
