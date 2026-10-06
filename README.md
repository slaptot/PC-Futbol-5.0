# PC Fútbol 5.0 Web

Réplica web (HTML/CSS/JS sin dependencias) de PC Fútbol 5.0 (Dinamic Multimedia, 1996)
con la estética del original y los datos reales extraídos de la carpeta `DBDAT` del juego.

## Créditos y aviso

Los datos, gráficos, fotografías, música y nombres pertenecen a **[Dinamic Multimedia](https://dinamicmultimedia.es/)** y han sido
obtenidos del juego original **PC Fútbol 5.0** y de su **Edición de Oro** (1996-1997). Esta web, que
se inspira en la estética del juego original, es obra de **Alberto Muñoz Fuertes**
(alberto.munoz.fuertes@proton.me) y no busca beneficio alguno, más allá de la nostalgia del juego de
su infancia y de poder rejugarlo con sus ídolos futbolísticos del pasado.

## Últimos cambios

- **PWA**: icono de app propio con el logotipo dorado del menú original, splash nuevo (también las
  imágenes de arranque de iOS) y arranque corregido: el splash ya no tapa el diálogo de contraseña ni
  el de elección de versión, así que la app instalada ya no se queda en "cargando". El manifest ya no
  fuerza la orientación horizontal. Al reinstalar la app en el móvil se ven el icono y el splash nuevos.
  Instalada en iPhone, la cabecera, los diálogos y el splash respetan la zona segura (barra de estado e
  isla), con una franja fija que cubre lo que pasa por detrás al hacer scroll.
- **Velocidad del partido**: LENTA (300 ms por minuto, unos 30 s), MEDIA (150 ms) o RÁPIDA (60 ms, la de
  siempre), en el botón OPCIONES de la oficina o con el botón VEL. durante el partido; se recuerda en el
  navegador (`pcf5_speed`).
- **Oficina reorganizada**: los botones de la copa nacional y de Europa se unen en COMPETICIONES (diálogo con
  el estado del club en cada copa y acceso a cada una), y hay un botón EMPLEADOS que abre la pantalla
  "Personal del club" con los ocho puestos del juego original (segundo entrenador, entrenador de juveniles,
  fisioterapeuta, psicólogo, ojeador, secretario técnico, asistente y cuidador del césped).
- **Empleados** (`js/empleados.js`): por cada puesto hay tres candidatos con estrellas (1 a 5) y sueldo anual
  (12 a 150 millones según estrellas, ±15 %), que se renuevan cada 1 a 3 jornadas. Se contrata uno por
  puesto (fila en verde, CONTRATADO) y se despide pagando el sueldo del resto de la temporada. El sueldo se
  descuenta por jornada con el de los jugadores. Efectos: segundo entrenador +10 % de progreso en el
  entrenamiento por estrella; entrenador de juveniles +4 % para los de 22 años o menos; fisioterapeuta −8 %
  de semanas de lesión; psicólogo −10 % de pérdida de ritmo; ojeador +20 % de figuras en el mercado;
  secretario técnico −2 % en el precio que aceptan los clubes; asistente, informe del rival en la oficina
  (media de su once y jugadores clave); cuidador del césped +1 % de público y −5 % de lesiones en casa.
- **Sustituciones durante el partido**: el partido en directo se simula minuto a minuto con estado
  (`matchSim` en `js/engine.js`), así que se pueden hacer hasta tres cambios con el botón CAMBIO: se elige
  quién sale del once y quién entra de los siete convocados; el que entra ocupa el puesto del que sale.
  Si se lesiona un jugador propio, el partido se detiene y ofrece sustituirlo o dejarlo (rinde a la mitad).
  Los expulsados dejan al equipo con uno menos (menos ataque y defensa, y el rival aprovecha). Los equipos
  de la máquina sustituyen a sus lesionados con el mejor suplente de la misma línea. Los cambios salen en
  el relato (⇄), el campo se redibuja con los dorsales nuevos y las estadísticas cuentan los minutos reales
  (partidos jugados y minutos de titulares, suplentes y expulsados). Los cambios no alteran la alineación
  guardada para el siguiente partido. No hay partido animado.
- **Alineación más legible**: la tabla de escritorio funde ROL y POS en una sola columna POS / ROL (puesto en
  el once, o demarcación natural para el resto, con la lesión o sanción) y elimina DEM, redundante con el rol;
  el espacio va a la columna del nombre, que ya no se corta.
- **Sanciones**: expulsión = 1 partido (2 si es roja directa) y acumulación de amarillas (5 en liga, 3 en
  copa) = 1 partido, que se cumplen en la misma competición (liga o copas). Los sancionados no pueden ser
  titulares ni convocados (la alineación los agrupa en SANCIONADOS y la oficina avisa "SANCIONADOS EN EL
  ONCE"), la alineación automática de todos los equipos los excluye, y la pantalla de Lesionados lista
  sancionados y amarillas acumuladas, con los iconos del juego original (tarjeta amarilla, doble amarilla,
  roja y la cruz de lesionado, `img/ui/ico_lesion.png` extraída de la Edición de Oro), que también se usan
  en la columna EN de la alineación (fila en rojo para los sancionados y en naranja para los lesionados) y en
  los sucesos del partido. El aviso de cada sanción sale tras el partido. Se reinician al
  empezar temporada. (`G.cards`, `G.susp` en `js/market.js`.)
- **Fotos en los sucesos del partido**: cada línea del partido en directo y del resumen (gol, tarjeta,
  expulsión, lesión) lleva la foto en miniatura del jugador (`img/foto`, precargada), a 16 px en
  escritorio y 22 px en móvil. Comprobado en el móvil.
- **Eliminatorias de copa manga a manga**: tras el sorteo se vuelve a la oficina, y en las eliminatorias
  a doble partido cada pulsación de JUGAR juega una manga (IDA o VUELTA, la oficina indica cuál y si es en
  casa o fuera, con el resultado de la ida), de modo que se puede cambiar la alineación antes de cada
  partido. Los demás equipos juegan la misma manga. Antes, el sorteo y los dos partidos iban seguidos.
  Comprobado en el móvil.
- **Precarga de imágenes** (comprobada en el móvil): tras arrancar, se descargan en segundo plano las
  4.671 imágenes y fuentes de uso frecuente (fondos y botones de `img/ui`, fuentes, banderas, escudos,
  iconos de camiseta, equipaciones, bombo, fotos pequeñas de jugadores, campos, entrenadores y árbitros;
  12,1 MB en total, lista en `data/precache.json` generada por `tools/build_precache.py`). En móvil lo
  hace el propio service worker al activarse y las guarda en su caché, así que al cambiar de pantalla ya
  no hay que esperar a la red; en escritorio quedan en la caché HTTP del navegador, aunque desde el 7 de octubre de 2026 el service worker también se registra en
  escritorio y las guarda igual que en móvil (comprobado). Se omite si el
  navegador tiene activado el ahorro de datos.
- **Fotos grandes de jugadores** (`img/fotobig`, 25 MB): no se precargan todas, sino por plantilla al
  entrar en ella: al abrir un equipo en la base de datos, al cargar la partida (equipo propio) y al abrir
  Fichajes (jugadores del mercado), `prefetchPhotos` pide sus fotos en segundo plano. Mientras llega la
  grande, la ficha muestra ampliada la foto pequeña, que ya está en caché. Comprobado en el móvil.
- **Bajas fuera de las plantillas**: los 94 jugadores que el campo `f2` del juego marca como baja (ya no
  estaban en el club en la 96-97: Bakero, Bebeto, Romario en el Valencia…) se retiran de las plantillas
  jugables al cargar los datos, con lo que desaparecen los duplicados (Prosinecki jugaba a la vez en el
  Barcelona y en el Sevilla). Siguen en la base de datos, en un grupo "Bajas 96-97" al final de cada
  plantilla, con su ficha y biografía. La columna SIT de la plantilla y la ficha indican ALTA (fichaje de
  esta temporada), FILIAL (ficha del equipo B) o BAJA. Las partidas guardadas se migran solas
  (`migrateBajas`: convierte los índices de alineación, lesiones, traspasos y estadísticas; si un titular era
  una baja se regenera la alineación automática). Comprobado en el móvil.
- **Falta de ritmo**: los jugadores del club que no juegan pierden media poco a poco a partir de la
  tercera jornada sin jugar (1 punto por atributo con probabilidad 0,25 cada jornada, tope 8 puntos por
  atributo) y la recuperan al volver a jugar; los lesionados no cuentan. El aviso sale con el del
  entrenamiento tras cada jornada. La base de datos del juego no guarda mínimos por jugador (los campos
  desconocidos del registro son índices y códigos, no topes), así que el tope se define respecto al valor
  del jugador con su entrenamiento.
- **Escudos, iconos de camiseta y equipaciones sin fondo negro** en toda la web (`tools/esc_alpha.py`),
  con copia de los originales fuera del repositorio, comprobados en el móvil. Las banderas no lo necesitan. En móvil, el reordenado de las pantallas ya no se ejecuta en bucle: la tira de ligas de
  Fichajes se desplaza y la app consume menos batería.
- **Avisos push** con alerta dentro del juego y script de envío (`tools/push.py`), probados en iPhone
  con la app instalada.
- **Créditos**: datos de Dinamic Multimedia (PC Fútbol 5.0 y Edición de Oro) y autoría de la web, en
  "Acerca de", en Instrucciones y en este README.
- **Temporada completa**: fin de temporada con campeones de todas las competiciones, ascensos y
  descensos en las seis ligas, clasificación europea, premios Pichichi, Zamora y mejor entrenador.
- **Copas**: sorteos animados con el bombo original, rondas repartidas por la temporada (finales
  europeas en mayo y Copa en junio), finales a partido único en campo neutral con taquilla al 50 % y
  pantalla de campeón y finalista.
- **Economía**: entradas con modelo de asistencia (clasificación, rival, derbis, lleno), ofertas de
  televisión, sueldos según valor de mercado, premios estipulados y balance por jornada en Finanzas.
- **Mercado de fichajes** variable y aleatorio con el popup de oferta original; los vendidos pasan al
  mercado. **Lesiones** con los 17 tipos del juego y curación de pago.
- **Versión móvil** vertical pantalla a pantalla (alineación, entrenamiento, partido en directo,
  táctica, fichajes, finanzas, premios, sorteos, finales…), elegible al detectar un móvil.

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
  liga a lo largo de toda la temporada (finales europeas en mayo y final de Copa en junio), con el
  sorteo de cada ronda animado con el bombo del juego original, y una pantalla de final con el
  campeón y el finalista; las finales se juegan a partido único en un campo neutral elegido al azar,
  con un precio de entrada según el cartel y la taquilla repartida al 50 % entre los finalistas (`IMG.PKF`, `SORTEO.BMP`) y los
  trofeos de cada competición; tu equipo entra en Europa según su puesto de la temporada 95-96 (campeón: Copa de Europa;
  2º-5º: UEFA). Hay mercado de fichajes variable: cada jornada caducan unos jugadores transferibles
  y aparecen otros de todas las ligas (España, Inglaterra, Italia, resto de Europa y América), y cada
  pocas jornadas sale una figura de 80 a más de 90 de media. Al pulsar un jugador se abre el popup
  "Hacer oferta" con los conceptos del juego original (`MANAGER.EXE`): oferta al equipo, ficha anual,
  años de contrato, cláusula de rescisión, prima por gol, casa y coche, partidos para renovación y
  libertad por descenso; el club acepta si la oferta cubre su precio y el jugador si la ficha y las
  condiciones le convencen. El presupuesto (millones de pesetas según aforo y socios) recibe la
  taquilla de los partidos en casa (pantalla Finanzas: el precio de la entrada se fija a voluntad y la
  asistencia depende de la posición en la liga, la racha, el precio y el rival, con lleno casi seguro
  en los derbis; con el estadio lleno el público empuja al equipo local en los últimos diez minutos si
  no va ganando), los derechos de televisión (al empezar cada liga tres cadenas ofrecen contratos
  según la posición del año anterior: fijo, fijo más prima por victoria, o fijo más partidos
  televisados) y paga cada jornada los sueldos de la plantilla (la ficha anual de cada jugador es el
  8 % de su valor de mercado, salvo la pactada en su contrato al ficharlo); el balance jornada a jornada se
  consulta en Finanzas. Los premios están estipulados (botón "Premios en juego" en Finanzas): por la
  posición final en la liga (de 600 M al campeón de 1ª a 80 M al resto; en 2ª de 150 a 40), por cada
  ronda jugada de Copa (15 a 120 M), Copa de Europa (120 a 400 M), Recopa (80 a 250 M) y UEFA (60 a
  250 M) y por el título (150, 500, 300 y 250 M), más la taquilla de los partidos de copa en casa.
  También se venden jugadores con ofertas de otros clubes. Y lesiones: se producen en los partidos, duran de 1 a 8
  semanas y el jugador no puede alinearse mientras tanto; cada lesión es de uno de los 17 tipos del
  juego original (gripe, sobrecarga, esguince de tobillo, rotura fibrilar, menisco, fractura de tibia
  y peroné, rotura de ligamentos…), con su duración, y desde la lista de lesionados se puede pagar
  el tratamiento médico (de 3 a 400 millones según la lesión) para recuperar al jugador de inmediato. Entrenamiento semanal por áreas (físico, fuerza, técnica, ataque,
  defensa, porteros) que hace evolucionar los atributos según la edad, con riesgo de lesión si se
  sobrecarga, y estadísticas de temporada (partidos, minutos, goles y tarjetas) de todos los
  jugadores de la partida, con rankings de goleadores y tarjetas. Los partidos se simulan con los atributos de los jugadores
  (VE, RE, AG, CA, pase, regate, remate, tiro, entradas, portero). La partida se guarda en `localStorage`.
- **Fin de temporada y temporadas siguientes**: cuando se agotan las jornadas y las rondas de copa,
  la oficina ofrece "Fin de temporada": pantallas con los campeones de las dos divisiones (con la
  clasificación final, descensos en rojo y ascensos en verde), de la Copa nacional, Copa de Europa,
  Recopa y UEFA (final y semifinales, y hasta dónde llegó tu equipo) y un balance con la posición, los
  títulos, el ascenso o descenso, la competición europea del año siguiente y los ingresos, además de
  los premios individuales de la liga: Pichichi (máximo goleador), Zamora (portero del equipo menos
  goleado) y mejor entrenador (mayor mejora sobre la posición esperada por la plantilla), con 50 M
  de prima por cada uno que gane tu club. Al empezar
  la nueva temporada bajan los 3 últimos de 1ª (4 en Italia) y suben los primeros de 2ª, se genera un
  calendario nuevo a doble vuelta para las dos divisiones del país, los jugadores cumplen un año más y
  tu equipo entra en la Copa de Europa (campeón de liga o vigente campeón), la Recopa (campeón de copa)
  o la UEFA (2º a 5º o vigente campeón) según lo conseguido. Las seis ligas (España, Inglaterra e
  Italia) se simulan jornada a jornada, con sus ascensos y descensos y calendarios nuevos cada año, y
  desde Clasificación se puede consultar cualquiera de ellas. Los ascensos y descensos y el historial
  de temporadas se guardan con la partida.
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

Al abrir la web en un teléfono o tableta (user agent o pantalla táctil pequeña) se pregunta qué
versión usar, y la elección se recuerda (`?ui=mobile` o `?ui=desktop` la fuerzan):

- **Versión móvil** (`js/mui.js`): las mismas pantallas remaquetadas en vertical. Cada pantalla se
  construye igual que en escritorio y un reflujo automático coloca la barra superior, los paneles,
  textos, listas y botones en columna ordenados por su posición original, con botones y filas más
  altos para el dedo, tablas con desplazamiento horizontal cuando no caben, el menú principal como
  lista de botones, los diálogos a pantalla casi completa y una barra inferior fija con los botones de
  acción de la pantalla (Volver, Imprimir…), los interruptores de audio y el cambio a escritorio.
  El doble click de Alineación es una pulsación larga.
- **Escritorio en el móvil**: el juego original a 640x480 escalado al visor en horizontal (en vertical
  aparece el aviso de girar el móvil), con zoom y selección bloqueados y pulsación larga. Desde la
  barra de audio se puede pasar a la versión móvil.

La versión de escritorio en un ordenador no cambia. Hay `manifest.json` e iconos para añadir la web a
la pantalla de inicio como app, y un `sw.js` (registrado en todos los modos, también en escritorio, desde el 7
de octubre de 2026) que guarda en caché la aplicación, precarga al activarse las imágenes y fuentes de `data/precache.json` y guarda
bajo demanda el resto de imágenes, datos y música, para jugar sin conexión. Tras cambiar imágenes hay que
regenerar la lista (`python3 tools/build_precache.py`) y subir la versión de caché `V` en `sw.js`.

Espacio que ocupa la caché en el móvil: la aplicación y los datos (unos 23 MB, de ellos 22 MB de
`teams.json`), la precarga (12 MB) y, bajo demanda, las fotos grandes que se hayan visto (hasta 25 MB) y
la música que se haya oído (hasta 25 MB). Máximo unos 85 MB y 7.000 entradas, muy por debajo de lo que
permiten Safari y Chrome (cientos de MB por sitio). Al cambiar la versión `V` se borra la caché anterior,
así que nunca se acumulan versiones. Al desarrollar en `localhost` el service worker también está
activo: tras cambiar imágenes o datos hay que subir `V` o borrar el almacenamiento del sitio en el navegador. Safari borra la caché de las webs que no se abren en 7 días, pero no
la de la app instalada en la pantalla de inicio. Como el navegador móvil puede borrar el almacenamiento local, "Guardar partida" permite
exportar la partida a un archivo JSON e importarla después. Cámara, instalación y caché exigen HTTPS
(o `localhost`).

Instalada como app muestra una pantalla de arranque (splash) con el icono propio, también en iOS (imágenes
en `img/splash/`). El icono (`img/icon-*.png`, `img/apple-touch-icon.png`) y las imágenes de arranque se generan
con `python3 tools/make_icons.py` a partir del logotipo del menú original. Si al arrancar hay que pedir la
contraseña o elegir versión, el splash se retira antes para no tapar el diálogo. El botón "Avisos" de la barra inferior activa los avisos push: el jugador acepta
el permiso, el navegador se suscribe con la clave pública VAPID de `js/push.js` y puede copiar su
suscripción para enviársela al administrador. "Probar aviso" muestra uno de ejemplo sin servidor.

### Envío de avisos a los jugadores

Probado en iPhone con la app instalada (6 de octubre de 2026). Pasos para el administrador:

1. Cada jugador activa los avisos en el juego (en iOS sólo funcionan con la app añadida a la pantalla
   de inicio), pulsa "Copiar suscripción" y envía el JSON resultante (`endpoint` + `keys`).
2. Guardar las suscripciones en una lista JSON **fuera del repositorio** (por ejemplo
   `../suscripciones.json`, junto a la clave privada VAPID `../pcfutbol-vapid-private.b64`). Ni la
   clave ni las suscripciones deben subirse a GitHub: el repositorio es público.
3. Instalar `pywebpush` (`pip install pywebpush`) y enviar:

```bash
python3 tools/push.py ../suscripciones.json "Título" "Texto del aviso" "https://slaptot.github.io/PC-Futbol-5.0/"
```

El aviso llega como notificación del sistema y, al abrirlo, el juego muestra una alerta con el título,
el texto y el enlace opcional. El script imprime "Enviados N de M"; una suscripción caducada da error
y hay que pedir al jugador que la copie de nuevo. El contacto VAPID (`sub`) del script es el correo
del autor; Apple rechaza direcciones de ejemplo. Las claves VAPID se generaron una vez con
`openssl ecparam -genkey -name prime256v1`; la pública está en `js/push.js` y si se cambia, los
jugadores deben volver a activar los avisos.

Los escudos (`img/esc`, `img/escbig`), sus iconos pequeños (`img/nano`, `img/ridi`: camisetas de las
listas) y las equipaciones (`img/cam`) se muestran sin el fondo negro original: `tools/esc_alpha.py` vuelve
transparente el color exacto del fondo (el de las esquinas, negro puro, índice 0 de la paleta) conectado con
el borde de cada imagen; el negro del dibujo (bordes, murciélago del Valencia, pantalones) es otro tono y se
conserva. Se aplica con `--dirs` a cualquier carpeta de `img/`. Las banderas (`img/band`, `img/bandbig`)
no se tocan: son rectángulos ondeando que ocupan toda la imagen, sin fondo, y en diez de ellas el negro
del borde forma parte del dibujo (Alemania, Bélgica, Estonia…). Las fotos de jugadores, árbitros y campos
tampoco tienen fondo que recortar. Los
originales se guardan fuera del repositorio (`../escudos_originales/`) y también están en el historial de git.

## Publicación en GitHub Pages con contraseña

La web se publica desde la rama `master` en GitHub Pages para poder probarla en el móvil por HTTPS.
Fuera de `localhost` pide una contraseña antes de cargar (`js/auth.js`): se compara el hash SHA-256
de lo tecleado con el guardado en el código y se recuerda en el navegador. Es una barrera contra el
acceso casual, no una protección real: quien conozca las URL de los archivos puede descargarlos.
Para cambiar la contraseña: `python3 tools/setpass.py <nueva>` y subir `js/auth.js`.

## Estructura

- `index.html`, `css/style.css`, `js/*.js`: la aplicación (pantalla lógica de 640x480 escalada).
  `data.js` carga los JSON y define roles y medias (al cargar, cada equipo queda con `players`, la
  plantilla jugable, y `bajas`; cada jugador conserva en `idx0` su índice original, que usan biografías y
  buscador, y `sitLabel`/`sitText` dan su situación); `engine.js` formaciones y simulación; `ui.js`
  widgets (botones, paneles, tablas, diálogos, campo); `screens.js` menú, base de datos, seguimiento e
  historia; `manager.js` el Liga Manager (oficina, alineación, táctica, partidos); `cups.js` copas;
  `market.js` fichajes y lesiones; `training.js` entrenamiento y estadísticas; `audio.js` música y
  efectos; `search.js` buscador; `print.js` PDFs; `custom.js` equipo propio y foto del entrenador; `mobile.js` detección de móvil,
  apaisado, pulsación larga, PWA y exportar/importar partida; `mui.js` la versión móvil en vertical; `season.js` fin de temporada,
  ascensos y descensos, calendario generado y nueva temporada.
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
- **Campos del registro de jugador** (`f1`–`f4`, `c2` en `teams.json`), descifrados por estadística sobre
  los 12.591 jugadores (6 de octubre de 2026):
  - `f4` = línea: 0 portero, 1 defensa, 2 medio, 3 delantero (coincide al 99 % con la demarcación).
  - `f2` = situación en la plantilla 96-97: 0 continúa, 1 alta de esta temporada (el 91 % llegó en el
    96: Ronaldo, Mijatovic, Suker, Vieri), 2 filial/canterano con ficha del equipo B (Arnau, Víctor,
    Etxeberria), 3 baja: ya no está en el club (Bakero, Bebeto, Prosinecki en el Barcelona, que aparece
    también en el Sevilla como alta). Los 94 jugadores con `f2`=3 siguen hoy en las plantillas del manager.
  - `f1` = número de orden de la ficha en la plantilla (1–25, único por club; 99 = sin ficha del primer
    equipo, es decir, filiales y bajas). No es el dorsal.
  - `c2` = tono de piel del jugador para los gráficos del partido (1 claro, 2 oscuro, 3 intermedio):
    lo confirman las listas de cada valor (Ronaldo, Amunike, Seedorf, Andy Cole, Ince con 2; Naybet,
    Chaouch con 3) y que no depende del club ni del pasaporte (Donato y Mauro Silva, españoles, son 2).
    No tiene relación con la regla de extracomunitarios del juego y la web no lo usa.
  - `f3` (valores 1, 2, 3, 5 y 6; parece una máscara de bits 1/2/4) sigue sin descifrar: no depende de
    la demarcación ni de la edad, varía por liga (Italia casi todo 3, Inglaterra inferior mitad 6) y no
    se corresponde con fotos, biografías, internacionalidades ni cantera. No hay ningún campo de mínimo
    ni de potencial por jugador: los topes de la falta de ritmo son propios de la web.
