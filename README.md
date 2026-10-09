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

- **Escudos reales en la prueba 2024-25**: CD Mirandés, Burgos CF y SD Eldense usan su escudo real de Wikimedia Commons (`tools/update2026/build_test_escudos_libres.py`): Mirandés (CC BY-SA 4.0, panel de 2010 de `Escudos-Mirandés.jpg`), Burgos (CC BY-SA 4.0, `Burgos.png`) y Eldense (CC BY 4.0, `CD Eldense.jpg`, de su autor en Commons). Girona y FC Cartagena siguen con un escudo dibujado, porque no hemos encontrado ninguno con licencia libre.
- **Pretemporada de cinco partidos con partido de presentación**: como el original, la pretemporada tiene cinco partidos. Los cuatro primeros son de preparación y el quinto es el de presentación: se juega en casa y cuesta dinero, que el club paga al rival. El precio depende de la media ME del rival: 20 millones con media 60, 60 con 85, con mínimo 10 y máximo 80 (`preFee`, `js/pretemporada.js`). Si el club tiene trofeo, el trofeo hace de presentación y su rival cobra el mismo precio. Planificar automáticamente pone el más fuerte como presentación.
- **Importar abre la liga**: al importar un archivo, el juego se recarga y abre la partida directamente en la LIGA MANAGER, en la jornada guardada (no vuelve al menú). La lógica de CONTINUAR es ahora `continueSaved` (`js/manager.js`), y el arranque la usa si hay una importación pendiente (`pcf5_resume`, `js/app.js`).
- **Guardar también en archivo en escritorio**: GUARDAR guarda en el navegador y ofrece EXPORTAR (descarga `pcfutbol5-<club>-j<jornada>.json`) e IMPORTAR, igual que en el móvil (`js/manager.js`, `save`).
- **Imágenes en el palmarés**: cada título muestra su trofeo. Las copas usan los trofeos grandes del juego (`img/sorteo`: Copa del Rey, Copa de Europa, Recopa y UEFA). La liga usa `img/palmares/liga.png`, convertido de `IMG/COPAS/LIGA BIG.BMP` con fondo transparente. Los trofeos de pretemporada y los premios individuales no tienen imagen, porque el juego no trae una para ellos.
- **Palmarés**: nueva pantalla PALMARÉS en el grupo CLUB de la oficina, con los títulos de la partida: ligas (1.º de su división), copas, trofeos de pretemporada ganados y premios individuales del club (Pichichi, Trofeo Zamora, mejor entrenador). Se guarda con la partida (`G.palmares`); las partidas anteriores lo reconstruyen de su historial de temporadas. Al cerrar una temporada se calculan los premios individuales aunque no se haya abierto la pantalla PREMIOS (`js/season.js`, `palmaresTemporada`, `scrPalmares`).
- **Trofeos de verano por club**: si el club tiene torneo propio, su partido es el último de la pretemporada, en casa, contra un invitado sorteado de la lista. Lista: Real Madrid (Trofeo Santiago Bernabéu), Barcelona (Trofeo Joan Gamper), Deportivo (Trofeo Teresa Herrera), Valencia (Trofeo Naranja) y Cádiz (Trofeo Carranza, que no se puede elegir porque no tiene liga en los datos). Los nombres y los invitados son de conocimiento general, no de los archivos del juego (`js/pretemporada.js`, `TROFEOS`). El trofeo ocupa el cuarto hueco de la pretemporada.
- **Pretemporada con balance**: primero se planifican hasta 4 amistosos (rival y campo, con el mapa); después EMPEZAR PRETEMPORADA los juega en orden, en directo; y al pulsar EMPEZAR LIGA se aplica el balance. Si gana más de lo que pierde, la plantilla mejora; si pierde más, empeora. El número de cambios sale de los puntos ponderados por el nivel del rival (ME) y el campo: ganar fuera o a un rival más fuerte vale más, y perder en casa o contra uno más débil pesa más (máximo 3 intentos). Cada intento da un 50 % de subir o bajar un atributo a cada jugador con 45 minutos o más en la mitad de los amistosos. Los cambios se guardan en `G.mods` (`js/pretemporada.js`, `preBalance`).
- **Logotipos en las ofertas de televisión**: cada oferta muestra el logo de su cadena (`img/tv/`, sobre fondo blanco para que se lea). Fuentes en Wikimedia Commons: Canal+ (`Logo Canal+ 1995.svg`, dominio público), TVE (`La Primera TVE1 (1995-1999).png`, CC BY-SA 4.0), Antena 3 (`Antena 3 logo 1997.png`, CC BY-SA 2.0), ITV (`ITV logo 1989.svg`), BBC (`BBC1-1991.svg`), Sky Sports (`Sky Sports 1 logo 1996 - 1997.jpg`), Mediaset (`Canale5.png`, fecha no confirmada) y RAI (`Rai 1 logo.svg`, diseño posterior a 1996). Telepiù no tiene logo: no he encontrado uno de la época. Son marcas de sus dueños, usadas en un juego de nostalgia sin fines comerciales.
- **Contratos de televisión por país**: si el club es italiano, las ofertas son de RAI (fijo), Mediaset (prima por victoria) y Telepiù (partidos televisados); si es inglés, de BBC, ITV y BSkyB. Los clubes españoles mantienen Canal Plus, TVE y Antena 3. Los nombres italianos e ingleses no están en los archivos del juego original: son cadenas de la época puestas por mí, y los importes siguen la misma fórmula que los españoles (`js/finance.js`, `tvChannels`).
- **Esquema propio de cada club**: los 22 clubes de 1ª juegan con el esquema que la previa de la temporada 96-97 (`ROBIN0.DBC`, «Sistema de juego») da para ellos, en vez de 4-4-2 para todos. El Barcelona empieza en 4-2-3-1, el Deportivo en 5-4-1, el Valencia y el Valladolid en 5-3-2, el Oviedo en 4-2-3-1, el Athletic en 3-2-3-2 y el Hércules en 4-1-3-2 (dos esquemas nuevos). El resto sigue en 4-4-2. Lo usan la alineación inicial, las jornadas de la máquina, las copas y los amistosos; las partidas ya empezadas conservan su esquema (`js/engine.js`, `TEAM_FORMATION`, `teamFormation`).
- **Equipo aleatorio en CREAR EQUIPO**: el botón ALEATORIO genera una plantilla al azar con entre 2 y 3 porteros y el mismo número de defensas, medios y delanteros que el club que ocupa la plaza, y ningún jugador por debajo de la media más baja de ese club (sin contar registros vacíos con media 0), con jugadores de otros clubes de la base de datos y una media igual a la del club o hasta 4 puntos superior, nunca inferior (medida como en la ficha del club: los 11 mejores con su esquema). La etiqueta de media de la pantalla de creación usa ahora esa misma medida (`js/custom.js`, `randomSquadFor`).
- **Pretemporada y selección de equipo por mapa**: cada partida nueva y cada nueva temporada empieza con una
  pretemporada antes de la primera jornada. Hasta 4 amistosos contra el rival que elijas, en casa o fuera; no cuentan
  para la liga, en casa dan taquilla al 50 % y devuelven ritmo a quien juega. Y un campamento, una sola vez: descanso
  (+10 de moral), trabajo normal (una semana de entrenamiento) o intensivo (dos semanas, +10 de forma y -8 de moral).
  Como en el original, se elige país en un mapa de Europa, después la división y el equipo; el mismo selector sirve
  para elegir rival. Además de España, Inglaterra e Italia, los amistosos admiten los otros 42 países con clubes
  en la base de datos (36 de Europa y 6 de América: Argentina, Brasil, Chile, Colombia, Paraguay y Uruguay), en una
  lista por continente y sin divisiones, porque esos clubes no tienen liga en los datos. No se pueden elegir como
  equipo propio (`js/pretemporada.js`, `scrMapa`, `scrPaises`, `preOficinaPanel`). Las partidas guardadas en mitad de una
  temporada no cambian: la pretemporada empieza con la siguiente temporada.
- **PWA**: icono de app propio con el logotipo dorado del menú original, splash nuevo (también las
  imágenes de arranque de iOS) y arranque corregido: el splash ya no tapa el diálogo de contraseña ni
  el de elección de versión, así que la app instalada ya no se queda en "cargando". El manifest ya no
  fuerza la orientación horizontal. Al reinstalar la app en el móvil se ven el icono y el splash nuevos.
  Instalada en iPhone, la cabecera, los diálogos y el splash respetan la zona segura (barra de estado e
  isla), con una franja fija que cubre lo que pasa por detrás al hacer scroll.
- **Estadio y servicios** (`js/estadio.js`, botón ESTADIO en la oficina, que también da acceso a la ficha del
  club), con los apartados de la pantalla original: GRADAS (ampliar el aforo en 2.000, 5.000 o 10.000 plazas:
  100 M por cada 1.000 y 4 semanas por cada 2.000), PARKING (tres niveles: 60/120/200 M, 3 semanas),
  SERVICIOS (W.C., cafeterías y tiendas en tres niveles; cada nivel atrae un 1 % más de público e ingresa por
  espectador 3, 12 y 20 pesetas respectivamente, sumado a la taquilla), EQUIPAMIENTO (marcadores +0,5 % de
  público, focos +1 %, calefacción del césped —desgaste a la mitad y −5 % de lesiones en casa—, vestuarios +5 %
  de entrenamiento, enfermería −10 % de duración de las lesiones; 80 a 150 M y 3 semanas), CÉSPED (de 0 a 100,
  se desgasta 4 puntos por partido en casa, 2 con calefacción, menos un 20 % por cada estrella del Cuidador
  del césped (con 5 estrellas no se desgasta), y recupera 1 o 2 por semana más 1 por estrella del cuidador; por debajo de 60
  aumenta las lesiones en casa y por debajo de 45 resta un 2 % de público; replantar cuesta 40 M y 1 semana) y
  VALLAS PUBLICITARIAS (al empezar cada temporada se cobran los derechos: 7 u 8 M por cada 1.000 plazas). Las
  obras se pagan al encargarlas, empiezan al terminar la jornada y avisan al acabar en el diálogo de noticias de
  la oficina. El aforo ampliado se guarda en la partida (`G.stadium`) y se reaplica al cargar.
- **Ofertas de otros clubes** (`js/ofertas.js`): cada jornada hay un 22 % de probabilidad de que un club de
  cualquier liga (de nivel parecido o superior al jugador) haga una oferta por un jugador del club propio,
  más probable cuanto mejor sea (peso (ME − 50)^3, los de 32 o más menos), por el 85 % al 145 % de su valor,
  válida dos jornadas; no llegan en las tres últimas jornadas ni con 16 jugadores o menos. Se responden en la
  oficina (ACEPTAR: traspaso inmediato y dinero al presupuesto; RECHAZAR: si la oferta superaba el valor en un
  20 %, el jugador pierde 4 de moral; MÁS TARDE la deja pendiente). Para figuras de 84 o más, un club grande
  puede pagar la cláusula de rescisión (12 % de las veces, si no supera 3,5 veces el valor) y el jugador se va
  sin remedio, como en el original. La cláusula de los jugadores de la base de datos es 3 veces su valor; la
  de los fichados, la pactada. La pantalla CONTRATOS muestra la cláusula.
- **Contratos y fin de temporada de la plantilla** (`js/contratos.js`): cada jugador del club tiene un
  contrato con ficha y temporadas restantes (los de la base de datos empiezan con 1 a 4 según su id; los
  fichados, con las del acuerdo). En FICHAJES → CONTRATOS se ven ficha, fecha de fin y cláusulas (R: partidos
  para renovación, L: libertad por descenso) y se renueva cualquiera: el jugador pide una ficha según su valor y
  edad (+6 % por temporada a partir de la tercera) y puede rechazar (8 %, 40 % con moral baja). Al terminar la
  temporada (`seasonSquadEnd`, antes de ascensos y descensos): la cláusula de renovación amplía un año a quien
  haya jugado 25 partidos o más; los contratos vencidos no renovados causan baja ("ha causado baja al no haber
  sido renovado", el jugador ficha por otro club); con descenso, los que tienen libertad se van; y en TODOS los
  clubes los veteranos se retiran (33 años 15 %, 34 30 %, 35 50 %, 36 o más 75 %) y pasan al equipo oculto
  "Retirados" (id 9998), mientras los clubes de la máquina reciben en su lugar un canterano generado de 18 a 21
  años de la misma línea (`genYoung`, con nombre de las listas del juego y reaplicado al cargar). La página de
  balance avisa de los contratos que terminan antes de empezar la temporada, y la oficina muestra al arrancar
  la nueva un diálogo con todas las novedades de plantilla.
- **Fuentes sin parpadeo**: las 17 fuentes del juego se cargan todas antes de mostrar el menú (en paralelo con
  los datos, con un tope de 8 s), las seis más usadas se precargan desde el HTML y todas llevan
  `font-display: block`, así que ninguna pantalla cambia de tipografía al llegar su fuente.
- **Imágenes optimizadas sin pérdida**: las 6.616 imágenes PNG de `img/` se han recomprimido con oxipng
  (`tools/optimize_png.py`, comprobación píxel a píxel antes de sustituir cada archivo): 43,3 MB → 36,4 MB
  (−16 %); la precarga baja de 12,1 a 8,1 MB (fotos pequeñas −35 %, escudos −44 % a −56 %, fondos −10 %).
  Originales guardados fuera del repositorio en `../img_originales/`. Caché del service worker v7.
- **Fotos en la alineación**: la tabla de Alineación lleva la foto pequeña de cada jugador junto al dorsal
  (14 px en escritorio, 20 px en móvil; son las de `img/foto`, de 1,6 KB y ya precargadas, así que no pesan).
- **Motor revisado**: líneas que se mezclan, diferencias de fuerza menos explosivas, uno menos que pesa más,
  cambios con efecto proporcional al jugador, techo de progreso en el entrenamiento, declive desde los 31 y
  evolución por edad de todos los equipos al cambiar de temporada. Detalles y cifras en "Motor de juego".
- **Oficina agrupada**: los botones se organizan en PARTIDO (alineación, táctica, ver rival), PLANTILLA
  (entrenar, lesionados, fichajes, jóvenes promesas), CLUB (finanzas, empleados, club y estadio) y
  COMPETICIÓN (clasificación, calendario, competiciones, estadísticas, goleadores) dentro de un bloque con
  scroll; el botón INFO de COMPETICIÓN abre un diálogo con el resumen del club (presupuesto, bajas, moral y
  forma, empleados, juveniles, plantilla, contrato de televisión); la fila PARTIDA (guardar, opciones, nueva,
  menú) queda fija al pie del panel.
- **Moral y estado de forma** (`js/moral.js`): cada jugador del club tiene MORAL (tiende a 70) y E. FORMA
  (tiende a 60), de 0 a 100, que sustituyen a los valores fijos de la ficha. Tras cada partido: los que juegan
  suman +6 de moral por victoria, +1 por empate, −6 por derrota, +3 por gol y −4 por expulsión, y ganan forma
  según los minutos; los que no juegan pierden 2 de moral y 3 de forma; una lesión hunde la forma. Cada
  jornada ambas vuelven despacio hacia su media y el Psicólogo amortigua los bajones (−10 % por estrella) y
  aporta +0,5 de moral por estrella. Influyen en la simulación hasta ±5 % entre los extremos
  (`playerFormFactor` en `squadStrength`); los demás equipos usan su racha de los últimos cinco partidos
  (±1 % por victoria o derrota). Se ven en la ficha (E. FORMA y MORAL con su texto), en el panel lateral de
  Alineación y, como media del equipo, en la oficina. Se reinician al cambiar de temporada.
- **Jóvenes promesas** (`js/juveniles.js`, botón en EMPLEADOS): con un Ojeador contratado se encarga una
  búsqueda por demarcación (portero, defensa, centrocampista, delantero) que dura entre 10 y 20 jornadas,
  menos cuantas más estrellas tenga; al terminar trae 1-3 informes (o ninguno) de juveniles de 16 a 18 años
  generados con el perfil de un jugador real de esa demarcación, que se pueden contratar (ficha pequeña; a
  veces rechazan). Los juveniles entrenan en la plantilla de jóvenes promesas (hasta 10) cada jornada, más
  deprisa con Entrenador de Juveniles, hasta su tope de juvenil (potencial − 8); entonces el entrenador avisa
  y se pueden PROMOCIONAR al primer equipo, donde siguen creciendo con el entrenamiento normal hasta su
  potencial. La columna PROYECCIÓN muestra el potencial en estrellas. Comprobación en la base de datos: el
  registro de jugador del juego no tiene mínimos ni máximos (ver campos `f1`–`f4`), así que el juego
  original generaba a los juveniles igual que esta web; el "mínimo del jugador en plantilla = máximo como
  juvenil" se reproduce aquí con el tope de juvenil y el potencial por jugador generado. Los promocionados
  llevan la situación JUVENIL en la ficha y se reañaden a la plantilla al cargar (`applyYouth`).
- **Sorteo**: el bombo es el sprite original de 31 px mostrado al doble (62 px, píxel nítido) y sin su fondo
  morado, y los trofeos son las imágenes grandes del juego (`COPAS/* BIG.BMP`: Copa del Rey, Copa de Europa,
  Recopa y UEFA, de unos 150x210 px), enteras y con el fondo negro quitado, en vez de las pequeñas de 72x144
  que recortaban la copa. `tools/upscale.py` (Scale2x/Scale3x) queda disponible para otros sprites.
- **Velocidad del partido**: LENTA (300 ms por minuto, unos 30 s), MEDIA (150 ms) o RÁPIDA (60 ms, la de
  siempre), en el botón OPCIONES de la oficina o con el botón VEL. durante el partido; se recuerda en el
  navegador (`pcf5_speed`).
- **Oficina reorganizada**: los botones de la copa nacional y de Europa se unen en COMPETICIONES (diálogo con
  el estado del club en cada copa y acceso a cada una), y hay un botón EMPLEADOS que abre la pantalla
  "Personal del club" con los ocho puestos del juego original (segundo entrenador, entrenador de juveniles,
  fisioterapeuta, psicólogo, ojeador, secretario técnico, asistente y cuidador del césped).
- **Empleados** (`js/empleados.js`): los nombres salen de las listas del juego original (`DBDAT/NOMBRES.xx` y
  `APELLIDO.xx` de España, Inglaterra e Italia, exportadas a `data/names.json` con `tools/names.py`; formato
  DMLT con cadenas de longitud u16 y XOR 0x61), según el país de la liga; las estrellas y el sueldo son
  propios de la web, porque el juego no guarda empleados en sus datos. Por cada puesto hay tres candidatos con
  estrellas (1 a 5) y sueldo anual
  (12 a 150 millones según estrellas, ±15 %), que se renuevan cada 1 a 3 jornadas. Se contrata uno por
  puesto (fila en verde, CONTRATADO) y se despide pagando el sueldo del resto de la temporada. El sueldo se
  descuenta por jornada con el de los jugadores. Efectos: segundo entrenador +10 % de progreso en el
  entrenamiento por estrella; entrenador de juveniles +4 % para los de 22 años o menos; fisioterapeuta −8 %
  de semanas de lesión; psicólogo −10 % de pérdida de ritmo; ojeador +20 % de figuras en el mercado;
  secretario técnico −2 % en el precio que aceptan los clubes; asistente, botón INFORME DEL RIVAL en la oficina que abre un
  diálogo con el once probable del rival (media, jugadores clave, portero y líneas con 2 estrellas, últimos
  resultados con 4); cuidador del césped +1 % de público y −5 % de lesiones en casa.
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

## Motor de juego (revisado el 7 de octubre de 2026)

**Fuerza del equipo** (`squadStrength`, `js/engine.js`). De cada jugador alineado se calcula un valor según su
línea: portero = atributo portero; defensa = entradas 50 %, agresividad 20 %, resistencia 15 %, velocidad 15 %;
medio = pase 40 %, regate 20 %, calidad 20 %, resistencia 20 %; delantero = remate 35 %, tiro 30 %, regate 20 %,
velocidad 15 %. Ese valor se multiplica por: el puesto (`effME`: jugar fuera de su demarcación resta 5 puntos de
media dentro de la misma línea, 10 o 15 entre líneas y 30 en la portería), el estado físico (lesionado en el
campo, 50 %) y moral y forma (±5 % entre los extremos; los demás equipos, ±1 % por victoria o derrota de su
racha). Las líneas se mezclan: ataque = 70 % delanteros + 30 % medios; defensa = 70 % defensas + 30 % medios;
medio campo = 80 % medios + 10 % defensas + 10 % delanteros, con un peso por número de jugadores en cada
línea; los valores se acotan (portero mínimo 35, líneas mínimo 30).

**Goles esperados por partido** (`matchSim`): local = 1,6 × (ataque / defensa rival)^1,8 × (medio / medio
rival)^0,8 × (72 / portero rival)^0,7; visitante igual con 1,15; en campo neutral ambos 1,35. Con un jugador
menos: propio × (n/11)^1,5, rival × (11/n)^1,1. Cada minuto hay una probabilidad de gol igual a esperados/90,
goleador según remate y tiro ponderado por línea. Con el estadio lleno, el local gana un 15 % en los últimos
diez minutos si no va ganando. Tarjetas (3,5 % por minuto, según agresividad), roja directa (0,07 %) y lesiones
(0,18 % por minuto) son independientes de la fuerza.

**Medido sobre la 1ª División 96-97** (todos contra todos, 462 partidos; 400 repeticiones por emparejamiento):
2,7 goles por partido; local 44 %, empate 26 %, visitante 30 % (la Liga real 96-97: 2,9 goles, 47/27/26);
Barcelona (media 80) en casa contra Extremadura (69): 77/15/9 %, fuera 59 % de victorias; dos equipos de
media 74: 44/26/30 %. Una expulsión en el centro del campo baja los goles propios esperados un 17 % y sube los
del rival un 18 %. Cambios: quitar a Ronaldo (96) por Giovanni (87) resta un 12 % de goles esperados; por un
medio de 69 fuera de sitio, un 28 %; un defensa en la portería casi duplica los goles del rival (×1,9).
Antes de la revisión, el exponente 2,4 y las líneas sin mezclar hacían que un solo cambio restara el 44 % y
que un defensa en la portería multiplicara por 5 los goles encajados.

**Evolución de los jugadores.** Entrenamiento semanal del club propio (`applyTraining`): por cada atributo del
área, probabilidad de +1 = nivel × 5 % × factor de edad (1,4 hasta 22 años, 1,0 hasta 26, 0,7 hasta 29, 0,4
hasta 32, 0,2 después) × techo (`ceilFactor`: (92 − valor)/35, mínimo 0,08: de 57 se sube fácil, de 85
cuesta cinco veces más, de 92 casi nada) × empleados (segundo entrenador +10 %/estrella; juveniles +4 %/estrella
hasta 22 años). Declive semanal desde los 31: 6 % × (edad − 30) por atributo. Al cambiar de temporada,
`ageProgress` aplica a TODOS los equipos (antes los rivales nunca cambiaban) un paso por edad: +3 hasta 20
años, +2 hasta 23, +1 hasta 26, 0 hasta 29, −1 hasta 31, −2 hasta 33, −3 después (±1 al azar, con techo y
potencial), guardado en `G.mods`. Resultado medido en una temporada: con el entrenamiento por defecto los
menores de 23 ganan +3 de media (hasta +4,6 al máximo), 23-26 +1,4, 27-29 +1 y los de 30-32 se quedan igual
(antes todos subían 2 a 5 puntos por temporada); el paso de temporada añade +3,1 a los de 20 o menos, +1,7
a 21-23, +0,8 a 24-26 y resta 1,1 a 30-31, 2 a 32-33 y 3,2 a 34 o más. La falta de ritmo (hasta −8 por
atributo), la moral y la forma se describen en sus apartados.

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
