#!/usr/bin/env python3
"""Banderas de los países de la prueba que no estaban en el juego: bandera oficial de Commons (licencia comprobada)
y dos tamaños del juego (img/band 14x10, img/bandbig 30x20). Códigos nuevos 118 en adelante (los 90-117 ya existían en el juego original)."""
import json, os, re, subprocess, sys, time, urllib.parse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(HERE, '..', '..')
MAGICK = '/opt/homebrew/bin/magick'
UA = 'PCFutbolReplicaPrueba/1.0 (prueba local, no publicado)'
# (código del juego, nombre en español, término para buscar la bandera en Commons)
PAISES = [
    (118, 'Irán', 'Iran'), (119, 'Corea del Sur', 'South Korea'), (120, 'Malí', 'Mali'), (121, 'Costa de Marfil', 'Ivory Coast'),
    (122, 'Cuba', 'Cuba'), (123, 'Jamaica', 'Jamaica'), (124, 'Nueva Zelanda', 'New Zealand'), (125, 'Togo', 'Togo'),
    (126, 'Gabón', 'Gabon'), (127, 'Zimbabue', 'Zimbabwe'), (128, 'Burkina Faso', 'Burkina Faso'), (129, 'Cabo Verde', 'Cape Verde'),
    (130, 'RD del Congo', 'Democratic Republic of the Congo'), (131, 'Curazao', 'Curaçao'), (132, 'Rep. Dominicana', 'Dominican Republic'),
    (133, 'Guinea Ecuatorial', 'Equatorial Guinea'), (134, 'Gambia', 'The Gambia'), (135, 'Guadalupe', 'Guadeloupe'), (136, 'Guinea', 'Guinea'),
    (137, 'Guinea-Bisáu', 'Guinea-Bissau'), (138, 'Kosovo', 'Kosovo'), (139, 'Martinica', 'Martinique'), (140, 'Mauritania', 'Mauritania'),
    (141, 'Montenegro', 'Montenegro'), (142, 'Mozambique', 'Mozambique'), (143, 'Níger', 'Niger'), (144, 'Puerto Rico', 'Puerto Rico'),
    (145, 'Sierra Leona', 'Sierra Leone'), (146, 'Surinam', 'Suriname'),
]
LICENSE_OK = ('CC0', 'CC BY', 'CC BY-SA', 'Public domain')


def get(url, binary=False):
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                d = r.read()
            return d if binary else json.loads(d)
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 5:
                raise
            time.sleep(15 * (2 ** i))


def bandera(term):
    q = urllib.parse.urlencode({'action': 'query', 'generator': 'search', 'gsrsearch': 'Flag of %s' % term, 'gsrnamespace': 6,
                                'gsrlimit': 10, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 300, 'format': 'json'})
    pages = get('https://commons.wikimedia.org/w/api.php?' + q).get('query', {}).get('pages', {})
    for p in sorted(pages.values(), key=lambda x: x.get('index', 99)):
        t = p['title'][5:]
        if t.lower().startswith('flag of ') and t.lower().endswith('.svg') and term.lower().split()[0] in t.lower():
            ii = p['imageinfo'][0]
            md = ii.get('extmetadata', {})
            return {'titulo': t, 'thumb': ii.get('thumburl'), 'licencia': md.get('LicenseShortName', {}).get('value', ''),
                    'pagina': ii.get('descriptionurl')}
    return None


def main():
    raw = os.path.join(HERE, 'out', 'esp1_2024', 'raw_banderas')
    os.makedirs(raw, exist_ok=True)
    info = {}
    for code, nombre, term in PAISES:
        try:
            b = bandera(term)
            time.sleep(2)
            if not b:
                print('sin bandera', code, nombre); continue
            if not any(b['licencia'].startswith(x) for x in LICENSE_OK):
                print('licencia no libre', code, nombre, b['licencia']); continue
            src = os.path.join(raw, '%d.png' % code)
            open(src, 'wb').write(get(b['thumb'], binary=True))
            for d, sz in (('img/band', '14x10'), ('img/bandbig', '30x20')):
                dst = os.path.join(GAME, d, '%d.png' % code)
                subprocess.run([MAGICK, src, '-background', 'none', '-resize', sz + '!', '-colors', '64', dst], check=True)
            info[code] = dict(nombre=nombre, **b)
            print('ok', code, nombre, '|', b['titulo'], '|', b['licencia'])
            time.sleep(2)
        except Exception as e:
            print('error', code, nombre, str(e)[:100])
    json.dump(info, open(os.path.join(HERE, 'out', 'esp1_2024', 'banderas_nuevas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('banderas nuevas:', len(info), 'de', len(PAISES))


if __name__ == '__main__':
    sys.exit(main())
