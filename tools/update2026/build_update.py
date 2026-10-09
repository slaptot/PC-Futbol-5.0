#!/usr/bin/env python3
"""Construye la base actualizada (jugadores y clubes de las 6 ligas del juego) en tools/update2026/out/.

NO escribe en data/ ni se usa en el juego: es la propuesta para revisar antes de integrar nada.
Fuente base: Transfermarkt (CC0, datos hasta 6-jul-2026), tools/update2026/raw/transfermarkt/.
Las estadísticas de API-Football se añadirían en otro paso, cuando haya clave y se confirme la licencia.
"""
import collections, csv, gzip, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw', 'transfermarkt')
OUT = os.path.join(HERE, 'out')

# ligas del juego -> código de competición en Transfermarkt. El dataset CC0 solo trae la 1ª división:
# las 2ª (ESP2, ENG2, ITA2) tendrán que venir de API-Football.
LEAGUES = {'ESP1': 'ES1', 'ENG1': 'GB1', 'ITA1': 'IT1'}
PENDIENTES = ['ESP2', 'ENG2', 'ITA2']
POS = {'Goalkeeper': 'POR', 'Defender': 'DEF', 'Midfield': 'MED', 'Attack': 'DEL'}


def read(name):
    with gzip.open(os.path.join(RAW, name + '.csv.gz'), 'rt', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def main():
    if not os.path.isdir(RAW):
        sys.exit('Falta ' + RAW + ': ejecuta primero fetch_transfermarkt.py')
    comps = {c['competition_id']: c for c in read('competitions')}
    league_ids = {v: k for k, v in LEAGUES.items()}
    missing = [c for c in LEAGUES.values() if c not in comps]
    if missing:
        sys.exit('Competiciones no encontradas en el dataset: ' + ', '.join(missing))
    print('ligas sin cubrir por el dataset (pendientes de API-Football):', ', '.join(PENDIENTES))

    # solo la última temporada del dataset (last_season): la tabla guarda también clubes de temporadas anteriores
    last = max(c['last_season'] for c in read('clubs'))
    clubs = [c for c in read('clubs') if c['domestic_competition_id'] in LEAGUES.values() and c['last_season'] == last]
    club_ids = {c['club_id']: c for c in clubs}
    players = [p for p in read('players') if p['current_club_id'] in club_ids and p['last_season'] == last]

    out_clubs, out_players = [], []
    for c in clubs:
        out_clubs.append({'id': c['club_id'], 'name': c['name'], 'league': league_ids[c['domestic_competition_id']],
                          'stadium': c['stadium_name'], 'seats': c['stadium_seats'], 'coach': c['coach_name'],
                          'squad_size': c['squad_size'], 'avg_age': c['average_age'],
                          'market_value_total': c['total_market_value']})
    for p in players:
        out_players.append({'id': p['player_id'], 'name': p['name'], 'club_id': p['current_club_id'],
                            'league': league_ids[p['current_club_domestic_competition_id']],
                            'position': POS.get(p['position'], p['position'] or ''), 'sub_position': p['sub_position'],
                            'dob': p['date_of_birth'], 'nationality': p['country_of_citizenship'],
                            'height_cm': p['height_in_cm'], 'foot': p['foot'],
                            'market_value_eur': p['market_value_in_eur'], 'contract_until': p['contract_expiration_date']})

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'clubs.json'), 'w', encoding='utf-8') as f:
        json.dump(out_clubs, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, 'players.json'), 'w', encoding='utf-8') as f:
        json.dump(out_players, f, ensure_ascii=False, indent=1)

    # resumen para revisar: clubes y jugadores por liga, y jugadores sin posición o sin valor
    per = collections.Counter(c['league'] for c in out_clubs)
    pl = collections.Counter(p['league'] for p in out_players)
    print('clubes por liga:', dict(per))
    print('jugadores por liga:', dict(pl))
    print('jugadores sin posición:', sum(1 for p in out_players if not p['position']))
    print('jugadores sin valor de mercado:', sum(1 for p in out_players if not p['market_value_eur']))
    print('temporada de los datos (último last_season):', max(c['last_season'] for c in clubs))
    print('escrito en', OUT)


if __name__ == '__main__':
    main()
