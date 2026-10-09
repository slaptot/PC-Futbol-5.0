#!/usr/bin/env python3
"""Descarga las tablas CC0 de transfermarkt-datasets (dcaribou) a tools/update2026/raw/transfermarkt/.

Licencia: CC0 1.0 (LICENSE del proyecto). Datos hasta el 6-jul-2026; el proyecto ya no se actualiza.
No toca data/ ni el juego: solo guarda los archivos crudos y un manifiesto con hashes.
"""
import datetime, gzip, hashlib, json, os, sys, urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (pcfutbol-web update2026)'}

BASE = 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/'
TABLES = ['players', 'clubs', 'competitions', 'games', 'player_valuations', 'appearances', 'club_games']
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'raw', 'transfermarkt')


def fetch(name):
    url = BASE + name + '.csv.gz'
    dst = os.path.join(OUT, name + '.csv.gz')
    h = hashlib.sha256()
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r, open(dst + '.part', 'wb') as f:
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            f.write(chunk)
            h.update(chunk)
    os.replace(dst + '.part', dst)
    # comprobación: el gzip debe leerse entero
    with gzip.open(dst, 'rb') as g:
        lines = sum(1 for _ in g) - 1
    return {'url': url, 'sha256': h.hexdigest(), 'bytes': os.path.getsize(dst), 'rows': lines}


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {'source': BASE, 'license': 'CC0-1.0', 'data_until': '2026-07-06',
                'fetched': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'files': {}}
    for t in TABLES:
        print('descargando', t, '...', flush=True)
        manifest['files'][t] = fetch(t)
        print('  ', manifest['files'][t]['rows'], 'filas', flush=True)
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print('listo:', OUT)


if __name__ == '__main__':
    sys.exit(main())
