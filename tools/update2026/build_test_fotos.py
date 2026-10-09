#!/usr/bin/env python3
"""Pixela las fotos descargadas (raw_fotos/) al formato del juego de 1996: 124x182 (ficha) y 32x32 (miniatura), paleta de 8 bits.
Salida: out/esp1_2024/img/fotobig/<id>.png y out/esp1_2024/img/foto/<id>.png. Requiere ImageMagick (magick)."""
import glob, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
RAW = os.path.join(OUT, 'raw_fotos')
MAGICK = os.environ.get('MAGICK', '/opt/homebrew/bin/magick')
GRID_BIG = '62x91'   # rejilla de bloques grandes: 124x182 = 2x la rejilla


def pixelate(src, dst_dir, size, grid, colors):
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, os.path.basename(src)[:-4] + '.png')
    cmd = [MAGICK, src, '-resize', size + '^', '-gravity', 'north', '-extent', size,
           '-filter', 'box', '-resize', grid + '!', '-dither', 'FloydSteinberg', '-colors', str(colors),
           '-filter', 'point', '-resize', size + '!', '-type', 'Palette', '-define', 'png:color-type=3', dst]
    subprocess.run(cmd, check=True)


def thumb(src, dst_dir):
    """Miniatura 32x32: la foto entera encajada (sin recortar la cara), con el mismo fondo oscuro del juego."""
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, os.path.basename(src)[:-4] + '.png')
    cmd = [MAGICK, src, '-resize', '32x32', '-background', '#223', '-gravity', 'center', '-extent', '32x32',
           '-dither', 'FloydSteinberg', '-colors', '16', '-type', 'Palette', '-define', 'png:color-type=3', dst]
    subprocess.run(cmd, check=True)


def main():
    files = sorted(glob.glob(os.path.join(RAW, '*.jpg')))
    for f in files:
        pixelate(f, os.path.join(OUT, 'img', 'fotobig'), '124x182', GRID_BIG, 32)
        thumb(f, os.path.join(OUT, 'img', 'foto'))
    print('fotos pixeladas:', len(files))


if __name__ == '__main__':
    sys.exit(main())
