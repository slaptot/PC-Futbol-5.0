#!/usr/bin/env python3
"""Colegiados de la temporada 2024-25 para el modo de prueba (?datos=2024).
Entrada (caché en out/esp1_2024/arb/, descargada de es.wikipedia):
  lista.json           Primera 2024-25 y Segunda 2024-25 ya ajustadas con el informe arbitral de la RFEF 2024/25
  wiki_arbitros.json   texto de cada artículo de árbitro (plantilla «Ficha de árbitro»), foto y error si no existe
Salida: out/esp1_2024/referees.json y out/esp1_2024/img/arb/<id>.png (80x96, pixelado como el resto del juego).
Fotos de Wikimedia Commons, todas con licencia libre (CC BY o CC BY-SA); los autores están en el README.
Los que no tienen artículo en es.wikipedia salen con fecha 0/0/0 y «Sin datos» en ciudad, colegio y profesión."""
import json, os, re, subprocess, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out', 'esp1_2024')
ARB = os.path.join(OUT, 'arb')
MAGICK = os.environ.get('MAGICK', '/opt/homebrew/bin/magick')
UA = 'PCFutbol5-test/1.0 (contacto: amunozf@imaac.es)'
MES = {'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
       'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12}
# colegiados en la lista FIFA (propuesta de la RFEF para 2026, con resultados de la temporada 2024/25)
FIFA = {'Javier Alberola Rojas', 'Mateo Busquets Ferrer', 'Guillermo Cuadra Fernández', 'Ricardo de Burgos Bengoetxea',
        'Jesús Gil Manzano', 'Alejandro José Hernández Hernández', 'Juan Martínez Munuera', 'José Luis Munuera Montero',
        'Alejandro Muñiz Ruiz', 'José María Sánchez Martínez', 'Marta Huerta de Aza'}
# nombres de pila de dos palabras (el resto es el apellido)
DOBLE = {'José Luis', 'Miguel Ángel', 'José María', 'Alejandro José', 'Francisco José', 'Jon Ander',
         'José Antonio', 'Manuel Ángel', 'Manuel Jesús', 'Sergiu Claudiu'}


def nombre(completo):
    """«Javier Alberola Rojas» -> «Javier ALBEROLA ROJAS» (el apellido en mayúsculas, como en el juego de 1996)."""
    partes = completo.split(' ')
    n = 2 if ' '.join(partes[:2]) in DOBLE else 1
    return f"{' '.join(partes[:n])} {' '.join(partes[n:]).upper()}"


def campo(wt, k):
    m = re.search(r'\|\s*' + k + r'\s*=\s*([^\n|]*)', wt)
    return m.group(1).strip() if m else ''


def limpia(s):
    s = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'<ref.*?(</ref>|/>)', '', s, flags=re.S)
    s = re.sub(r'\{\{[^{}]*\}\}', '', s)
    return re.sub(r'\s+', ' ', s).strip(' ,|}')


def fecha(wt):
    m = re.search(r'fecha(?:de)?nacimiento\s*=\s*(\{\{fecha\|(\d+)\|(\d+)\|(\d{4})|(\d{1,2}) de (\w+) de (\d{4}))', wt)
    if m:
        if m.group(2):
            return [int(m.group(2)), int(m.group(3)), int(m.group(4))]
        return [int(m.group(5)), MES[m.group(6)], int(m.group(7))]
    # sin plantilla: la primera fecha del párrafo de presentación, «'''Nombre''' (Ciudad, 19 de mayo de 1983)»
    i = wt.find("'''")
    m = re.search(r'(\d{1,2}) de (\w+) de (\d{4})', wt[i:i + 400]) if i >= 0 else None
    if m and m.group(2) in MES:
        return [int(m.group(1)), MES[m.group(2)], int(m.group(3))]
    return None


def datos_articulo(wt):
    wt = re.sub(r'<ref[^>]*/>|<ref.*?</ref>', '', wt, flags=re.S)
    ciudad = limpia(campo(wt, 'ciudaddenacimiento') or campo(wt, 'lugar de nacimiento'))
    if not ciudad:  # sin campo de ciudad: la del párrafo de presentación, «'''Nombre''' (Jaén, 19 de mayo…)»
        m = re.search(r"'''[^'\n]*'''\s*\(([^,()\d]+),", wt)
        ciudad = m.group(1) if m else ''
    ciudad = re.split(r'[,(|]', ciudad.replace('[[', ''))[0].strip()
    return {'birth': fecha(wt), 'place': ciudad,
            'dem': limpia(campo(wt, 'comité')), 'prof': limpia(campo(wt, 'otraocupacion')).split(',')[0].strip(),
            'img': limpia(campo(wt, 'imagen'))}


def registro(nombre_wiki, cat, art, intl):
    d = datos_articulo(art['wt']) if art and not art['missing'] else {}
    if art and not d.get('img'):
        d['img'] = art.get('imgname')  # imagen principal de la página, cuando la ficha no la pone
    return {'nombre': nombre(nombre_wiki), 'cat': cat, 'birth': d.get('birth') or [0, 0, 0],
            'place': d.get('place') or 'Sin datos', 'dem': d.get('dem') or 'Sin datos',
            'prof': d.get('prof') or 'Sin datos', 'intl': intl, 'img': d.get('img') or None}


def pixelar(src, dest):
    # encaja en 80x96 con la cabeza arriba, reduce a 40x48 y vuelve a ampliar: aspecto pixelado de 1996
    subprocess.run([MAGICK, src, '-resize', '80x96^', '-gravity', 'north', '-extent', '80x96',
                    '-filter', 'point', '-resize', '40x48', '-resize', '80x96', dest], check=True)


def main():
    L = json.load(open(os.path.join(ARB, 'lista.json'), encoding='utf-8'))
    W = json.load(open(os.path.join(ARB, 'wiki_arbitros.json'), encoding='utf-8'))
    lista = [registro(n, 1, W.get(n), 'Sí' if n in FIFA else 'No') for n in L['primera']]
    lista += [registro(n, 2, W.get(n), 'Sí' if n == 'Marta Huerta de Aza' else 'No') for n in L['segunda']]

    os.makedirs(os.path.join(OUT, 'img', 'arb'), exist_ok=True)
    salida = []
    for i, r in enumerate(lista):
        rid = 1000001 + i
        if r['img']:
            crudo = os.path.join(ARB, f'foto_{rid}')
            subprocess.run(['curl', '-sL', '-A', UA, '-o', crudo,
                            'https://commons.wikimedia.org/wiki/Special:FilePath/' +
                            urllib.parse.quote(r['img'].replace(' ', '_')) + '?width=400'], check=True)
            pixelar(crudo, os.path.join(OUT, 'img', 'arb', f'{rid}.png'))
        salida.append({'id': rid, 'name': r['nombre'], 'cat': r['cat'], 'place': r['place'], 'birth': r['birth'],
                       'prof': r['prof'], 'intl': r['intl'], 'dem': r['dem']})
    json.dump(salida, open(os.path.join(OUT, 'referees.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(salida), 'árbitros;', sum(1 for r in lista if r['img']), 'con foto')


if __name__ == '__main__':
    main()
