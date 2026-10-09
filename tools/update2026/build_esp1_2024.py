#!/usr/bin/env python3
"""Atributos del juego para ESP1 (temporada 2024) a partir de la caché de API-Football.

Salida: tools/update2026/out/esp1_2024/ (no toca data/ ni el juego).
Reglas (aprobadas): percentiles por demarcación, escala 2024 propia, umbral 450 minutos,
VE/RE con valores por demarcación y edad, la fórmula de ME del juego (calcME).
Desviación documentada: PASE combina volumen de pases/90 y precisión (la precisión solo llega a ~55 jugadores).
"""
import glob, json, os, statistics, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw', 'apifootball')
# liga: ESP1 (por defecto) o ESP2 -> python3 build_esp1_2024.py ESP2 [--shift N]
LIGA = next((a for a in sys.argv[1:] if not a.startswith('--') and a in ('ESP1', 'ESP2')), 'ESP1')
LEAGUE = {'ESP1': 140, 'ESP2': 141}[LIGA]
OUT = os.path.join(HERE, 'out', 'esp1_2024' if LIGA == 'ESP1' else 'esp2_2024')
# nivel de la liga: +5 para igualar la media de 1996-97 de 1ª (elegido en la revisión); en 2ª se pasa con --shift
SHIFT = int(sys.argv[sys.argv.index('--shift') + 1]) if '--shift' in sys.argv else 5
SEASON = 2024
MIN_MINUTES = 450
ATTRS = ['VE', 'RE', 'AG', 'CA', 'PASE', 'REGATE', 'REMATE', 'TIRO', 'ENTRADAS', 'PORTERO']
POS = {'Goalkeeper': 'POR', 'Defender': 'DEF', 'Midfielder': 'MED', 'Attacker': 'DEL', 'Forward': 'DEL'}
# valores de partida por demarcación para VE y RE (medias de 1996-97, propuesta aprobada)
PRIOR_VE = {'POR': 74, 'DEF': 76, 'MED': 74, 'DEL': 77}
PRIOR_RE = {'POR': 71, 'DEF': 74, 'MED': 73, 'DEL': 72}
# código de rol del juego para cada demarcación (calcME usa el rol para elegir la fórmula)
ROLE = {'POR': 1, 'DEF': 5, 'MED': 15, 'DEL': 9}


def calc_me(a, dem):
    """Misma fórmula que calcME en js/data.js."""
    m4 = (a[0] + a[1] + a[2] + a[3]) / 4
    if dem == 'POR':
        v = m4 * 0.45 + a[9] * 0.55
    elif dem == 'DEF':
        v = m4 * 0.5 + a[8] * 0.3 + a[4] * 0.1 + a[6] * 0.1
    elif dem == 'MED':
        v = m4 * 0.5 + a[4] * 0.25 + a[5] * 0.15 + a[7] * 0.1
    else:
        v = m4 * 0.4 + a[6] * 0.25 + a[7] * 0.2 + a[5] * 0.15
    return round(v)


def num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def load():
    teams = json.load(open(os.path.join(RAW, 'teams_%s.json' % LIGA), encoding='utf-8'))['response']
    players = {}
    for t in teams:
        tid = t['team']['id']
        sq = json.load(open(os.path.join(RAW, 'squad_%d.json' % tid), encoding='utf-8'))['response'][0]['players']
        for p in sq:
            players[p['id']] = {'id': p['id'], 'name': p['name'], 'age': p.get('age'), 'team': t['team']['name'],
                                'team_id': tid, 'pos': POS.get(p.get('position'), 'MED'), 'rows': []}
        for f in glob.glob(os.path.join(RAW, 'players_%d_p*.json' % tid)):
            for x in json.load(open(f, encoding='utf-8'))['response']:
                for s in x['statistics']:
                    if s['team']['id'] == tid and s['league']['id'] == LEAGUE and s['league']['season'] == SEASON:
                        pid = x['player']['id']
                        players.setdefault(pid, {'id': pid, 'name': x['player']['name'], 'age': x['player'].get('age'),
                                                 'team': t['team']['name'], 'team_id': tid,
                                                 'pos': POS.get(s['games'].get('position'), 'MED'), 'rows': []})
                        players[pid]['rows'].append(s)
    # plantilla de 2024: solo los que tuvieron minutos con ese equipo en la temporada (la lista de plantilla es de 2026)
    players = {k: v for k, v in players.items() if any((r['games']['minutes'] or 0) > 0 for r in v['rows'])}
    return players


def aggregate(p):
    """Suma minutos y métricas de las filas de liga; devuelve valores por 90 y medias ponderadas."""
    mins = sum((s['games']['minutes'] or 0) for s in p['rows'])
    a = {'minutes': mins}
    def tot(get):
        vals = [num(get(s)) for s in p['rows']]
        vals = [v for v in vals if v is not None]
        return sum(vals) if vals else None
    a['games'] = sum((s['games']['appearences'] or 0) for s in p['rows'])
    per90 = (mins / 90.0) if mins else 0
    for key, get in {
        'passes': lambda s: s['passes']['total'], 'pass_acc': lambda s: s['passes']['accuracy'],
        'shots': lambda s: s['shots']['total'], 'goals': lambda s: s['goals']['total'],
        'tackles': lambda s: s['tackles']['total'], 'intercept': lambda s: s['tackles']['interceptions'],
        'dribbles': lambda s: s['dribbles']['attempts'], 'dribble_ok': lambda s: s['dribbles']['success'],
        'fouls_drawn': lambda s: s['fouls']['drawn'], 'saves': lambda s: s['goals']['saves'],
        'conceded': lambda s: s['goals']['conceded'],
    }.items():
        a[key] = tot(get)
    ratings = [(num(s['games']['rating']), s['games']['minutes'] or 0) for s in p['rows'] if num(s['games']['rating']) is not None]
    a['rating'] = (sum(r * m for r, m in ratings) / sum(m for _, m in ratings)) if ratings and sum(m for _, m in ratings) else None
    if per90:
        for k in ['passes', 'shots', 'goals', 'tackles', 'intercept', 'dribbles', 'fouls_drawn']:
            a[k + '90'] = (a[k] / per90) if a[k] is not None else None
    a['pass_acc'] = a['pass_acc']  # ya es porcentaje o None
    a['dribble_rate'] = (a['dribble_ok'] / a['dribbles']) if a['dribbles'] and a['dribble_ok'] is not None else None
    a['save_pct'] = (a['saves'] / (a['saves'] + a['conceded'])) if a['saves'] and a['conceded'] is not None and (a['saves'] + a['conceded']) > 0 else None
    return a


def reference_1996():
    """Lee data/teams.json (solo lectura) y devuelve la media ME de los 16 mejores de cada equipo de la liga en 1996-97."""
    path = os.path.join(HERE, '..', '..', 'data', 'teams.json')
    if not os.path.exists(path):
        return []
    T = json.load(open(path, encoding='utf-8'))
    teams = list(T.values()) if isinstance(T, dict) else T
    ROLE_DEM = {1: 'POR', 2: 'DEF', 3: 'DEF', 4: 'DEF', 5: 'DEF', 6: 'DEF', 7: 'MED', 8: 'MED', 10: 'MED', 11: 'MED', 15: 'MED', 18: 'MED', 12: 'DEL', 13: 'DEL', 14: 'DEL', 16: 'DEL', 17: 'DEL', 9: 'DEL'}
    out = []
    for t in teams:
        if t.get('league') != LIGA:
            continue
        me = []
        for p in t['players']:
            if not p.get('attrs') or p.get('id', 0) <= 0 or not p.get('roles'):
                continue
            me.append(calc_me(p['attrs'], ROLE_DEM.get(p['roles'][0], 'MED')))
        if me:
            out.append(statistics.mean(sorted(me, reverse=True)[:16]))
    return out


def pct_map(values):
    """Percentil (0-1) de cada valor dentro de la lista; None se queda en None."""
    pairs = sorted((v, i) for i, v in enumerate(values) if v is not None)
    n = len(pairs)
    out = [None] * len(values)
    for rank, (v, i) in enumerate(pairs):
        out[i] = (rank + 0.5) / n if n else None
    return out


def scale(p):
    """Percentil -> escala del juego 35-95."""
    return None if p is None else int(round(min(99, max(1, 35 + 60 * p))))


def main():
    players = load()
    eligible = [p for p in players.values() if sum((s['games']['minutes'] or 0) for s in p['rows']) >= MIN_MINUTES]
    for p in players.values():
        p['agg'] = aggregate(p)
    for p in eligible:
        p['elig'] = True
    el = [p for p in players.values() if p.get('elig')]
    # percentiles por demarcación entre los elegibles
    feats = {}
    for dem in ['POR', 'DEF', 'MED', 'DEL']:
        group = [p for p in el if p['pos'] == dem]
        if not group:
            continue
        feats[dem] = group
        for key, fn in [
            ('pass_vol', lambda a: a['passes90']), ('pass_acc', lambda a: a['pass_acc']),
            ('goals', lambda a: a['goals90']), ('shots', lambda a: a['shots90']),
            ('def', lambda a: ((a['tackles90'] or 0) + (a['intercept90'] or 0)) if a['tackles90'] is not None else None),
            ('drib_vol', lambda a: a['dribbles90']), ('drib_rate', lambda a: a['dribble_rate']),
            ('fouls', lambda a: a['fouls_drawn90']), ('rating', lambda a: a['rating']),
            ('save', lambda a: a['save_pct']),
        ]:
            vals = [fn(p['agg']) for p in group]
            for p, pc in zip(group, pct_map(vals)):
                p.setdefault('pct', {})[key] = pc
    # atributos por jugador
    for p in players.values():
        dem = p['pos']; pc = p.get('pct', {}); a = p['agg']
        src = {}
        def avg(*xs):
            xs = [x for x in xs if x is not None]
            return scale(sum(xs) / len(xs)) if xs else None
        attr = {}
        if p.get('elig'):
            attr['PASE'] = avg(pc.get('pass_vol'), pc.get('pass_acc')); src['PASE'] = 'stats'
            attr['REGATE'] = avg(pc.get('drib_vol'), pc.get('drib_rate')); src['REGATE'] = 'stats'
            attr['REMATE'] = avg(pc.get('goals')); src['REMATE'] = 'stats'
            attr['TIRO'] = avg(pc.get('shots')); src['TIRO'] = 'stats'
            attr['ENTRADAS'] = avg(pc.get('def')); src['ENTRADAS'] = 'stats'
            attr['CA'] = avg(pc.get('rating')); src['CA'] = 'stats'
            attr['AG'] = avg(pc.get('drib_vol'), pc.get('fouls')); src['AG'] = 'stats'
            attr['PORTERO'] = avg(pc.get('save')) if dem == 'POR' else 22; src['PORTERO'] = 'stats' if dem == 'POR' else 'constante'
            mmax = max(((x['agg']['minutes'] or 0) for x in el), default=1)
            attr['RE'] = int(round(55 + 35 * (a['minutes'] / mmax))); src['RE'] = 'minutos'
        else:
            src = {k: 'prior' for k in ATTRS}
        p['attr'] = attr; p['src'] = src
    # priors para los que no llegan a 450 minutos: mediana calibrada de su demarcación
    med = {}
    for dem in ['POR', 'DEF', 'MED', 'DEL']:
        group = [p for p in el if p['pos'] == dem]
        for key in ATTRS:
            vals = [p['attr'][key] for p in group if p['attr'].get(key) is not None]
            med[(dem, key)] = int(statistics.median(vals)) if vals else 50
    for p in players.values():
        if p.get('elig'):
            base = p['attr']
        else:
            base = {}
        dem = p['pos']
        final = {}
        for key in ATTRS:
            if key in base and base[key] is not None:
                final[key] = base[key]
            else:
                final[key] = med[(dem, key)]
        final['VE'] = PRIOR_VE[dem]  # VE no tiene dato: valor de partida por demarcación (luego ajuste por edad)
        final['RE'] = PRIOR_RE[dem] if not p.get('elig') else final['RE']
        age = num(p.get('age'))
        if age is not None:
            final['VE'] = max(1, min(99, final['VE'] + (2 if age <= 23 else 0) - (3 if age >= 31 else 0)))
        if dem != 'POR':
            final['PORTERO'] = {'DEF': 25, 'MED': 24, 'DEL': 22}[dem]
        for k in ATTRS:
            if k == 'PORTERO' and dem != 'POR':
                continue  # valor fijo de los jugadores de campo, no se desplaza
            final[k] = max(1, min(99, final[k] + SHIFT))
        a = [final[k] for k in ATTRS]
        p['attrs'] = a
        p['me'] = calc_me(a, dem)
        p['minutes'] = a and p['agg']['minutes']
    os.makedirs(OUT, exist_ok=True)
    out_players = [{'id': p['id'], 'name': p['name'], 'team': p['team'], 'team_id': p['team_id'], 'pos': p['pos'],
                    'age': p['age'], 'minutes': p['agg']['minutes'], 'elig': bool(p.get('elig')),
                    'attrs': dict(zip(ATTRS, p['attrs'])), 'me': p['me'], 'src': p.get('src', {})} for p in players.values()]
    json.dump(out_players, open(os.path.join(OUT, 'players.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # resumen: media ME por equipo (los 11 mejores ponderados por demarcación no se calculan aquí: se usa la media de la plantilla)
    by_team = {}
    for p in out_players:
        by_team.setdefault(p['team'], []).append(p['me'])
    summary = {t: {'n': len(v), 'best16_me': round(statistics.mean(sorted(v, reverse=True)[:16]), 1)} for t, v in sorted(by_team.items())}
    ref = reference_1996()
    summary_ref = {'1996-97 %s (mejores 16)' % LIGA: round(statistics.mean(ref), 1) if ref else None, '2024 %s (mejores 16)' % LIGA: round(statistics.mean([v['best16_me'] for v in summary.values()]), 1)}
    print('referencia:', summary_ref)
    json.dump(summary, open(os.path.join(OUT, 'teams_summary.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('jugadores', len(out_players), '| con estadísticas', len(el), '| con prior', len(out_players) - len(el))
    print('equipos:', len(summary))
    for t, v in summary.items():
        print('  %-24s n=%2d  mejores16 %5.1f' % (t, v['n'], v['best16_me']))
    top = sorted(out_players, key=lambda x: -x['me'])[:10]
    print('top ME:', [(x['name'], x['team'], x['me']) for x in top])


if __name__ == '__main__':
    sys.exit(main())
