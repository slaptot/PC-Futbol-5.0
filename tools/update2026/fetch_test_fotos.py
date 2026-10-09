#!/usr/bin/env python3
"""Descarga las fotos de Transfermarkt de los jugadores de la prueba 2024 (solo uso local, sin publicar).
Lee out/esp1_2024/fotos.json y guarda en raw_fotos/<id>.jpg. Vuelve a ejecutarlo para completar las que falten."""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
RAW = os.path.join(OUT, 'raw_fotos')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'


def main():
    fotos = json.load(open(os.path.join(OUT, 'fotos.json'), encoding='utf-8'))
    os.makedirs(RAW, exist_ok=True)
    ok = skip = fail = 0
    for pid, url in fotos.items():
        dst = os.path.join(RAW, pid + '.jpg')
        if os.path.exists(dst) and os.path.getsize(dst) > 0:
            skip += 1
            continue
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r, open(dst, 'wb') as f:
                f.write(r.read())
            ok += 1
        except (urllib.error.URLError, OSError) as e:
            fail += 1
            print('error', pid, e, file=sys.stderr)
        time.sleep(0.25)
    print('descargadas:', ok, '| ya estaban:', skip, '| fallidas:', fail, 'de', len(fotos))


if __name__ == '__main__':
    sys.exit(main())
