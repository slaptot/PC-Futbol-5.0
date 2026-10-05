// Música de fondo (módulos S3M originales renderizados) y efectos de sonido (SONIDOS/*.RAW)
const AUDIO={ctx:null,track:null,el:null,music:true,sfx:true,unlocked:false,lastHover:null};
const PLAYLISTS={menu:['dinamic0'],manager:['dinamic1','dinamic2','dinamic3','dinamic4','dinamic5'],db:['dinabase','dinabas2']};
const SFX={hover:'pasa',click:'selec',open:'abrir',intro:'intro',cortina:'cortin',bote:'bote'};
const sfxCache={};
function audioInit(){
  try{ AUDIO.music=localStorage.getItem('pcf5_music')!=='0'; AUDIO.sfx=localStorage.getItem('pcf5_sfx')!=='0'; }catch(e){}
  const unlock=()=>{ if(AUDIO.unlocked) return; AUDIO.unlocked=true; if(AUDIO.ctx&&AUDIO.music) playTrack(); };
  ['click','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,unlock,{once:false}));
  const stage=document.getElementById('stage');
  stage.addEventListener('mouseover',e=>{ if(typeof MOBILE!=='undefined'&&MOBILE) return; const t=e.target.closest('.btn,.menu-item:not(.dis),.teamlist div,tr.clk,.hot'); if(!t||t===AUDIO.lastHover) return; AUDIO.lastHover=t; if(t.classList.contains('dis')) return; playSfx('hover'); });
  stage.addEventListener('mouseout',e=>{ if(e.target.closest('.btn,.menu-item,.teamlist div,tr.clk,.hot')===AUDIO.lastHover&&!e.relatedTarget?.closest('.btn,.menu-item,.teamlist div,tr.clk,.hot')) AUDIO.lastHover=null; });
  stage.addEventListener('click',e=>{ const t=e.target.closest('.btn,.menu-item:not(.dis),.teamlist div,tr.clk,.hot'); if(t&&!t.classList.contains('dis')) playSfx('click'); },true);
  audioControls();
}
function playSfx(name){
  if(!AUDIO.sfx) return; if(!AUDIO.unlocked&&name!=='click') return;
  AUDIO.unlocked=true;
  const f=SFX[name]||name; let a=sfxCache[f]; if(!a){ a=new Audio('snd/'+f+'.wav'); a.volume=0.6; sfxCache[f]=a; }
  try{ a.currentTime=0; a.play().catch(()=>{}); }catch(e){}
}
function setMusic(ctx){
  if(AUDIO.ctx===ctx) return; AUDIO.ctx=ctx; AUDIO.trackIdx=0;
  if(AUDIO.music&&AUDIO.unlocked) playTrack();
}
function playTrack(){
  const list=PLAYLISTS[AUDIO.ctx||'menu']; if(!list) return;
  const name=list[(AUDIO.trackIdx||0)%list.length];
  if(AUDIO.el&&AUDIO.track===name&&!AUDIO.el.paused) return;
  if(AUDIO.el){ AUDIO.el.pause(); AUDIO.el.src=''; }
  const a=new Audio('snd/'+name+'.mp3'); a.volume=0.45; a.loop=list.length===1;
  a.onended=()=>{ AUDIO.trackIdx=((AUDIO.trackIdx||0)+1)%list.length; playTrack(); };
  AUDIO.el=a; AUDIO.track=name; a.play().catch(()=>{});
}
function stopMusic(){ if(AUDIO.el){ try{ AUDIO.el.pause(); AUDIO.el.muted=true; AUDIO.el.src=''; }catch(e){} AUDIO.el=null; } AUDIO.track=null; }
function audioControls(){
  let bar=document.getElementById('audiobar'); if(bar) bar.remove();
  bar=h('div',{id:'audiobar'});
  const mk=(label,on,f)=>h('div',{class:'abtn'+(on?' on':''),title:label,onclick:ev=>{ev.stopPropagation(); f();}},label);
  bar.appendChild(mk(AUDIO.music?'♫ MÚSICA ON':'♫ MÚSICA OFF',AUDIO.music,()=>{ AUDIO.music=!AUDIO.music; try{localStorage.setItem('pcf5_music',AUDIO.music?'1':'0');}catch(e){} if(AUDIO.music){ AUDIO.unlocked=true; playTrack(); } else stopMusic(); audioControls(); }));
  bar.appendChild(mk(AUDIO.sfx?'♪ SONIDO ON':'♪ SONIDO OFF',AUDIO.sfx,()=>{ AUDIO.sfx=!AUDIO.sfx; try{localStorage.setItem('pcf5_sfx',AUDIO.sfx?'1':'0');}catch(e){} audioControls(); }));
  document.getElementById('stage').appendChild(bar);
}
