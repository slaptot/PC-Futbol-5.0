#!/usr/bin/env python3
"""Escudos reales de los clubes de la prueba 2024: logo de Wikidata (P154) -> Commons. Solo uso local en la prueba.
Salida: out/esp1_2024/img/{esc,escbig,nano,ridi}/<id>.png y out/esp1_2024/escudos.json (fuente y licencia)."""
import json, os, subprocess, sys, time, urllib.parse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
RAW = os.path.join(OUT, 'raw_escudos')
MAGICK = os.environ.get('MAGICK', '/opt/homebrew/bin/magick')
UA = 'PCFutbolReplicaPrueba/1.0 (prueba local, no publicado)'
SIZES = [('esc', '48x64'), ('escbig', '164x174'), ('nano', '24x32'), ('ridi', '17x20')]
# nombre en el juego de prueba -> nombre oficial para buscar
SEARCH = {
    'Alaves': 'Deportivo Alavés', 'Athletic Club': 'Athletic Club', 'Atletico Madrid': 'Atlético de Madrid', 'Barcelona': 'FC Barcelona',
    'Celta Vigo': 'RC Celta de Vigo', 'Espanyol': 'RCD Espanyol', 'Getafe': 'Getafe CF', 'Girona': 'Girona FC', 'Las Palmas': 'UD Las Palmas',
    'Leganes': 'CD Leganés', 'Mallorca': 'RCD Mallorca', 'Osasuna': 'CA Osasuna', 'Rayo Vallecano': 'Rayo Vallecano', 'Real Betis': 'Real Betis',
    'Real Madrid': 'Real Madrid CF', 'Real Sociedad': 'Real Sociedad', 'Sevilla': 'Sevilla FC', 'Valencia': 'Valencia CF',
    'Valladolid': 'Real Valladolid CF', 'Villarreal': 'Villarreal CF',
    'Albacete': 'Albacete Balompié', 'Almeria': 'UD Almería', 'Burgos': 'Burgos CF', 'Cadiz': 'Cádiz CF', 'Castellón': 'CD Castellón',
    'Cordoba': 'Córdoba CF', 'Deportivo La Coruna': 'Deportivo de La Coruña', 'Eibar': 'SD Eibar', 'Eldense': 'CD Eldense', 'Elche': 'Elche CF',
    'Granada CF': 'Granada CF', 'Huesca': 'SD Huesca', 'Levante': 'Levante UD', 'Malaga': 'Málaga CF', 'Mirandes': 'CD Mirandés',
    'Oviedo': 'Real Oviedo', 'Racing Ferrol': 'Racing Club Ferrol', 'Racing Santander': 'Real Racing Club', 'Sporting Gijon': 'Real Sporting de Gijón',
    'Tenerife': 'CD Tenerife', 'Zaragoza': 'Real Zaragoza', 'FC Cartagena': 'FC Cartagena',
}
LICENSE_OK = ('CC0', 'CC BY', 'CC BY-SA', 'Public domain', 'PD-')


def get(url, binary=False):
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 5:
                raise
            time.sleep(15 * (2 ** i))


def wd(params):
    return get('https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json')))


def logo_for(term):
    ids = [x['id'] for x in wd({'action': 'wbsearchentities', 'search': term, 'language': 'es', 'type': 'item', 'limit': 6}).get('search', [])]
    time.sleep(1.5)
    if not ids:
        return None
    ents = wd({'action': 'wbgetentities', 'ids': '|'.join(ids), 'props': 'claims|descriptions|labels', 'languages': 'es|en'}).get('entities', {})
    time.sleep(1.5)
    for qid in ids:
        e = ents.get(qid, {})
        desc = ((e.get('descriptions', {}).get('es') or e.get('descriptions', {}).get('en') or {}).get('value', '')).lower()
        logos = [c['mainsnak']['datavalue']['value'] for c in e.get('claims', {}).get('P154', []) if c.get('mainsnak', {}).get('datavalue')]
        if logos and ('fútbol' in desc or 'futbol' in desc or 'football' in desc):
            return {'wikidata': qid, 'etiqueta': (e.get('labels', {}).get('es') or {}).get('value', ''), 'fichero': logos[0]}
    return None


import re
DISTINCT = {'Alaves': 'Alavés', 'Athletic Club': 'Athletic', 'Atletico Madrid': 'Atlético', 'Barcelona': 'Barcelona', 'Celta Vigo': 'Celta',
            'Espanyol': 'Espanyol', 'Getafe': 'Getafe', 'Girona': 'Girona', 'Las Palmas': 'Palmas', 'Leganes': 'Leganés', 'Mallorca': 'Mallorca',
            'Osasuna': 'Osasuna', 'Rayo Vallecano': 'Rayo', 'Real Betis': 'Betis', 'Real Madrid': 'Madrid', 'Real Sociedad': 'Sociedad',
            'Sevilla': 'Sevilla', 'Valencia': 'Valencia', 'Valladolid': 'Valladolid', 'Villarreal': 'Villarreal', 'Albacete': 'Albacete',
            'Almeria': 'Almería', 'Burgos': 'Burgos', 'Cadiz': 'Cádiz', 'Castellón': 'Castell', 'Cordoba': 'Córdoba', 'Deportivo La Coruna': 'Coruña',
            'Eibar': 'Eibar', 'Eldense': 'Eldense', 'Elche': 'Elche', 'Granada CF': 'Granada', 'Huesca': 'Huesca', 'Levante': 'Levante',
            'Malaga': 'Málaga', 'Mirandes': 'Miranda', 'Oviedo': 'Oviedo', 'Racing Ferrol': 'Ferrol', 'Racing Santander': 'Racing',
            'Sporting Gijon': 'Sporting', 'Tenerife': 'Tenerife', 'Zaragoza': 'Zaragoza', 'FC Cartagena': 'Cartagena'}


def commons_logo(name):
    """Plan B: archivo de Commons con 'escudo' o 'logo' en el título y el nombre distintivo del club."""
    q = urllib.parse.urlencode({'action': 'query', 'generator': 'search', 'gsrsearch': 'escudo ' + SEARCH.get(name, name),
                                'gsrnamespace': 6, 'gsrlimit': 10, 'format': 'json'})
    pages = get('https://commons.wikimedia.org/w/api.php?' + q).get('query', {}).get('pages', {})
    key = DISTINCT.get(name, name).lower()
    for p in sorted(pages.values(), key=lambda x: x.get('index', 99)):
        t = p['title'][5:]
        if re.search(r'escudo|logo|badge|crest', t, re.I) and key in t.lower() and t.lower().endswith(('.svg', '.png', '.jpg')):
            return t
    return None


def commons(fichero):
    q = urllib.parse.urlencode({'action': 'query', 'titles': 'File:' + fichero, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 400, 'format': 'json'})
    p = list(get('https://commons.wikimedia.org/w/api.php?' + q)['query']['pages'].values())[0]
    ii = p['imageinfo'][0]
    md = ii.get('extmetadata', {})
    return {'thumb': ii.get('thumburl'), 'pagina': ii.get('descriptionurl'), 'licencia': md.get('LicenseShortName', {}).get('value', ''),
            'autor': md.get('Artist', {}).get('value', '')}


def convert(src, dst, size):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    cmd = [MAGICK, src + '[0]', '-background', 'none', '-resize', size, '-gravity', 'center', '-extent', size, dst]
    subprocess.run(cmd, check=True, capture_output=True)


def main():
    ids = json.load(open(os.path.join(OUT, 'ids.json'), encoding='utf-8'))
    os.makedirs(RAW, exist_ok=True)
    info = {}
    for name, tid in sorted(ids.items(), key=lambda x: x[1]):
        term = SEARCH.get(name, name)
        try:
            hit = logo_for(term)
            if hit:
                c = commons(hit['fichero'])
            else:
                f = commons_logo(name)
                time.sleep(1.5)
                if not f:
                    info[str(tid)] = {'club': name, 'estado': 'sin_escudo'}
                    print('sin escudo:', tid, name)
                    continue
                hit = {'wikidata': '', 'etiqueta': term, 'fichero': f}
                c = commons(f)
            time.sleep(1.5)
            if not any(c['licencia'].startswith(l) for l in LICENSE_OK):
                info[str(tid)] = dict(hit, club=name, estado='licencia_no_libre', **c)
                print('licencia:', tid, name, c['licencia'])
                continue
            src = os.path.join(RAW, '%d.png' % tid)
            with open(src, 'wb') as f:
                f.write(get(c['thumb'], binary=True))
            for folder, size in SIZES:
                convert(src, os.path.join(OUT, 'img', folder, '%d.png' % tid), size)
            info[str(tid)] = dict(hit, club=name, estado='ok', **c)
            print('ok', tid, name, '|', hit['fichero'], '|', c['licencia'])
        except Exception as e:
            info[str(tid)] = {'club': name, 'estado': 'error: ' + str(e)[:120]}
            print('error', tid, name, str(e)[:100])
        time.sleep(1.5)
    json.dump(info, open(os.path.join(OUT, 'escudos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('escudos reales:', sum(1 for v in info.values() if v.get('estado') == 'ok'), 'de', len(info))


if __name__ == '__main__':
    sys.exit(main())
