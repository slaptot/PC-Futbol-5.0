#!/usr/bin/env python3
"""Busca la foto de cada entrenador de la prueba 2024 en Wikidata y Wikimedia Commons, y la descarga solo con
licencia libre (CC0, CC BY, CC BY-SA o dominio público). Uso local en la prueba.
Salida: out/esp1_2024/raw_entrenadores/<id_equipo>.<ext> y out/esp1_2024/entrenadores.json (fuente, autor y licencia)."""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
RAW = os.path.join(OUT, 'raw_entrenadores')
UA = 'PCFutbolReplicaPrueba/1.0 (prueba local, no publicado)'
MANAGER = 'Q628099'  # Wikidata: association football manager (entrenador de fútbol)
LICENSE_OK = re.compile(r'^(CC0|CC BY|CC BY-SA|Public domain)')


def get(url, binary=False):
    """GET con reintentos: si Wikimedia responde 429 (demasiadas peticiones), espera más cada vez."""
    for intento in range(6):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code != 429 or intento == 5:
                raise
            time.sleep(15 * (2 ** intento))


def api(url):
    return get(url)


def norm(s):
    return unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()


def wd_search(name):
    q = urllib.parse.urlencode({'action': 'wbsearchentities', 'search': name, 'language': 'en', 'type': 'item',
                                'limit': 6, 'format': 'json'})
    return [x['id'] for x in api('https://www.wikidata.org/w/api.php?' + q).get('search', [])]


def wd_entities(ids):
    q = urllib.parse.urlencode({'action': 'wbgetentities', 'ids': '|'.join(ids), 'props': 'claims|labels',
                                'languages': 'en|es', 'format': 'json'})
    return api('https://www.wikidata.org/w/api.php?' + q).get('entities', {})


def claim_values(ent, prop):
    out = []
    for c in ent.get('claims', {}).get(prop, []):
        v = c.get('mainsnak', {}).get('datavalue', {}).get('value')
        if v is not None:
            out.append(v)
    return out


def commons_info(filename):
    q = urllib.parse.urlencode({'action': 'query', 'titles': 'File:' + filename, 'prop': 'imageinfo',
                                'iiprop': 'url|extmetadata', 'iiurlwidth': 600, 'format': 'json'})
    page = list(api('https://commons.wikimedia.org/w/api.php?' + q)['query']['pages'].values())[0]
    ii = page['imageinfo'][0]
    md = ii.get('extmetadata', {})
    return {'thumb': ii.get('thumburl'), 'page': ii.get('descriptionurl'),
            'license': md.get('LicenseShortName', {}).get('value', ''),
            'author': re.sub(r'<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip()}


def find_manager(name):
    """Primer resultado de Wikidata que sea entrenador de fútbol, tenga foto y cuyo nombre contenga el apellido."""
    surname = norm(name.split()[-1])
    ids = wd_search(name)
    time.sleep(2)
    if not ids:
        return None
    for qid, ent in wd_entities(ids).items():
        label = (ent.get('labels', {}).get('en') or ent.get('labels', {}).get('es') or {}).get('value', '')
        occ = [v.get('id') for v in claim_values(ent, 'P106') if isinstance(v, dict)]
        img = [v for v in claim_values(ent, 'P18') if isinstance(v, str)]
        if MANAGER in occ and img and surname in norm(label):
            return {'wikidata': qid, 'label': label, 'file': img[0]}
    return None


def main():
    teams = json.load(open(os.path.join(OUT, 'teams.json'), encoding='utf-8'))
    os.makedirs(RAW, exist_ok=True)
    previo = {}
    if os.path.exists(os.path.join(OUT, 'entrenadores.json')):
        previo = json.load(open(os.path.join(OUT, 'entrenadores.json'), encoding='utf-8'))
    result = {}
    for tid, t in sorted(teams.items(), key=lambda x: int(x[0])):
        if t.get('league') not in ('ESP1', 'ESP2') or not t.get('prueba'):
            continue
        name = (t.get('coach') or {}).get('name', '-')
        rec = {'club': t['name'], 'entrenador': name}
        old = previo.get(tid, {})
        if old.get('estado') == 'descargada' and os.path.exists(os.path.join(RAW, old.get('archivo', ''))):
            result[tid] = old
            continue
        if not name or name == '-':
            rec['estado'] = 'sin_nombre'
            result[tid] = rec
            continue
        try:
            m = find_manager(name)
            if not m:
                rec['estado'] = 'no_encontrado'
                result[tid] = rec
                continue
            info = commons_info(m['file'])
            time.sleep(2)
            rec.update({'wikidata': m['wikidata'], 'fichero': m['file'], 'licencia': info['license'],
                        'autor': info['author'], 'pagina': info['page']})
            if not LICENSE_OK.match(info['license'] or ''):
                rec['estado'] = 'licencia_no_libre'
                result[tid] = rec
                continue
            ext = os.path.splitext(urllib.parse.urlparse(info['thumb']).path)[1].lower() or '.jpg'
            dst = os.path.join(RAW, tid + ext)
            with open(dst, 'wb') as f:
                f.write(get(info['thumb'], binary=True))
            rec['estado'] = 'descargada'
            rec['archivo'] = os.path.basename(dst)
            time.sleep(2)
        except Exception as e:  # red o formato inesperado: se anota y se sigue
            rec['estado'] = 'error: ' + str(e)[:120]
        result[tid] = rec
        print(tid, rec.get('estado'), '|', name, '|', rec.get('fichero', ''), '|', rec.get('licencia', ''))
    json.dump(result, open(os.path.join(OUT, 'entrenadores.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    done = sum(1 for r in result.values() if r.get('estado') == 'descargada')
    print('descargadas:', done, 'de', len(result))


if __name__ == '__main__':
    sys.exit(main())
