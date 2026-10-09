#!/usr/bin/env python3
"""Descarga de API-Football (plantillas y jugadores de la temporada) a tools/update2026/raw/apifootball/.

Requiere la clave en la variable de entorno API_FOOTBALL_KEY. Sin clave solo muestra el plan (--dry-run).
- Respeta una cuota diaria (por defecto 90 peticiones; el plan gratuito da 100 al día).
- Es reanudable: cada respuesta se guarda en un archivo y no se vuelve a pedir.
- Los endpoints y los IDs de liga son los de la documentación v3 y deben confirmarse con una clave real
  (/leagues y la cabecera x-ratelimit-requests-remaining). La documentación web respondió 403 desde el entorno de desarrollo.
"""
import argparse, datetime, json, os, sys, time, urllib.parse, urllib.request

BASE = 'https://v3.football.api-sports.io/'
# ligas del juego -> id de API-Football (a confirmar con /leagues)
LEAGUES = {'ESP1': 140, 'ESP2': 141, 'ENG1': 39, 'ENG2': 40, 'ITA1': 135, 'ITA2': 136}
# comprobado con la clave: el plan gratuito solo da acceso a estas temporadas (2026 requiere plan de pago)
FREE_SEASONS = (2022, 2024)
# el plan gratuito solo deja pedir hasta la página 3 de jugadores (20 por página)
MAX_PAGES_FREE = 3
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw', 'apifootball')


def quota_path():
    return os.path.join(RAW, 'quota.json')


def load_quota():
    today = datetime.date.today().isoformat()
    q = {'date': today, 'used': 0}
    if os.path.exists(quota_path()):
        with open(quota_path(), encoding='utf-8') as f:
            old = json.load(f)
        if old.get('date') == today:
            q = old
    return q


def save_quota(q):
    os.makedirs(RAW, exist_ok=True)
    with open(quota_path(), 'w', encoding='utf-8') as f:
        json.dump(q, f)


def get(path, params, key, q, max_requests):
    if q['used'] >= max_requests:
        raise SystemExit('Cuota diaria alcanzada (%d). Vuelve mañana: se reanuda desde la caché.' % max_requests)
    time.sleep(6.5)  # el plan permite 10 peticiones por minuto
    url = BASE + path + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'x-apisports-key': key, 'User-Agent': 'pcfutbol-web update2026'})
    with urllib.request.urlopen(req, timeout=60) as r:
        body = json.load(r)
        remaining = r.headers.get('x-ratelimit-requests-remaining')
    q['used'] += 1
    save_quota(q)
    if body.get('errors'):
        raise SystemExit('API-Football devolvió errores: %s' % body['errors'])
    return body, remaining


def cached(name, fn):
    dst = os.path.join(RAW, name + '.json')
    if os.path.exists(dst):
        with open(dst, encoding='utf-8') as f:
            return json.load(f), False
    body = fn()
    os.makedirs(RAW, exist_ok=True)
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(body, f, ensure_ascii=False)
    return body, True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--season', type=int, default=2024)
    ap.add_argument('--max-requests', type=int, default=90)
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    key = os.environ.get('API_FOOTBALL_KEY', '')
    q = load_quota()
    if a.dry_run or not key:
        print('Plan (sin hacer peticiones):')
        print('  ligas:', ', '.join('%s=%d' % kv for kv in LEAGUES.items()))
        print('  temporada:', a.season, '· cuota diaria:', a.max_requests)
        print('  peticiones: 1 de equipos por liga + 1 de plantilla por equipo + páginas de jugadores (aprox. 2-3 por equipo)')
        print('  caché:', RAW, '· usadas hoy:', q['used'])
        if not key:
            print('Falta API_FOOTBALL_KEY. Exporta la clave y vuelve a ejecutar.')
        return
    season = a.season
    if season > FREE_SEASONS[1] and q.get('plan', 'Free') == 'Free':
        raise SystemExit('El plan gratuito no da acceso a %d (solo %d-%d). Usa --season 2024 o contrata un plan.' % (season, FREE_SEASONS[0], FREE_SEASONS[1]))
    for code, lid in LEAGUES.items():
        teams_body, _ = cached('teams_%s' % code, lambda: get('teams', {'league': lid, 'season': season}, key, q, a.max_requests)[0])
        for t in teams_body.get('response', []):
            tid = t['team']['id']
            cached('squad_%d' % tid, lambda: get('players/squads', {'team': tid}, key, q, a.max_requests)[0])
            page = 1
            while True:
                name = 'players_%d_p%d' % (tid, page)
                body, _ = cached(name, lambda: get('players', {'team': tid, 'season': season, 'page': page}, key, q, a.max_requests)[0])
                paging = body.get('paging', {})
                if page >= int(paging.get('total', 1)) or (q.get('plan', 'Free') == 'Free' and page >= MAX_PAGES_FREE):
                    break
                page += 1
        print('listo', code, flush=True)
    print('cuota usada hoy:', q['used'], 'de', a.max_requests)


if __name__ == '__main__':
    main()
