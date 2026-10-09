#!/usr/bin/env python3
"""Ficha de entrenador para la prueba 2024: foto (Commons) y datos (Wikidata + Wikipedia en español).
- Descarga las fotos elegidas a mano en Commons (licencia libre) y actualiza out/esp1_2024/entrenadores.json.
- Escribe out/esp1_2024/bio/<id_equipo>.json con el mismo formato que data/bio/ (coach: texts, career, playercareer, quotes).
- Escribe out/esp1_2024/entrenadores_info.json con las fuentes (Wikidata, Wikipedia, Commons y autor).
Uso solo local en la prueba."""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
RAW = os.path.join(OUT, 'raw_entrenadores')
UA = 'PCFutbolReplicaPrueba/1.0 (prueba local, no publicado)'
MANAGER = 'Q628099'
LICENSE_OK = re.compile(r'^(CC0|CC BY|CC BY-SA|Public domain)')
# fotos elegidas a mano tras revisar la descripción del archivo en Commons (id equipo -> archivo)
# fotos elegidas a mano (id equipo -> archivo en Commons); se rellenan tras la búsqueda automática
PHOTOS = {}
NO_PHOTO = {}  # id equipo -> nombre, sin foto fiable en Commons


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


def norm(s):
    return unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()


def wd(params):
    return get('https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode(dict(params, format='json')))


def commons_file(title):
    q = urllib.parse.urlencode({'action': 'query', 'titles': 'File:' + title, 'prop': 'imageinfo',
                                'iiprop': 'url|extmetadata', 'iiurlwidth': 600, 'format': 'json'})
    p = list(get('https://commons.wikimedia.org/w/api.php?' + q)['query']['pages'].values())[0]
    ii = p['imageinfo'][0]
    md = ii.get('extmetadata', {})
    return {'thumb': ii.get('thumburl'), 'page': ii.get('descriptionurl'),
            'license': md.get('LicenseShortName', {}).get('value', ''),
            'author': re.sub(r'<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip()}


def label(ent):
    labs = ent.get('labels', {})
    return (labs.get('es') or labs.get('en') or {}).get('value', '')


def claims(ent, prop):
    out = []
    for c in ent.get('claims', {}).get(prop, []):
        v = c.get('mainsnak', {}).get('datavalue', {}).get('value')
        if v is None:
            continue
        def qual(p):
            q = c.get('qualifiers', {}).get(p, [{}])[0].get('datavalue', {}).get('value', {})
            return int(q['time'][1:5]) if isinstance(q, dict) and q.get('time') else None
        out.append({'v': v, 'start': qual('P580'), 'end': qual('P582')})
    return out


def find_qid(name, surname):
    ids = [x['id'] for x in wd({'action': 'wbsearchentities', 'search': name, 'language': 'es', 'type': 'item', 'limit': 6}).get('search', [])]
    time.sleep(2)
    if not ids:
        return None
    ents = wd({'action': 'wbgetentities', 'ids': '|'.join(ids), 'props': 'claims|labels|sitelinks', 'languages': 'es|en', 'sitefilter': 'eswiki'}).get('entities', {})
    time.sleep(2)
    for qid in ids:
        ent = ents.get(qid, {})
        occ = [c['v'].get('id') for c in claims(ent, 'P106') if isinstance(c['v'], dict)]
        if MANAGER in occ and surname in norm(label(ent)):
            return qid
    return None


def labels_of(ids):
    ids = sorted(set(i for i in ids if i))
    out = {}
    for i in range(0, len(ids), 50):
        out.update(wd({'action': 'wbgetentities', 'ids': '|'.join(ids[i:i + 50]), 'props': 'labels', 'languages': 'es|en'}).get('entities', {}))
    return {k: label(v) for k, v in out.items()}


def wiki_extract(title):
    url = 'https://es.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(title.replace(' ', '_'))
    return get(url).get('extract', '')


def years(a):
    return str(a['start']) if a['start'] and not a['end'] else (f"{a['start']}-{a['end']}" if a['start'] and a['end'] else '-')


def build_bio(qid, name):
    ent = wd({'action': 'wbgetentities', 'ids': qid, 'props': 'claims|labels|sitelinks', 'languages': 'es|en', 'sitefilter': 'eswiki'})['entities'][qid]
    time.sleep(2)
    coach_cl = claims(ent, 'P6087')
    player_cl = claims(ent, 'P54')
    award_cl = claims(ent, 'P166')
    birth = claims(ent, 'P569')
    bplace = claims(ent, 'P19')
    nat = claims(ent, 'P27')
    ids = [c['v'].get('id') for c in coach_cl + player_cl + award_cl + bplace + nat if isinstance(c['v'], dict)]
    L = labels_of(ids)
    time.sleep(2)
    lab = lambda c: L.get(c['v'].get('id'), '')
    coach_rows = [f"{years(c)},{lab(c)},-,-,-" for c in sorted(coach_cl, key=lambda c: c['start'] or 0) if lab(c)]
    player_rows = [f"{years(c)},{lab(c)},-,-,-" for c in sorted(player_cl, key=lambda c: c['start'] or 0) if lab(c)]
    awards = sorted({lab(c) for c in award_cl if lab(c)})
    info = []
    if birth:
        info.append('Nacimiento: ' + str(birth[0]['v']['time'][1:11]).replace('-', '/')[::-1] if False else
                    'Nacimiento: ' + '/'.join(reversed(birth[0]['v']['time'][1:11].split('-'))))
    if bplace:
        info.append('Lugar: ' + lab(bplace[0]))
    if nat:
        info.append('Nacionalidad: ' + ', '.join(lab(c) for c in nat if lab(c)))
    sitelink = ent.get('sitelinks', {}).get('eswiki', {}).get('title')
    extract = ''
    if sitelink:
        try:
            extract = wiki_extract(sitelink)
        except Exception:
            extract = ''
        time.sleep(2)
    presentation = '\n'.join([x for x in ['\n'.join(info), extract] if x])
    return {'coach': {'texts': [presentation, '', '\n'.join(awards)], 'career': '\r\n'.join(coach_rows),
                      'playercareer': '\r\n'.join(player_rows), 'quotes': ''}, 'players': {}}, {
        'wikidata': qid, 'etiqueta': label(ent), 'wikipedia': sitelink or '', 'entrenador_cuenta': len(coach_rows),
        'jugador_cuenta': len(player_rows), 'palmares_cuenta': len(awards)}


def main():
    teams = json.load(open(os.path.join(OUT, 'teams.json'), encoding='utf-8'))
    man = json.load(open(os.path.join(OUT, 'entrenadores.json'), encoding='utf-8'))
    os.makedirs(RAW, exist_ok=True)
    os.makedirs(os.path.join(OUT, 'bio'), exist_ok=True)
    # 1) fotos elegidas a mano
    for tid, fname in PHOTOS.items():
        info = commons_file(fname)
        if not LICENSE_OK.match(info['license'] or ''):
            man[tid]['estado'] = 'licencia_no_libre'
            continue
        ext = os.path.splitext(urllib.parse.urlparse(info['thumb']).path)[1].lower() or '.jpg'
        with open(os.path.join(RAW, tid + ext), 'wb') as f:
            f.write(get(info['thumb'], binary=True))
        man[tid].update({'estado': 'descargada', 'archivo': tid + ext, 'fichero': fname, 'licencia': info['license'],
                         'autor': info['author'], 'pagina': info['page'], 'nota': 'elegida a mano tras revisar la descripción en Commons'})
        print('foto', tid, fname, info['license'])
        time.sleep(2)
    for tid, nombre in NO_PHOTO.items():
        man[tid]['estado'] = 'no_encontrado_commons'
    # 2) datos de cada entrenador
    info_all = {}
    for tid, t in sorted(teams.items(), key=lambda x: int(x[0])):
        if t.get('league') not in ('ESP1', 'ESP2') or not t.get('prueba') or not t['coach']['name'] or t['coach']['name'] == '-':
            continue
        name = t['coach']['name']
        surname = norm(name.split()[-1])
        try:
            qid = man.get(tid, {}).get('wikidata') or find_qid(name, surname)
            if not qid:
                print('sin Wikidata:', tid, name)
                continue
            bio, meta = build_bio(qid, name)
            json.dump(bio, open(os.path.join(OUT, 'bio', tid + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            meta['nombre'] = name
            info_all[tid] = meta
            print(tid, name, '|', meta['etiqueta'], '| entrenador', meta['entrenador_cuenta'], '| jugador', meta['jugador_cuenta'], '| palmarés', meta['palmares_cuenta'], '| wiki', bool(meta['wikipedia']))
        except Exception as e:
            print('error', tid, name, str(e)[:120])
    json.dump(man, open(os.path.join(OUT, 'entrenadores.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(info_all, open(os.path.join(OUT, 'entrenadores_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('fichas de entrenador:', len(info_all))


if __name__ == '__main__':
    sys.exit(main())
