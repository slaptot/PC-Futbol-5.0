#!/usr/bin/env python3
"""Escudos de prueba (iniciales sobre color) para los clubes de out/esp1_2024. Requiere ImageMagick (magick)."""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
MAGICK = os.environ.get('MAGICK', '/opt/homebrew/bin/magick')
# (carpeta, tamaño, tamaño de letra)
SIZES = [('esc', '48x64', 14), ('escbig', '164x174', 48), ('nano', '24x32', 9), ('ridi', '17x20', 7)]
PALETTE = ['#1d4ed8', '#b91c1c', '#15803d', '#ca8a04', '#7e22ce', '#0e7490', '#be185d', '#334155']
FONTS = ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf',
         '/Library/Fonts/Arial.ttf', '/System/Library/Fonts/Helvetica.ttc']
SKIP = {'de', 'fc', 'cf', 'ud', 'cd', 'rc', 'ca', 'rcd'}


def initials(name):
    words = [w for w in name.replace('.', ' ').split() if w.lower() not in SKIP]
    return (''.join(w[0] for w in words[:3]) or name[:2]).upper()


FONT = next(f for f in FONTS if os.path.exists(f))


def main():
    ids = json.load(open(os.path.join(OUT, 'ids.json'), encoding='utf-8'))
    for name, tid in ids.items():
        color = PALETTE[tid % len(PALETTE)]
        for folder, size, pt in SIZES:
            d = os.path.join(OUT, 'img', folder)
            os.makedirs(d, exist_ok=True)
            cmd = [MAGICK, '-size', size, 'xc:' + color, '-bordercolor', 'black', '-border', '1', '-font', FONT,
                   '-fill', 'white', '-pointsize', str(pt), '-gravity', 'center', '-annotate', '+0+0', initials(name),
                   os.path.join(d, '%d.png' % tid)]
            subprocess.run(cmd, check=True)
    print('escudos de prueba:', len(ids), 'clubes en', os.path.join(OUT, 'img'))


if __name__ == '__main__':
    sys.exit(main())
