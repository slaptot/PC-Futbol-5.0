#!/usr/bin/env python3
"""Índice del buscador global para la prueba 2024 (out/esp1_2024/search.json), mismo formato que data/search.json:
equipos, entrenadores (con su biografía de la prueba) y jugadores de la liga 1ª 2024."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
ROLES = {1: 'Portero', 2: 'Lateral derecho', 3: 'Lateral izquierdo', 4: 'Líbero', 5: 'Central izquierdo', 6: 'Central derecho',
         7: 'Centrocampista derecha', 8: 'Interior derecho', 9: 'Delantero centro', 10: 'Medio centro organizador',
         11: 'Centrocampista izquierda', 12: 'Extremo derecho', 13: 'Media punta', 14: 'Extremo izquierdo',
         15: 'Medio centro defensivo', 16: 'Media punta derecha', 17: 'Media punta izquierda', 18: 'Interior izquierdo'}
LIGA = '1ª División · 2024'


def main():
    teams = json.load(open(os.path.join(OUT, 'teams.json'), encoding='utf-8'))
    docs = []
    for tid, t in sorted(teams.items(), key=lambda x: int(x[0])):
        if t.get('league') != 'ESP1' or not t.get('prueba'):
            continue
        tid = int(tid)
        coach = t['coach'].get('full') or t['coach']['name']
        parts = [t['full'], 'Estadio ' + t['stadium'], 'Fundado en %s' % t['founded']]
        if t.get('president') and t['president'] != '-':
            parts.append('Presidente ' + t['president'])
        parts.append('Entrenador ' + coach)
        docs.append(['team', tid, t['name'], ' · '.join(parts), LIGA])
        bp = os.path.join(OUT, 'bio', '%d.json' % tid)
        if os.path.exists(bp) and coach != '-':
            c = json.load(open(bp, encoding='utf-8'))['coach']
            docs.append(['coach', tid, 'Entrenador: ' + coach,
                         '\n'.join([x for x in c['texts'] + [c['career'], c['playercareer'], c['quotes']] if x]), t['name']])
        for i, p in enumerate(t['players']):
            txt = [p['full'] or p['name'], ', '.join(ROLES.get(r, '') for r in p['roles'])]
            if p.get('birthplace'):
                txt.append('Nacido en ' + p['birthplace'])
            docs.append(['player', [tid, i], p['name'], '\n'.join(txt), t['name'] + ' · ' + LIGA])
    json.dump(docs, open(os.path.join(OUT, 'search.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('documentos de la prueba:', len(docs))


if __name__ == '__main__':
    sys.exit(main())
