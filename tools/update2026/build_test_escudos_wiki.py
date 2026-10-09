#!/usr/bin/env python3
"""Escudos de los clubes sin escudo fiable: imagen de escudo/logo de su artículo de Wikipedia en español, con licencia libre.
Deja candidatos en raw_escudos_wiki/<id>.<ext> y actualiza escudos.json (sin tocar img/ hasta revisar)."""
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error
import build_test_escudos as B

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = B.OUT
RAW = os.path.join(OUT, 'raw_escudos_wiki')


def wp(params):
    q = urllib.parse.urlencode(dict(params, format='json', redirects=1))
    return B.get('https://es.wikipedia.org/w/api.php?' + q)


def article(term):
    r = wp({'action': 'query', 'list': 'search', 'srsearch': term, 'srlimit': 3})
    hits = r.get('query', {}).get('search', [])
    return hits[0]['title'] if hits else None


def escudo_files(title):
    r = wp({'action': 'query', 'titles': title, 'prop': 'images', 'imlimit': 200})
    pages = r.get('query', {}).get('pages', {})
    files = [i['title'] for p in pages.values() for i in p.get('images', [])]
    return [f for f in files if re.search(r'escudo|logo|crest|badge', f, re.I) and f.lower().endswith(('.svg', '.png', '.jpg', '.jpeg'))]


def wiki_file(f):
    """Información del archivo en es.wikipedia (sirve para los subidos a Wikipedia y para los de Commons)."""
    r = wp({'action': 'query', 'titles': f, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 400})
    p = list(r.get('query', {}).get('pages', {}).values())[0]
    ii = (p.get('imageinfo') or [{}])[0]
    md = ii.get('extmetadata', {})
    return {'thumb': ii.get('thumburl'), 'pagina': ii.get('descriptionurl'), 'licencia': md.get('LicenseShortName', {}).get('value', ''),
            'autor': re.sub(r'<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip()}


def main():
    E = json.load(open(os.path.join(OUT, 'escudos.json'), encoding='utf-8'))
    ids = json.load(open(os.path.join(OUT, 'ids.json'), encoding='utf-8'))
    os.makedirs(RAW, exist_ok=True)
    name_of = {str(v): k for k, v in ids.items()}
    for tid, name in sorted(name_of.items(), key=lambda x: int(x[0])):
        if E.get(tid, {}).get('estado') in ('ok', 'candidato', 'sin_imagen', 'sin_articulo', 'licencia_no_libre'):
            continue
        term = B.SEARCH.get(name, name)
        try:
            title = article(term)
            time.sleep(1)
            if not title:
                E[tid] = {'club': name, 'estado': 'sin_articulo'}
                print('sin artículo', tid, name); continue
            cands = escudo_files(title)
            time.sleep(1)
            if not cands:
                E[tid] = {'club': name, 'estado': 'sin_imagen', 'articulo': title}
                print('sin imagen de escudo', tid, name, '|', title); continue
            f = cands[0]
            c = wiki_file(f)
            time.sleep(1)
            if not any(c['licencia'].startswith(l) for l in B.LICENSE_OK):
                E[tid] = {'club': name, 'estado': 'licencia_no_libre', 'fichero': f, 'articulo': title}
                print('licencia', tid, name, c['licencia']); continue
            ext = os.path.splitext(f)[1].lower()
            dst = os.path.join(RAW, tid + '.png')
            with open(dst, 'wb') as fh:
                fh.write(B.get(c['thumb'], binary=True))
            E[tid] = {'club': name, 'estado': 'candidato', 'fichero': f, 'articulo': title, 'licencia': c['licencia'], 'autor': c['autor'], 'pagina': c['pagina']}
            print('candidato', tid, name, '|', f, '|', c['licencia'])
        except Exception as e:
            E[tid] = {'club': name, 'estado': 'error: ' + str(e)[:100]}
            print('error', tid, name, str(e)[:80])
        time.sleep(1)
    json.dump(E, open(os.path.join(OUT, 'escudos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('candidatos:', sum(1 for v in E.values() if v.get('estado') == 'candidato'))


if __name__ == '__main__':
    sys.exit(main())
