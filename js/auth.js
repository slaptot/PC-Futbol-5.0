// Puerta de acceso con contraseña para la versión publicada (GitHub Pages).
// Es una protección en el navegador: evita el acceso casual, pero quien conozca las URL de los
// archivos puede descargarlos igualmente. Cambia la contraseña con: python3 tools/setpass.py <nueva>
const AUTH_SALT='pcf5';
const AUTH_HASH='19a399dae0cf6a295e82b51c41a1a805d4d01cc72cf30d4b8eee3a9e8ebafc7e';
function authNeeded(){ const hn=location.hostname; return !(hn==='localhost'||hn==='127.0.0.1'||hn==='[::1]'||hn.endsWith('.local')||location.protocol==='file:'); }
async function authHash(pw){ const b=new TextEncoder().encode(AUTH_SALT+':'+pw); const d=await crypto.subtle.digest('SHA-256',b); return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
function authPending(){ if(!authNeeded()) return false; try{ return localStorage.getItem('pcf5_auth')!==AUTH_HASH; }catch(e){ return true; } }
function authGate(){
  if(!authNeeded()) return Promise.resolve();
  try{ if(localStorage.getItem('pcf5_auth')===AUTH_HASH) return Promise.resolve(); }catch(e){}
  return new Promise(res=>{
    const m=$('#modal'); m.innerHTML=''; m.classList.add('on');
    const inp=h('input',{class:'ed',type:'password',placeholder:'Contraseña',autocomplete:'current-password'});
    const msg=h('div',{class:'f-m8',style:{minHeight:'12px',color:'#ff8a60'}});
    const d=h('div',{class:'dlg'},h('h3',{},'ACCESO'),h('div',{style:{marginBottom:'6px'}},'Introduce la contraseña para entrar en PC Fútbol 5.0 Web.'),inp,msg);
    const ok=async()=>{ const hsh=await authHash(inp.value); if(hsh===AUTH_HASH){ try{ localStorage.setItem('pcf5_auth',hsh); }catch(e){} closeDialog(); res(); } else { msg.textContent='Contraseña incorrecta.'; inp.value=''; inp.focus(); } };
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter') ok(); });
    const bar=h('div',{}); bar.appendChild(h('div',{class:'btn green',onclick:ok},'ENTRAR')); d.appendChild(bar);
    m.appendChild(h('div',{class:'fade'})); m.appendChild(d); setTimeout(()=>inp.focus(),50);
  });
}
