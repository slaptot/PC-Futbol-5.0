#!/usr/bin/env python3
"""Escudos reales con licencia libre para los clubes de la prueba que tenían escudo dibujado.
Fuentes (Wikimedia Commons, con la licencia y el autor en escudos.json):
  5036 CD Mirandés  -> Escudos-Mirandés.jpg, panel de 2010 (CC BY-SA 4.0)
  5023 Burgos CF    -> Burgos.png (CC BY-SA 4.0)
  5030 SD Eldense   -> CD Eldense.jpg (CC BY 4.0)
Los ficheros brutos se guardan en out/esp1_2024/raw_escudos_wd/ y los de salida en img/{esc,escbig,nano,ridi}/<id>.png.
Girona (5008) y FC Cartagena (5031) no tienen escudo con licencia libre: siguen con el dibujado."""
import json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
RAW = os.path.join(OUT, 'raw_escudos_wd')
MAGICK = os.environ.get('MAGICK', '/opt/homebrew/bin/magick')
SIZES = [('esc', '48x64'), ('escbig', '164x174'), ('nano', '24x32'), ('ridi', '17x20')]
# id -> (fichero bruto, recorte opcional "WxH+X+Y", fuente y licencia)
FUENTES = {
    '5036': ('mirandes_escudos.jpg', '140x140+190+195', 'Commons: Escudos-Mirandés.jpg, panel 2010 (CC BY-SA 4.0)'),
    '5023': ('burgos.png', None, 'Commons: Burgos.png (CC BY-SA 4.0)'),
    '5030': ('eldense_cd.jpg', None, 'Commons: CD Eldense.jpg (CC BY 4.0)'),
}


def run(*args):
    subprocess.run([MAGICK, *args], check=True)


def quitar_fondo(src, dest):
    """Hace transparente solo el blanco que toca las esquinas (el blanco interior del escudo se conserva)."""
    w, h = map(int, subprocess.run([MAGICK, 'identify', '-format', '%w %h', src],
                                   check=True, capture_output=True, text=True).stdout.split())
    dibujo = []
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        dibujo += ['-draw', f'alpha {x},{y} floodfill']
    run(src, '-alpha', 'set', '-fuzz', '12%', '-fill', 'none', *dibujo, '-trim', '+repage', dest)


def main():
    os.makedirs(RAW, exist_ok=True)
    for tid, (raw, recorte, fuente) in FUENTES.items():
        src = os.path.join(RAW, raw)
        if recorte:
            # el recorte se hace sobre el fichero bruto y se guarda en una copia temporal
            tmp = os.path.join(RAW, f'{tid}_recorte.png')
            run(src, '-crop', recorte, '+repage', tmp)
            src = tmp
        sin_fondo = os.path.join(RAW, f'{tid}_sin_fondo.png')
        quitar_fondo(src, sin_fondo)
        # encaja cada tamaño con fondo transparente
        for carpeta, size in SIZES:
            dest = os.path.join(OUT, 'img', carpeta, f'{tid}.png')
            run(sin_fondo, '-background', 'none', '-resize', size, '-gravity', 'center', '-extent', size, dest)
        print(tid, 'ok', fuente)

    # registra la fuente y la licencia de cada escudo
    ruta = os.path.join(OUT, 'escudos.json')
    E = json.load(open(ruta, encoding='utf-8'))
    for tid, (_, _, fuente) in FUENTES.items():
        E[tid] = {'club': E[tid]['club'], 'estado': 'libre', 'fuente': fuente,
                  'nota': 'escudo real del club con licencia libre (Wikimedia Commons)'}
    json.dump(E, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
