# Actualización 2026 (preparación, no integrada)

Carpeta de trabajo para construir una base de jugadores y clubes actualizada. **No modifica `data/` ni el juego**:
todo se escribe en `raw/` (datos crudos, sin subir a git) y en `out/` (propuesta para revisar).
El botón de la página principal que cargaría estos datos se hará cuando esté claro que se pueden obtener bien.

## Fuentes

| Fuente | Qué aporta | Licencia / condiciones | Estado |
|---|---|---|---|
| [transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets) (CC0) | Clubes, jugadores, posición, nacionalidad, fecha de nacimiento, valor de mercado | CC0 1.0 (`LICENSE`). Los datos proceden de Transfermarkt. | Datos hasta el 6-jul-2026; el proyecto no se actualiza. Solo 1ª división (ES1, GB1, IT1). |
| [API-Football](https://www.api-football.com/) | Plantillas y estadísticas de jugadores, y las 2ª divisiones | Condiciones sin confirmar: el texto oficial no se pudo leer y hay que preguntar por escrito si se pueden guardar y publicar los datos. | Clave probada: plan **gratuito**, 100 peticiones al día y 10 por minuto. **El plan gratuito solo da las temporadas 2022-2024**; la 2026 necesita plan de pago. |

## Pasos

1. `python3 fetch_transfermarkt.py`: descarga las 7 tablas CC0 a `raw/transfermarkt/` con hashes en `manifest.json`.
2. `python3 build_update.py`: genera `out/clubs.json` y `out/players.json` para ES1, GB1 e IT1 de la última temporada del dataset.
3. Con clave (variable de entorno, nunca en un archivo): `export API_FOOTBALL_KEY=...` y `python3 fetch_apifootball.py --dry-run` para ver el plan. Por defecto usa la temporada 2024, la única que da el plan gratuito.
   Prueba hecha con Real Madrid en 2024: equipos (20), plantilla (38 jugadores) y estadísticas (4 páginas de 20). Por liga son unas 100 peticiones; las 6 ligas, unos 6 días con el plan gratuito.

## Lo que falta antes de integrar nada

- **Temporada 2026 con API-Football.** El plan gratuito no la da. Hace falta un plan de pago (precio no comprobado) o usar 2024 como base.
- **Condiciones de API-Football.** Confirmar por escrito que se puede guardar y publicar.
- **Las 2ª divisiones** (ESP2, ENG2, ITA2) solo vienen de API-Football. Los IDs de liga (140, 141, 39, 40, 135, 136) hay que confirmarlos con `/leagues`.
- **Nombres de clubes.** Son los de 2025/26 (p. ej. «FC Barcelona», «Real Oviedo») y no los de 1996-97 del juego. Hace falta una tabla de equivalencias.
- **Plantillas.** Transfermarkt asigna a un club también cedidos y filiales: un club sale con 25 a 45 jugadores. Hay que filtrar hasta una plantilla real.
- **Atributos del juego** (VE, RE, AG, CA, PASE, REGATE, REMATE, TIRO, ENTRADAS, PORTERO). Ninguna API los da. Hay que estimarlos a partir de estadísticas y valor de mercado, y calibrarlos contra 1996-97.
- **Temporada.** Transfermarkt llega a 2025/26. API-Football con plan gratuito llega a 2024; el 2026 exige plan de pago.

## Estado de la carpeta

- `raw/transfermarkt/`: descargado (7 tablas, unos 125 MB comprimidos). Ignorado por git.
- `out/`: generado con ES1, GB1 e IT1 (20 clubes por liga, 2.227 jugadores). Ignorado por git.
- `raw/apifootball/`: vacío. La prueba con la clave (estado, liga, equipos, plantilla y una página de jugadores de 2024) se hizo sin guardar archivos, para no gastar cuota en la caché.

## Prueba de juego con la liga 1ª 2024 (solo local)

- `python3 build_test_2024.py`: genera `out/esp1_2024/teams.json` y `leagues.json` (20 clubes de ESP1 con plantilla 2024, calendario nuevo de 38 jornadas). Los clubes de 1996-97 de 1ª quedan sin liga. Lee `data/` sin escribir en él.
- `python3 build_test_crests.py`: escudos de prueba con iniciales en `out/esp1_2024/img/`.
- Abrir `http://localhost:8765/?datos=2024`: carga esos datos y guarda la partida en `pcf5_save_2024`, sin tocar la partida normal. Sin el parámetro, el juego no cambia.
- Pendiente: ESP2 sigue con los clubes de 1996-97; fotos, campos y banderas de los jugadores nuevos no existen todavía.
