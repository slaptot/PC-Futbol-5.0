// Empleados (personal del club), como en el juego original: ocho puestos, un contratado por puesto, candidatos
// con estrellas (1-5) y sueldo anual que se renuevan cada 1-3 jornadas, y despido con indemnización del resto
// de temporada. Cada puesto tiene un efecto en el juego (ver empStars y sus usos).
const EMP_ROLES=[
  ['segundo','Segundo entrenador','Entrenamiento: +10 % de progreso por estrella'],
  ['juveniles','Entrenador de juveniles','Jóvenes (22 o menos): +4 % de progreso por estrella'],
  ['fisio','Fisioterapeuta','Lesiones: −8 % de semanas por estrella'],
  ['psicologo','Psicólogo','Suplentes: −10 % de pérdida de ritmo por estrella'],
  ['ojeador','Ojeador','Mercado: +20 % de figuras por estrella'],
  ['secretario','Secretario técnico','Fichajes: los clubes aceptan −2 % por estrella'],
  ['asistente','Asistente','Informe del rival en la oficina: once y jugadores clave'],
  ['cesped','Cuidador del césped','Casa: +1 % de público y −5 % de lesiones por estrella']];
const EMP_NOMBRES=['Antonio','José','Manuel','Francisco','Juan','Javier','Carlos','Miguel','Luis','Rafael','Pedro','Ángel','Jesús','Alberto','Fernando','Jorge','Sergio','Vicente','Andrés','Ramón','Enrique','Ignacio','Óscar','Julio','Marcos','Raúl','Tomás','Emilio','Gonzalo','Eduardo'];
const EMP_APELLIDOS=['García','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Martín','Jiménez','Ruiz','Hernández','Díaz','Moreno','Muñoz','Álvarez','Romero','Alonso','Gutiérrez','Navarro','Torres','Domínguez','Gil','Vázquez','Serrano','Blanco','Molina','Morales','Ortega','Delgado','Castro','Ortiz','Rubio','Marín','Sanz','Iglesias','Medina','Garrido','Cortés','Santos','Lozano'];
const EMP_SUELDO=[0,12,25,50,90,150]; // millones de pesetas por temporada según estrellas
function empRole(k){ return EMP_ROLES.find(r=>r[0]===k); }
function empInit(){ G.emp={hired:{},market:{}}; EMP_ROLES.forEach(r=>{ G.emp.market[r[0]]=[]; }); empTick(true); }
// nombre al azar con las listas del juego original del país de la liga (22 España, 30 Inglaterra, 36 Italia); si faltan, listas propias
function empName(){ const c=String((league(G.league)||{}).country||22); const L=DATA.names&&DATA.names[c]; const n=L&&L.n&&L.n.length?L.n:EMP_NOMBRES, a=L&&L.a&&L.a.length?L.a:EMP_APELLIDOS; return n[Math.floor(Math.random()*n.length)]+' '+a[Math.floor(Math.random()*a.length)]; }
function empNew(){ const stars=1+Math.floor(Math.random()*5); const s=Math.round(EMP_SUELDO[stars]*(0.85+Math.random()*0.3)); return {name:empName(),stars,salary:Math.max(5,s),until:(G.jornada||1)+1+Math.floor(Math.random()*3)}; }
function empTick(init){ // tras cada jornada: los candidatos caducados se sustituyen; siempre hay 3 por puesto
  if(!G.emp) return empInit(); const j=G.jornada||1;
  EMP_ROLES.forEach(r=>{ const k=r[0]; let list=(G.emp.market[k]||[]).filter(c=>init||c.until>j); while(list.length<3) list.push(empNew()); G.emp.market[k]=list; });
}
function empStars(k){ const e=G&&G.emp&&G.emp.hired&&G.emp.hired[k]; return e?e.stars:0; }
function empWagesWeek(){ if(!G||!G.emp) return 0; const N=Math.max(30,calOf(G.league).length); return Math.round(Object.values(G.emp.hired).reduce((a,e)=>a+e.salary,0)/N); }
// estrellas: la imagen del juego (stareqon) para las llenas; las vacías son la misma en gris apagado (el sprite "-off" del juego es media estrella)
function empStarsEl(n){ const d=h('span',{class:'stars',title:n+' de 5'}); for(let i=1;i<=5;i++) d.appendChild(h('img',{src:'img/ui/stareqon.png',style:{height:'10px',marginRight:'1px',filter:i<=n?'':'grayscale(1) brightness(.6) opacity(.45)'}})); return d; }
function empHire(k,c){ const role=empRole(k); if(G.emp.hired[k]) return dialog('EMPLEADOS','Ya tienes un empleado contratado para este trabajo. Despídelo antes de contratar a otro.');
  dialog('CONTRATAR',role[1].toUpperCase()+': '+c.name+'<br>'+'Sueldo: '+fmtNum(c.salary)+' millones por temporada ('+fmtNum(Math.round(c.salary/Math.max(30,calOf(G.league).length)))+' por jornada).<br>'+role[2],
    [{t:'CONTRATAR',cls:'green',f:()=>{ G.emp.hired[k]=Object.assign({since:G.jornada},c); G.emp.market[k]=G.emp.market[k].filter(x=>x!==c); saveGame(); scrEmpleados(); }},{t:'CANCELAR'}]); }
function empFire(k){ const e=G.emp.hired[k]; if(!e) return; const N=Math.max(30,calOf(G.league).length); const left=Math.max(0,N-(G.jornada||1)+1); const indem=Math.round(e.salary*left/N);
  dialog('DESPEDIR','¿Estás seguro de que deseas despedir a '+e.name+' ('+empRole(k)[1]+')? Si lo haces deberás pagarle el resto de la temporada como indemnización: '+fmtNum(indem)+' millones.',
    [{t:'DESPEDIR',cls:'red',f:()=>{ delete G.emp.hired[k]; G.budget=(G.budget||0)-indem; if(typeof finOther==='function') finOther('Indemnización '+e.name,-indem); saveGame(); scrEmpleados(); }},{t:'CANCELAR'}]); }
function scrEmpleados(){
  if(!G.emp) empInit(); const t=team(G.team); setBg('fondo6'); const s=clearScreen(); const MUI=(typeof UI!=='undefined'&&UI==='mobile');
  s.appendChild(topbar({team:t,title:'PERSONAL DEL CLUB',date:gameDate(),sub:'EMPLEADOS · SUELDOS: '+fmtNum(empWagesWeek())+' M POR JORNADA'}));
  const P=panel(10,68,620,372); s.appendChild(P); P.appendChild(h('div',{class:'hdr'},'EMPLEADOS DEL CLUB · PRESUPUESTO '+fmtNum(G.budget||0)+' M'));
  const sc=at(h('div',{class:'scroll'}),0,20,616,348); P.appendChild(sc);
  const rows=[]; EMP_ROLES.forEach(r=>{ const k=r[0]; const e=G.emp.hired[k]; rows.push({__group:MUI?r[1].toUpperCase():r[1].toUpperCase()+' · '+r[2]}); if(e) rows.push({k,c:e,hired:true}); (G.emp.market[k]||[]).forEach(c=>rows.push({k,c})); });
  const cols=[{t:'NOMBRE',w:MUI?120:170,k:x=>x.c.name},{t:'ESTADO',w:MUI?80:110,k:x=>x.hired?h('span',{style:{color:'#8dff8d'}},'CONTRATADO'):h('span',{class:'f-con8',style:{color:'#9fb4e8'}},'disponible '+(x.c.until-(G.jornada||1))+' j.')},{t:'ESTRELLAS',w:70,cls:'c',k:x=>empStarsEl(x.c.stars)},{t:'SUELDO',w:70,cls:'r',k:x=>fmtNum(x.c.salary)+' M'},{t:'',w:MUI?90:110,cls:'c',k:x=>h('span',{class:'f-con8',style:{color:x.hired?'#ff8a60':'#8dff8d'}},x.hired?'DESPEDIR':(G.emp.hired[x.k]?'':'CONTRATAR'))}];
  // móvil: tres columnas; el estado va bajo el nombre y la acción se hace tocando la fila
  const colsM=[{t:'NOMBRE',k:x=>h('span',{},x.c.name,h('br'),h('span',{class:'f-con8',style:{color:x.hired?'#8dff8d':'#9fb4e8'}},x.hired?'CONTRATADO · tocar para despedir':'disponible '+(x.c.until-(G.jornada||1))+' j.'+(G.emp.hired[x.k]?'':' · tocar para contratar')))},{t:'ESTRELLAS',w:72,cls:'c',k:x=>empStarsEl(x.c.stars)},{t:'SUELDO',w:56,cls:'r',k:x=>fmtNum(x.c.salary)+' M'}];
  sc.appendChild(table(MUI?colsM:cols,rows,{rowClass:x=>x.hired?'hired':'',onRow:x=>x.hired?empFire(x.k):empHire(x.k,x.c)}));
  s.appendChild(btn('VOLVER',540,446,90,()=>scrOficina(),'blue','ico_volver'));
}
