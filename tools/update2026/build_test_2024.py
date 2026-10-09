#!/usr/bin/env python3
"""Datos de prueba: ESP1 con la temporada 2024 (clubes y plantillas), para probar el juego con ?datos=2024.

Escribe SOLO en tools/update2026/out/esp1_2024/ (teams.json y leagues.json). No toca data/.
- Los clubes de ESP1 de 1996-97 se conservan, pero sin liga (quedan como equipos sin liga).
- Clubes nuevos: ids 5001-5020. Jugadores: id = 1000000 + id de API-Football.
- Estadio, aforo y entrenador: Transfermarkt (CC0), temporada 2025/26; el resto, valores neutros.
"""
import csv, glob, gzip, json, math, os, random, re, sys, statistics, unicodedata
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
RAW_AF = os.path.join(HERE, 'raw', 'apifootball')
RAW_TM = os.path.join(HERE, 'raw', 'transfermarkt')
OUT = os.path.join(HERE, 'out', 'esp1_2024')
DATA = os.path.join(HERE, '..', '..', 'data')
BASE_ID = 5000
NAT = {'Spain': 22, 'England': 30, 'Italy': 36, 'Brazil': 10, 'Argentina': 3, 'France': 24, 'Germany': 2, 'Portugal': 47,
       'Netherlands': 27, 'Belgium': 12, 'Uruguay': 57, 'Colombia': 16, 'Mexico': 68, 'Croatia': 17, 'Chile': 14,
       'Denmark': 18, 'Sweden': 53, 'Norway': 44, 'Switzerland': 54, 'Serbia': 58, 'Ukraine': 56, 'Greece': 26,
       'Turkey': 55, 'Poland': 46, 'Romania': 49, 'Austria': 5, 'Scotland': 19, 'Wales': 45, 'Hungary': 29,
       'Iceland': 33, 'Finland': 23, 'Norway ': 44, 'Georgia': 62, 'Paraguay': 64, 'Ecuador': 66, 'Peru': 65,
       'Venezuela': 67, 'Cameroon': 13, 'Nigeria': 43, 'Morocco': 41, 'Senegal': 80, 'Ghana': 25, 'Australia': 4,
       'United States': 69, 'Japan': 70, 'Canada': 0}
ROLES = {'POR': [1], 'DEF': [5, 6, 2, 3], 'MED': [15, 10, 7, 11], 'DEL': [9, 13, 12, 14]}
# entrenador de la temporada 2024-25 por club (API-Football). Fuentes: prensa y Wikipedia de cada temporada, ver README.
# Cuando hubo cambio, el que más partidos dirigió: Alavés (Coudet), Las Palmas (Ramírez), Valladolid (Pezzolano, con varios cambios),
# Sevilla (García Pimienta), Valencia (Corberán), Cádiz (Garitano), Castellón (Plat), Eibar (Etxeberria), Oviedo (Calleja),
# Racing Ferrol (Parralo), Sporting (Albés), Zaragoza (Víctor Fernández), Deportivo (Gilsanz), Burgos (Ramis), Cartagena (Abelardo: sin confirmar tras septiembre 2024)
COACH_2425 = {
    'Alaves': 'Eduardo Coudet', 'Athletic Club': 'Ernesto Valverde', 'Atletico Madrid': 'Diego Simeone',
    'Barcelona': 'Hansi Flick', 'Celta Vigo': 'Claudio Giráldez', 'Espanyol': 'Manolo González', 'Getafe': 'José Bordalás',
    'Girona': 'Míchel', 'Las Palmas': 'Miguel Ángel Ramírez', 'Leganes': 'Borja Jiménez', 'Mallorca': 'Jagoba Arrasate',
    'Osasuna': 'Vicente Moreno', 'Rayo Vallecano': 'Íñigo Pérez', 'Real Betis': 'Manuel Pellegrini', 'Real Madrid': 'Carlo Ancelotti',
    'Real Sociedad': 'Imanol Alguacil', 'Sevilla': 'Javier García Pimienta', 'Valencia': 'Carlos Corberán',
    'Valladolid': 'Paulo Pezzolano', 'Villarreal': 'Marcelino García Toral',
    'Albacete': 'Alberto González', 'Almeria': 'Rubi', 'Burgos': 'Luis Miguel Ramis', 'Cadiz': 'Gaizka Garitano',
    'Castellón': 'Johan Plat', 'Cordoba': 'Iván Ania', 'Deportivo La Coruna': 'Óscar Gilsanz', 'Eibar': 'Joseba Etxeberria',
    'Eldense': 'Dani Ponz', 'Elche': 'Eder Sarabia', 'Granada CF': 'Guille Abascal', 'Huesca': 'Antonio Hidalgo',
    'Levante': 'Julián Calero', 'Malaga': 'Sergio Pellicer', 'Mirandes': 'Alessio Lisci', 'Oviedo': 'Javi Calleja',
    'Racing Ferrol': 'Cristóbal Parralo', 'Racing Santander': 'José Alberto López', 'Sporting Gijon': 'Rubén Albés',
    'Tenerife': 'Álvaro Cervera', 'Zaragoza': 'Víctor Fernández', 'FC Cartagena': 'Abelardo Fernández',
}
# nombre del club en la temporada 2024 (API-Football) -> nombre en Transfermarkt (2025/26), para estadio y entrenador
TM_NAME = {'Alaves': 'Deportivo Alavés', 'Athletic Club': 'Athletic Bilbao', 'Atletico Madrid': 'Atlético de Madrid',
           'Barcelona': 'FC Barcelona', 'Celta Vigo': 'RC Celta de Vigo', 'Espanyol': 'RCD Espanyol Barcelona',
           'Getafe': 'Getafe CF', 'Girona': 'Girona FC', 'Las Palmas': 'UD Las Palmas', 'Leganes': 'CD Leganés',
           'Mallorca': 'RCD Mallorca', 'Osasuna': 'CA Osasuna', 'Rayo Vallecano': 'Rayo Vallecano',
           'Real Betis': 'Real Betis Balompié', 'Real Madrid': 'Real Madrid', 'Real Sociedad': 'Real Sociedad',
           'Sevilla': 'Sevilla FC', 'Valencia': 'Valencia CF', 'Valladolid': 'Real Valladolid', 'Villarreal': 'Villarreal CF'}


def dob(s):
    if not s:
        return [0, 0, 0]
    y, m, d = s.split('-')
    return [int(d), int(m), int(y)]


def height_cm(s):
    try:
        return int(str(s).split()[0])
    except (TypeError, ValueError, IndexError):
        return 0


def load_bio():
    """Fecha de nacimiento, nacionalidad, altura y peso por jugador, de la caché de API-Football (2024)."""
    bio = {}
    for f in glob.glob(os.path.join(RAW_AF, 'players_*_p*.json')):
        for x in json.load(open(f, encoding='utf-8'))['response']:
            pl = x['player']
            bio[pl['id']] = {'birth': (pl.get('birth') or {}).get('date'), 'nat': pl.get('nationality'),
                             'height': height_cm(pl.get('height')), 'weight': int(str(pl.get('weight') or '0').split()[0] or 0)}
    return bio


def norm_tokens(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return [t for t in re.sub(r'[^a-z ]', ' ', s).split() if len(t) >= 3]


def tm_contracts(players_bio):
    """Por jugador de la API: fecha de fin de contrato y valor de mercado de Transfermarkt.
    Cruce por fecha de nacimiento + algún apellido en común. Valor: la valoración más cercana al 30-9-2024
    (la última anterior o, si no hay, la primera posterior)."""
    wanted = defaultdict(list)
    for pid, (name, birth) in players_bio.items():
        if birth:
            wanted[birth].append((pid, set(norm_tokens(name))))
    cands = defaultdict(list)
    with gzip.open(os.path.join(RAW_TM, 'players.csv.gz'), 'rt', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            d = r['date_of_birth'][:10]
            if d in wanted:
                cands[d].append((r['player_id'], set(norm_tokens(r['name']) + norm_tokens(r['last_name'])),
                                 r['contract_expiration_date'][:10], r['market_value_in_eur'], r['sub_position'], r['foot'], r['image_url']))
    match = {}
    for d, lst in wanted.items():
        for pid, toks in lst:
            hit = [c for c in cands.get(d, []) if toks & c[1]]
            if hit:
                match[pid] = hit[0]
    want_ids = {c[0] for c in match.values()}
    vals = defaultdict(list)
    with gzip.open(os.path.join(RAW_TM, 'player_valuations.csv.gz'), 'rt', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            if r['player_id'] in want_ids:
                vals[r['player_id']].append((r['date'][:10], r['market_value_in_eur']))
    out = {}
    for pid, (tm_id, _, contract, _, sub, foot, foto) in match.items():
        v = vals.get(tm_id, [])
        before = sorted(x for x in v if x[0] <= '2024-09-30')
        after = sorted(x for x in v if x[0] > '2024-09-30')
        best = before[-1] if before else (after[0] if after else None)
        out[pid] = {'contrato_hasta': contract or None,
                    'valor_eur': int(float(best[1])) if best and best[1] else None,
                    'valor_fecha': best[0] if best else None,
                    'posicion_tm': sub or None, 'pie': foot or None, 'foto': foto or None}
    return out


# roles del juego (js/data.js) que puede ocupar cada jugador, por el grupo de la API (POR/DEF/MED/DEL)
SECONDARY = {1: [1], 2: [3], 3: [2], 5: [6], 6: [5], 15: [10], 10: [15, 7, 11], 7: [11], 11: [7], 9: [12, 14], 12: [14, 9], 14: [12, 9]}


def roles_for(pos, sub, foot, k):
    """Rol principal según la posición de Transfermarkt (sub_position) y el pie; el grupo lo fija la API para no cambiar la valoración."""
    side = 'L' if sub in ('Left-Back', 'Left Midfield', 'Left Winger') else 'R' if sub in ('Right-Back', 'Right Midfield', 'Right Winger') else None
    if pos == 'POR':
        r = 1
    elif pos == 'DEF':
        if sub == 'Left-Back':
            r = 3
        elif sub == 'Right-Back':
            r = 2
        else:  # central: sin lado en la base, el pie decide; si no hay dato, se alterna
            r = 5 if foot == 'left' or (foot not in ('left', 'right') and k % 2 == 0) else 6
    elif pos == 'MED':
        r = 15 if sub == 'Defensive Midfield' else 11 if side == 'L' else 7 if side == 'R' else 10
    else:
        r = 14 if side == 'L' or sub == 'Left Winger' else 12 if side == 'R' else 9
    return [r] + [x for x in SECONDARY.get(r, []) if x != r]


def tm_clubs():
    with gzip.open(os.path.join(RAW_TM, 'clubs.csv.gz'), 'rt', encoding='utf-8') as f:
        rows = [r for r in csv.DictReader(f) if r['domestic_competition_id'] == 'ES1']
    last = max(r['last_season'] for r in rows)
    return {r['name']: r for r in rows if r['last_season'] == last}


def circle_pairs(ids):
    """Método del círculo: cada jornada de la primera vuelta como pares sin orientar (todos contra todos una vez)."""
    a = list(ids)
    n = len(a)
    rounds = []
    for _ in range(n - 1):
        rounds.append([(a[i], a[n - 1 - i]) for i in range(n // 2)])
        a.insert(1, a.pop())
    return rounds


def venue_cost(rounds, ids):
    """Penaliza rachas de más de dos partidos seguidos en casa o fuera, y que un equipo no tenga la mitad de partidos en casa."""
    seq = {t: [] for t in ids}
    for rd in rounds:
        for h, a in rd:
            seq[h].append('H')
            seq[a].append('A')
    c = 0
    for t, s_ in seq.items():
        run = 1
        for k in range(1, len(s_)):
            if s_[k] == s_[k - 1]:
                run += 1
            else:
                c += 10 * max(0, run - 2)
                run = 1
        c += 10 * max(0, run - 2)
        c += 5 * (s_.count('H') - len(s_) // 2) ** 2
    return c


def round_robin(ids, seed=2024, iters=60000):
    """Liga a doble vuelta: la segunda vuelta invierte cada partido de la primera. La orientación de cada partido
    se busca por recocido simulado para que no haya rachas largas de local o visitante (semilla fija: resultado reproducible)."""
    base = circle_pairs(sorted(ids))
    R = len(base)
    rnd = random.Random(seed)
    o = [[rnd.randint(0, 1) for _ in base[r]] for r in range(R)]

    def build():
        first = [[(a, b) if o[r][i] == 0 else (b, a) for i, (a, b) in enumerate(base[r])] for r in range(R)]
        return first + [[(b, a) for (a, b) in rd] for rd in first]

    cur = venue_cost(build(), ids)
    temp = 5.0
    for _ in range(iters):
        if cur == 0:
            break
        r = rnd.randrange(R)
        i = rnd.randrange(len(base[r]))
        o[r][i] ^= 1
        new = venue_cost(build(), ids)
        if new <= cur or rnd.random() < math.exp((cur - new) / temp):
            cur = new
        else:
            o[r][i] ^= 1
        temp = max(0.05, temp * 0.9995)
    print('coste de local/visitante:', cur)
    return [[[h, a, None, None] for (h, a) in rd] for rd in build()]


def venue_stats(rounds, ids):
    seq = {t: [] for t in ids}
    for rd in rounds:
        for h, a, *_ in rd:
            seq[h].append('H')
            seq[a].append('A')
    worst = 0
    for s_ in seq.values():
        run = 1
        for k in range(1, len(s_)):
            run = run + 1 if s_[k] == s_[k - 1] else 1
            worst = max(worst, run)
    homes = [t_.count('H') for t_ in seq.values()]
    return worst, min(homes), max(homes)


def main():
    players_all = json.load(open(os.path.join(HERE, 'out', 'esp1_2024', 'players.json'), encoding='utf-8'))
    players_2 = json.load(open(os.path.join(HERE, 'out', 'esp2_2024', 'players.json'), encoding='utf-8'))
    api2 = {x['team']['name']: x for x in json.load(open(os.path.join(RAW_AF, 'teams_ESP2.json'), encoding='utf-8'))['response']}
    players_1 = players_all
    players_all = players_1 + players_2
    bio = load_bio()
    tm = tm_clubs()
    pbio = {p['id']: (p['name'], (bio.get(p['id']) or {}).get('birth')) for p in players_all}
    contracts = tm_contracts(pbio)
    fotos = {}
    teams_json = json.load(open(os.path.join(DATA, 'teams.json'), encoding='utf-8'))
    leagues = json.load(open(os.path.join(DATA, 'leagues.json'), encoding='utf-8'))
    # 1) los clubes de 1996-97 de ESP1 pasan a no tener liga (siguen en la base de datos)
    for tid, t in (teams_json.items() if isinstance(teams_json, dict) else []):
        if t.get('league') in ('ESP1', 'ESP2'):
            t['league'] = None
    # 2) clubes nuevos
    names = [(n, 'ESP1') for n in sorted({p['team'] for p in players_1})] + [(n, 'ESP2') for n in sorted({p['team'] for p in players_2})]
    new_ids = {}
    for i, (name, liga) in enumerate(names):
        tid = BASE_ID + 1 + i
        new_ids[name] = tid
        if liga == 'ESP1':
            club = tm.get(TM_NAME.get(name, name))
            stadium = club['stadium_name'] if club else name
            seats = int(float(club['stadium_seats'])) if club and club['stadium_seats'] else 20000
            coach = club['coach_name'] if club and club['coach_name'] else '-'
            founded = '-'
        else:  # 2ª: sin Transfermarkt; estadio, aforo y fundación de la caché de API-Football
            v = api2[name]['venue']
            stadium = v.get('name') or name
            seats = int(v.get('capacity') or 15000)
            coach = '-'
            founded = api2[name]['team'].get('founded') or '-'
        coach = COACH_2425.get(name, coach)
        mine = sorted([p for p in players_all if p['team'] == name], key=lambda p: -(p['minutes'] or 0))
        keep = mine[:25]
        if sum(1 for p in keep if p['pos'] == 'POR') < 2:
            extra = [p for p in mine[25:] if p['pos'] == 'POR'][:2]
            keep = keep[:25 - len(extra)] + extra
        plantilla = []
        for k, p in enumerate(keep):
            b = bio.get(p['id'], {})
            pos = p['pos']
            a = [p['attrs'][x] for x in ['VE', 'RE', 'AG', 'CA', 'PASE', 'REGATE', 'REMATE', 'TIRO', 'ENTRADAS', 'PORTERO']]
            tmc = contracts.get(p['id'], {})
            if tmc.get('foto'): fotos[str(1000000 + p['id'])] = tmc['foto']
            extra = {k2: v for k2, v in (('contrato_hasta', tmc.get('contrato_hasta')), ('valor_eur', tmc.get('valor_eur')), ('valor_fecha', tmc.get('valor_fecha'))) if v}
            plantilla.append(dict(extra, **{'id': 1000000 + p['id'], 'dorsal': k + 1, 'name': p['name'], 'full': p['name'].upper(),
                              'roles': roles_for(pos, tmc.get('posicion_tm'), tmc.get('pie'), k), 'country': NAT.get(b.get('nat'), 0), 'c2': 1,
                              'f1': 0, 'f2': 0, 'f3': 0, 'f4': 0, 'birth': dob(b.get('birth')),
                              'height': b.get('height') or 0, 'weight': b.get('weight') or 0, 'attrs': a,
                              'dem': pos, 'birthplace': '', 'prevclub': '', 'intl': '0'}))
        teams_json[str(tid)] = {'id': tid, 'name': name, 'full': name, 'stadium': stadium, 'nat': 22, 'capacity': seats,
                                'width': 68, 'length': 105, 'founded': founded, 'div': 1 if liga == 'ESP1' else 2, 'league': liga, 'long': False,
                                'coach': dict({'id': 0, 'name': coach, 'full': ''}, **({'photo': 'tools/update2026/out/esp1_2024/img/entr/%d.png' % tid} if os.path.exists(os.path.join(OUT, 'img', 'entr', '%d.png' % tid)) else {'photo': 'img/ui/foto_general.png'})), 'coach2': [], 'block': [], 'src': 'ESP',
                                'members': 0, 'president': '-', 'sponsor': '', 'kit': '', 'positions': [], 'seasons': 0,
                                'hist': None, 'series': [], 'prueba': True, 'players': plantilla}
    # 3) liga ESP1 con calendario nuevo (ida y vuelta, 38 jornadas)
    for liga in ('ESP1', 'ESP2'):
        ids_liga = sorted(new_ids[n] for n, l in names if l == liga)
        leagues[liga]['rounds'] = round_robin(ids_liga)
        racha, hmin, hmax = venue_stats(leagues[liga]['rounds'], ids_liga)
        print(liga, '| racha máxima local/visitante:', racha, '| partidos en casa por equipo: entre', hmin, 'y', hmax)
    os.makedirs(OUT, exist_ok=True)
    json.dump(teams_json, open(os.path.join(OUT, 'teams.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(leagues, open(os.path.join(OUT, 'leagues.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(new_ids, open(os.path.join(OUT, 'ids.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(fotos, open(os.path.join(OUT, 'fotos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('fotos con URL:', len(fotos))
    allp = [q for t in teams_json.values() if t.get('league') == 'ESP1' for q in t['players']]
    print('con fecha de contrato:', sum(1 for q in allp if 'contrato_hasta' in q), '| con valor de mercado:', sum(1 for q in allp if 'valor_eur' in q), 'de', len(allp))
    sizes = [len(t['players']) for t in teams_json.values() if t.get('league') == 'ESP1']
    print('clubes ESP1 2024:', len(sizes), '| jugadores por club: min', min(sizes), 'max', max(sizes), '| media', round(statistics.mean(sizes), 1))
    print('jornadas:', len(leagues['ESP1']['rounds']), '| partidos por jornada:', len(leagues['ESP1']['rounds'][0]))
    print('escrito en', OUT)


if __name__ == '__main__':
    sys.exit(main())
