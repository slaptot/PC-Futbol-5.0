// Avisos push (PWA): suscripción en el navegador, alerta dentro del juego con los datos del aviso.
// La clave pública VAPID está aquí; la privada (para enviar) se guarda fuera del repositorio (tools/push.py).
const VAPID_PUBLIC='BPy2rQrdJTj-282jgTyubCV4pZ_7zegvL6vNYtgRaixtYhR_Jf-aWYkCy_tQyGDXJmje0bIDLaQhMwjNQ7P8S4Q';
function b64ToU8(s){ const p='='.repeat((4-s.length%4)%4); const b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/')); return Uint8Array.from(b,c=>c.charCodeAt(0)); }
function pushSupported(){ return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window; }
async function pushState(){ if(!pushSupported()) return {ok:false,why:'Este navegador no admite avisos push.'+(/iPhone|iPad/.test(navigator.userAgent)?' En iPhone/iPad hay que añadir la web a la pantalla de inicio (iOS 16.4 o superior).':'')}; const reg=await navigator.serviceWorker.getRegistration(); if(!reg) return {ok:false,why:'El service worker no está activo (hace falta HTTPS).'}; const sub=await reg.pushManager.getSubscription(); return {ok:true,reg,sub,perm:Notification.permission}; }
async function pushSubscribe(){ const st=await pushState(); if(!st.ok) return dialog('AVISOS',st.why); const perm=await Notification.requestPermission(); if(perm!=='granted') return dialog('AVISOS','No has dado permiso para los avisos.');
  try{ const sub=await st.reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToU8(VAPID_PUBLIC)}); try{ localStorage.setItem('pcf5_push',JSON.stringify(sub.toJSON())); }catch(e){} scrAvisos(); }catch(e){ dialog('AVISOS','No se pudo activar: '+e.message); } }
async function pushUnsubscribe(){ const st=await pushState(); if(st.ok&&st.sub) await st.sub.unsubscribe(); try{ localStorage.removeItem('pcf5_push'); }catch(e){} scrAvisos(); }
async function pushTest(){ const st=await pushState(); if(!st.ok) return dialog('AVISOS',st.why); if(Notification.permission!=='granted') return dialog('AVISOS','Activa primero los avisos.'); await st.reg.showNotification('PC Fútbol 5.0',{body:'Esto es un aviso de prueba. Así llegarán las novedades del juego.',icon:'img/icon-192.png',badge:'img/icon-192.png',data:{title:'AVISO DE PRUEBA',body:'Esto es un aviso de prueba. Así llegarán las novedades del juego.'}}); }
function showAviso(d){ if(!d) return; const title=(d.title||'AVISO').toString().toUpperCase(); const body=(d.body||'').toString(); const extra=d.url?'<br><br><a href="'+d.url+'" target="_blank" style="color:#8dff8d">'+(d.linkText||'Más información')+'</a>':''; dialog('🔔 '+title,body.replace(/</g,'&lt;').replace(/\n/g,'<br>')+extra); try{ const L=JSON.parse(localStorage.getItem('pcf5_avisos')||'[]'); L.unshift({t:Date.now(),title:d.title||'',body}); localStorage.setItem('pcf5_avisos',JSON.stringify(L.slice(0,20))); }catch(e){} }
function pushInit(){
  if(!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message',e=>{ if(e.data&&e.data.type==='aviso') showAviso(e.data.data); });
  try{ const q=new URLSearchParams(location.search).get('aviso'); if(q){ const d=JSON.parse(q); setTimeout(()=>showAviso(d),800); history.replaceState(null,'',location.pathname); } }catch(e){}
}
async function scrAvisos(){
  const st=await pushState(); const body=h('div',{});
  if(!st.ok){ body.appendChild(h('div',{},st.why)); return dialog('AVISOS DEL JUEGO',body); }
  const on=!!st.sub&&Notification.permission==='granted';
  body.appendChild(h('div',{style:{marginBottom:'6px'}},'Recibe en este dispositivo avisos con novedades del juego (actualizaciones, nuevas funciones, eventos). Cuando llegue uno, se mostrará como una alerta dentro del juego.'));
  body.appendChild(h('div',{class:'f-e5',style:{color:on?'#8dff8d':'#ff8a60',margin:'4px 0'}},on?'AVISOS ACTIVADOS':'AVISOS DESACTIVADOS'));
  let hist=[]; try{ hist=JSON.parse(localStorage.getItem('pcf5_avisos')||'[]'); }catch(e){}
  if(hist.length){ body.appendChild(h('div',{class:'f-e5',style:{color:'#ffe24a',margin:'6px 0 2px'}},'ÚLTIMOS AVISOS')); hist.slice(0,5).forEach(a=>body.appendChild(h('div',{class:'f-p8',style:{lineHeight:'12px',marginBottom:'3px'}},new Date(a.t).toLocaleDateString('es-ES')+' · '+(a.title?a.title+': ':'')+a.body))); }
  const btns=on?[{t:'PROBAR AVISO',cls:'green',f:pushTest},{t:'COPIAR SUSCRIPCIÓN',cls:'blue',f:()=>{ const s=st.sub?JSON.stringify(st.sub.toJSON()):''; (navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>dialog('AVISOS','Suscripción copiada. Envíasela al administrador para recibir avisos.'),()=>dialog('AVISOS','<textarea style="width:100%;height:80px">'+s.replace(/</g,'&lt;')+'</textarea>')); }},{t:'DESACTIVAR',cls:'red',f:pushUnsubscribe},{t:'CERRAR'}]:[{t:'ACTIVAR AVISOS',cls:'green',f:pushSubscribe},{t:'CERRAR'}];
  dialog('AVISOS DEL JUEGO',body,btns);
}
