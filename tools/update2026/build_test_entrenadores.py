#!/usr/bin/env python3
"""Pixela las fotos de entrenador descargadas al perfil del juego (124x182), con el mismo estilo que las fotos de jugador.
Salida: out/esp1_2024/img/entr/<id_equipo>.png. Requiere ImageMagick y build_test_fotos.py en la misma carpeta."""
import glob, json, os, sys
from build_test_fotos import pixelate

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')


def main():
    dst_dir = os.path.join(OUT, 'img', 'entr')
    files = sorted(glob.glob(os.path.join(OUT, 'raw_entrenadores', '*')))
    for f in files:
        pixelate(f, dst_dir, '124x182', '62x91', 32)
    print('perfiles de entrenador pixelados:', len(files))


if __name__ == '__main__':
    sys.exit(main())
