# PC Fútbol 5.0 Web

Réplica web (HTML/CSS/JS sin dependencias) de PC Fútbol 5.0 (Dinamic Multimedia, 1996)
con la estética del original y los datos reales extraídos de la carpeta `DBDAT` del juego.

## Ejecutar

Necesita servirse por HTTP (usa `fetch` para cargar los JSON):

```bash
python3 serve.py 8765
```

y abrir <http://localhost:8765>. Cualquier otro servidor estático sirve igual.

## Contenido

- **Liga Manager**: elige una liga (1ª y 2ª División, Premier League, First Division, Serie A o
  Serie B, temporada 96-97) y un equipo, prepara alineación y táctica y juega jornada a jornada.
  Incluye la Copa nacional (Copa del Rey, FA Cup o Coppa Italia, 32 equipos) y las competiciones
  europeas (Copa de Europa, Recopa y UEFA) en eliminatorias a doble partido intercaladas con la
  liga; tu equipo entra en Europa según su puesto de la temporada 95-96 (campeón: Copa de Europa;
  2º-5º: UEFA). Hay mercado de fichajes (presupuesto en millones de pesetas según aforo y socios,
  valoración de cada jugador por media y edad, compras a cualquier club de la base de datos y
  ventas con ofertas de otros clubes) y lesiones: se producen en los partidos, duran de 1 a 8
  semanas y el jugador no puede alinearse mientras tanto (lista de lesionados en la oficina y en
  la pantalla de alineación). Entrenamiento semanal por áreas (físico, fuerza, técnica, ataque,
  defensa, porteros) que hace evolucionar los atributos según la edad, con riesgo de lesión si se
  sobrecarga, y estadísticas de temporada (partidos, minutos, goles y tarjetas) de todos los
  jugadores de la partida, con rankings de goleadores y tarjetas. Los partidos se simulan con los atributos de los jugadores
  (VE, RE, AG, CA, pase, regate, remate, tiro, entradas, portero). La partida se guarda en `localStorage`.
- **Alineación y táctica**: en Alineación un click selecciona un jugador y muestra sus parámetros;
  un doble click sobre un convocado o no convocado lo marca para cambiar (fila naranja) y el siguiente
  click sobre cualquier jugador (titular, convocado o no convocado) hace el intercambio; también hay
  botones Sustituir, Quitar del once, Poner titular, Convocar, Desconvocar y Automática. La columna ROL
  es la demarcación natural del jugador y POS la posición que ocupa en el esquema. En Táctica se
  resaltan (★) las posiciones en las que puede jugar cada jugador según la base de datos; jugar fuera
  de su demarcación rebaja su media efectiva (↓, de 5 a 30 puntos según la distancia a su rol) y, con
  ella, la fuerza del equipo en la simulación. Las tablas tienen anchos fijos: los nombres largos se
  recortan con puntos suspensivos en vez de descuadrar la pantalla.
- **Impresión en PDF** (botón Imprimir PDF): ficha completa del jugador, plantilla y datos del club,
  biografía del entrenador, árbitros y crónicas de cada partido, maquetados con los fondos, fuentes y
  paneles del juego. Se abre el diálogo de impresión del navegador para guardarlos como PDF.
- **Música y efectos** originales (ver `snd/`), con interruptores "Música" y "Sonido" en la barra
  inferior que detienen el audio de verdad y se recuerdan entre sesiones.
- **Base de datos**: 645 equipos de la *Edición de Oro* (España, Inglaterra, Italia, resto de Europa
  y América), 12.600 jugadores con fotos, biografías y trayectorias (330 equipos con datos
  completos), entrenadores, estadios y árbitros.
- **Seguimiento manual**: resultados reales de la temporada 96-97 completa en las seis ligas, con
  clasificación por jornada y, en 1ª División, la crónica de cada partido (ficha, goles, tarjetas,
  alineaciones con cambios y declaraciones de los entrenadores) extraída de `JORN1xx.DBC`.
- **Historia**: clasificaciones de todas las ligas 1928-29 a 1995-96, y todas las finales de la
  Copa del Rey (desde 1902), Copa de Europa, Recopa, UEFA, Supercopas de España y de Europa e
  Intercontinental, con alineaciones, estadios, árbitros y rankings históricos (`C*.DBC`).
- **Partido amistoso** entre dos equipos cualesquiera.
- **Equipo propio**: al elegir equipo en Liga Manager, "Crear equipo" permite ponerle nombre, elegir la
  liga y la plaza que ocupa (sustituye a un club existente, heredando estadio y calendario) y fichar
  entre 16 y 25 jugadores de toda la base de datos filtrando por porteros, defensas, medios y
  delanteros, con buscador por nombre o club. Los jugadores salen de sus clubes de origen y el
  equipo se reconstruye al cargar la partida. El entrenador eres tú: con "Hacer foto" puedes ponerle
  tu cara usando la cámara del ordenador (el navegador pide permiso; también vale un archivo de
  imagen), tanto al crear el equipo como después desde la pantalla Club del manager (botón Foto).
  La foto se recorta al formato de las fotos de entrenador del juego (124x182), se guarda con la
  partida y aparece en la plantilla y en el PDF del equipo. También se pueden poner el nombre y el
  aforo del estadio y elegir su foto entre los 61 campos del juego (por defecto se heredan los del
  club sustituido); todo ello se puede cambiar después desde la pantalla Club del manager con los
  botones Editar, Campo y Foto.
- **Buscador global** (botón Buscar en el menú y en la base de datos): texto libre, sin distinguir
  mayúsculas ni acentos, por palabra, frase completa o varias palabras, sobre equipos, jugadores y sus
  biografías, entrenadores, crónicas y declaraciones, árbitros, finales de copa e historia de la Liga.
  El índice se genera con `tools/build_search.py` (`data/search.json`) y cada resultado abre su ficha.

## Versión móvil

La misma web detecta teléfonos y tabletas (user agent o pantalla táctil pequeña; se puede forzar con
`?mobile=1` o desactivar con `?mobile=0`, y la elección se recuerda) y activa el modo móvil sin tocar
la versión de escritorio: se juega en horizontal (en vertical aparece el aviso de girar el móvil), el
escenario 640x480 se escala al visor completo respetando las zonas seguras, se bloquean el zoom y la
selección de texto, las filas de las tablas son más altas para el dedo, no hay sonido de paso de ratón
y el doble click de Alineación se sustituye por una pulsación larga (medio segundo, con vibración).
Incluye `manifest.json` e iconos para añadirla a la pantalla de inicio como app a pantalla completa, y
un `sw.js` (sólo se registra en modo móvil) que guarda en caché la aplicación y, bajo demanda, las
imágenes, datos, fuentes y música ya vistos, para poder jugar sin conexión. Como el navegador móvil
puede borrar el almacenamiento local, el diálogo "Guardar partida" permite exportar la partida a un
archivo JSON e importarla después. Cámara, instalación y caché exigen servir la web por HTTPS (o
`localhost`).

## Publicación en GitHub Pages con contraseña

La web se publica desde la rama `master` en GitHub Pages para poder probarla en el móvil por HTTPS.
Fuera de `localhost` pide una contraseña antes de cargar (`js/auth.js`): se compara el hash SHA-256
de lo tecleado con el guardado en el código y se recuerda en el navegador. Es una barrera contra el
acceso casual, no una protección real: quien conozca las URL de los archivos puede descargarlos.
Para cambiar la contraseña: `python3 tools/setpass.py <nueva>` y subir `js/auth.js`.

## Estructura

- `index.html`, `css/style.css`, `js/*.js`: la aplicación (pantalla lógica de 640x480 escalada).
  `data.js` carga los JSON y define roles y medias; `engine.js` formaciones y simulación; `ui.js`
  widgets (botones, paneles, tablas, diálogos, campo); `screens.js` menú, base de datos, seguimiento e
  historia; `manager.js` el Liga Manager (oficina, alineación, táctica, partidos); `cups.js` copas;
  `market.js` fichajes y lesiones; `training.js` entrenamiento y estadísticas; `audio.js` música y
  efectos; `search.js` buscador; `print.js` PDFs; `custom.js` equipo propio y foto del entrenador; `mobile.js` modo móvil
  (detección, apaisado, pulsación larga, PWA, exportar/importar partida).
- `data/`: JSON generados desde los `.DBC` (`teams.json`, `bio/<id>.json`, `leagues.json`,
  `cronicas/<liga>-<jornada>.json`, `cups.json`, `referees.json`, `liga_history.json`). Los datos salen de la
  carpeta *Edición de Oro* (`Eq022022/Eq030022/Eq036022.pkf`, `JORN*.DBC`, `PREMIER/FIRST/SERIEA/SERIEB.DBC`).
- `img/`: escudos (`esc`, `escbig`, `nano`, `ridi`), camisetas (`cam`), banderas (`band`, `bandbig`),
  fotos (`foto` 32x32, `fotobig` 124x182), estadios (`campo`), entrenadores (`entr`), árbitros (`arb`)
  y gráficos de interfaz (`ui`), todos convertidos de los BMP del juego con su paleta original.
- `fonts/`: las fuentes bitmap del juego (`WINFONTS/*.FNT`) convertidas a TTF.
- `snd/`: la música original (`MUSICAS.PKF`, módulos S3M renderizados a MP3 con openmpt123) y los
  efectos de `SONIDOS/*.RAW` (PCM 8 bits 11 kHz convertidos a WAV): paso de ratón, clic, etc.
  La música cambia según la zona (menú, base de datos, manager) y se puede silenciar desde la barra
  inferior; el navegador la arranca tras la primera pulsación.
- `tools/`: scripts Python usados para la extracción.

## Formatos del juego (ingeniería inversa)

- **PKF**: contenedor de Dinamic. Entradas de directorio (tag `02`) de 38 bytes: nombre de 25 bytes
  cifrado por posición con `key[i] = (i*i - 34*i) & 0xff` (XOR), offset u32, tamaño u32, id de carpeta.
  Las carpetas van al principio (tag `01`), y los punteros con tag `04`. Los bloques de directorio son
  de 32 entradas encadenadas.
- **DBC / DAT**: cadenas con prefijo de longitud u16 y caracteres XOR `0x61`. Los BMP interiores
  llevan cabecera `DM` sin paleta (usan `DAT.PKF/MANAGER.PAL`).
- `tools/teamparse.py` documenta el registro de equipo y jugador (`EQUIPOS.PKF`; versiones 500/505/510
  del registro), `tools/jorn.py` las crónicas (`JORN1xx.DBC`: cabecera de 10 bytes por partido, textos
  en líneas de 120 caracteres en CP437, alineación de 12 entradas, eventos (33 gol, 34 gol en propia
  puerta a favor, 35 penalti, 67 tarjeta) y declaraciones) `tools/cups.py` las copas (`C1`: ediciones con alineación; `C2/C3/C4`: ranking de 50 equipos y finales;
  `C5/C6/C7`: ediciones con dos partidos, estadio, fecha, árbitro, público y alineaciones) y
  `tools/export2.py` genera todos los JSON.
