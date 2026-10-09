#!/usr/bin/env python3
"""Escudos dibujados para los clubes de la prueba sin escudo fiable: forma de escudo, colores del club e iniciales.
Diseño propio (no copia el escudo oficial). Salida: out/esp1_2024/escudos_dibujados/<id>.svg y img/{esc,escbig,nano,ridi}/<id>.png."""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
MAGICK = os.environ.get('MAGICK', '/opt/homebrew/bin/magick')
SIZES = [('esc', '48x64'), ('escbig', '164x174'), ('nano', '24x32'), ('ridi', '17x20')]
# club -> (color izquierda, color derecha, iniciales); colores aproximados de cada club
COLORES = {
    'Alaves': ('#0057B8', '#FFFFFF', 'DA'), 'Athletic Club': ('#E30613', '#FFFFFF', 'AC'), 'Barcelona': ('#004D98', '#A50044', 'FCB'),
    'Espanyol': ('#0066B3', '#FFFFFF', 'RCD'), 'Girona': ('#E1000F', '#FFFFFF', 'GFC'), 'Las Palmas': ('#FFD700', '#004B8D', 'UD'),
    'Leganes': ('#0060A8', '#FFFFFF', 'CDL'), 'Mallorca': ('#E30613', '#000000', 'RCD'), 'Osasuna': ('#D71920', '#0C1C8C', 'CAO'),
    'Rayo Vallecano': ('#FFFFFF', '#E30613', 'RV'), 'Real Betis': ('#00954C', '#FFFFFF', 'RB'), 'Real Madrid': ('#FFFFFF', '#FDBF00', 'RM'),
    'Real Sociedad': ('#0067B1', '#FFFFFF', 'RSS'), 'Sevilla': ('#D4021D', '#FFFFFF', 'SFC'), 'Valencia': ('#000000', '#FFFFFF', 'VCF'),
    'Valladolid': ('#5B2D8E', '#FFFFFF', 'RVC'), 'Villarreal': ('#FFD700', '#005187', 'VIL'),
    'Albacete': ('#FFFFFF', '#0061A7', 'ABP'), 'Almeria': ('#E30613', '#FFFFFF', 'UDA'), 'Burgos': ('#FFFFFF', '#B2001B', 'BCF'),
    'Cadiz': ('#FFD700', '#004B8D', 'CCF'), 'Castellón': ('#0055A4', '#FFFFFF', 'CD'), 'Cordoba': ('#00723F', '#FFFFFF', 'CCF'),
    'Deportivo La Coruna': ('#0A4A9A', '#FFFFFF', 'RCD'), 'Eibar': ('#003F87', '#C8102E', 'SDE'), 'Eldense': ('#003D7D', '#FFFFFF', 'CDE'),
    'Huesca': ('#0067B1', '#000000', 'SDH'), 'Levante': ('#002E6D', '#8B1A2B', 'LUD'), 'Mirandes': ('#D40022', '#000000', 'CDM'),
    'Oviedo': ('#0053A6', '#FFFFFF', 'ROF'), 'Racing Ferrol': ('#00A651', '#FFFFFF', 'RCF'), 'Racing Santander': ('#00843D', '#FFFFFF', 'RRC'),
    'Sporting Gijon': ('#DA291C', '#FFFFFF', 'SG'), 'Zaragoza': ('#FFFFFF', '#004A99', 'RZ'), 'FC Cartagena': ('#E30613', '#0055A4', 'FCC'),
}
ESCUDO = 'M10 8 H90 V64 Q90 102 50 116 Q10 102 10 64 Z'


def contraste(hexcolor):
    h = hexcolor.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return '#000000' if (0.299 * r + 0.587 * g + 0.114 * b) > 150 else '#FFFFFF'


FONT = next(f for f in ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/Library/Fonts/Arial Unicode.ttf'] if os.path.exists(f))


def contorno():
    """Puntos del escudo en coordenadas 0-100 x 0-120: lado superior recto y punta redondeada."""
    pts = [(10, 8), (90, 8), (90, 64)]
    for k in range(1, 13):
        t = k / 12
        pts.append(((1 - t) ** 2 * 90 + 2 * (1 - t) * t * 90 + t ** 2 * 50, (1 - t) ** 2 * 64 + 2 * (1 - t) * t * 102 + t ** 2 * 116))
    for k in range(1, 13):
        t = k / 12
        pts.append(((1 - t) ** 2 * 50 + 2 * (1 - t) * t * 10 + t ** 2 * 10, (1 - t) ** 2 * 116 + 2 * (1 - t) * t * 102 + t ** 2 * 64))
    return pts


def recortar(poly, x0, derecha):
    """Recorte de un polígono por la línea x=x0 (Sutherland-Hodgman): lado derecho o izquierdo."""
    dentro = (lambda p: p[0] >= x0) if derecha else (lambda p: p[0] <= x0)
    out = []
    for k in range(len(poly)):
        a, b = poly[k - 1], poly[k]
        if dentro(b):
            if not dentro(a):
                out.append(interseccion(a, b, x0))
            out.append(b)
        elif dentro(a):
            out.append(interseccion(a, b, x0))
    return out


def interseccion(a, b, x0):
    t = (x0 - a[0]) / (b[0] - a[0])
    return (x0, a[1] + t * (b[1] - a[1]))


def render(c1, c2, letras, size, dst):
    """Escudo de dos colores (izquierda/derecha) con las iniciales, dibujado con ImageMagick."""
    w, h = (int(x) for x in size.split('x'))
    sx, sy = w / 100.0, h / 120.0
    esc = lambda pts: ' '.join('%.1f,%.1f' % (x * sx, y * sy) for x, y in pts)
    base = contorno()
    izq, der = recortar(base, 50, False), recortar(base, 50, True)
    pt = max(6, int(h * (0.36 if len(letras) <= 2 else 0.28)))
    cmd = [MAGICK, '-size', size, 'xc:none', '-fill', c1, '-draw', 'polygon ' + esc(izq),
           '-fill', c2, '-draw', 'polygon ' + esc(der),
           '-fill', 'none', '-stroke', '#000000', '-strokewidth', '1.5', '-draw', 'polygon ' + esc(base),
           '-font', FONT, '-pointsize', str(pt), '-fill', contraste(c1), '-stroke', '#000000', '-strokewidth', '0.6',
           '-gravity', 'center', '-annotate', '+0+%d' % int(h * 0.08), letras, dst]
    subprocess.run(cmd, check=True)


def main():
    ids = json.load(open(os.path.join(OUT, 'ids.json'), encoding='utf-8'))
    E = json.load(open(os.path.join(OUT, 'escudos.json'), encoding='utf-8'))
    n = 0
    for name, tid in sorted(ids.items(), key=lambda x: x[1]):
        if E.get(str(tid), {}).get('estado') == 'ok':
            continue  # escudo real verificado
        if name not in COLORES:
            print('sin colores', name); continue
        c1, c2, letras = COLORES[name]
        for folder, size in SIZES:
            dst = os.path.join(OUT, 'img', folder, '%d.png' % tid)
            render(c1, c2, letras, size, dst)
        E[str(tid)] = {'club': name, 'estado': 'dibujado', 'fuente': 'diseño propio (colores del club e iniciales)', 'colores': [c1, c2], 'iniciales': letras}
        n += 1
    json.dump(E, open(os.path.join(OUT, 'escudos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('escudos dibujados:', n)


if __name__ == '__main__':
    sys.exit(main())
