// Utilidades de interfaz: escalado de la "pantalla" 640x480 y componentes
const $ = s=>document.querySelector(s);
function h(tag, attrs, ...children){
  const el=document.createElement(tag);
  if(attrs) for(const k in attrs){ const v=attrs[k]; if(k==='style'&&typeof v==='object') Object.assign(el.style,v); else if(k==='class') el.className=v; else if(k.startsWith('on')) el.addEventListener(k.slice(2),v); else if(k==='html') el.innerHTML=v; else if(v!==null&&v!==undefined) el.setAttribute(k,v); }
  for(const c of children.flat()){ if(c===null||c===undefined||c===false) continue; el.appendChild(typeof c==='string'||typeof c==='number'?document.createTextNode(String(c)):c); }
  return el;
}
function px(n){ return n+'px'; }
function at(el,x,y,w,hh){ el.style.position='absolute'; el.style.left=px(x); el.style.top=px(y); if(w!==undefined) el.style.width=px(w); if(hh!==undefined) el.style.height=px(hh); return el; }
function fitStage(){
  const s=$('#stage'); if(typeof UI!=='undefined'&&UI==='mobile'){ s.style.transform='none'; return; } let W=window.innerWidth, H=window.innerHeight;
  if(typeof MOBILE!=='undefined'&&MOBILE){ const vp=$('#viewport'); if(vp&&vp.clientWidth){ W=vp.clientWidth; H=vp.clientHeight; } if(window.visualViewport){ W=Math.min(W,window.visualViewport.width); H=Math.min(H,window.visualViewport.height); } }
  const k=Math.min(W/640, H/480);
  s.style.transform='translate(-50%,-50%) scale('+k+')';
}
window.addEventListener('resize',fitStage);
function setBg(name){ $('#bg').style.backgroundImage=name?"url(img/ui/"+name+".png)":'none'; }
function clearScreen(){ const s=$('#screen'); s.innerHTML=''; return s; }
function fitBtn(b){
  if(!b.isConnected||!b.clientWidth) return;
  const fits=()=>b.scrollWidth<=b.clientWidth;
  if(fits()) return;
  b.style.letterSpacing='0'; if(fits()) return;
  b.style.fontFamily='micro8'; b.style.fontSize='10px'; if(fits()) return;
  b.style.paddingLeft=b.classList.contains('ib')?'18px':'2px'; b.style.paddingRight='2px'; if(fits()) return;
  const ico=b.querySelector('.ico'); if(ico){ ico.style.display='none'; b.style.paddingLeft='2px'; }
}
function btn(label,x,y,w,onclick,cls,icon){
  const b=h('div',{class:'btn '+(cls||'')+(icon?' ib':''),onclick},icon?h('img',{class:'ico',src:'img/ui/'+icon+'.png'}):null,label);
  at(b,x,y,w); requestAnimationFrame(()=>fitBtn(b)); return b;
}
function panel(x,y,w,hh,cls){ return at(h('div',{class:'panel '+(cls||'')}),x,y,w,hh); }
function lbl(text,x,y,cls,color){ const e=at(h('div',{class:'lbl '+(cls||'')},text),x,y); if(color) e.style.color=color; return e; }
function txt(text,x,y,w,hh,cls){ const e=at(h('div',{class:'txt '+(cls||'')},text),x,y,w,hh); return e; }
function img(src,x,y,w,hh,cls){ const e=at(h('img',{src,class:cls||''}),x,y,w,hh); e.onerror=()=>{e.style.visibility='hidden'}; return e; }
// iconos del juego: tarjeta amarilla / doble amarilla / roja y cruz de lesionado (img/ui)
function icoImg(name,hpx,title){ return h('img',{class:'ico',src:'img/ui/'+name+'.png',alt:'',title:title||'',style:{height:(hpx||10)+'px',imageRendering:'pixelated',verticalAlign:'middle'}}); }
function suspIco(tid,idx,comp){ const s=G&&G.susp&&G.susp[injKey(tid,idx)]; const w=s&&s['w'+(comp||'L')]; return w==='red'?'tarjeta_roja':w==='red2'?'tarjeta2_amar':'tarjeta_amar'; }
// velocidad del partido en directo (ms por minuto), recordada en el navegador
const SPEEDS={lenta:[300,'LENTA'],media:[150,'MEDIA'],rapida:[60,'RÁPIDA']};
function matchSpeedKey(){ try{ const k=localStorage.getItem('pcf5_speed'); return SPEEDS[k]?k:'rapida'; }catch(e){ return 'rapida'; } }
function matchSpeed(){ return SPEEDS[matchSpeedKey()][0]; }
function setMatchSpeed(k){ if(SPEEDS[k]) try{ localStorage.setItem('pcf5_speed',k); }catch(e){} }
function nextSpeedKey(k){ const ks=Object.keys(SPEEDS); return ks[(ks.indexOf(k)+1)%ks.length]; }
function escImg(tid,size){ if(tid===9999) return 'img/ui/icono_balon_de_la_b.png'; const dir=size==='big'?'escbig':size==='nano'?'nano':size==='ridi'?'ridi':'esc'; const t=DATA.teams&&DATA.teams[tid]; return (t&&t.prueba?TEST_DATA+'img/':'img/')+dir+'/'+tid+'.png'; }
function topbar(opts){
  // opts: team (obj), title, date (Date), sub
  const tb=h('div',{class:'topbar'});
  if(opts.team){
    tb.appendChild(h('div',{class:'teambox'},h('div',{class:'n1'},opts.team.name),h('div',{class:'n2'},opts.team.stadium)));
    tb.appendChild(h('div',{class:'esc'},h('img',{src:escImg(opts.team.id)})));
  }
  const ti=h('div',{class:'title'},opts.title||''); if((opts.title||'').length>13){ ti.style.fontFamily='euroh32'; ti.style.fontSize='19px'; } tb.appendChild(ti);
  if(opts.date){ const d=opts.date; tb.appendChild(h('div',{class:'datebox'},MONTHS[d.getMonth()+1],h('b',{},String(d.getDate())),DAYS[d.getDay()],h('div',{},String(d.getFullYear())))); }
  else if(opts.right){ tb.appendChild(h('div',{class:'datebox'},opts.right)); }
  if(opts.sub) tb.appendChild(h('div',{class:'sub'},opts.sub));
  return tb;
}
function table(cols, rows, opts){
  // cols: [{t:'POS',w:30,cls:'c',k:fn}] rows: array of objects; opts.rowClass(fn), opts.onRow
  opts=opts||{};
  const thead=h('tr',{},cols.map(c=>h('th',{class:c.cls||'',style:c.w?{width:px(c.w)}:{}},c.t)));
  const body=rows.map((r,i)=>{ if(r.__group) return h('tr',{class:'grp'},h('td',{colspan:cols.length},r.__group));
    const tr=h('tr',{class:(opts.rowClass?opts.rowClass(r,i):'')+(opts.onRow?' clk':'')},cols.map(c=>{const v=c.k(r,i); const td=h('td',{class:(c.cls||'')+' '+(c.cell?c.cell(r,i):'')}); if(v instanceof Node) td.appendChild(v); else td.textContent=v===undefined||v===null?'':v; return td;}));
    if(opts.onRow) tr.onclick=()=>{ if(tr.__lp){ tr.__lp=false; return; } opts.onRow(r,i,tr); }; if(opts.onRowDbl) tr.ondblclick=()=>opts.onRowDbl(r,i,tr);
    if(opts.onRowDbl&&typeof MOBILE!=='undefined'&&MOBILE){ // pulsación larga = doble click en móvil
      let tm=null, sx=0, sy=0; const cancel=()=>{ if(tm){ clearTimeout(tm); tm=null; } };
      tr.addEventListener('touchstart',e=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; cancel(); tm=setTimeout(()=>{ tm=null; tr.__lp=true; if(navigator.vibrate) navigator.vibrate(20); opts.onRowDbl(r,i,tr); },450); },{passive:true});
      tr.addEventListener('touchmove',e=>{ const t=e.touches[0]; if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8) cancel(); },{passive:true});
      tr.addEventListener('touchend',cancel); tr.addEventListener('touchcancel',cancel);
    }
    return tr; });
  return h('table',{class:'t'},thead,body);
}
function dialog(title, body, buttons){
  const m=$('#modal'); m.innerHTML=''; m.classList.add('on');
  const d=h('div',{class:'dlg'},h('h3',{},title), typeof body==='string'?h('div',{html:body}):body);
  const bar=h('div',{});
  (buttons||[{t:'ACEPTAR'}]).forEach(b=>bar.appendChild(h('div',{class:'btn '+(b.cls||''),onclick:()=>{closeDialog(); b.f&&b.f();}},b.t)));
  d.appendChild(bar); m.appendChild(h('div',{class:'fade'})); m.appendChild(d);
  if(!(typeof UI!=='undefined'&&UI==='mobile')){ const H=d.offsetHeight; if(140+H>470) d.style.top=Math.max(8,470-H)+'px'; } // diálogos altos: que no se salgan de la pantalla
}
function closeDialog(){ const m=$('#modal'); m.classList.remove('on'); m.innerHTML=''; }
function pitch(x,y,w,hh,players,opts){
  // players: [{x,y,n,cls,onclick}] coordenadas 0..100
  opts=opts||{};
  const p=at(h('div',{class:'pitch'}),x,y,w,hh);
  const L=(l,t,ww,hhh)=>p.appendChild(at(h('div',{class:'ln'}),l,t,ww,hhh));
  L(2,2,w-8,hh-8); L(w/2-2,2,0,hh-8); L(2,hh*0.22,w*0.16,hh*0.56); L(w-6-w*0.16,hh*0.22,w*0.16,hh*0.56); L(2,hh*0.36,w*0.06,hh*0.28); L(w-6-w*0.06,hh*0.36,w*0.06,hh*0.28);
  const c=at(h('div',{class:'ln'}),w/2-hh*0.14,hh/2-hh*0.14,hh*0.28,hh*0.28); c.style.borderRadius='50%'; p.appendChild(c);
  for(const pl of players){ const d=at(h('div',{class:'dot '+(pl.cls||''),onclick:pl.onclick,title:pl.title||''},pl.n),pl.x/100*(w-4)+2,pl.y/100*(hh-4)+2); p.appendChild(d); }
  return p;
}
function flagImg(c,x,y){ return img('img/band/'+c+'.png',x,y,14,10); }
