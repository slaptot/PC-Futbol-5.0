#!/usr/bin/env python3
"""Primera RFEF (Primera Federación): los 5 primeros de cada grupo en 2024 (clasificación final) para la prueba.
Pide clasificación y datos de los equipos de los dos grupos, plantillas y páginas de jugadores de los 10 elegidos.
Caché en raw/apifootball/ (teams_PRFEF.json, squad_<id>.json, players_<id>_p<n>.json). Cuota propia: quota_prfef.json."""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw', 'apifootball')
GROUPS = {'435': 'G1', '436': 'G2'}  # Primera Federación (Primera División RFEF) grupo 1 y grupo 2
SEASON = 2024
TOP = 5
MAX_REQ = 90
MAX_PAGES = 3  # plan gratuito
BASE = 'https://v3.football.api-sports.io/'
QUOTA = os.path.join(RAW, 'quota_prfef.json')


def quota():
    today = time.strftime('%Y-%m-%d')
    q = json.load(open(QUOTA)) if os.path.exists(QUOTA) else {'date': today, 'used': 0}
    if q.get('date') != today:
        q = {'date': today, 'used': 0}
    return q


def save(q):
    json.dump(q, open(QUOTA, 'w'))


def get(path, params, key, q):
    if q['used'] >= MAX_REQ:
        raise SystemExit('Cupo propio alcanzado (%d). Continúa en otro momento.' % MAX_REQ)
    url = BASE + path + '?' + '&'.join('%s=%s' % kv for kv in params.items())
    req = urllib.request.Request(url, headers={'x-apisports-key': key})
    q['used'] += 1
    save(q)
    with urllib.request.urlopen(req, timeout=60) as r:
        body = json.load(r)
    time.sleep(6.5)
    if body.get('errors'):
        raise SystemExit('API: %s' % body['errors'])
    return body


def cached(name, fn):
    p = os.path.join(RAW, name + '.json')
    if os.path.exists(p):
        return json.load(open(p, encoding='utf-8'))
    body = fn()
    json.dump(body, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    return body


def main():
    key = os.environ.get('API_FOOTBALL_KEY', '')
    if not key:
        raise SystemExit('Falta API_FOOTBALL_KEY')
    q = quota()
    os.makedirs(RAW, exist_ok=True)
    top = []
    for lid, g in GROUPS.items():
        st = cached('standings_%s' % lid, lambda: get('standings', {'league': lid, 'season': SEASON}, key, q))
        table = st['response'][0]['league']['standings'][0]
        table = sorted(table, key=lambda x: x['rank'])
        top += [{'id': r['team']['id'], 'name': r['team']['name'], 'group': g, 'rank': r['rank'], 'points': r['points']} for r in table[:TOP]]
    tid_set = {t['id'] for t in top}
    teams = cached('teams_PRFEF_all', lambda: {'response': sum([get('teams', {'league': lid, 'season': SEASON}, key, q)['response'] for lid in GROUPS], [])})
    chosen = [x for x in teams['response'] if x['team']['id'] in tid_set]
    json.dump({'response': chosen, 'top': top}, open(os.path.join(RAW, 'teams_PRFEF.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    for t in chosen:
        tid = t['team']['id']
        cached('squad_%d' % tid, lambda: get('players/squads', {'team': tid}, key, q))
        page = 1
        while True:
            body = cached('players_%d_p%d' % (tid, page), lambda: get('players', {'team': tid, 'season': SEASON, 'page': page}, key, q))
            total = int(body.get('paging', {}).get('total', 1))
            if page >= total or page >= MAX_PAGES:
                break
            page += 1
        print('listo', t['team']['name'], flush=True)
    print('cupo propio usado hoy:', q['used'], 'de', MAX_REQ)


if __name__ == '__main__':
    sys.exit(main())
