// Buscador global de texto libre
const SEARCH={docs:null,norm:null,loading:false};
function normTxt(s){ return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
async function loadSearch(){
  if(SEARCH.docs) return SEARCH.docs;
  const d=await fetch('data/search.json').then(r=>r.json());
  SEARCH.docs=d; SEARCH.norm=d.map(x=>normTxt(x[2]+'\n'+x[3])); return d;
}
function runSearch(q,limit){
  const nq=normTxt(q.trim()); if(nq.length<2) return [];
  const words=nq.split(/\s+/).filter(w=>w.length>1); const out=[];
  for(let i=0;i<SEARCH.docs.length;i++){ const n=SEARCH.norm[i]; let score=0;
    if(n.includes(nq)) score=100; else if(words.length>1&&words.every(w=>n.includes(w))) score=50; else if(words.length===1&&n.includes(words[0])) score=100;
    if(!score) continue;
    const t=normTxt(SEARCH.docs[i][2]); if(t.includes(nq)) score+=30; if(SEARCH.docs[i][0]==='player'||SEARCH.docs[i][0]==='team') score+=5;
    out.push({i,score}); }
  out.sort((a,b)=>b.score-a.score||a.i-b.i); return out.slice(0,limit||200);
}
function snippet(doc,q){
  const text=doc[3]; const n=normTxt(text); const nq=normTxt(q.trim()); const words=nq.split(/\s+/).filter(w=>w.length>1);
  let pos=n.indexOf(nq); let len=nq.length; if(pos<0){ for(const w of words){ pos=n.indexOf(w); if(pos>=0){ len=w.length; break; } } }
  if(pos<0) return text.slice(0,140).replace(/\s+/g,' ');
  const a=Math.max(0,pos-70), b=Math.min(text.length,pos+len+90);
  const frag=document.createDocumentFragment();
  const pre=(a>0?'…':'')+text.slice(a,pos).replace(/\s+/g,' '); frag.appendChild(document.createTextNode(pre));
  frag.appendChild(h('b',{style:{color:'#ffe24a'}},text.slice(pos,pos+len)));
  frag.appendChild(document.createTextNode(text.slice(pos+len,b).replace(/\s+/g,' ')+(b<text.length?'…':'')));
  return frag;
}
const SEARCH_TYPES={team:'EQUIPO',coach:'ENTRENADOR',player:'JUGADOR',cronica:'CRÓNICA',ref:'ÁRBITRO',cup:'COPAS',liga:'LIGA'};
function openResult(doc,back){
  const [type,ref]=doc;
  if(type==='team'||type==='coach') return type==='coach'?scrCoachBio(ref,back):scrDbTeam(ref,{back});
  if(type==='player') return scrFicha(ref[0],ref[1],back);
  if(type==='cronica') return scrCronica(ref[0],ref[1],ref[2],back);
  if(type==='ref') return scrArbitros({i:ref});
  if(type==='cup') return scrHistoria({comp:ref[0],i:ref[1]});
  if(type==='liga') return scrHistoria({comp:'LIGA',season:ref});
}
async function scrBuscar(state){
  state=state||{}; setMusic(AUDIO.ctx==='manager'?'manager':'db'); setBg('fondo_dbase'); const s=clearScreen();
  s.appendChild(topbar({title:'BUSCAR',right:'Texto libre'}));
  const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'BUSCADOR GLOBAL'));
  const inp=at(h('input',{class:'select',type:'text',placeholder:'Escribe un nombre, una palabra o una frase…',value:state.q||'',style:{width:'430px',height:'22px',fontFamily:'futcon12',fontSize:'15px',padding:'0 4px',outline:'none'}}),10,26); P.appendChild(inp);
  const bt=btn('BUSCAR',450,26,90,()=>doit(),'green'); P.appendChild(bt);
  const info=txt('',550,30,66,14,'f-p8'); P.appendChild(info);
  const res=at(h('div',{class:'scroll'}),0,56,616,312); P.appendChild(res);
  const doit=async()=>{ const q=inp.value; if(normTxt(q.trim()).length<2){ res.innerHTML=''; return; } if(!SEARCH.docs){ res.innerHTML=''; res.appendChild(txt('Cargando índice…',8,8,300,14,'f-p12')); await loadSearch(); }
    const hits=runSearch(q,300); res.innerHTML=''; info.textContent=hits.length+(hits.length>=300?'+':'')+' res.';
    if(!hits.length){ res.appendChild(txt('Sin resultados para "'+q+'".',8,8,500,14,'f-p12')); return; }
    hits.forEach(hh=>{ const d=SEARCH.docs[hh.i]; const row=h('div',{style:{padding:'3px 8px',borderBottom:'1px solid #1a2b70',cursor:'pointer'},onclick:()=>openResult(d,()=>scrBuscar({q}))});
      row.onmouseenter=()=>row.style.background='#1d2f80'; row.onmouseleave=()=>row.style.background='';
      row.appendChild(h('div',{},h('span',{class:'f-e8b',style:{color:'#9fd0ff',marginRight:'6px',letterSpacing:'1px'}},SEARCH_TYPES[d[0]]||d[0]),h('span',{class:'f-con'},d[2]),d[4]?h('span',{class:'f-con8',style:{color:'#ffe24a',marginLeft:'8px'}},d[4]):null));
      const sn=h('div',{class:'f-p8',style:{color:'#c8d0ff',lineHeight:'12px',whiteSpace:'normal'}}); const frag=snippet(d,q); if(typeof frag==='string') sn.textContent=frag; else sn.appendChild(frag); row.appendChild(sn);
      res.appendChild(row); });
  };
  inp.onkeydown=e=>{ if(e.key==='Enter') doit(); };
  s.appendChild(btn('VOLVER',540,446,90,()=>go('menu'),'blue','ico_volver'));
  setTimeout(()=>inp.focus(),50);
  if(state.q) doit();
}
