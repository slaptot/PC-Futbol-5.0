// Datos del juego (extraídos de DBDAT) y constantes
const DATA = { teams: null, calendar: null, leagues: null, referees: null, liga: null, bios: {}, cronicas: {}, playersById: {} };
const LEAGUE_ORDER=['ESP1','ESP2','ENG1','ENG2','ITA1','ITA2'];
const LEAGUE_SHORT={ESP1:'1ª DIVISIÓN',ESP2:'2ª DIVISIÓN',ENG1:'PREMIER',ENG2:'FIRST DIV.',ITA1:'SERIE A',ITA2:'SERIE B'};
const SIBLING={ESP1:'ESP2',ESP2:'ESP1',ENG1:'ENG2',ENG2:'ENG1',ITA1:'ITA2',ITA2:'ITA1'};

const ROLES = {1:'PORTERO',2:'LATERAL DERECHO',3:'LATERAL IZQUIERDO',4:'LIBERO',5:'CENTRAL IZQUIERDO',6:'CENTRAL DERECHO',
  7:'CENTROCAMPISTA DERECHA',8:'INTERIOR DERECHO',9:'DELANTERO CENTRO',10:'MEDIO CENTRO ORGANIZADOR',11:'CENTROCAMPISTA IZQUIERDA',
  12:'EXTREMO DERECHO',13:'MEDIA PUNTA POR EL CENTRO',14:'EXTREMO IZQUIERDO',15:'MEDIO CENTRO DEFENSIVO',16:'MEDIA PUNTA DERECHA',
  17:'MEDIA PUNTA IZQUIERDA',18:'INTERIOR IZQUIERDO'};
const ROLES_SHORT = {1:'POR',2:'LAT. DER.',3:'LAT. IZQ.',4:'LIBERO',5:'CENTRAL IZQ.',6:'CENTRAL DER.',7:'CENTROC. DER.',8:'INTERIOR DER.',9:'DEL. CENTRO',
  10:'M.C. ORGANIZ.',11:'CENTROC. IZQ.',12:'EXTREMO DER.',13:'MEDIA PUNTA',14:'EXTREMO IZQ.',15:'M.C. DEFENSIVO',16:'M. PUNTA DER.',17:'M. PUNTA IZQ.',18:'INTERIOR IZQ.'};
const ROLE_DEM = {1:'POR',2:'DEF',3:'DEF',4:'DEF',5:'DEF',6:'DEF',7:'MED',8:'MED',10:'MED',11:'MED',15:'MED',18:'MED',12:'DEL',13:'DEL',14:'DEL',16:'DEL',17:'DEL',9:'DEL'};
// posición (x 0..100 a lo ancho del campo horizontal, y 0..100) de cada rol, equipo atacando hacia la derecha
const ROLE_POS = {1:[6,50],2:[24,86],3:[24,14],4:[18,50],5:[26,36],6:[26,64],7:[52,84],8:[56,66],9:[86,50],10:[50,50],11:[52,16],
  12:[78,86],13:[72,50],14:[78,14],15:[40,50],16:[72,70],17:[72,30],18:[56,34]};
const ATTR_NAMES = ['VE','RE','AG','CA','PASE','REGATE','REMATE','TIRO','ENTRADAS','PORTERO'];
const PARAM_NAMES = ['PORTERO','PASE','REGATE','REMATE','ENTRADAS','TIRO'];
const PARAM_IDX = [9,4,5,6,8,7];

const COUNTRIES = {0:'-',1:'Albania',2:'Alemania',3:'Argentina',4:'Australia',5:'Austria',6:'Bielorrusia',7:'Bélgica',8:'Bolivia',9:'Bosnia',10:'Brasil',
  11:'Bulgaria',12:'Bélgica',13:'Camerún',14:'Chile',15:'Chipre',16:'Colombia',17:'Croacia',18:'Dinamarca',19:'Escocia',20:'Eslovaquia',21:'Eslovenia',
  22:'España',23:'Finlandia',24:'Francia',25:'Ghana',26:'Grecia',27:'Holanda',28:'Honduras',29:'Hungría',30:'Inglaterra',31:'Irlanda',32:'Irlanda del Norte',
  33:'Islandia',34:'Islas Feroe',35:'Israel',36:'Italia',37:'Letonia',38:'Lituania',39:'Macedonia',40:'Malta',41:'Marruecos',42:'Moldavia',43:'Nigeria',
  44:'Noruega',45:'Gales',46:'Polonia',47:'Portugal',48:'Rep. Checa',49:'Rumanía',50:'Rusia',51:'Ex-Yugoslavia',52:'Sudáfrica',53:'Suecia',54:'Suiza',
  55:'Turquía',56:'Ucrania',57:'Uruguay',58:'Yugoslavia',59:'Zaire',60:'Armenia',61:'Azerbaiyán',62:'Georgia',63:'Costa Rica',64:'Paraguay',65:'Perú',
  66:'Ecuador',67:'Venezuela',68:'México',69:'EE.UU.',70:'Japón',72:'Estonia',76:'Luxemburgo',77:'Liechtenstein',78:'San Marino',79:'Andorra',80:'Senegal',
  81:'Túnez',82:'Argelia',84:'Egipto',85:'Zambia',89:'Liberia'};

const MONTHS = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

// ?datos=2024: prueba con la liga 1ª de la temporada 2024 (solo en local; ver tools/update2026/build_test_2024.py)
const TEST_DATA='tools/update2026/out/esp1_2024/';
// la partida de prueba se guarda aparte para no sustituir la partida real
const TEST_MODE=new URLSearchParams(location.search).get('datos')==='2024';
const SAVE_KEY=TEST_MODE?'pcf5_save_2024':'pcf5_save';
// año de la temporada 1: 1996 con los datos originales; 2024 con la prueba (edades y fechas de las jornadas)
const BASE_YEAR=TEST_MODE?2024:1996;
// foto del jugador: en la prueba 2024 (ids 1000000+) sale de la carpeta de prueba; el resto, de img/
function fotoPath(p,big){ return (p.id>=1000000?TEST_DATA+'img/':'img/')+(big?'fotobig':'foto')+'/'+p.id+'.png'; }
async function loadData(){
  const getJ=u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);
  const test=TEST_MODE?await Promise.all([getJ(TEST_DATA+'teams.json'),getJ(TEST_DATA+'leagues.json')]):[null,null];
  const [teams0, leagues0, referees, liga, cups, names] = await Promise.all(['teams','leagues','referees','liga_history','cups','names'].map(n=>getJ('data/'+n+'.json')));
  const teams=test[0]||teams0, leagues=test[1]||leagues0;
  DATA.teams = teams; DATA.leagues = leagues; DATA.referees = referees; DATA.liga = liga; DATA.cups = cups; DATA.names = names||{}; // listas de nombres del juego (NOMBRES.xx / APELLIDO.xx) para empleados
  DATA.calendar = {div1: leagues.ESP1.rounds, div2: leagues.ESP2.rounds};
  // post-proceso
  for (const id in teams){
    const t = teams[id];
    t.players.forEach((p,i)=>{ p.idx0=i; p.team=t.id; p.me = calcME(p); if(!p.roles.length) p.roles=[9]; p.dem = ROLE_DEM[p.roles[0]]||'MED'; });
    // f2=3: bajas (jugadores que ya no estaban en el club en la 96-97); se consultan en la base de datos pero no juegan
    t.bajas=t.players.filter(p=>p.f2===3); t.players=t.players.filter(p=>p.f2!==3);
    t.players.forEach((p,i)=>{ p.idx=i; if(p.id) DATA.playersById[p.id]=p; }); t.bajas.forEach((p,i)=>{ p.idx=i; p.baja=true; if(p.id&&!DATA.playersById[p.id]) DATA.playersById[p.id]=p; });
  }
}
// situación del jugador en la plantilla 96-97 según el campo f2 del juego
function sitLabel(p){ return p.youth?'JUVENIL':p.f2===1?'ALTA':p.f2===2?'FILIAL':p.f2===3?'BAJA':''; }
function sitText(p){ return p.youth?'Juvenil promocionado al primer equipo (potencial '+p.pot+')':p.f2===1?'Alta de la temporada 96-97':p.f2===2?'Filial (ficha del equipo B)':p.f2===3?'Baja: ya no está en el club':'Continúa en el club'; }
function playerByOrig(tid,idx0){ const t=team(tid); if(!t) return null; return t.players.find(p=>p.idx0===idx0)||(t.bajas||[]).find(p=>p.idx0===idx0)||t.players[idx0]; }
async function loadBio(tid){
  if (DATA.bios[tid]) return DATA.bios[tid];
  const t = DATA.teams&&DATA.teams[tid]; // clubes de la prueba 2024: biografías en la carpeta de prueba
  try { const b = await fetch((t&&t.prueba?TEST_DATA+'bio/':'data/bio/')+tid+'.json').then(r=>r.ok?r.json():null); DATA.bios[tid]=b; return b; } catch(e){ return null; }
}
function calcME(p){
  const a=p.attrs; const m4=(a[0]+a[1]+a[2]+a[3])/4; const dem=ROLE_DEM[p.roles[0]]||'MED'; let v;
  if(dem==='POR') v = m4*0.45 + a[9]*0.55;
  else if(dem==='DEF') v = m4*0.5 + a[8]*0.3 + a[4]*0.1 + a[6]*0.1;
  else if(dem==='MED') v = m4*0.5 + a[4]*0.25 + a[5]*0.15 + a[7]*0.1;
  else v = m4*0.4 + a[6]*0.25 + a[7]*0.2 + a[5]*0.15;
  return Math.round(v);
}
function team(id){ return DATA.teams[id]; }
function teamsOfDiv(d){ return Object.values(DATA.teams).filter(t=>t.div===d).sort((a,b)=>a.name.localeCompare(b.name)); }
function playerAge(p, year){ year = year||(BASE_YEAR+((typeof G!=='undefined'&&G&&G.seasonIdx)||0)); return p.birth[2]>1900 ? (year - p.birth[2] - ((p.birth[1]>8)?1:0)) : '-'; }
function birthStr(p){ if(!p.birth[2]) return '-'; if(!p.birth[0]) return String(p.birth[2]); return p.birth[0]+'/'+p.birth[1]+'/'+p.birth[2]; }
function countryName(c){ return COUNTRIES[c] || ('País '+c); }
function imgOr(src, fallback){ return src; }
const CAMPO_IDS=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,25,26,27,28,30,32,36,38,39,133,201,202,203,204,206,207,212,213,215,220,228,236,302,303,304,305,306,307,308,309,310,311,312,313,315,317,319,320];
function campoImg(t,base){ return (base||'')+'img/campo/'+((t&&t.campoId)||(t&&t.id))+'.png'; }
function coachImg(t,base){ const c=t&&t.coach; if(c&&c.photo) return c.photo; return (base||'')+'img/entr/'+(c?c.id:0)+'.png'; }
function fmtNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
// Fecha de cada jornada (1ª: 42 jornadas, 2ª: 38; con la prueba 2024, 38). Aproximación: domingos consecutivos desde el 1-9 del año base
function jornadaDate(j, div){
  const start = new Date(BASE_YEAR,8,1); // 1 de septiembre del año base
  const skip = [16,17]; // navidad
  let d = new Date(start); let n=1;
  while(n<j){ d.setDate(d.getDate()+7); n++; if(d.getMonth()===11 && d.getDate()>=22){ d.setDate(d.getDate()+14);} }
  return d;
}
function dateStr(d){ return DAYS[d.getDay()]+' '+d.getDate()+' '+MONTHS[d.getMonth()+1]+' '+d.getFullYear(); }

function league(k){ return DATA.leagues[k]; }
function teamsOfLeague(k){ return Object.values(DATA.teams).filter(t=>t.league===k).sort((a,b)=>a.name.localeCompare(b.name)); }
function leagueIds(k){ const rs=(typeof calAliased==='function')?calAliased(k):league(k).rounds; return [...new Set(rs.flat().map(m=>m[0]))]; }
function roundDate(k,j){ const r=league(k).rounds[j-1]; if(r&&r[0]&&r[0][4]){ const d=r[0][4]; return new Date(d[2],d[1]-1,d[0]); } return jornadaDate(j,k); }
function playedRounds(k){ const rs=league(k).rounds; let n=0; rs.forEach((r,i)=>{ if(r.some(m=>m[2]!==null&&m[2]!==undefined&&(k.startsWith('ESP')?(m[2]||m[3]||i<42):true))) n=i+1; }); return n; }
function realResults(k,j){ const out=[]; const rs=league(k).rounds; for(let i=0;i<j&&i<rs.length;i++) for(const m of rs[i]){ if(m[2]===null||m[2]===undefined) continue; out.push({home:m[0],away:m[1],gh:m[2],ga:m[3]}); } return out; }
async function loadCronica(k,j){ const key=k+'-'+j; if(DATA.cronicas[key]!==undefined) return DATA.cronicas[key]; try{ const r=await fetch('data/cronicas/'+key+'.json'); DATA.cronicas[key]=r.ok?await r.json():null; }catch(e){ DATA.cronicas[key]=null; } return DATA.cronicas[key]; }
function playerName(pid){ const p=DATA.playersById[pid]; return p?p.name:('#'+pid); }

// Penalización por jugar fuera de las demarcaciones del jugador
function rolePenalty(p,role){ if(!role||p.roles.includes(role)) return 0; const d=ROLE_DEM[role]; if(d==='POR'||p.dem==='POR') return 30; if(d===p.dem) return 5; if((d==='DEF'&&p.dem==='MED')||(d==='MED'&&p.dem!=='POR')||(d==='DEL'&&p.dem==='MED')) return 10; return 15; }
function effME(p,role){ return Math.max(1,p.me-rolePenalty(p,role)); }
function lineupME(t,lineup){ return lineup.length?Math.round(lineup.reduce((a,x)=>a+effME(t.players[x.idx],x.role),0)/lineup.length):0; }
